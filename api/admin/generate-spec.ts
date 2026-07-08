import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

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

// Vercel serverless function (Node). Admin-only. Generates a public-facing
// training specification with the Anthropic API. Returns the content for admin
// review — it does NOT save anything.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You write public-facing training program specifications for Venakan, an AI-only firm.

Return ONLY a single JSON object — no prose, no explanation, no markdown code fences — with exactly these keys:
{ "short_description": "...", "spec_markdown": "..." }

- "short_description": 1–2 plain, factual sentences describing the program. No hype, no marketing adjectives, no exclamation marks.
- "spec_markdown": a complete public-facing training specification in clean, well-structured Markdown. Include these sections, using ## headings: Overview, Who It's For, Week-by-Week Outline, Tools & Stack, Outcomes, and Capstone. Use bullet lists and short paragraphs. Do not include a top-level # title. Keep it professional and concrete.`;

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

// Strip accidental ``` fences and pull the outermost JSON object.
function extractJson(raw: string): string {
  let t = raw.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return t;
}

async function callAnthropic(apiKey: string, messages: any[]): Promise<string> {
  const resp = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Anthropic ${resp.status}: ${body.slice(0, 300)}`);
  }
  const data: any = await resp.json();
  return String(data?.content?.[0]?.text ?? "");
}

function coerce(parsed: any): { short_description: string; spec_markdown: string } | null {
  if (!parsed || typeof parsed !== "object") return null;
  const short_description = typeof parsed.short_description === "string" ? parsed.short_description.trim() : "";
  const spec_markdown = typeof parsed.spec_markdown === "string" ? parsed.spec_markdown.trim() : "";
  if (!short_description || !spec_markdown) return null;
  return { short_description, spec_markdown };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[admin/generate-spec] ANTHROPIC_API_KEY is not set");
    return res.status(500).json({ error: "Server is not configured." });
  }

  const b = parseBody(req.body);
  const brief = String(b.brief ?? "").trim();
  const programId = String(b.programId ?? "").trim();
  if (!brief) return res.status(400).json({ error: "A brief is required to generate a spec." });

  // Optional: pull the program name for extra context (best-effort).
  let programName = "";
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (programId && supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
      const { data } = await supabase.from("training_programs").select("name").eq("id", programId).maybeSingle();
      programName = (data as any)?.name ?? "";
    }
  } catch {
    /* non-fatal */
  }

  const userContent = `Program name: ${programName || "(untitled)"}\n\nBrief from the admin:\n${brief}`;
  const messages: any[] = [{ role: "user", content: userContent }];

  try {
    // First attempt.
    let text = await callAnthropic(apiKey, messages);
    let result = coerce((() => {
      try {
        return JSON.parse(extractJson(text));
      } catch {
        return null;
      }
    })());

    // Repair retry once if parsing/shape failed.
    if (!result) {
      const repairMessages = [
        ...messages,
        { role: "assistant", content: text },
        {
          role: "user",
          content:
            'That was not valid. Return ONLY the JSON object with keys "short_description" and "spec_markdown". No prose, no code fences.',
        },
      ];
      text = await callAnthropic(apiKey, repairMessages);
      result = coerce((() => {
        try {
          return JSON.parse(extractJson(text));
        } catch {
          return null;
        }
      })());
    }

    if (!result) {
      console.error("[admin/generate-spec] could not parse model output as JSON");
      return res.status(502).json({ error: "The generator returned invalid content. Please try again." });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("[admin/generate-spec] generation failed", err);
    return res.status(502).json({ error: "Spec generation failed. Please try again." });
  }
}
