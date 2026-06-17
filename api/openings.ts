import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

// Vercel serverless function (Node). NOT a Vite route — runs only on Vercel
// (or `vercel dev`), never under `vite dev`.

const ZINTERVIEW_BASE = "https://app.zinterview.ai/api/v1";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-6";

type Trait = { point: string; because?: string; dimension?: string };
type WittyContent = {
  witty_intro: string;
  witty_responsibilities: string[];
  witty_traits: Trait[];
};

function normalizeTraits(raw: unknown): Trait[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t: any): Trait => {
      if (typeof t === "string") return { point: t };
      return {
        point: t?.point ?? t?.trait ?? t?.name ?? t?.title ?? "",
        because: t?.because ?? t?.description ?? t?.reason ?? undefined,
        dimension: t?.dimension ?? t?.category ?? undefined,
      };
    })
    .filter((t) => t.point);
}

// Stable hash of the source JD fields. Changes when the JD is edited in
// Zinterview, which invalidates the cache and triggers regeneration.
function sourceHash(o: any): string {
  const payload = JSON.stringify({
    businessContext: o?.businessContext ?? "",
    responsibilities: Array.isArray(o?.jobRequirementsAndResponsibilities)
      ? o.jobRequirementsAndResponsibilities
      : [],
    behavioralTraits: normalizeTraits(o?.behavioralTraits),
  });
  return createHash("sha256").update(payload).digest("hex");
}

// Call Anthropic ONCE to produce witty copy. Returns null on any failure so the
// caller can fall back to the original copy (and skip caching).
async function generateWitty(o: any): Promise<WittyContent | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const intro: string = o?.businessContext ?? "";
  const responsibilities: string[] = Array.isArray(o?.jobRequirementsAndResponsibilities)
    ? o.jobRequirementsAndResponsibilities
    : [];
  const traits = normalizeTraits(o?.behavioralTraits);

  const prompt = `You are an in-house copywriter for Venakan, an AI-only company. Rewrite the copy for a REAL job opening to have light wit and personality — characterful but professional, on-brand for a serious AI company. Not gimmicky, not cringe, not over-the-top.

HARD RULES:
- Preserve the original MEANING and ALL factual details exactly. Do NOT invent or add requirements, salary, perks, locations, tools, or anything not present in the source.
- Reword, do not replace: keep the same substance, just more personality.
- "witty_responsibilities" must have the SAME number of items as the source Responsibilities, each a reworded version of the corresponding item.
- "witty_traits" must have the SAME number of items as the source BehavioralTraits, preserving each item's "dimension" exactly and its underlying meaning; only the wording of "point"/"because" becomes more characterful.
- Return STRICT JSON ONLY. No markdown, no code fences, no preamble or trailing text.

OUTPUT JSON SHAPE:
{"witty_intro": string, "witty_responsibilities": string[], "witty_traits": [{"point": string, "because": string, "dimension": string}]}

SOURCE:
Title: ${JSON.stringify(o?.title ?? "")}
Intro: ${JSON.stringify(intro)}
Responsibilities: ${JSON.stringify(responsibilities)}
BehavioralTraits: ${JSON.stringify(traits)}`;

  try {
    const resp = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      console.error(`[openings] Anthropic ${resp.status}: ${body.slice(0, 300)}`);
      return null;
    }

    const data: any = await resp.json();
    let text: string = (data?.content?.[0]?.text ?? "").trim();
    // Strip code fences defensively if the model added them.
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const parsed = JSON.parse(text);
    const witty_intro = typeof parsed?.witty_intro === "string" ? parsed.witty_intro : intro;
    const witty_responsibilities = Array.isArray(parsed?.witty_responsibilities)
      ? parsed.witty_responsibilities.filter((x: unknown) => typeof x === "string")
      : responsibilities;
    const witty_traits = normalizeTraits(parsed?.witty_traits);

    return {
      witty_intro,
      witty_responsibilities: witty_responsibilities.length ? witty_responsibilities : responsibilities,
      witty_traits: witty_traits.length ? witty_traits : traits,
    };
  } catch (err) {
    console.error("[openings] witty generation failed", err);
    return null;
  }
}

// Build the client-facing opening, swapping in witty copy where available
// (cache → generate-and-cache → original fallback). Raw behavioralTraits are
// never sent to the client; only the normalized/witty {point, because, dimension}.
async function buildOpening(o: any, supabase: SupabaseClient | null) {
  const originalIntro: string = o?.businessContext ?? "";
  const originalResp: string[] = Array.isArray(o?.jobRequirementsAndResponsibilities)
    ? o.jobRequirementsAndResponsibilities
    : [];
  const originalTraits = normalizeTraits(o?.behavioralTraits);

  let intro = originalIntro;
  let responsibilities = originalResp;
  let traits = originalTraits;

  // Only attempt witty copy when both Supabase (for caching) and Anthropic are configured.
  if (supabase && process.env.ANTHROPIC_API_KEY) {
    const hash = sourceHash(o);
    try {
      const { data: cached } = await supabase
        .from("opening_content")
        .select("witty_intro, witty_responsibilities, witty_traits")
        .eq("opening_id", o._id)
        .eq("source_hash", hash)
        .maybeSingle();

      if (cached) {
        // Cache hit — no AI call.
        intro = cached.witty_intro ?? originalIntro;
        responsibilities = Array.isArray(cached.witty_responsibilities)
          ? cached.witty_responsibilities
          : originalResp;
        const ct = normalizeTraits(cached.witty_traits);
        traits = ct.length ? ct : originalTraits;
      } else {
        // Cache miss — generate once, then cache.
        const witty = await generateWitty(o);
        if (witty) {
          intro = witty.witty_intro || originalIntro;
          responsibilities = witty.witty_responsibilities.length ? witty.witty_responsibilities : originalResp;
          traits = witty.witty_traits.length ? witty.witty_traits : originalTraits;
          const { error: insErr } = await supabase.from("opening_content").insert({
            opening_id: o._id,
            source_hash: hash,
            witty_intro: intro,
            witty_responsibilities: responsibilities,
            witty_traits: traits,
          });
          if (insErr) console.error("[openings] cache insert failed", insErr.message);
        }
        // witty === null → AI/parse failed: keep originals, do NOT cache.
      }
    } catch (err) {
      console.error("[openings] cache lookup failed; serving original copy", err);
      // Fall back to originals — the listing must always render.
    }
  }

  return {
    id: o._id,
    title: o.title,
    isTechnical: o.isTechnical,
    minExperience: o.minExperience,
    maxExperience: o.maxExperience,
    jobRequirementsAndResponsibilities: responsibilities, // witty (or original on fallback)
    businessContext: intro, // witty intro (or original on fallback)
    behavioralTraits: traits, // witty {point, because, dimension} (or normalized original on fallback)
    skillsGroup: Array.isArray(o.skillsGroup)
      ? o.skillsGroup.map((g: any) => ({ skillGroupName: g?.skillGroupName, skills: g?.skills }))
      : [],
    jobDetails: o.jobDetails
      ? {
          jobType: o.jobDetails.jobType,
          workmode: o.jobDetails.workmode,
          location: o.jobDetails.location,
          educationMinimum: o.jobDetails.educationMinimum,
          educationIdeal: o.jobDetails.educationIdeal,
          totalOpenPositions: o.jobDetails.totalOpenPositions,
        }
      : null,
    // SALARY INTENTIONALLY OMITTED for now — to re-enable, add salaryMin/salaryMax/salaryCurrency on this line.
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ZINTERVIEW_API_KEY;
  if (!apiKey) {
    console.error("[openings] ZINTERVIEW_API_KEY is not set");
    return res.status(500).json({ error: "Server is not configured." });
  }

  try {
    const upstream = await fetch(`${ZINTERVIEW_BASE}/openings`, {
      // Raw key, NO "Bearer " prefix, per Zinterview.
      headers: { Authorization: apiKey },
    });

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.error(`[openings] Zinterview responded ${upstream.status}: ${body.slice(0, 500)}`);
      return res.status(502).json({ error: "Unable to load openings right now." });
    }

    const data: unknown = await upstream.json();
    const list: any[] = Array.isArray(data)
      ? data
      : ((data as any)?.openings ?? (data as any)?.data ?? []);
    const active = list.filter((o) => o?.status === true);

    // Supabase client for the witty-copy cache (service role bypasses RLS).
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase =
      supabaseUrl && serviceKey
        ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
        : null;

    const openings = await Promise.all(active.map((o) => buildOpening(o, supabase)));

    // Cache at the edge so the list (and any AI generation) isn't repeated on every load.
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ openings });
  } catch (err) {
    console.error("[openings] unexpected error", err);
    return res.status(502).json({ error: "Unable to load openings right now." });
  }
}
