import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceHero } from "@/components/ServiceHero";

function TracksPanel() {
  return (
    <div className="flex flex-col h-full gap-2.5">
      <div
        style={{
          borderTop: "2px solid var(--color-brand-blue)",
          background: "rgba(52,211,153,0.06)",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="tag tag-blue">Executive</span>
        </div>
        <div className="font-display font-bold text-[14px] text-white">AI Fluency for Leaders</div>
        <div className="font-mono text-[10px] text-[var(--white-muted)] mt-1">
          1–2 day intensive · C-Suite, VP, Director
        </div>
      </div>

      <div
        style={{
          borderTop: "2px solid var(--color-brand-violet)",
          background: "rgba(52,211,153,0.06)",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="tag tag-violet">Technical</span>
        </div>
        <div className="font-display font-bold text-[14px] text-white">AI Enablement for Builders</div>
        <div className="font-mono text-[10px] text-[var(--white-muted)] mt-1">
          Multi-week · Developers, Architects, PMs
        </div>
      </div>

      <Link
        href="/training#tracks"
        className="btn-ghost w-full justify-center mt-1"
        style={{ fontSize: 12, padding: "8px 16px" }}
      >
        Compare Both Tracks →
      </Link>
    </div>
  );
}

// Teaser near the bottom of the Training page: pulls published tracks from
// /api/programs and links to the registration flow.
function TrainingInterestTeaser() {
  const { data } = useQuery<{ programs: { slug: string; name: string }[] }>({
    queryKey: ["training-programs"],
    queryFn: async () => {
      const res = await fetch("/api/programs");
      if (!res.ok) throw new Error("Failed to load training programs");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const programs = data?.programs ?? [];

  return (
    <section style={{ background: "var(--black-mid)" }}>
      <div className="container">
        <Reveal variant="heading">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Register your interest in a track.
          </h2>
          <p className="text-lg text-white/70 leading-relaxed max-w-2xl mb-7">
            Pick the program that fits, share a few details, and we'll follow up with curriculum,
            schedule, and next steps.
          </p>
        </Reveal>
        {programs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {programs.map((p) => (
              <span key={p.slug} className="tag">
                {p.name}
              </span>
            ))}
          </div>
        )}
        <Link href="/training/register" className="btn-primary">
          Register Your Interest &rarr;
        </Link>
      </div>
    </section>
  );
}

// Dynamic tracks: published programs from /api/programs, each linking to its
// full spec page at /training/{slug}.
function TracksGrid() {
  const { data, isLoading } = useQuery<{
    programs: { slug: string; name: string; short_description: string | null }[];
  }>({
    queryKey: ["training-programs"],
    queryFn: async () => {
      const res = await fetch("/api/programs");
      if (!res.ok) throw new Error("Failed to load training programs");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const programs = data?.programs ?? [];

  return (
    <section id="tracks" className="scroll-mt-24" style={{ background: "var(--bg-surface)" }}>
      <div className="container">
        <Reveal variant="heading">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Training programs</h2>
          <p className="text-lg text-white/70 max-w-2xl mb-10">
            Purpose-built programs for leaders and builders. Explore each track's full specification.
          </p>
        </Reveal>
        {isLoading ? (
          <p style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12 }}>Loading programs…</p>
        ) : programs.length === 0 ? (
          <p style={{ color: "var(--text-2)" }}>Programs are being finalized. Check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 60} className="h-full" variant="card">
                <div className="glass p-7 h-full flex flex-col">
                  <h3 className="text-2xl font-display font-bold mb-3">{p.name}</h3>
                  <p className="text-sm mb-6 flex-grow" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
                    {p.short_description}
                  </p>
                  <Link href={`/training/${p.slug}`} className="btn-ghost self-start">
                    View Program Details →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function Training() {
  return (
    <div className="w-full">
      <ServiceHero
        h1Line1="AI Fluency."
        h1Line2="For Every Role."
        subhead="Two purpose-built tracks — executive decision-makers and technical builders. Designed by practitioners who ship AI systems daily, not career educators."
        chips={["Executive Track", "Technical Track", "Custom Programs Available"]}
        primaryCta="Request a Training Program →"
        secondaryCta="See Both Tracks ↓"
        secondaryCtaTo="/training#tracks"
        rightPanel={<TracksPanel />}
        stats={[
          { value: "2", label: "Dedicated tracks" },
          { value: "5", label: "Modules per track" },
          { value: "360°", label: "Org coverage" },
          { value: "1", label: "Day executive intensive" },
        ]}
      />

      <TracksGrid />

      <section className="bg-navy">
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Reveal variant="heading">
              <h2 className="text-4xl font-display font-bold mb-5">Designed by practitioners. Not educators.</h2>
              <p className="text-lg text-white/70 leading-relaxed mb-7">
                Generic online courses don't translate to enterprise outcomes. We design bespoke training programs built around your specific data, tech stack, and business objectives. When we teach RAG, we teach it using your internal documents.
              </p>
            </Reveal>
            <Link href="/contact" className="btn-primary">
              Request a Custom Training Proposal &rarr;
            </Link>
          </div>

          <Reveal delay={200} from="right" variant="card">
            <div className="glass p-7 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.2),transparent_60%)]" />
              <h3 className="text-[110px] font-display font-bold leading-none gradient-text mb-3 relative z-10">360&deg;</h3>
              <p className="text-xl font-medium text-white/90 relative z-10">Organizational AI Readiness</p>
            </div>
          </Reveal>
        </div>
      </section>

      <TrainingInterestTeaser />
    </div>
  );
}
