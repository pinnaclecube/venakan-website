import type { VercelRequest, VercelResponse } from "@vercel/node";

// Vercel serverless function (Node). NOT a Vite route — runs only on Vercel
// (or `vercel dev`), never under `vite dev`.

const ZINTERVIEW_BASE = "https://app.zinterview.ai/api/v1";

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
      // Log full detail server-side only; never leak key/upstream body to client.
      console.error(`[openings] Zinterview responded ${upstream.status}: ${body.slice(0, 500)}`);
      return res.status(502).json({ error: "Unable to load openings right now." });
    }

    const data: unknown = await upstream.json();
    const list: any[] = Array.isArray(data)
      ? data
      : ((data as any)?.openings ?? (data as any)?.data ?? []);

    // Return only live openings, in a CLEAN, minimal shape. Strip every internal/
    // sensitive field; expose only what the public page needs to render.
    const openings = list
      .filter((o) => o?.status === true)
      .map((o) => ({
        id: o._id,
        title: o.title,
        isTechnical: o.isTechnical,
        minExperience: o.minExperience,
        maxExperience: o.maxExperience,
        jobRequirementsAndResponsibilities: Array.isArray(o.jobRequirementsAndResponsibilities)
          ? o.jobRequirementsAndResponsibilities
          : [],
        businessContext: o.businessContext,
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
      }));

    // Cache at the edge so the list isn't refetched on every page load.
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ openings });
  } catch (err) {
    console.error("[openings] unexpected error", err);
    return res.status(502).json({ error: "Unable to load openings right now." });
  }
}
