import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

// Vercel serverless (Node). Admin-only. POST /api/admin/applications/:id/mark-paid
// Records a manual (wire/check) payment, enrolls the applicant, increments seats,
// and sends the welcome email — the only non-webhook path that marks a payment paid.

// Keep NEXT_STEPS in sync with api/stripe/webhook.ts (edit both when Arvind
// provides the real list).
const NEXT_STEPS: string[] = [
  "[NEXT STEPS — TO BE PROVIDED BY ARVIND] Join the Venakan Learn workspace/community (invite to follow).",
  "[NEXT STEPS] Complete the pre-course environment setup guide.",
  "[NEXT STEPS] Watch for your TalentLMS login, sent closer to the start date.",
  "[NEXT STEPS] Cohort start date and logistics will be confirmed by email.",
];

function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("[admin] ADMIN_PASSWORD is not set");
    res.status(500).json({ error: "Server is not configured." });
    return false;
  }
  const raw = req.headers["x-admin-key"];
  const provided = Array.isArray(raw) ? raw[0] : raw;
  if (!provided) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  return true;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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

async function sendResend(to: string, subject: string, html: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return;
  const from = process.env.LEARN_FROM_EMAIL || "Venakan Learn <learn@venakan.com>";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });
  if (!r.ok) console.error(`[applications/mark-paid] Resend ${r.status}: ${(await r.text().catch(() => "")).slice(0, 300)}`);
}

async function incrementSeat(supabase: SupabaseClient, programId: string) {
  const { error } = await supabase.rpc("enroll_seat", { p_program_id: programId });
  if (!error) return;
  console.error("[applications/mark-paid] enroll_seat rpc failed; falling back:", error.message);
  const { data } = await supabase
    .from("training_programs")
    .select("seats_total, seats_enrolled")
    .eq("id", programId)
    .maybeSingle();
  if (data && (data.seats_total == null || data.seats_enrolled < data.seats_total)) {
    await supabase.from("training_programs").update({ seats_enrolled: data.seats_enrolled + 1 }).eq("id", programId);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[applications/mark-paid] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }

  const id = String(req.query.id ?? "").trim();
  if (!id) return res.status(400).json({ error: "Application id is required." });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: app, error: appErr } = await supabase
    .from("training_interest")
    .select("id, first_name, email, status, program_id")
    .eq("id", id)
    .maybeSingle();
  if (appErr) {
    console.error("[applications/mark-paid] lookup failed", appErr);
    return res.status(500).json({ error: "Could not load the application." });
  }
  if (!app) return res.status(404).json({ error: "Application not found." });
  if (app.status === "enrolled") return res.status(409).json({ error: "This applicant is already enrolled." });

  const { data: program, error: progErr } = await supabase
    .from("training_programs")
    .select("id, name, tuition_cents, currency")
    .eq("id", app.program_id)
    .maybeSingle();
  if (progErr || !program) {
    console.error("[applications/mark-paid] program lookup failed", progErr);
    return res.status(500).json({ error: "Could not load the program." });
  }

  // Record a manual paid payment.
  const { error: payErr } = await supabase.from("payments").insert({
    application_id: app.id,
    program_id: program.id,
    amount_cents: program.tuition_cents ?? 0,
    currency: program.currency || "usd",
    status: "paid",
    is_manual: true,
    paid_at: new Date().toISOString(),
  });
  if (payErr) {
    console.error("[applications/mark-paid] payment insert failed", payErr);
    return res.status(500).json({ error: "Could not record the payment." });
  }

  const { error: updErr } = await supabase
    .from("training_interest")
    .update({ status: "enrolled", enrolled_at: new Date().toISOString() })
    .eq("id", app.id);
  if (updErr) {
    console.error("[applications/mark-paid] enroll update failed", updErr);
    return res.status(500).json({ error: "Recorded payment but could not enroll." });
  }

  await incrementSeat(supabase, program.id);

  const { html, text } = welcomeEmail(app.first_name || "there", program.name);
  await sendResend(app.email, `Welcome to Venakan Learn — ${program.name} next steps`, html, text);

  return res.status(200).json({ ok: true });
}
