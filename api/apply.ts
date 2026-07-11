import type { VercelRequest, VercelResponse } from "@vercel/node";
import Busboy from "busboy";
import { createClient } from "@supabase/supabase-js";

// Vercel serverless function (Node). Accepts multipart/form-data (résumé +
// fields), so Vercel's default JSON body parser MUST be disabled.
//
// Applications are accepted on our site: the résumé is uploaded to the private
// Supabase "resumes" bucket, the application row is inserted into "applications"
// (source of truth), and a notification email (with the résumé attached) is sent
// via Resend. Interviews are scheduled in Zinterview manually — no candidate is
// created here.
export const config = { api: { bodyParser: false } };

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]);
const ALLOWED_EXT = /\.(pdf|doc|docx)$/i;

type ParsedForm = {
  fields: Record<string, string>;
  file?: { buffer: Buffer; filename: string; mimeType: string };
  fileTooLarge: boolean;
};

function parseMultipart(req: VercelRequest): Promise<ParsedForm> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_FILE_BYTES, files: 1 } });
    const fields: Record<string, string> = {};
    let file: ParsedForm["file"];
    let fileTooLarge = false;

    bb.on("field", (name, val) => {
      fields[name] = val;
    });
    bb.on("file", (_name, stream, info) => {
      const chunks: Buffer[] = [];
      stream.on("data", (c: Buffer) => chunks.push(c));
      stream.on("limit", () => {
        fileTooLarge = true;
        stream.resume(); // drain remainder
      });
      stream.on("end", () => {
        if (!fileTooLarge && chunks.length) {
          file = { buffer: Buffer.concat(chunks), filename: info.filename, mimeType: info.mimeType };
        }
      });
    });
    bb.on("finish", () => resolve({ fields, file, fileTooLarge }));
    bb.on("error", reject);
    req.pipe(bb);
  });
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
    console.error("[apply] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }

  let parsed: ParsedForm;
  try {
    parsed = await parseMultipart(req);
  } catch (err) {
    console.error("[apply] multipart parse error", err);
    return res.status(400).json({ error: "Could not read the submitted form." });
  }

  const { fields, file, fileTooLarge } = parsed;
  const openingId = (fields.openingId || "").trim();
  const openingTitle = (fields.openingTitle || "").trim();
  const firstName = (fields.firstName || "").trim();
  const lastName = (fields.lastName || "").trim();
  const email = (fields.email || "").trim();
  const phone = (fields.phone || "").trim();
  const experienceRaw = (fields.experience || "").trim();

  // ── Server-side validation (mirrors the client) ──
  const fieldErrors: Record<string, string> = {};
  if (!openingId) fieldErrors.openingId = "Missing opening.";
  if (!firstName) fieldErrors.firstName = "First name is required.";
  if (!lastName) fieldErrors.lastName = "Last name is required.";
  if (!email) fieldErrors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (!phone) fieldErrors.phone = "Phone is required.";
  if (fileTooLarge) fieldErrors.resume = "Resume must be 5 MB or smaller.";
  else if (!file) fieldErrors.resume = "Resume is required.";
  else if (!ALLOWED_MIME.has(file.mimeType) && !ALLOWED_EXT.test(file.filename)) {
    fieldErrors.resume = "Resume must be a PDF or Word document.";
  }

  let experience: number | undefined;
  if (experienceRaw) {
    const n = Number(experienceRaw);
    if (!Number.isNaN(n)) experience = n;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return res.status(400).json({ error: "Please fix the highlighted fields.", fieldErrors });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // 1) Upload the résumé to the private bucket, then insert the application row.
  const safeName = file!.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const resumePath = `${openingId}/${Date.now()}-${safeName}`;
  try {
    const up = await supabase.storage.from("resumes").upload(resumePath, file!.buffer, {
      contentType: file!.mimeType,
      upsert: false,
    });
    if (up.error) throw up.error;

    const ins = await supabase.from("applications").insert({
      opening_id: openingId,
      opening_title: openingTitle || null,
      zinterview_candidate_id: null,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      experience: experience ?? null,
      resume_path: resumePath,
    });
    if (ins.error) throw ins.error;
  } catch (err) {
    console.error("[apply] Supabase write failed", err);
    return res.status(502).json({ error: "We couldn't submit your application, please try again." });
  }

  // 2) Best-effort notification email (with the résumé attached) via Resend. A
  //    failure here must NOT fail the request — the Supabase row is the record.
  try {
    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.CAREERS_NOTIFY_EMAIL;
    if (resendKey && notifyEmail) {
      const fromEmail = process.env.CAREERS_FROM_EMAIL || "Venakan Careers <onboarding@resend.dev>";
      const rows: Array<[string, string]> = [
        ["Role", openingTitle || openingId],
        ["Name", `${firstName} ${lastName}`],
        ["Email", email],
        ["Phone", phone],
      ];
      if (experience !== undefined) rows.push(["Experience", `${experience} yrs`]);
      const html = `<h2>New job application</h2><p>${rows
        .map(([k, v]) => `<strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}`)
        .join("<br>")}</p><p>Résumé attached.</p>`;
      const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + "\n\nRésumé attached.";

      const er = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: [notifyEmail],
          reply_to: email,
          subject: `New application — ${openingTitle || openingId} — ${firstName} ${lastName}`,
          html,
          text,
          attachments: [{ filename: file!.filename, content: file!.buffer.toString("base64") }],
        }),
      });
      if (!er.ok) {
        const body = await er.text().catch(() => "");
        console.error(`[apply] Resend ${er.status}: ${body.slice(0, 300)}`);
      }
    }
  } catch (err) {
    console.error("[apply] notification email failed (application was saved)", err);
  }

  return res.status(200).json({ ok: true });
}
