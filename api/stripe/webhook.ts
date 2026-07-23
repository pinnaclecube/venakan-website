import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Vercel serverless (Node). PUBLIC POST /api/stripe/webhook
// The SINGLE source of truth for enrollment.
//
// Stripe signature verification needs the EXACT raw request bytes, so we MUST
// disable Vercel's automatic JSON body parsing and read the raw stream
// ourselves — a parsed/re-serialized body would change the bytes and break the
// HMAC check.
export const config = { api: { bodyParser: false } };

// ── EDIT ME: the enrollment next-steps shown in the welcome email. Provided by
//    Arvind — replace these placeholders with the real, verbatim list before
//    going live (workspace/community, environment setup, TalentLMS login timing,
//    cohort start logistics, etc.). ──
const NEXT_STEPS: string[] = [
  "[NEXT STEPS — TO BE PROVIDED BY ARVIND] Join the Venakan Learn workspace/community (invite to follow).",
  "[NEXT STEPS] Complete the pre-course environment setup guide.",
  "[NEXT STEPS] Watch for your TalentLMS login, sent closer to the start date.",
  "[NEXT STEPS] Cohort start date and logistics will be confirmed by email.",
];

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer));
  return Buffer.concat(chunks);
}

async function sendResend(to: string, subject: string, html: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return;
  const from = process.env.LEARN_FROM_EMAIL || "Venakan Learn <learn@venakan.com>";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });
  if (!r.ok) console.error(`[stripe/webhook] Resend ${r.status}: ${(await r.text().catch(() => "")).slice(0, 300)}`);
}

function welcomeEmail(firstName: string, programName: string) {
  const stepsHtml = NEXT_STEPS.map((s, i) => `<li style="margin-bottom:8px;"><strong>${i + 1}.</strong> ${esc(s)}</li>`).join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0F172A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;">
    <tr><td style="background:#0F172A;padding:22px 28px;"><span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.5px;">Venakan Learn</span></td></tr>
    <tr><td style="padding:32px 28px;">
      <p style="margin:0 0 14px;font-size:16px;">Hi ${esc(firstName)},</p>
      <p style="margin:0 0 18px;line-height:1.6;">You're enrolled in <strong>${esc(programName)}</strong> — welcome to the cohort!</p>
      <h2 style="margin:0 0 12px;color:#10B981;font-size:16px;">Next Steps</h2>
      <ol style="margin:0 0 20px;padding-left:18px;line-height:1.6;list-style:none;">${stepsHtml}</ol>
      <p style="margin:0 0 8px;line-height:1.6;">We're excited to have you in the cohort. Reply to this email or write <a href="mailto:hello@venakan.com" style="color:#10B981;">hello@venakan.com</a> anytime.</p>
      <p style="margin:0;line-height:1.6;">— The Venakan Learn Team</p>
    </td></tr>
    <tr><td style="background:#0F172A;padding:16px 28px;"><span style="color:#94a3b8;font-size:12px;">Receipts are sent by Stripe.</span></td></tr>
  </table></body></html>`;
  const text = `Hi ${firstName},

You're enrolled in ${programName} — welcome to the cohort!

Next Steps
${NEXT_STEPS.map((s, i) => `${i + 1}. ${s}`).join("\n")}

We're excited to have you in the cohort. Reply to this email or write hello@venakan.com anytime.

— The Venakan Learn Team`;
  return { html, text };
}

async function adminAlert(subject: string, line: string) {
  const to = process.env.TRAINING_NOTIFY_EMAIL;
  if (!to) return;
  await sendResend(to, subject, `<p>${esc(line)}</p>`, line);
}

async function incrementSeat(supabase: SupabaseClient, programId: string) {
  // Atomic guarded increment via SQL function (see the enroll_seat() function in
  // the SQL deliverable). Fallback to a read-modify-write if the RPC is absent.
  const { error } = await supabase.rpc("enroll_seat", { p_program_id: programId });
  if (!error) return;
  console.error("[stripe/webhook] enroll_seat rpc failed; falling back:", error.message);
  const { data } = await supabase
    .from("training_programs")
    .select("seats_total, seats_enrolled")
    .eq("id", programId)
    .maybeSingle();
  if (data && (data.seats_total == null || data.seats_enrolled < data.seats_total)) {
    await supabase.from("training_programs").update({ seats_enrolled: data.seats_enrolled + 1 }).eq("id", programId);
  }
}

async function handleCompleted(session: Stripe.Checkout.Session, supabase: SupabaseClient) {
  if (session.payment_status !== "paid") return; // async/unpaid — nothing to enroll yet
  const sessionId = session.id;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  const { data: payment } = await supabase
    .from("payments")
    .select("id, application_id, program_id, status")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (!payment) {
    console.error("[stripe/webhook] no payment row for session", sessionId);
    return;
  }
  if (payment.status === "paid") return; // already processed — idempotent

  // Mark the payment paid regardless of duplicate status (so refunds can be reconciled).
  await supabase
    .from("payments")
    .update({ status: "paid", stripe_payment_intent_id: paymentIntentId, paid_at: new Date().toISOString() })
    .eq("id", payment.id);

  const { data: app } = await supabase
    .from("training_interest")
    .select("id, first_name, last_name, email, status, program_id")
    .eq("id", payment.application_id)
    .maybeSingle();
  const { data: program } = await supabase
    .from("training_programs")
    .select("name")
    .eq("id", payment.program_id)
    .maybeSingle();
  const fullName = app ? `${app.first_name ?? ""} ${app.last_name ?? ""}`.trim() : "Unknown";
  const programName = program?.name ?? "Unknown program";

  // Double-payment race: application already enrolled → record paid (done above),
  // but do NOT double-increment seats. Alert an admin to refund manually.
  if (app && app.status === "enrolled") {
    await adminAlert(`[DUPLICATE PAYMENT] ${fullName} — ${programName}`, `${fullName} paid twice for ${programName}. Issue a refund.`);
    return;
  }

  // Fresh enrollment. Note: payment_token is intentionally kept so the /pay page
  // can show "already enrolled"; re-payment is blocked by the status check in the
  // checkout endpoint, which makes the link single-use for payment.
  if (app) {
    await supabase
      .from("training_interest")
      .update({ status: "enrolled", enrolled_at: new Date().toISOString() })
      .eq("id", app.id);
    await incrementSeat(supabase, payment.program_id);
    const { html, text } = welcomeEmail(app.first_name || "there", programName);
    await sendResend(app.email, `Welcome to Venakan Learn — ${programName} next steps`, html, text);
    await adminAlert(`[ENROLLED] ${fullName} — ${programName}`, `${fullName} enrolled in ${programName}.`);
  }
}

async function handleExpired(session: Stripe.Checkout.Session, supabase: SupabaseClient) {
  // Registration stays approved_pending_payment so the email link yields a fresh session.
  await supabase
    .from("payments")
    .update({ status: "expired" })
    .eq("stripe_checkout_session_id", session.id)
    .eq("status", "pending");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    console.error("[stripe/webhook] missing STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / SUPABASE_*");
    return res.status(500).json({ error: "Server is not configured." });
  }

  const stripe = new Stripe(stripeKey);
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, sig as string, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed", err);
    return res.status(400).json({ error: "Invalid signature." });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Idempotency: record the event first; a duplicate id means we've seen it.
  const { error: idErr } = await supabase
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, event_type: event.type });
  if (idErr && (idErr as any).code === "23505") {
    return res.status(200).json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCompleted(event.data.object as Stripe.Checkout.Session, supabase);
    } else if (event.type === "checkout.session.expired") {
      await handleExpired(event.data.object as Stripe.Checkout.Session, supabase);
    }
    // Other event types are deliberately ignored.
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook] processing error", err);
    // Remove the idempotency marker so Stripe's retry can reprocess this event.
    await supabase.from("stripe_webhook_events").delete().eq("event_id", event.id);
    return res.status(500).json({ error: "Processing error." });
  }
}
