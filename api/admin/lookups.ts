import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../../lib/admin-auth";

// Vercel serverless function (Node). Admin-only. Manage the two lookup tables:
// GET lists all rows (including inactive); PATCH edits label / sort_order /
// active. No deletes — rows are FK-referenced by training_interest.

const TABLES: Record<string, string> = {
  experience: "lookup_experience_ranges",
  eligibility: "lookup_employment_eligibility",
};

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

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[admin/lookups] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    if (req.method === "GET") {
      const [exp, elig] = await Promise.all([
        supabase.from(TABLES.experience).select("*").order("sort_order", { ascending: true }),
        supabase.from(TABLES.eligibility).select("*").order("sort_order", { ascending: true }),
      ]);
      if (exp.error) throw exp.error;
      if (elig.error) throw elig.error;
      return res.status(200).json({ experienceRanges: exp.data ?? [], eligibilityOptions: elig.data ?? [] });
    }

    if (req.method === "PATCH") {
      const b = parseBody(req.body);
      const table = TABLES[String(b.table ?? "")];
      if (!table) return res.status(400).json({ error: "Unknown lookup table." });
      const id = b.id;
      if (id === undefined || id === null || id === "") {
        return res.status(400).json({ error: "Row id is required." });
      }

      const patch: Record<string, any> = {};
      if (b.label !== undefined) {
        const label = String(b.label).trim();
        if (!label) return res.status(400).json({ error: "Label cannot be empty." });
        patch.label = label;
      }
      if (b.sort_order !== undefined) patch.sort_order = Number(b.sort_order) || 0;
      if (b.active !== undefined) patch.active = Boolean(b.active);
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: "Nothing to update." });
      }

      const { data, error } = await supabase.from(table).update(patch).eq("id", id).select().single();
      if (error) throw error;
      return res.status(200).json({ row: data });
    }

    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[admin/lookups] unexpected error", err);
    return res.status(500).json({ error: (err as any)?.message || "Request failed." });
  }
}
