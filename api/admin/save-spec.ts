import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { marked } from "marked";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { requireAdmin } from "../../lib/admin-auth";

// Vercel serverless function (Node). Admin-only. Saves a reviewed generated
// spec, renders it to a branded PDF (white print layout, dark text), uploads the
// PDF to the public "training-specs" bucket, and records spec_doc_path.
//
// Chromium needs more memory/time than the default — see the functions block in
// vercel.json for this route.

const BUCKET = "training-specs";

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Branded, print-ready HTML: white page, dark text, Venakan wordmark header.
function buildHtml(programName: string, bodyHtml: string, dateStr: string): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @import url("https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=Inter:wght@400;600;700&display=swap");
  * { box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: #1a2233; margin: 0; padding: 0; line-height: 1.6; font-size: 12px; }
  .page { padding: 8px 4px; }
  .brand { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 2px solid #34D399; padding-bottom: 12px; margin-bottom: 20px; }
  .wordmark { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 22px; letter-spacing: 0.04em; color: #0F172A; text-transform: uppercase; }
  .wordmark small { display: block; font-size: 9px; letter-spacing: 0.28em; color: #64748b; font-weight: 500; }
  .meta { text-align: right; font-size: 10px; color: #64748b; }
  h1.program { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 26px; color: #0F172A; margin: 0 0 24px; }
  h2 { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 16px; color: #0f9d6c; margin: 24px 0 8px; }
  h3 { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 13px; color: #0F172A; margin: 16px 0 6px; }
  p { margin: 0 0 10px; }
  ul, ol { margin: 0 0 10px; padding-left: 20px; }
  li { margin-bottom: 4px; }
  strong { color: #0F172A; }
  a { color: #0f9d6c; }
  table { border-collapse: collapse; width: 100%; margin: 0 0 12px; }
  th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
  code { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 11px; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
</style>
</head>
<body>
  <div class="page">
    <div class="brand">
      <div class="wordmark">Venakan<small>Info Solutions</small></div>
      <div class="meta">Training Specification<br/>${escapeHtml(dateStr)}</div>
    </div>
    <h1 class="program">${escapeHtml(programName)}</h1>
    ${bodyHtml}
  </div>
</body>
</html>`;
}

async function renderPdf(html: string): Promise<Buffer> {
  chromium.setGraphicsMode = false; // lighter footprint; we only need print rendering
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    // Wait for the web fonts to finish loading before rendering.
    await page.evaluate("document.fonts.ready");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", bottom: "16mm", left: "16mm", right: "16mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
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
    console.error("[admin/save-spec] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }

  const b = parseBody(req.body);
  const programId = String(b.programId ?? "").trim();
  const shortDescription = String(b.short_description ?? "").trim();
  const specMarkdown = String(b.spec_markdown ?? "").trim();
  if (!programId) return res.status(400).json({ error: "Program id is required." });
  if (!shortDescription) return res.status(400).json({ error: "A short description is required." });
  if (!specMarkdown) return res.status(400).json({ error: "Spec markdown is required." });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Resolve slug + name for the storage path and PDF header.
  const { data: program, error: progErr } = await supabase
    .from("training_programs")
    .select("id, slug, name")
    .eq("id", programId)
    .maybeSingle();
  if (progErr) {
    console.error("[admin/save-spec] program lookup failed", progErr);
    return res.status(500).json({ error: "Could not load the program." });
  }
  if (!program) return res.status(404).json({ error: "Program not found." });

  // Render the branded PDF.
  let pdfBuffer: Buffer;
  try {
    const bodyHtml = await marked.parse(specMarkdown, { async: true });
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const html = buildHtml((program as any).name, bodyHtml, dateStr);
    pdfBuffer = await renderPdf(html);
  } catch (err) {
    console.error("[admin/save-spec] PDF render failed", err);
    return res.status(502).json({ error: "Could not render the PDF. Please try again." });
  }

  const specDocPath = `${(program as any).slug}/spec.pdf`;

  // Upload to the public bucket (overwrite prior version).
  try {
    const up = await supabase.storage.from(BUCKET).upload(specDocPath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (up.error) throw up.error;
  } catch (err) {
    console.error("[admin/save-spec] PDF upload failed", err);
    return res.status(502).json({ error: "Could not upload the PDF. Please try again." });
  }

  // Persist the reviewed content + path.
  try {
    const { error } = await supabase
      .from("training_programs")
      .update({
        short_description: shortDescription,
        spec_markdown: specMarkdown,
        spec_type: "generated",
        spec_doc_path: specDocPath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", programId);
    if (error) throw error;
  } catch (err) {
    console.error("[admin/save-spec] update failed", err);
    return res.status(500).json({ error: "Saved the PDF but could not update the program." });
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(specDocPath);
  return res.status(200).json({ ok: true, spec_doc_path: specDocPath, pdf_url: pub?.publicUrl ?? null });
}
