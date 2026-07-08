import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../../lib/admin-auth";

// Vercel serverless function (Node). Admin-only. Accepts a base64 PDF or DOCX,
// uploads it to the public "training-specs" bucket, and marks the program as an
// uploaded spec.
export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };

const BUCKET = "training-specs";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB decoded
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]);

function parseBody(body: any): any {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body ?? {};
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
    console.error("[admin/upload-spec] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }

  const b = parseBody(req.body);
  const programId = String(b.programId ?? "").trim();
  const shortDescription = String(b.short_description ?? "").trim();
  const fileBase64 = String(b.fileBase64 ?? "");
  const filename = String(b.filename ?? "").trim();
  const mimeType = String(b.mimeType ?? "").trim();

  if (!programId) return res.status(400).json({ error: "Program id is required." });
  if (!fileBase64 || !filename) return res.status(400).json({ error: "A file is required." });
  if (!ALLOWED_MIME.has(mimeType) && !/\.(pdf|docx)$/i.test(filename)) {
    return res.status(400).json({ error: "File must be a PDF or DOCX." });
  }

  const rawBase64 = fileBase64.includes(",") ? fileBase64.slice(fileBase64.indexOf(",") + 1) : fileBase64;
  let buffer: Buffer;
  try {
    buffer = Buffer.from(rawBase64, "base64");
  } catch {
    return res.status(400).json({ error: "Could not read the file." });
  }
  if (buffer.length === 0) return res.status(400).json({ error: "The file is empty." });
  if (buffer.length > MAX_BYTES) return res.status(400).json({ error: "File must be 5 MB or smaller." });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: program, error: progErr } = await supabase
    .from("training_programs")
    .select("id, slug")
    .eq("id", programId)
    .maybeSingle();
  if (progErr) {
    console.error("[admin/upload-spec] program lookup failed", progErr);
    return res.status(500).json({ error: "Could not load the program." });
  }
  if (!program) return res.status(404).json({ error: "Program not found." });

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const specDocPath = `${(program as any).slug}/${safeName}`;
  const contentType = ALLOWED_MIME.has(mimeType)
    ? mimeType
    : /\.pdf$/i.test(filename)
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  try {
    const up = await supabase.storage.from(BUCKET).upload(specDocPath, buffer, { contentType, upsert: true });
    if (up.error) throw up.error;
  } catch (err) {
    console.error("[admin/upload-spec] upload failed", err);
    return res.status(502).json({ error: "Could not upload the file. Please try again." });
  }

  try {
    const patch: Record<string, any> = {
      spec_type: "uploaded",
      spec_doc_path: specDocPath,
      updated_at: new Date().toISOString(),
    };
    if (shortDescription) patch.short_description = shortDescription;
    const { error } = await supabase.from("training_programs").update(patch).eq("id", programId);
    if (error) throw error;
  } catch (err) {
    console.error("[admin/upload-spec] update failed", err);
    return res.status(500).json({ error: "Uploaded the file but could not update the program." });
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(specDocPath);
  return res.status(200).json({ ok: true, spec_doc_path: specDocPath, doc_url: pub?.publicUrl ?? null });
}
