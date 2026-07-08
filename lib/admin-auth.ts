import type { VercelRequest, VercelResponse } from "@vercel/node";
import { timingSafeEqual } from "node:crypto";

// Shared password gate for every admin serverless function. The expected value
// lives in process.env.ADMIN_PASSWORD (server-side only — never in the bundle).
// The client sends it in the `x-admin-key` header. Comparison is constant-time.
//
// Returns true when authorized. On failure it writes the response (401/500) and
// returns false, so callers do: `if (!requireAdmin(req, res)) return;`.
export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("[admin] ADMIN_PASSWORD is not set");
    res.status(500).json({ error: "Server is not configured." });
    return false;
  }

  const raw = req.headers["x-admin-key"];
  const provided = Array.isArray(raw) ? raw[0] : raw;

  if (!provided || !constantTimeEqual(provided, expected)) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  return true;
}

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  // timingSafeEqual throws on length mismatch; guard while still touching the
  // buffer so length differences don't short-circuit before any comparison.
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
