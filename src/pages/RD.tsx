import { Link } from "wouter";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceHero } from "@/components/ServiceHero";

const VERTICALS = [
  { name: "Healthcare AI", status: "In Development", tone: "blue" },
  { name: "Legal AI", status: "In Development", tone: "blue" },
  { name: "HR & Workforce Intelligence", status: "Beta", tone: "violet" },
  { name: "Financial Services AI", status: "Research Phase", tone: "amber" },
  { name: "Logistics & Supply Chain AI", status: "In Development", tone: "blue" },
  { name: "HR & Compliance AI", status: "Beta", tone: "violet" },
] as const;

const DOT_COLOR: Record<string, string> = {
  blue: "#60A5FA",
  violet: "#A78BFA",
  amber: "#FCD34D",
};

function VerticalsPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="font-mono uppercase tracking-[0.18em] text-[10px] text-[var(--white-muted)] mb-3">
        Active Verticals
      </div>
      <div className="flex flex-col">
        {VERTICALS.map((v, i) => (
          <div
            key={v.name}
            className="flex items-center justify-between gap-3 py-[7px]"
            style={{
              borderBottom:
                i === VERTICALS.length - 1 ? "none" : "1px solid var(--ven-border)",
            }}
          >
            <span className="flex items-center gap-2.5 text-[13px] text-[var(--white-dim)]">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: DOT_COLOR[v.tone] }}
              />
              {v.name}
            </span>
            <span className={`tag tag-${v.tone}`}>{v.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RD() {
  return (
    <div className="pt-[90px]">
      <ServiceHero
        h1Line1="We Build"
        h1Line2="AI Products."
        subhead="Proprietary intelligent systems across six high-value verticals — built to production standards, not demo decks. Long-horizon research with short-horizon delivery."
        chips={["6 Active Verticals", "Healthcare to Compliance", "Production-Grade Output"]}
        primaryCta="Discuss a Partnership →"
        secondaryCta="See Our Verticals ↓"
        secondaryCtaTo="/rd#verticals"
        rightPanel={<VerticalsPanel />}
        stats={[
          { value: "6", label: "Product verticals" },
          { value: "2", label: "In beta now" },
          { value: "100%", label: "Built in-house" },
          { value: "0", label: "Off-shelf tools" },
        ]}
      />

      <section
        id="verticals"
        className="scroll-mt-24"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="container grid md:grid-cols-2 gap-12">
          <Reveal variant="heading">
            <h2
              className="text-3xl md:text-4xl font-display font-bold"
              style={{ color: "var(--ink-primary)" }}
            >
              Most organizations buy AI.<br />We build it.
            </h2>
          </Reveal>
          <Reveal delay={100} variant="body">
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--ink-secondary)" }}
            >
              Our R&D division focuses on proprietary AI applications across specialized verticals. We don't build generic wrappers; we engineer domain-specific systems designed to solve hard problems with precision and reliability.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ background: "#FFFFFF" }}>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Healthcare AI", status: "In Development", tone: "amber", desc: "Clinical documentation generation and diagnostic support systems with strict HIPAA compliance boundaries." },
              { name: "Legal AI", status: "In Development", tone: "amber", desc: "Contract analysis and case law precedent retrieval using secure, air-gapped retrieval-augmented generation." },
              { name: "HR & Workforce Intelligence", status: "Beta", tone: "violet", desc: "Skill mapping, automated onboarding, and predictive talent retention models." },
              { name: "Financial Services AI", status: "Research Phase", tone: "amber", desc: "Fraud detection pattern recognition and automated compliance reporting." },
              { name: "Logistics & Supply Chain AI", status: "In Development", tone: "amber", desc: "Dynamic routing optimization and predictive inventory management." },
              { name: "HR & Compliance AI", status: "Beta", tone: "violet", desc: "Automated workforce compliance tracking, employment eligibility monitoring, and audit readiness tools for organizations managing large or distributed workforces." },
            ].map((v, i) => (
              <Reveal key={v.name} delay={i * 60} variant="card">
                <div className="glass p-7 h-full flex flex-col items-start group">
                  <div className={`tag tag-${v.tone} mb-5`}>{v.status}</div>
                  <h3
                    className="text-2xl font-display font-bold mb-3 group-hover:text-[var(--brand-blue)] transition-colors"
                    style={{ color: "var(--ink-primary)" }}
                  >
                    {v.name}
                  </h3>
                  <p className="text-sm flex-grow" style={{ color: "var(--ink-secondary)" }}>
                    {v.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <Reveal variant="heading">
            <h2
              className="text-4xl font-display font-bold mb-10"
              style={{ color: "var(--ink-primary)" }}
            >
              How We Work with Partners
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { t: "Co-Development", d: "Partner with our engineering team to build a bespoke AI solution for your specific organizational challenges." },
              { t: "Pilot Access", d: "Gain early access to our beta products to shape their roadmap and establish a technological edge in your industry." },
              { t: "Research Sponsorship", d: "Sponsor directed AI research into frontier models and techniques relevant to your domain." },
            ].map((e, i) => (
              <Reveal key={e.t} delay={i * 60} variant="card">
                <div
                  className="rounded-xl p-7 bg-[rgba(59,75,204,0.03)] h-full"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <h3
                    className="text-xl font-display font-bold mb-3"
                    style={{ color: "var(--ink-primary)" }}
                  >
                    {e.t}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>{e.d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="text-center">
            <Link href="/contact" className="btn-primary">
              Start a Partnership Conversation &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
