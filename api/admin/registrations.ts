import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

// Vercel serverless function (Node). Admin-only. Lists training_interest
// submissions with human-readable labels and a short-lived signed download URL
// for each résumé (the training-resumes bucket is private).

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

const RESUME_BUCKET = "training-resumes";
const SIGNED_URL_TTL = 60 * 60; // 1 hour

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[admin/registrations] missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server is not configured." });
  }
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    // Registrations + the three lookup tables, resolved in JS (robust vs. PostgREST embeds).
    const [interest, programs, experience, eligibility, payments] = await Promise.all([
      supabase.from("training_interest").select("*").order("created_at", { ascending: false }),
      supabase.from("training_programs").select("id, name"),
      supabase.from("lookup_experience_ranges").select("id, label"),
      supabase.from("lookup_employment_eligibility").select("id, label, is_program_eligible"),
      supabase.from("payments").select("application_id, status, amount_cents, paid_at, created_at").order("created_at", { ascending: false }),
    ]);
    if (interest.error) throw interest.error;
    if (programs.error) throw programs.error;
    if (experience.error) throw experience.error;
    if (eligibility.error) throw eligibility.error;
    if (payments.error) throw payments.error;

    const programMap = new Map<string, string>((programs.data ?? []).map((p: any) => [p.id, p.name]));
    const expMap = new Map<number, string>((experience.data ?? []).map((r: any) => [r.id, r.label]));
    const eligMap = new Map<number, string>((eligibility.data ?? []).map((r: any) => [r.id, r.label]));
    const eligFlagMap = new Map<number, boolean>((eligibility.data ?? []).map((r: any) => [r.id, r.is_program_eligible]));

    // Latest payment per application (payments ordered created_at desc → first seen wins).
    const latestPayment = new Map<string, any>();
    for (const p of payments.data ?? []) {
      if (!latestPayment.has(p.application_id)) latestPayment.set(p.application_id, p);
    }

    const rows = interest.data ?? [];
    const registrations = await Promise.all(
      rows.map(async (r: any) => {
        let resumeUrl: string | null = null;
        if (r.resume_path) {
          const { data: signed } = await supabase.storage
            .from(RESUME_BUCKET)
            .createSignedUrl(r.resume_path, SIGNED_URL_TTL);
          resumeUrl = signed?.signedUrl ?? null;
        }
        const pay = latestPayment.get(r.id);
        return {
          id: r.id,
          created_at: r.created_at,
          first_name: r.first_name,
          last_name: r.last_name,
          email: r.email,
          phone: r.phone,
          linkedin_url: r.linkedin_url ?? null,
          program_id: r.program_id,
          program_name: programMap.get(r.program_id) ?? "—",
          experience_label: expMap.get(r.experience_range_id) ?? "—",
          eligibility_label: eligMap.get(r.eligibility_id) ?? "—",
          is_program_eligible: eligFlagMap.get(r.eligibility_id) ?? true,
          resume_url: resumeUrl,
          status: r.status ?? "submitted",
          payment_status: pay?.status ?? null,
          payment_amount_cents: pay?.amount_cents ?? null,
          paid_at: pay?.paid_at ?? null,
        };
      })
    );

    return res.status(200).json({ registrations });
  } catch (err) {
    console.error("[admin/registrations] unexpected error", err);
    return res.status(500).json({ error: (err as any)?.message || "Request failed." });
  }
}
