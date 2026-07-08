import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Vercel serverless function (Node). Public GET. Returns the single payload that
// feeds every dropdown on the training registration form. Reads go through the
// service role key (all tables are RLS-locked with no public policies).
//
// Only client-safe columns are ever selected: no is_program_eligible, no codes,
// no draft programs.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[registration-options] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const [programs, experienceRanges, eligibilityOptions] = await Promise.all([
      supabase
        .from("training_programs")
        .select("id, slug, name")
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
      supabase
        .from("lookup_experience_ranges")
        .select("id, label")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("lookup_employment_eligibility")
        .select("id, label")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
    ]);

    if (programs.error) throw programs.error;
    if (experienceRanges.error) throw experienceRanges.error;
    if (eligibilityOptions.error) throw eligibilityOptions.error;

    // Edge cache: options change rarely.
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({
      programs: programs.data ?? [],
      experienceRanges: experienceRanges.data ?? [],
      eligibilityOptions: eligibilityOptions.data ?? [],
    });
  } catch (err) {
    console.error("[registration-options] unexpected error", err);
    return res.status(502).json({ error: "Unable to load registration options right now." });
  }
}
