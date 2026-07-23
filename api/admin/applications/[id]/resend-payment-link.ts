import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

// Vercel serverless (Node). Admin-only. POST /api/admin/applications/:id/resend-payment-link
// Re-sends the payment-request email without changing state.

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

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: (currency || "usd").toUpperCase() }).format(
    cents / 100
  );
}
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function paymentRequestEmail(firstName: string, programName: string, amount: string, payUrl: string) {
  const html = `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0F172A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;">
    <tr><td style="background:#0F172A;padding:22px 28px;"><span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.5px;">Venakan Learn</span></td></tr>
    <tr><td style="padding:32px 28px;">
      <p style="margin:0 0 14px;font-size:16px;">Hi ${esc(firstName)},</p>
      <p style="margin:0 0 14px;line-height:1.6;">Congratulations — you're approved for the <strong>${esc(programName)}</strong> cohort at Venakan Learn.</p>
      <p style="margin:0 0 20px;line-height:1.6;">Tuition for this program is <strong>${esc(amount)}</strong>. Complete your enrollment using the secure link below.</p>
      <p style="margin:0 0 24px;"><a href="${payUrl}" style="display:inline-block;background:#10B981;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 26px;border-radius:8px;">Complete Enrollment</a></p>
      <p style="margin:0 0 8px;line-height:1.6;color:#475569;font-size:14px;">Seats are limited and held on a first-paid basis. Questions? Email <a href="mailto:hello@venakan.com" style="color:#10B981;">hello@venakan.com</a>.</p>
    </td></tr>
    <tr><td style="background:#0F172A;padding:16px 28px;"><span style="color:#94a3b8;font-size:12px;">Venakan Learn · Pure AI. Research to Results.</span></td></tr>
  </table></body></html>`;
  const text = `Hi ${firstName},

Congratulations — you're approved for the ${programName} cohort at Venakan Learn.

Tuition for this program is ${amount}. Complete your enrollment here:
${payUrl}

Seats are limited and held on a first-paid basis. Questions? Email hello@venakan.com.

— The Venakan Learn Team`;
  return { html, text };
}

async function sendResend(to: string, subject: string, html: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[applications/resend] RESEND_API_KEY not set — email skipped");
    return;
  }
  const from = process.env.LEARN_FROM_EMAIL || "Venakan Learn <learn@venakan.com>";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    console.error(`[applications/resend] Resend ${r.status}: ${body.slice(0, 300)}`);
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
  const siteUrl = process.env.SITE_URL;
  if (!supabaseUrl || !serviceKey || !siteUrl) {
    console.error("[applications/resend] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SITE_URL");
    return res.status(500).json({ error: "Server is not configured." });
  }

  const id = String(req.query.id ?? "").trim();
  if (!id) return res.status(400).json({ error: "Application id is required." });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: app, error: appErr } = await supabase
    .from("training_interest")
    .select("id, first_name, email, status, payment_token, program_id")
    .eq("id", id)
    .maybeSingle();
  if (appErr) {
    console.error("[applications/resend] lookup failed", appErr);
    return res.status(500).json({ error: "Could not load the application." });
  }
  if (!app) return res.status(404).json({ error: "Application not found." });
  if (app.status === "enrolled") return res.status(409).json({ error: "This applicant is already enrolled." });
  if (app.status !== "approved_pending_payment" && app.status !== "payment_failed") {
    return res.status(409).json({ error: "Approve the application before sending a payment link." });
  }

  const { data: program, error: progErr } = await supabase
    .from("training_programs")
    .select("name, tuition_cents, currency")
    .eq("id", app.program_id)
    .maybeSingle();
  if (progErr || !program) {
    console.error("[applications/resend] program lookup failed", progErr);
    return res.status(500).json({ error: "Could not load the program." });
  }

  const paymentToken = app.payment_token || crypto.randomUUID();
  if (!app.payment_token) {
    await supabase.from("training_interest").update({ payment_token: paymentToken }).eq("id", id);
  }

  const payUrl = `${siteUrl.replace(/\/$/, "")}/pay/${paymentToken}`;
  const amount = money(program.tuition_cents, program.currency);
  const { html, text } = paymentRequestEmail(app.first_name || "there", program.name, amount, payUrl);
  await sendResend(app.email, `You're approved — complete your enrollment in ${program.name}`, html, text);

  return res.status(200).json({ ok: true });
}
