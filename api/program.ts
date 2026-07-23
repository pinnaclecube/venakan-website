import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Vercel serverless function (Node). Public GET ?slug=<slug>. Returns the full
// public detail for a single PUBLISHED training program (used by the dynamic
// /training/:slug page). Draft or unknown slugs return 404.

const BUCKET = "training-specs";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const slug = String((req.query.slug ?? "") as string).trim();
  if (!slug) return res.status(400).json({ error: "A slug is required." });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[program] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("training_programs")
      .select("slug, name, short_description, spec_type, spec_markdown, spec_doc_path, status, tuition_cents, currency")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;

    // Unknown slug or draft → 404 (the client renders NotFound).
    if (!data || (data as any).status !== "published") {
      return res.status(404).json({ error: "Program not found." });
    }

    const p: any = data;
    const specDocPath: string | null = p.spec_doc_path || null;
    let docUrl: string | null = null;
    if (specDocPath) {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(specDocPath);
      docUrl = pub?.publicUrl ?? null;
    }

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json({
      slug: p.slug,
      name: p.name,
      short_description: p.short_description,
      spec_type: p.spec_type,
      // spec_markdown holds the course summary (generated from the PDF or written
      // by an admin); expose it whenever present.
      spec_markdown: p.spec_markdown ?? null,
      doc_url: docUrl,
      doc_is_pdf: specDocPath ? /\.pdf$/i.test(specDocPath) : false,
      tuition_cents: p.tuition_cents ?? 0,
      currency: p.currency ?? "usd",
    });
  } catch (err) {
    console.error("[program] unexpected error", err);
    return res.status(502).json({ error: "Unable to load the program right now." });
  }
}
