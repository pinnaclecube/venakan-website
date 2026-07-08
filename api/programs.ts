import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Vercel serverless function (Node). Public GET. Returns published training
// programs for the marketing pages. Reads go through the service role key (the
// table is RLS-locked with no public policies).
//
// The raw spec_markdown / spec_doc_path are never sent to the client — only the
// has_spec / has_pdf booleans that tell the UI whether a spec exists.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[programs] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data, error } = await supabase
      .from("training_programs")
      .select("slug, name, short_description, spec_type, spec_markdown, spec_doc_path")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    const programs = (data ?? []).map((p: any) => ({
      slug: p.slug,
      name: p.name,
      short_description: p.short_description,
      spec_type: p.spec_type,
      has_spec: typeof p.spec_markdown === "string" && p.spec_markdown.trim().length > 0,
      has_pdf: typeof p.spec_doc_path === "string" && p.spec_doc_path.trim().length > 0,
    }));

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ programs });
  } catch (err) {
    console.error("[programs] unexpected error", err);
    return res.status(502).json({ error: "Unable to load training programs right now." });
  }
}
