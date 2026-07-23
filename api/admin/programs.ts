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

// Vercel serverless function (Node). Admin-only CRUD on training_programs.
// GET (all, incl. drafts) · POST (create) · PATCH (update) · DELETE (FK-guarded).

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
    console.error("[admin/programs] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    // ── List (including drafts) ──
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("training_programs")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return res.status(200).json({ programs: data ?? [] });
    }

    // ── Create ──
    if (req.method === "POST") {
      const b = parseBody(req.body);
      const name = String(b.name ?? "").trim();
      const slug = String(b.slug ?? "").trim();
      if (!name) return res.status(400).json({ error: "Name is required." });
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return res.status(400).json({ error: "Slug must be lowercase letters, numbers, and hyphens." });
      }
      const { data, error } = await supabase
        .from("training_programs")
        .insert({
          name,
          slug,
          short_description: b.short_description ?? null,
          spec_markdown: b.spec_markdown ?? null,
          status: b.status === "published" ? "published" : "draft",
          sort_order: Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 0,
        })
        .select()
        .single();
      if (error) {
        if ((error as any).code === "23505") {
          return res.status(409).json({ error: "A program with that slug already exists." });
        }
        throw error;
      }
      return res.status(200).json({ program: data });
    }

    // ── Update ──
    if (req.method === "PATCH") {
      const b = parseBody(req.body);
      const id = String(b.id ?? "").trim();
      if (!id) return res.status(400).json({ error: "Program id is required." });

      const patch: Record<string, any> = { updated_at: new Date().toISOString() };
      if (b.name !== undefined) patch.name = String(b.name).trim();
      if (b.slug !== undefined) {
        const slug = String(b.slug).trim();
        if (!/^[a-z0-9-]+$/.test(slug)) {
          return res.status(400).json({ error: "Slug must be lowercase letters, numbers, and hyphens." });
        }
        patch.slug = slug;
      }
      if (b.short_description !== undefined) patch.short_description = b.short_description;
      if (b.spec_markdown !== undefined) patch.spec_markdown = b.spec_markdown;
      if (b.status !== undefined) patch.status = b.status === "published" ? "published" : "draft";
      if (b.sort_order !== undefined) patch.sort_order = Number(b.sort_order) || 0;
      // Tuition stored in cents (UI sends dollars); seats/currency validated min 0.
      if (b.tuition_usd !== undefined) {
        const dollars = Number(b.tuition_usd);
        if (!Number.isFinite(dollars) || dollars < 0) {
          return res.status(400).json({ error: "Tuition must be 0 or more." });
        }
        patch.tuition_cents = Math.round(dollars * 100);
      }
      if (b.currency !== undefined) patch.currency = String(b.currency).trim().toLowerCase() || "usd";
      if (b.seats_total !== undefined) {
        if (b.seats_total === null || b.seats_total === "") {
          patch.seats_total = null;
        } else {
          const seats = Number(b.seats_total);
          if (!Number.isInteger(seats) || seats < 0) {
            return res.status(400).json({ error: "Seats must be a whole number, 0 or more." });
          }
          patch.seats_total = seats;
        }
      }

      const { data, error } = await supabase
        .from("training_programs")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        if ((error as any).code === "23505") {
          return res.status(409).json({ error: "A program with that slug already exists." });
        }
        throw error;
      }
      return res.status(200).json({ program: data });
    }

    // ── Delete (blocked when registrations reference the program) ──
    if (req.method === "DELETE") {
      const b = parseBody(req.body);
      const id = String((req.query.id ?? b.id) ?? "").trim();
      if (!id) return res.status(400).json({ error: "Program id is required." });

      const { count, error: cntErr } = await supabase
        .from("training_interest")
        .select("id", { count: "exact", head: true })
        .eq("program_id", id);
      if (cntErr) throw cntErr;
      if ((count ?? 0) > 0) {
        return res.status(409).json({
          error: `Cannot delete: ${count} registration${count === 1 ? "" : "s"} reference this program. Unpublish it instead.`,
        });
      }

      const { error } = await supabase.from("training_programs").delete().eq("id", id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[admin/programs] unexpected error", err);
    return res.status(500).json({ error: (err as any)?.message || "Request failed." });
  }
}
