import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Vercel serverless (Node). PUBLIC GET /api/pay/:token
// Returns only what the pay page needs: applicant first name, program name,
// formatted tuition, currency, and a coarse state. Looks up strictly by
// payment_token; unknown tokens 404.

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: (currency || "usd").toUpperCase() }).format(
    cents / 100
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[pay] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }

  const token = String(req.query.token ?? "").trim();
  if (!token) return res.status(400).json({ error: "Missing payment link." });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: app, error } = await supabase
    .from("training_interest")
    .select("first_name, status, program_id")
    .eq("payment_token", token)
    .maybeSingle();
  if (error) {
    console.error("[pay] lookup failed", error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
  if (!app) return res.status(404).json({ error: "This payment link is invalid or has expired." });

  const { data: program, error: progErr } = await supabase
    .from("training_programs")
    .select("name, tuition_cents, currency, seats_total, seats_enrolled")
    .eq("id", app.program_id)
    .maybeSingle();
  if (progErr || !program) {
    console.error("[pay] program lookup failed", progErr);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }

  let state: "ready" | "enrolled" | "full" = "ready";
  if (app.status === "enrolled") state = "enrolled";
  else if (program.seats_total != null && program.seats_enrolled >= program.seats_total) state = "full";

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    firstName: app.first_name ?? "",
    programName: program.name,
    amount: money(program.tuition_cents, program.currency),
    amountCents: program.tuition_cents,
    currency: program.currency,
    state,
  });
}
