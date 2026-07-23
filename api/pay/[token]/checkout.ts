import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Vercel serverless (Node). PUBLIC POST /api/pay/:token/checkout
// Re-validates status + seats server-side, creates a fresh Stripe Checkout
// Session (amount read from the DB, never the client), inserts a pending
// payments row, and returns the session URL.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl = process.env.SITE_URL;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!supabaseUrl || !serviceKey || !siteUrl || !stripeKey) {
    console.error("[pay/checkout] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SITE_URL / STRIPE_SECRET_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }

  const token = String(req.query.token ?? "").trim();
  if (!token) return res.status(400).json({ error: "Missing payment link." });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Re-validate the registration.
  const { data: app, error: appErr } = await supabase
    .from("training_interest")
    .select("id, email, first_name, status, program_id")
    .eq("payment_token", token)
    .maybeSingle();
  if (appErr) {
    console.error("[pay/checkout] lookup failed", appErr);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
  if (!app) return res.status(404).json({ error: "This payment link is invalid or has expired." });
  if (app.status === "enrolled") {
    return res.status(409).json({ error: "You're already enrolled — check your email for next steps." });
  }
  if (app.status !== "approved_pending_payment" && app.status !== "payment_failed") {
    return res.status(409).json({ error: "This application isn't ready for payment." });
  }

  const { data: program, error: progErr } = await supabase
    .from("training_programs")
    .select("id, name, tuition_cents, currency, seats_total, seats_enrolled")
    .eq("id", app.program_id)
    .maybeSingle();
  if (progErr || !program) {
    console.error("[pay/checkout] program lookup failed", progErr);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
  if (!program.tuition_cents || program.tuition_cents <= 0) {
    return res.status(400).json({ error: "Tuition isn't set for this program yet." });
  }
  if (program.seats_total != null && program.seats_enrolled >= program.seats_total) {
    return res.status(409).json({ error: "This cohort is now full." });
  }

  const base = siteUrl.replace(/\/$/, "");
  const metadata = { application_id: app.id, program_id: program.id, payment_token: token };

  let session: Stripe.Checkout.Session;
  try {
    const stripe = new Stripe(stripeKey);
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: app.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: program.currency || "usd",
            unit_amount: program.tuition_cents, // server-side amount, never the client's
            product_data: { name: program.name },
          },
        },
      ],
      success_url: `${base}/enrollment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pay/${token}`,
      metadata,
      payment_intent_data: { metadata },
    });
  } catch (err) {
    console.error("[pay/checkout] Stripe session create failed", err);
    return res.status(502).json({ error: "Could not start checkout. Please try again." });
  }

  // Record a pending payment tied to this session.
  const { error: insErr } = await supabase.from("payments").insert({
    application_id: app.id,
    program_id: program.id,
    stripe_checkout_session_id: session.id,
    amount_cents: program.tuition_cents,
    currency: program.currency || "usd",
    status: "pending",
    is_manual: false,
  });
  if (insErr) {
    console.error("[pay/checkout] payments insert failed", insErr);
    // The session exists; surface an error so the user retries rather than paying
    // against an unrecorded session.
    return res.status(500).json({ error: "Could not start checkout. Please try again." });
  }

  return res.status(200).json({ url: session.url });
}
