import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Vercel serverless function (Node). Public POST. Accepts a JSON body with the
// resume encoded as base64 (the form is small; no multipart needed). Everything
// runs through the service role key — the client never sees it, and no VITE_
// prefixes are used.
//
// Allow a body large enough for a 3 MB file (~4 MB once base64-encoded) plus the
// JSON fields; the default parser limit would reject it.
export const config = { api: { bodyParser: { sizeLimit: "5mb" } } };

const MAX_RESUME_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]);

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[training-interest] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }

  // Vercel parses application/json by default; tolerate a raw string body too.
  let data: any = req.body;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return res.status(400).json({ error: "Invalid JSON body." });
    }
  }
  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const firstName = String(data.firstName ?? "").trim();
  const lastName = String(data.lastName ?? "").trim();
  const email = String(data.email ?? "").trim();
  const phone = String(data.phone ?? "").trim();
  const linkedinUrl = String(data.linkedinUrl ?? "").trim();
  const programId = String(data.programId ?? "").trim();
  const experienceRangeId = Number(data.experienceRangeId);
  const eligibilityId = Number(data.eligibilityId);
  const resumeBase64 = String(data.resumeBase64 ?? "");
  const resumeFilename = String(data.resumeFilename ?? "").trim();
  const resumeMimeType = String(data.resumeMimeType ?? "").trim();

  // ── Server-side validation (return 400 with a clear message on any failure) ──
  if (!firstName) return res.status(400).json({ error: "First name is required." });
  if (!lastName) return res.status(400).json({ error: "Last name is required." });
  if (!email) return res.status(400).json({ error: "Email is required." });
  if (!isEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (!phone) return res.status(400).json({ error: "Phone is required." });
  if (!programId) return res.status(400).json({ error: "Select a program track." });
  if (!Number.isInteger(experienceRangeId)) {
    return res.status(400).json({ error: "Select your years of experience." });
  }
  if (!Number.isInteger(eligibilityId)) {
    return res.status(400).json({ error: "Select your employment eligibility." });
  }
  if (linkedinUrl && !/^https?:\/\/\S+$/i.test(linkedinUrl)) {
    return res.status(400).json({ error: "Enter a valid LinkedIn URL." });
  }
  if (!resumeBase64 || !resumeFilename) {
    return res.status(400).json({ error: "Resume is required." });
  }
  if (!ALLOWED_MIME.has(resumeMimeType)) {
    return res.status(400).json({ error: "Resume must be a PDF or DOCX file." });
  }

  // Decode the resume (strip a data-URL prefix if present) and enforce the size.
  const rawBase64 = resumeBase64.includes(",")
    ? resumeBase64.slice(resumeBase64.indexOf(",") + 1)
    : resumeBase64;
  let buffer: Buffer;
  try {
    buffer = Buffer.from(rawBase64, "base64");
  } catch {
    return res.status(400).json({ error: "Could not read the resume file." });
  }
  if (buffer.length === 0) return res.status(400).json({ error: "The resume file is empty." });
  if (buffer.length > MAX_RESUME_BYTES) {
    return res.status(400).json({ error: "Resume must be 3 MB or smaller." });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Validate the foreign keys against the DB and pull the human-readable labels
  // (+ is_program_eligible) for the notification email.
  let program: { id: string; name: string; status: string } | null;
  let experience: { id: number; label: string; active: boolean } | null;
  let eligibility: { id: number; label: string; active: boolean; is_program_eligible: boolean } | null;
  try {
    const [progRes, expRes, eligRes] = await Promise.all([
      supabase.from("training_programs").select("id, name, status").eq("id", programId).maybeSingle(),
      supabase.from("lookup_experience_ranges").select("id, label, active").eq("id", experienceRangeId).maybeSingle(),
      supabase
        .from("lookup_employment_eligibility")
        .select("id, label, active, is_program_eligible")
        .eq("id", eligibilityId)
        .maybeSingle(),
    ]);
    if (progRes.error) throw progRes.error;
    if (expRes.error) throw expRes.error;
    if (eligRes.error) throw eligRes.error;
    program = progRes.data as any;
    experience = expRes.data as any;
    eligibility = eligRes.data as any;
  } catch (err) {
    console.error("[training-interest] lookup failed", err);
    return res.status(502).json({ error: "Unable to process your registration right now." });
  }

  if (!program || program.status !== "published") {
    return res.status(400).json({ error: "The selected program is not available." });
  }
  if (!experience || experience.active !== true) {
    return res.status(400).json({ error: "The selected experience range is not available." });
  }
  if (!eligibility || eligibility.active !== true) {
    return res.status(400).json({ error: "The selected eligibility option is not available." });
  }

  // Upload the resume to the private bucket.
  const safeName = resumeFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const resumePath = `${Date.now()}-${safeName}`;
  try {
    const up = await supabase.storage
      .from("training-resumes")
      .upload(resumePath, buffer, { contentType: resumeMimeType, upsert: false });
    if (up.error) throw up.error;
  } catch (err) {
    console.error("[training-interest] resume upload failed", err);
    return res.status(502).json({ error: "Could not upload your resume. Please try again." });
  }

  // Insert the interest row — this is the source of truth.
  try {
    const ins = await supabase.from("training_interest").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      program_id: program.id,
      experience_range_id: experience.id,
      eligibility_id: eligibility.id,
      linkedin_url: linkedinUrl || null,
      resume_path: resumePath,
      source: "training_register",
    });
    if (ins.error) throw ins.error;
  } catch (err) {
    console.error("[training-interest] insert failed", err);
    return res.status(502).json({ error: "Could not save your registration. Please try again." });
  }

  // Best-effort notification email via the Resend REST API. A failure here must
  // NOT fail the request — the Supabase insert already succeeded.
  try {
    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.TRAINING_NOTIFY_EMAIL;
    if (resendKey && notifyEmail) {
      const needsReview = eligibility.is_program_eligible === false;
      const subject = `${needsReview ? "[NEEDS REVIEW] " : ""}New training interest — ${program.name}`;
      const fromEmail = process.env.TRAINING_FROM_EMAIL || "Venakan <onboarding@resend.dev>";

      const rows: Array<[string, string]> = [
        ["Name", `${firstName} ${lastName}`],
        ["Email", email],
        ["Phone", phone],
        ["Program", program.name],
        ["Experience", experience.label],
        ["Eligibility", eligibility.label],
      ];
      if (linkedinUrl) rows.push(["LinkedIn", linkedinUrl]);
      rows.push(["Resume path", resumePath]);

      const html = `<h2>New training interest${needsReview ? " — needs review" : ""}</h2><p>${rows
        .map(([k, v]) => `<strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}`)
        .join("<br>")}</p>`;
      const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

      const er = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromEmail, to: [notifyEmail], subject, html, text }),
      });
      if (!er.ok) {
        const body = await er.text().catch(() => "");
        console.error(`[training-interest] Resend ${er.status}: ${body.slice(0, 300)}`);
      }
    }
  } catch (err) {
    console.error("[training-interest] notification email failed (registration was saved)", err);
  }

  return res.status(200).json({ ok: true });
}
