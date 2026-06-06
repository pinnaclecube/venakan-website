import { Fragment } from "react";
import { Link } from "wouter";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceHero } from "@/components/ServiceHero";
import venakanLogo from "@/assets/venakan-logo.png";

const DIFFERENTIATORS = [
  "We only do AI — no other practice competes for budget or attention",
  "Our strategists have shipped AI systems, not just advised on them",
  "R&D, Strategy, Training, Engineering, and Staffing under one roof",
  "We stay accountable through execution, not just the recommendation",
  "Compliance-first staffing — HR compliance risk managed proactively",
];

function DifferentiatorPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="font-mono uppercase tracking-[0.18em] text-[10px] text-[var(--white-muted)] mb-4">
        What Makes Us Different
      </div>
      {DIFFERENTIATORS.map((d, i) => (
        <div
          key={d}
          className="flex items-start gap-3"
          style={{
            padding: "10px 0",
            borderBottom: i === DIFFERENTIATORS.length - 1 ? "none" : "1px solid var(--ven-border)",
          }}
        >
          <span style={{ color: "#86EFAC", fontSize: 14, flexShrink: 0, marginTop: 2 }}>✓</span>
          <span className="font-body text-[13px] text-[var(--white-dim)] leading-[1.5]">{d}</span>
        </div>
      ))}
    </div>
  );
}

const CAPABILITIES = [
  { icon: "⬡", color: "var(--color-blue-bright)", name: "AI R&D", desc: "Products built for real verticals" },
  { icon: "◈", color: "var(--color-violet-bright)", name: "AI Strategy", desc: "Roadmaps built for execution" },
  { icon: "◎", color: "var(--color-cyan)", name: "AI Training", desc: "Fluency from board to codebase" },
  { icon: "⬢", color: "#86EFAC", name: "AI Development", desc: "Systems built for production" },
  { icon: "◉", color: "#FCD34D", name: "AI Staffing", desc: "Talent vetted against our own bar" },
];

const PRINCIPLES = [
  {
    n: "01",
    t: "Depth over breadth.",
    b: "We do one thing. That is not a limitation — it is a deliberate choice that makes us sharper than generalists and more useful than theorists. Every person on our team has built and shipped AI in production. Not studied it. Not been certified in it. Built it.",
  },
  {
    n: "02",
    t: "Delivery over advice.",
    b: "Strategy that does not ship is expensive documentation. Every engagement we run is structured around execution milestones, not recommendations. We write the roadmap and we stay through deployment. Accountability is not optional in our model.",
  },
  {
    n: "03",
    t: "Honesty over optimism.",
    b: "We will tell you what AI cannot do for you as readily as what it can. We do not manufacture urgency or oversell capability. When a use case is not ready, we say so. Our clients make better decisions because of it — and they come back because of it.",
  },
  {
    n: "04",
    t: "Craft over credential.",
    b: "We do not hire based on academic pedigree or certification counts. We hire based on demonstrated delivery. The same standard applies to every candidate we place with clients. The bar is: have you shipped AI that runs in production? Everything else is secondary.",
  },
];

const NOT_LIST = [
  "A generalist IT firm that added an AI practice",
  "A software vendor looking to license a product to you",
  "A staffing agency that places any tech talent",
  "A research lab with no path to business application",
  "A framework factory that delivers decks without delivery",
  "An offshore development shop with AI in the name",
];

const ARE_LIST = [
  "An AI-only company — every engagement, every hire, every product",
  "An embedded partner that stays through execution, not just strategy",
  "A talent network assessed against real AI delivery standards",
  "An R&D practice building production-grade AI across 6 verticals",
  "A training team built by practitioners who ship AI systems daily",
  "A compliance-first staffing partner for organizations managing complex workforce requirements",
];

export function About() {
  return (
    <div className="pt-[90px]">
      {/* SECTION 1 — HERO */}
      <ServiceHero
        eyebrow="About Venakan"
        h1Line1="One Focus."
        h1Line2="Total AI."
        subhead="We didn't add AI to an existing practice. We started with AI and built everything else around it. That single decision changes every engagement we run, every hire we make, and every product we ship."
        chips={["AI-Only Since Day One", "R&D to Staffing", "No Legacy Practice"]}
        primaryCta="Work With Us →"
        secondaryCta="Read Our Story ↓"
        secondaryCtaTo="/about#story"
        rightPanel={<DifferentiatorPanel />}
        stats={[
          { value: "5", label: "Integrated AI capabilities" },
          { value: "12+", label: "Verticals in active R&D" },
          { value: "100%", label: "AI-specialized team" },
          { value: "0", label: "Legacy IT engagements" },
        ]}
      />

      {/* SECTION 2 — THE PROBLEM */}
      <section id="story" className="scroll-mt-24" style={{ background: "var(--color-navy-mid)" }}>
        <div className="container">
          <div className="two-col two-col-55-45">
            <Reveal from="left" variant="heading">
              <div className="section-label">Why We Exist</div>
              <h2
                className="font-display font-extrabold"
                style={{ fontSize: "clamp(28px, 3.5vw, 44px)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                <span className="block">Most Organizations Don't Have an AI Problem.</span>
                <span className="block gradient-text mt-1">They Have an Execution Problem.</span>
              </h2>
              <div className="flex flex-col gap-5 mt-7 text-[var(--white-dim)] font-body font-light text-[15px] leading-[1.8]">
                <p>
                  The AI opportunity is visible to almost every organization. The problem is the gap between seeing it and capturing it. Strategy decks sit unimplemented. Pilots run for eighteen months without shipping. Technical teams get hired without the AI depth to build what's actually needed. Executives approve budgets without the fluency to evaluate what they're buying.
                </p>
                <p>
                  Venakan Info Solutions was founded to close that gap. Not with another framework, not with another vendor relationship, and not with a team of generalist consultants who picked up an AI practice last year. We built an AI-only company — one where every capability, every person, and every engagement exists for a single purpose: turning AI from a priority on a slide into a capability your organization actually runs on.
                </p>
                <p>
                  That means R&D that ships real products. Strategy that leads to deployed systems. Training that changes how people work. Engineering that builds to production standards. And staffing that places talent assessed against our own delivery bar — not a recruiter's checklist.
                </p>
              </div>
            </Reveal>

            <Reveal from="right" delay={180} variant="card">
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59,75,204,0.04), rgba(107,63,168,0.04))",
                  border: "1px solid rgba(59,75,204,0.12)",
                  borderLeft: "3px solid var(--brand-blue)",
                  borderRadius: 16,
                  padding: 36,
                }}
              >
                <span
                  className="font-display font-extrabold block"
                  style={{
                    fontSize: 64,
                    color: "var(--brand-blue)",
                    opacity: 0.3,
                    lineHeight: 1,
                    marginBottom: -12,
                  }}
                >
                  "
                </span>
                <p
                  className="font-display"
                  style={{
                    fontWeight: 600,
                    fontSize: 20,
                    color: "var(--color-white)",
                    lineHeight: 1.5,
                    letterSpacing: "-0.01em",
                  }}
                >
                  AI is not a feature you add to a company. It is a foundation you build one on. We built Venakan on that foundation — and we build it into every organization we work with.
                </p>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--white-muted)",
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px solid var(--ven-border)",
                  }}
                >
                  — Arvind Kandula, Principal Advisor
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { v: "2025", l: "Founded" },
                  { v: "AI-Only", l: "Practice" },
                  { v: "Day 1", l: "Practitioners" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="text-center"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--ven-border)",
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <div className="font-display font-extrabold gradient-text" style={{ fontSize: 24, lineHeight: 1 }}>
                      {s.v}
                    </div>
                    <div
                      className="font-mono uppercase"
                      style={{ fontSize: 9, color: "var(--white-muted)", letterSpacing: "0.08em", marginTop: 4 }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 3 — AI ERA */}
      <section style={{ background: "var(--color-navy)" }}>
        <div className="container">
          <Reveal variant="heading">
            <div className="text-center max-w-[680px] mx-auto">
              <div className="section-label justify-center">The Context</div>
              <h2
                className="font-display font-extrabold"
                style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.1 }}
              >
                <span className="block">The AI Era Is Not Arriving.</span>
                <span className="block gradient-text mt-1">It's Already Here.</span>
              </h2>
              <p
                className="font-body font-light text-[var(--white-dim)] mx-auto"
                style={{ fontSize: 18, maxWidth: 620, lineHeight: 1.7, marginTop: 24, marginBottom: 56 }}
              >
                Every major AI model released in the last 18 months outperforms the previous generation by a margin that took decades before. Organizations that are still "evaluating AI" are not being cautious. They are falling behind. The competitive baseline has moved. Permanently.
              </p>
            </div>
          </Reveal>

          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
          >
            {[
              {
                stat: "73%",
                label: "of enterprise AI pilots never reach production",
                body: "The gap is not model quality. It is execution capability — data infrastructure, governance, talent, and organizational readiness that most firms address too late.",
                src: "McKinsey State of AI, 2024",
              },
              {
                stat: "4.5×",
                label: "productivity advantage for AI-mature organizations",
                body: "Organizations that have built genuine AI capability — not just bought AI tools — outperform peers on productivity by a factor that compounds every year they maintain the lead.",
                src: "MIT Sloan Management Review, 2024",
              },
              {
                stat: "82%",
                label: "of AI talent in the US workforce is subject to workforce compliance requirements",
                body: "Building an AI team without a clear handle on HR compliance is building on exposed ground. Venakan's staffing practice manages this risk proactively — before placement, not after an audit.",
                src: "National Foundation for American Policy, 2023",
              },
            ].map((c, i) => (
              <Reveal key={c.stat} delay={i * 60} variant="card">
                <div className="glass" style={{ padding: "28px 32px" }}>
                  <div
                    style={{
                      height: 2,
                      width: 40,
                      background:
                        "linear-gradient(90deg, var(--color-brand-blue), var(--color-brand-violet))",
                      marginBottom: 20,
                    }}
                  />
                  <div
                    className="font-display font-extrabold gradient-text"
                    style={{ fontSize: 40, lineHeight: 1 }}
                  >
                    {c.stat}
                  </div>
                  <div
                    className="font-mono uppercase"
                    style={{
                      fontSize: 10,
                      color: "var(--white-muted)",
                      letterSpacing: "0.08em",
                      marginTop: 10,
                      marginBottom: 16,
                    }}
                  >
                    {c.label}
                  </div>
                  <p
                    className="font-body font-light text-[var(--white-dim)]"
                    style={{ fontSize: 13, lineHeight: 1.7 }}
                  >
                    {c.body}
                  </p>
                  <div
                    className="font-mono"
                    style={{ fontSize: 9, color: "var(--ink-muted)", marginTop: 16 }}
                  >
                    {c.src}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — HOW WE'RE BUILT */}
      <section style={{ background: "var(--color-navy-mid)" }}>
        <div className="container">
          <Reveal variant="heading">
            <h2
              className="font-display font-extrabold"
              style={{ fontSize: "clamp(28px, 3.5vw, 48px)", lineHeight: 1.1 }}
            >
              <span className="block">Five Capabilities.</span>
              <span className="block gradient-text mt-1">One Integrated Practice.</span>
            </h2>
            <p
              className="font-body font-light text-[var(--white-dim)]"
              style={{ fontSize: 17, maxWidth: 560, marginTop: 20, marginBottom: 56, lineHeight: 1.7 }}
            >
              Most organizations need more than one of these. We built them to work together — so nothing gets lost between strategy and execution, between research and delivery, between placement and productivity.
            </p>
          </Reveal>

          <Reveal delay={100} variant="card">
            <div className="flex flex-col md:flex-row items-stretch md:items-start justify-between gap-6 md:gap-2">
              {CAPABILITIES.map((c, i) => (
                <Fragment key={c.name}>
                  <div className="flex flex-col items-center text-center flex-1 min-w-0">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "rgba(59,75,204,0.15)",
                        border: "1px solid rgba(59,75,204,0.3)",
                      }}
                    >
                      <span style={{ fontSize: 22, color: c.color }}>{c.icon}</span>
                    </div>
                    <div
                      className="font-display font-bold text-white"
                      style={{ fontSize: 15, marginTop: 12 }}
                    >
                      {c.name}
                    </div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        color: "var(--white-muted)",
                        marginTop: 6,
                        lineHeight: 1.4,
                      }}
                    >
                      {c.desc}
                    </div>
                  </div>
                  {i < CAPABILITIES.length - 1 && (
                    <span
                      className="cap-arrow self-center"
                      style={{
                        fontSize: 20,
                        color: "var(--color-brand-blue)",
                        opacity: 0.5,
                        flexShrink: 0,
                      }}
                    >
                      →
                    </span>
                  )}
                </Fragment>
              ))}
            </div>
          </Reveal>

          <div
            style={{
              borderTop: "1px solid var(--ven-border)",
              marginTop: 40,
              paddingTop: 32,
            }}
          >
            <Reveal delay={200} variant="body">
              <p
                className="text-center font-body font-light"
                style={{ fontSize: 16, color: "var(--white-muted)", lineHeight: 1.7 }}
              >
                Every capability informs the others. Our R&amp;D tells us what the technology can actually do. Our engineering sets the delivery bar for every strategy we write. Our training is built by people who ship — not people who teach.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 5 — PRINCIPLES */}
      <section style={{ background: "var(--color-navy)" }}>
        <div className="container">
          <Reveal variant="heading">
            <h2
              className="font-display font-extrabold"
              style={{ fontSize: "clamp(28px, 3.5vw, 48px)", lineHeight: 1.1, marginBottom: 56 }}
            >
              <span className="block">Four Principles.</span>
              <span className="block gradient-text mt-1">No Exceptions.</span>
            </h2>
          </Reveal>

          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 2,
              background: "var(--ven-border)",
            }}
          >
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.n} delay={i * 60} variant="card">
                <div
                  className="principle-tile"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    padding: "36px 32px",
                    transition: "background 0.3s",
                    height: "100%",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FFFFFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                >
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color: "var(--brand-blue)",
                      letterSpacing: "0.1em",
                      marginBottom: 20,
                    }}
                  >
                    {p.n}
                  </div>
                  <div
                    className="font-display font-bold text-white"
                    style={{ fontSize: 20, letterSpacing: "-0.02em", marginBottom: 14 }}
                  >
                    {p.t}
                  </div>
                  <p
                    className="font-body font-light text-[var(--white-dim)]"
                    style={{ fontSize: 14, lineHeight: 1.75 }}
                  >
                    {p.b}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — LEADERSHIP */}
      <section style={{ background: "var(--color-navy-mid)" }}>
        <div className="container">
          <Reveal variant="heading">
            <div className="section-label">Leadership</div>
            <h2
              className="font-display font-extrabold"
              style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: 1.1, marginBottom: 48 }}
            >
              <span className="block">Built by Someone Who Has</span>
              <span className="block gradient-text mt-1">Done the Work.</span>
            </h2>
          </Reveal>

          <div className="two-col two-col-45-55">
            <Reveal from="left" variant="card">
              <div className="glass text-center" style={{ padding: 32 }}>
                <div
                  className="flex items-center justify-center mx-auto"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--color-brand-blue), var(--color-brand-violet))",
                    marginBottom: 20,
                  }}
                >
                  <span className="font-display font-extrabold text-white" style={{ fontSize: 26 }}>AK</span>
                </div>
                <div
                  className="font-display font-extrabold text-white"
                  style={{ fontSize: 22, letterSpacing: "-0.02em" }}
                >
                  Arvind Kandula
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--color-blue-bright)",
                    letterSpacing: "0.08em",
                    marginTop: 6,
                  }}
                >
                  Principal Advisor
                </div>
                <div style={{ height: 1, background: "var(--ven-border)", margin: "20px 0" }} />
                <div className="flex flex-col text-left">
                  {[
                    { l: "Company", v: "Venakan Info Solutions LLC" },
                    { l: "Location", v: "United States" },
                  ].map((r, i, arr) => (
                    <div
                      key={r.l}
                      className="flex gap-3"
                      style={{
                        padding: "8px 0",
                        borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--ven-border)",
                      }}
                    >
                      <span
                        className="font-mono uppercase"
                        style={{
                          fontSize: 9,
                          color: "var(--white-muted)",
                          letterSpacing: "0.1em",
                          minWidth: 70,
                          paddingTop: 2,
                        }}
                      >
                        {r.l}
                      </span>
                      <span
                        className="font-body text-[var(--white-dim)]"
                        style={{ fontSize: 13, fontWeight: 500 }}
                      >
                        {r.v}
                      </span>
                    </div>
                  ))}
                </div>
                <a
                  href="https://linkedin.com/in/arvindkandula"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                  style={{
                    marginTop: 20,
                    fontSize: 13,
                    padding: "9px 20px",
                    display: "inline-flex",
                  }}
                >
                  Connect on LinkedIn →
                </a>
              </div>
            </Reveal>

            <Reveal from="right" delay={150} variant="body">
              <div className="section-label">Founder's Note</div>
              <p
                className="font-body text-white"
                style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.85, marginBottom: 20 }}
              >
                I have spent over two decades in enterprise technology — long enough to watch three major platform shifts happen and see the same pattern repeat each time: organizations that move early build durable advantages. Organizations that wait for certainty spend years catching up to competitors who acted on conviction.
              </p>
              <p
                className="font-body font-light text-[var(--white-dim)]"
                style={{ fontSize: 15, lineHeight: 1.85, marginBottom: 20 }}
              >
                AI is that shift — and it is moving faster than any of the previous ones. The gap between organizations that are building genuine AI capability and those that are still evaluating is widening every quarter. I founded Venakan because I saw that gap and knew what it would take to close it: not a consulting firm with an AI practice, but an AI firm with a consulting capability — built from the ground up around the technology itself.
              </p>
              <p
                className="font-body font-light text-[var(--white-dim)]"
                style={{ fontSize: 15, lineHeight: 1.85, marginBottom: 32 }}
              >
                That is what Venakan is. Every service we offer, every person we hire, every product we build in our R&amp;D practice — it all starts from AI. Not from a methodology. Not from a framework. From the technology and what it can actually do when it is engineered and deployed with discipline.
              </p>
              <div className="font-mono" style={{ fontSize: 12, color: "var(--white-muted)" }}>
                — Arvind Kandula, Venakan Info Solutions
              </div>

              <div
                className="flex gap-6"
                style={{
                  marginTop: 28,
                  paddingTop: 24,
                  borderTop: "1px solid var(--ven-border)",
                }}
              >
                {[
                  { v: "20+", l: "Years in enterprise technology" },
                  { v: "3", l: "AI-focused ventures built" },
                ].map((s) => (
                  <div key={s.l}>
                    <div
                      className="font-display font-extrabold gradient-text"
                      style={{ fontSize: 28, lineHeight: 1 }}
                    >
                      {s.v}
                    </div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        color: "var(--white-muted)",
                        letterSpacing: "0.06em",
                        marginTop: 6,
                      }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 7 — WHAT WE ARE NOT */}
      <section style={{ background: "var(--color-navy)" }}>
        <div className="container">
          <Reveal variant="heading">
            <div className="text-center">
              <h2
                className="font-display font-extrabold"
                style={{ fontSize: "clamp(26px, 3vw, 44px)", lineHeight: 1.1, marginBottom: 48 }}
              >
                <span className="block">What Venakan Is.</span>
                <span className="block gradient-text mt-1">And What It Isn't.</span>
              </h2>
            </div>
          </Reveal>

          <div
            className="grid gap-6 mx-auto"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", maxWidth: 860 }}
          >
            <Reveal from="left" variant="card">
              <div className="glass" style={{ padding: "28px 32px", borderTop: "3px solid #DC2626", background: "#FEF2F2" }}>
                <div
                  className="font-mono uppercase"
                  style={{ fontSize: 11, color: "#DC2626", letterSpacing: "0.1em", marginBottom: 20 }}
                >
                  We are not:
                </div>
                {NOT_LIST.map((t, i) => (
                  <div
                    key={t}
                    className="flex gap-2.5"
                    style={{
                      padding: "9px 0",
                      borderBottom: i === NOT_LIST.length - 1 ? "none" : "1px solid var(--ven-border)",
                    }}
                  >
                    <span style={{ color: "#DC2626", fontSize: 14, flexShrink: 0 }}>✕</span>
                    <span
                      className="font-body font-light text-[var(--white-dim)]"
                      style={{ fontSize: 13, lineHeight: 1.5 }}
                    >
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal from="right" delay={60} variant="card">
              <div className="glass" style={{ padding: "28px 32px", borderTop: "3px solid #059669", background: "#F0FDF4" }}>
                <div
                  className="font-mono uppercase"
                  style={{ fontSize: 11, color: "#059669", letterSpacing: "0.1em", marginBottom: 20 }}
                >
                  We are:
                </div>
                {ARE_LIST.map((t, i) => (
                  <div
                    key={t}
                    className="flex gap-2.5"
                    style={{
                      padding: "9px 0",
                      borderBottom: i === ARE_LIST.length - 1 ? "none" : "1px solid var(--ven-border)",
                    }}
                  >
                    <span style={{ color: "#059669", fontSize: 14, flexShrink: 0 }}>✓</span>
                    <span
                      className="font-body font-light text-[var(--white-dim)]"
                      style={{ fontSize: 13, lineHeight: 1.5 }}
                    >
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section
        style={{
          background:
            "linear-gradient(135deg, rgba(59,75,204,0.05), rgba(107,63,168,0.05))",
          borderTop: "1px solid rgba(59,75,204,0.10)",
          borderBottom: "1px solid rgba(59,75,204,0.10)",
          padding: "80px 0",
        }}
      >
        <div className="container text-center">
          <Reveal delay={0} variant="card">
            <img
              src={venakanLogo}
              alt="Venakan"
              style={{ height: 60, marginBottom: 36, opacity: 0.9, margin: "0 auto 36px" }}
            />
          </Reveal>

          <Reveal delay={100} variant="heading">
            <h2
              className="font-display font-extrabold text-white"
              style={{ fontSize: "clamp(28px, 3.5vw, 48px)", lineHeight: 1.1 }}
            >
              If you're serious about AI,
            </h2>
          </Reveal>
          <Reveal delay={150} variant="heading">
            <h2
              className="font-display font-extrabold gradient-text"
              style={{ fontSize: "clamp(28px, 3.5vw, 48px)", lineHeight: 1.1 }}
            >
              we should talk.
            </h2>
          </Reveal>

          <Reveal delay={220} variant="body">
            <p
              className="font-body font-light text-[var(--white-dim)] mx-auto"
              style={{
                fontSize: 17,
                maxWidth: 460,
                marginTop: 24,
                marginBottom: 44,
                lineHeight: 1.7,
              }}
            >
              Not a discovery call. Not a sales pitch. A direct conversation about where you are, where you want to go, and whether Venakan is the right partner to get you there.
            </p>
          </Reveal>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="btn-primary"
              style={{ fontSize: 15, padding: "14px 32px" }}
            >
              Schedule a Conversation →
            </Link>
            <Link
              href="/rd"
              className="btn-ghost"
              style={{ fontSize: 15, padding: "14px 32px" }}
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
