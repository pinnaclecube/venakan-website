import { Link } from "wouter";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceHero } from "@/components/ServiceHero";

function TalentBarPanel() {
  const criteria = [
    "System design judgment — not textbook answers",
    "Production deployment experience — not just demos",
    "Model selection reasoning under real constraints",
    "Workforce compliance verified before every placement",
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="font-mono uppercase tracking-[0.18em] text-[10px] text-[var(--white-muted)] mb-3">
        The Venakan Talent Bar
      </div>
      <div className="flex flex-col">
        {criteria.map((c, i) => (
          <div
            key={c}
            className="flex items-start gap-2.5 py-2"
            style={{
              borderBottom:
                i === criteria.length - 1 ? "none" : "1px solid var(--ven-border)",
            }}
          >
            <span className="text-[14px] mt-0.5" style={{ color: "var(--green)" }}>✓</span>
            <span className="font-body text-[13px] text-[var(--white-dim)]">{c}</span>
          </div>
        ))}
      </div>
      <p className="italic font-body text-[12px] text-[var(--white-muted)] mt-4">
        Every candidate assessed by our own AI engineering team.
      </p>
    </div>
  );
}

export function Staffing() {
  const technicalRoles = [
    "Machine Learning Engineers", "AI Data Scientists", "LLM Architects",
    "Prompt Engineers", "AI Backend Developers", "MLOps Engineers",
    "Data Engineers", "AI QA & Evaluation Specialists", "Research Scientists",
  ];

  const strategicRoles = [
    "Chief AI Officers", "VP of AI Initiatives", "AI Product Managers",
    "AI Strategists", "AI Transformation Leads", "AI Ethicists",
    "AI Governance Specialists",
  ];

  return (
    <div className="pt-[96px]">
      <ServiceHero
        h1Line1="AI Talent."
        h1Line2="Vetted Against Real Delivery."
        subhead="We place AI practitioners who have shipped systems in production — assessed against our own engineering benchmarks. Compliance-first for organizations managing complex workforce requirements."
        chips={["16+ AI Roles", "Workforce Compliance Built-In", "Vetted Against Our Own Bar"]}
        primaryCta="Build Your AI Team →"
        secondaryCta="See Roles We Place ↓"
        secondaryCtaTo="/staffing#roles"
        rightPanel={<TalentBarPanel />}
        stats={[
          { value: "16", label: "AI roles we place" },
          { value: "2", label: "Talent tracks" },
          { value: "100%", label: "Compliance reviewed" },
          { value: "0", label: "Résumé-only vetting" },
        ]}
      />

      <section className="bg-navy-mid" style={{ background: "var(--bg-surface)" }}>
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <Reveal variant="body">
            <div className="flex flex-col gap-5">
              {[
                "Recruiters matching buzzwords on résumés.",
                "Candidates who have only built demos, not production systems.",
                "Workforce compliance headaches causing onboarding delays.",
                'Paying premium rates for generic software engineers rebranded as "AI".',
              ].map((t) => (
                <div key={t} className="flex items-start gap-4">
                  <span className="font-bold mt-1" style={{ color: "var(--text-3)" }}>✕</span>
                  <p className="text-white/80">{t}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={60} from="right" variant="card">
            <div className="glass p-7 border-l-4 border-l-brand-blue">
              <h3 className="text-2xl font-display font-bold mb-3 text-white">The Venakan AI Talent Standard</h3>
              <p className="text-white/70 leading-relaxed">
                Because we build AI products ourselves, we know exactly what it takes to deliver them. Every candidate we place is technically vetted by our active engineering and strategy practitioners. We don't forward resumes; we present validated capabilities.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="roles" className="bg-navy scroll-mt-24">
        <div className="container">
          <Reveal variant="heading">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">Roles We Staff</h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-7">
            <Reveal delay={0} variant="card">
              <div className="glass p-7 border-t-2 border-t-blue-bright h-full">
                <h3 className="text-2xl font-display font-bold mb-6 text-white">Technical Roles</h3>
                <ul className="grid gap-3">
                  {technicalRoles.map((role) => (
                    <li key={role} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-bright shrink-0" />
                      <span className="text-white/80">{role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={60} variant="card">
              <div className="glass p-7 border-t-2 border-t-violet-bright h-full">
                <h3 className="text-2xl font-display font-bold mb-6 text-white">Strategic & Leadership</h3>
                <ul className="grid gap-3">
                  {strategicRoles.map((role) => (
                    <li key={role} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-bright shrink-0" />
                      <span className="text-white/80">{role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-navy-mid" style={{ background: "var(--bg-surface)" }}>
        <div className="container grid md:grid-cols-2 gap-10 items-center">
          <Reveal variant="heading">
            <h2 className="text-4xl font-display font-bold mb-5">Workforce Compliance? We Handle It.</h2>
            <p className="text-lg text-white/70 leading-relaxed mb-7">
              Building an AI team is only half the equation. The other half is ensuring every placement meets the employment eligibility and workforce compliance requirements your organization is accountable for. Venakan's staffing practice includes structured compliance verification at the point of placement — so you are never exposed to an audit you did not see coming.
            </p>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3 text-white/80"><span className="text-brand-blue">✓</span> Workforce compliance verification before every placement</li>
              <li className="flex items-center gap-3 text-white/80"><span className="text-brand-blue">✓</span> Employment eligibility review and audit readiness</li>
              <li className="flex items-center gap-3 text-white/80"><span className="text-brand-blue">✓</span> Ongoing compliance monitoring throughout the engagement</li>
            </ul>
          </Reveal>

          <Reveal delay={60} from="right" variant="card">
            <div className="glass p-7 border-l-4 border-l-cyan">
              <div className="tag tag-violet mb-5">Compliance Intelligence</div>
              <h3 className="text-2xl font-display font-bold mb-4 text-white">Zero Compliance Surprises</h3>
              <p className="text-white/70 leading-relaxed">
                Every Venakan placement includes a structured pre-placement compliance review and monitoring throughout the engagement period. HR compliance risk is managed proactively — not discovered during an audit.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="bg-navy text-center"
        style={{
          background: "linear-gradient(135deg, rgba(52,211,153,0.05), rgba(52,211,153,0.05))",
          borderTop: "1px solid rgba(52,211,153,0.10)",
          borderBottom: "1px solid rgba(52,211,153,0.10)",
        }}
      >
        <Link href="/contact" className="btn-primary text-lg px-8 py-4">
          Build Your AI Team &rarr;
        </Link>
      </section>
    </div>
  );
}
