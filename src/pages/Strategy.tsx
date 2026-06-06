import { Link } from "wouter";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceHero } from "@/components/ServiceHero";
import { StrategyProcessFlow } from "@/components/StrategyProcessFlow";

function EntryPointsPanel() {
  const rows = [
    "New AI budget, no clear plan",
    "Pilots stalled, nothing in production",
    "Board asking for AI ROI evidence",
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="font-mono uppercase tracking-[0.18em] text-[10px] text-[var(--white-muted)] mb-3">
        Common Entry Points
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div
            key={r}
            className="text-[13px] text-[var(--white-dim)]"
            style={{
              borderLeft: "2px solid var(--color-brand-blue)",
              padding: "10px 14px",
              background: "rgba(59,75,204,0.06)",
              borderRadius: 6,
            }}
          >
            {r}
          </div>
        ))}
      </div>
      <div className="font-mono text-[10px] text-[var(--white-muted)] mt-4">
        Sound familiar? That's exactly where we start.
      </div>
    </div>
  );
}

export function Strategy() {
  return (
    <div className="pt-[90px]">
      <ServiceHero
        eyebrow="AI Strategy"
        h1Line1="Turn AI from Buzzword"
        h1Line2="to Business Advantage."
        subhead="We embed with your leadership team, build a prioritized AI roadmap, and stay accountable through execution. Strategy that ships — not strategy that presents."
        chips={["6-Week Initial Roadmap", "Board-Ready Deliverables", "Execution Embedded"]}
        primaryCta="Start an AI Readiness Assessment →"
        secondaryCta="See How We Work ↓"
        secondaryCtaTo="/strategy#engagement"
        rightPanel={<EntryPointsPanel />}
        stats={[
          { value: "6", label: "Weeks to first roadmap" },
          { value: "4", label: "Engagement phases" },
          { value: "90", label: "Day execution check-in" },
          { value: "3", label: "Org layers covered" },
        ]}
      />

      <div id="engagement" className="scroll-mt-24">
        <StrategyProcessFlow />
      </div>

      <section style={{ background: "#FFFFFF" }}>
        <div className="container max-w-4xl mx-auto">
          <Reveal variant="heading">
            <h2
              className="text-4xl font-display font-bold mb-12"
              style={{ color: "var(--ink-primary)" }}
            >
              The Venakan Strategy Approach
            </h2>
          </Reveal>

          <div className="flex flex-col gap-10 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-brand-blue before:to-transparent">
            {[
              { num: "01", title: "AI Readiness Assessment", desc: "We evaluate your data infrastructure, technical capability, process readiness, and governance gaps to establish a baseline." },
              { num: "02", title: "Opportunity Prioritization", desc: "We map potential AI use cases against technical feasibility and business impact to identify the highest ROI targets." },
              { num: "03", title: "Roadmap Design", desc: "We architect the technical and operational roadmap required to move from current state to target deployment." },
              { num: "04", title: "Execution Partnership", desc: "We provide ongoing strategic oversight as your internal teams or external vendors execute the build." },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 60} variant="card" className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-blue shrink-0 md:order-1 md:group-odd:-ml-[20px] md:group-even:-mr-[20px] z-10 shadow-[0_0_15px_rgba(59,75,204,0.5)]"
                  style={{ background: "var(--brand-blue)" }}
                >
                  <span className="font-mono text-xs font-bold text-[#FFFFFF]">{step.num}</span>
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-3rem)] glass p-6 hover:border-brand-blue transition-colors">
                  <h4 className="text-xl font-display font-bold mb-2" style={{ color: "var(--brand-blue)" }}>{step.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <Reveal variant="heading">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-10 text-center" style={{ color: "var(--ink-primary)" }}>Who We Advise</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { t: "Mid-Market Enterprises", d: "Organizations seeking to leverage AI for operational efficiency without building massive internal data science teams." },
              { t: "Enterprise Technology Leaders", d: "CTOs and CIOs looking for an independent, vendor-neutral assessment of their AI initiatives and architecture." },
              { t: "PE-Backed Companies", d: "Portfolio companies executing aggressive value-creation plans through AI-driven automation." },
            ].map((a, i) => (
              <Reveal key={a.t} delay={i * 60} variant="card">
                <div className="glass p-7 text-center h-full">
                  <h4 className="text-lg font-display font-bold mb-3" style={{ color: "var(--brand-blue)" }}>{a.t}</h4>
                  <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>{a.d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="text-center">
            <Link href="/contact" className="btn-primary">
              Schedule a Strategy Session &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
