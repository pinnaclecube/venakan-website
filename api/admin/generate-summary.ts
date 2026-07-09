import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

// Vercel serverless function (Node). Admin-only. Reads a program's uploaded PDF
// from the private "training-specs" bucket and produces a concise, Coursera-style
// course summary with the Anthropic API (native PDF understanding). Returns the
// summary markdown for admin review — it does NOT save.

// Inline admin gate (x-admin-key vs ADMIN_PASSWORD, constant-time). Kept inline
// per file so Vercel doesn't need to resolve a shared module across api/ — an
// external relative import isn't reliably bundled into the ESM function.
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

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const BUCKET = "training-specs";

const SYSTEM_PROMPT = `You write concise, Coursera-style course summaries from a training program document.
Return ONLY Markdown — no preamble, no code fences, no top-level # title. Keep it brief and scannable, NOT elaborate. Use exactly this structure:

## Overview
2–4 plain sentences describing what the program is and who it's for.

## What you'll learn
4–6 short bullet points.

## Skills you'll gain
One line: a short, comma-separated list of skills.

Base everything strictly on the document. Do not invent specifics, dates, prices, or tools that aren't in it.`;

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[admin/generate-summary] ANTHROPIC_API_KEY is not set");
    return res.status(500).json({ error: "Server is not configured." });
  }
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[admin/generate-summary] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }

  const b = parseBody(req.body);
  const programId = String(b.programId ?? "").trim();
  if (!programId) return res.status(400).json({ error: "Program id is required." });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Resolve the uploaded PDF path.
  const { data: program, error: progErr } = await supabase
    .from("training_programs")
    .select("id, spec_doc_path")
    .eq("id", programId)
    .maybeSingle();
  if (progErr) {
    console.error("[admin/generate-summary] program lookup failed", progErr);
    return res.status(500).json({ error: "Could not load the program." });
  }
  if (!program) return res.status(404).json({ error: "Program not found." });

  const path: string | null = (program as any).spec_doc_path || null;
  if (!path || !/\.pdf$/i.test(path)) {
    return res.status(400).json({ error: "Upload a PDF for this program first." });
  }

  // Download the PDF and base64-encode it for the Anthropic document block.
  let base64Pdf: string;
  try {
    const dl = await supabase.storage.from(BUCKET).download(path);
    if (dl.error || !dl.data) throw dl.error ?? new Error("empty download");
    const arrayBuffer = await dl.data.arrayBuffer();
    base64Pdf = Buffer.from(arrayBuffer).toString("base64");
  } catch (err) {
    console.error("[admin/generate-summary] PDF download failed", err);
    return res.status(502).json({ error: "Could not read the uploaded PDF." });
  }

  // Summarize with Anthropic (native PDF understanding).
  try {
    const resp = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: base64Pdf },
              },
              {
                type: "text",
                text: "Write a brief Coursera-style course summary of this training program document, following the required structure.",
              },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      console.error(`[admin/generate-summary] Anthropic ${resp.status}: ${body.slice(0, 300)}`);
      return res.status(502).json({ error: "Could not create the summary. Please try again." });
    }

    const data: any = await resp.json();
    let summary = String(data?.content?.[0]?.text ?? "").trim();
    summary = summary.replace(/^```(?:markdown)?\s*/i, "").replace(/\s*```$/i, "").trim();
    if (!summary) {
      return res.status(502).json({ error: "The summary came back empty. Please try again." });
    }

    return res.status(200).json({ summary });
  } catch (err) {
    console.error("[admin/generate-summary] generation failed", err);
    return res.status(502).json({ error: "Could not create the summary. Please try again." });
  }
}
