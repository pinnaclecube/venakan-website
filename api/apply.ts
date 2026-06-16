import type { VercelRequest, VercelResponse } from "@vercel/node";
import Busboy from "busboy";
import { createClient } from "@supabase/supabase-js";

// Vercel serverless function (Node). Accepts multipart/form-data, so Vercel's
// default JSON body parser MUST be disabled.
export const config = { api: { bodyParser: false } };

const ZINTERVIEW_BASE = "https://app.zinterview.ai/api/v1";
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ZINTERVIEW_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey || !supabaseUrl || !serviceKey) {
    console.error("[apply] missing required env vars");
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

  // ── Dual write, in this exact order ──

  // 1) Zinterview create-candidate (multipart/form-data with the resume file).
  let candidateId: string | undefined;
  try {
    const fd = new FormData();
    fd.append("openingId", openingId);
    fd.append("firstName", firstName);
    fd.append("lastName", lastName);
    fd.append("email", email);
    fd.append("phoneNumber", phone);
    if (experience !== undefined) fd.append("experience", String(experience));
    fd.append("resume", new Blob([new Uint8Array(file!.buffer)], { type: file!.mimeType }), file!.filename);

    const zr = await fetch(`${ZINTERVIEW_BASE}/candidates/create-candidate`, {
      method: "POST",
      headers: { Authorization: apiKey }, // raw key, no Bearer prefix
      body: fd,
    });

    if (!zr.ok) {
      const body = await zr.text().catch(() => "");
      console.error(`[apply] Zinterview create-candidate ${zr.status}: ${body.slice(0, 500)}`);
      // Zinterview failed → do NOT write to Supabase.
      return res
        .status(502)
        .json({ error: "We couldn't submit your application, please try again." });
    }

    const zdata: any = await zr.json().catch(() => ({}));
    candidateId = zdata?._id ?? zdata?.candidate?._id ?? zdata?.data?._id;
  } catch (err) {
    console.error("[apply] Zinterview request failed", err);
    return res
      .status(502)
      .json({ error: "We couldn't submit your application, please try again." });
  }

  // 2) Supabase: upload resume to the private bucket, then insert the row.
  //    The candidate already exists in Zinterview, so if this step fails we still
  //    return success to the user and log for later reconciliation.
  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const safeName = file!.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const resumePath = `${openingId}/${candidateId || crypto.randomUUID()}-${safeName}`;

    const up = await supabase.storage.from("resumes").upload(resumePath, file!.buffer, {
      contentType: file!.mimeType,
      upsert: false,
    });
    if (up.error) throw up.error;

    const ins = await supabase.from("applications").insert({
      opening_id: openingId,
      opening_title: openingTitle || null,
      zinterview_candidate_id: candidateId || null,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      experience: experience ?? null,
      resume_path: resumePath,
    });
    if (ins.error) throw ins.error;
  } catch (err) {
    // TODO: reconcile — candidate IS in Zinterview but the local row/storage write
    // failed. Use the logged Zinterview candidate id to backfill the missing row.
    console.error("[apply] Supabase write FAILED after Zinterview success", {
      zinterviewCandidateId: candidateId,
      openingId,
      email,
      error: err instanceof Error ? err.message : String(err),
    });
    // Do not surface failure to the user — they are already a Zinterview candidate.
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
