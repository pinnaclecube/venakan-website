import { Link } from "wouter";
import { Reveal } from "@/components/ui/Reveal";
import logoMark from "@/assets/venakan-logo.png";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Crown, Compass, Layers3, Code2, Database, Check, ArrowRight } from "lucide-react";

const INTERESTS = [
  "AI Strategy",
  "AI R&D",
  "AI Training",
  "AI Development",
  "AI Staffing",
  "Just Exploring",
];

const HERO_CARDS = [
  {
    h1Line1: "Pure AI.",
    h1Line2: "Research to Results.",
    subheading:
      "Built exclusively for AI. No legacy IT practice, no generalist consulting. We go from the research that tells you what's possible to the engineering that makes it run in production.",
    stats: [
      { value: "6", label: "Active R&D verticals" },
      { value: "5", label: "Integrated capabilities" },
      { value: "1", label: "Focus: AI only" },
    ],
    primaryCta: { label: "Start the Conversation →", href: "/contact" },
    secondaryCta: { label: "Explore Our Work", href: "/rd" },
  },
  {
    h1Line1: "Enterprise AI.",
    h1Line2: "Built for the Midwest.",
    subheading:
      "Global consulting firms price out the mid-market. Local IT firms underqualify for the work. Venakan fills the gap — the only firm in the region covering the full AI spectrum under one roof.",
    stats: [
      { value: "200–5K", label: "Employee org sweet spot" },
      { value: "12+", label: "Midwest states served" },
      { value: "0", label: "Legacy IT practice" },
    ],
    primaryCta: { label: "See How We Work →", href: "/strategy" },
    secondaryCta: { label: "Our Five Capabilities", href: "/rd" },
  },
  {
    h1Line1: "AI Strategy.",
    h1Line2: "That Actually Ships.",
    subheading:
      "Most AI strategies live in decks. Ours live in production. We embed with your leadership team, build the roadmap, and stay accountable through execution — not just the recommendation.",
    stats: [
      { value: "6 wks", label: "To first roadmap" },
      { value: "4", label: "Engagement phases" },
      { value: "100%", label: "Delivery accountability" },
    ],
    primaryCta: { label: "Start an AI Assessment →", href: "/strategy" },
    secondaryCta: { label: "How It Works", href: "/strategy" },
  },
  {
    h1Line1: "We Build AI.",
    h1Line2: "End to End.",
    subheading:
      "Agentic systems, LLM applications, intelligent pipelines — built to production standards with documented handoffs your team can actually use. No ongoing dependency required.",
    stats: [
      { value: "3", label: "Engagement models" },
      { value: "0", label: "Vendor lock-in" },
      { value: "100%", label: "Documented handoffs" },
    ],
    primaryCta: { label: "Talk to Our Engineers →", href: "/development" },
    secondaryCta: { label: "Our Tech Stack", href: "/development" },
  },
  {
    h1Line1: "AI Talent.",
    h1Line2: "Vetted Against Real Delivery.",
    subheading:
      "We place practitioners who have shipped AI in production — assessed against our own engineering bar, not a recruiter's checklist. Compliance-first for complex workforce requirements.",
    stats: [
      { value: "16+", label: "AI roles we place" },
      { value: "2", label: "Talent tracks" },
      { value: "0", label: "Résumé-only vetting" },
    ],
    primaryCta: { label: "Build Your AI Team →", href: "/staffing" },
    secondaryCta: { label: "Roles We Place", href: "/staffing" },
  },
];

export function Home() {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Rotating hero left panel
  const [currentCard, setCurrentCard] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const card = HERO_CARDS[currentCard];

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setCurrentCard((c) => (c + 1) % HERO_CARDS.length);
    }, 2000);
    return () => clearInterval(id);
  }, [isPaused, currentCard]);

  const cardMotion = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -4 },
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
      };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setCompany("");
    setMessage("");
    setSelectedInterests([]);
    setSubmitted(false);
  };

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="hero-home relative min-h-[calc(100vh-56px)] flex items-center overflow-hidden pb-20">
        {/* Photographic neural-network background + readability overlay */}
        <div aria-hidden className="hero-bg-base absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
        <div aria-hidden className="hero-image absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
        <div aria-hidden className="hero-image-overlay absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
        <div aria-hidden className="hero-vignette absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />

        <div className="container hero-grid relative grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-12 lg:gap-16 items-center" style={{ zIndex: 1 }}>
          {/* LEFT 65% — rotating hero cards */}
          <div
            className="flex flex-col items-start"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard}
                className="flex flex-col items-start gap-8 w-full"
                initial={cardMotion.initial}
                animate={cardMotion.animate}
                exit={cardMotion.exit}
                transition={cardMotion.transition}
              >
                <div className="flex flex-col gap-2 hero-h1-stack">
                  <h1
                    className="tracking-[-0.04em] leading-[1.05] hero-h1-line1"
                    style={{
                      fontFamily: "var(--oswald)",
                      fontWeight: 500,
                      fontSize: "clamp(42px, 6vw, 78px)",
                      color: "var(--white)",
                    }}
                  >
                    {card.h1Line1}
                  </h1>
                  <h1
                    className="tracking-[-0.04em] leading-[1.05] gradient-text pb-1 hero-h1-line2"
                    style={{
                      fontFamily: "var(--oswald)",
                      fontWeight: 500,
                      fontSize: "clamp(42px, 6vw, 78px)",
                    }}
                  >
                    {card.h1Line2}
                  </h1>
                </div>

                <p
                  style={{
                    fontFamily: "var(--oswald)",
                    color: "var(--text-2)",
                    fontWeight: 300,
                    fontSize: 16,
                    lineHeight: 1.7,
                    maxWidth: 520,
                  }}
                >
                  {card.subheading}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-6">
                  {card.stats.map((stat, i) => (
                    <Fragment key={stat.label}>
                      <div className="flex flex-col">
                        <span
                          className="leading-none"
                          style={{
                            fontFamily: "var(--oswald)",
                            color: "var(--green)",
                            fontWeight: 600,
                            fontSize: 28,
                          }}
                        >
                          {stat.value}
                        </span>
                        <span
                          className="uppercase mt-1.5"
                          style={{
                            fontFamily: "var(--mono)",
                            color: "var(--text-3)",
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                          }}
                        >
                          {stat.label}
                        </span>
                      </div>
                      {i < card.stats.length - 1 && (
                        <span style={{ width: 1, height: 28, background: "var(--border)" }} />
                      )}
                    </Fragment>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <Link href={card.primaryCta.href} className="btn-primary">
                    {card.primaryCta.label}
                  </Link>
                  <Link href={card.secondaryCta.href} className="btn-ghost">
                    {card.secondaryCta.label}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="flex items-center gap-2" style={{ marginTop: 32 }}>
              {HERO_CARDS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show hero card ${i + 1}`}
                  aria-current={i === currentCard}
                  onClick={() => setCurrentCard(i)}
                  style={{
                    height: 6,
                    width: i === currentCard ? 24 : 6,
                    borderRadius: i === currentCard ? 3 : "50%",
                    background:
                      i === currentCard ? "var(--brand-blue)" : "var(--text-4)",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    transition: "width 200ms, background 200ms",
                  }}
                />
              ))}
            </div>
          </div>

          {/* RIGHT 35% — Glass Form Card */}
          <Reveal from="right" delay={200} variant="card">
            <div className="relative w-full max-w-md mx-auto lg:mx-0">
              <div
                className="relative overflow-hidden"
                style={{
                  background: "rgba(15,23,42,0.85)",
                  border: "1px solid var(--border-mid)",
                  borderTop: "2px solid var(--brand-blue)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  borderRadius: "var(--r)",
                }}
              >
                {/* Panel header */}
                <div
                  className="flex items-center justify-between"
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 9,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "var(--text-3)",
                    }}
                  >
                    Start a conversation
                  </span>
                </div>

                <div className="p-6 md:p-7">
                {submitted ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="py-10 flex flex-col items-center text-center gap-4"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(52,211,153,0.2), rgba(52,211,153,0.2))",
                        border: "1px solid rgba(52,211,153,0.3)",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#34D399"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">
                      Message received.
                    </h3>
                    <p className="text-sm text-white/60 max-w-xs">
                      We'll review what you sent and get back to you within 1 business day —
                      with a real answer, not a calendar link.
                    </p>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="font-mono text-[11px] uppercase tracking-[0.16em] text-blue-bright hover:text-white transition-colors mt-2"
                    >
                      Send another →
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        label="Name"
                        value={name}
                        onChange={setName}
                        placeholder="Jane Doe"
                        required
                      />
                      <FormField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="jane@company.com"
                        required
                      />
                    </div>

                    <FormField
                      label="Company"
                      value={company}
                      onChange={setCompany}
                      placeholder="Acme Inc."
                    />

                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                        Interested in
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {INTERESTS.map((interest) => {
                          const active = selectedInterests.includes(interest);
                          return (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => toggleInterest(interest)}
                              aria-pressed={active}
                              className="text-[11px] font-medium px-2.5 py-1.5 rounded-full transition-all duration-150"
                              style={{
                                background: active ? "var(--blue-dim)" : "transparent",
                                border: active
                                  ? "1px solid var(--blue-border)"
                                  : "1px solid var(--border-mid)",
                                color: active ? "#34D399" : "var(--text-3)",
                              }}
                            >
                              {interest}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                        Message <span className="normal-case tracking-normal text-white/30">(optional)</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        placeholder="Tell us briefly what you're working on…"
                        className="form-input resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !name || !email}
                      className="btn-primary w-full justify-center mt-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <svg
                            className="animate-spin"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="3"
                              opacity="0.25"
                            />
                            <path
                              d="M12 2a10 10 0 0 1 10 10"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>Start the conversation →</>
                      )}
                    </button>

                    <p
                      className="text-[10px] text-white/40 text-center font-mono uppercase tracking-wider"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      No sales pitch. No spam. Just a real reply.
                    </p>
                  </form>
                )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SEC 2: The Venakan Difference */}
      <section
        className="py-24 md:py-32 relative z-10"
        style={{ background: "var(--surface)" }}
      >
        <div className="container">
          <Reveal variant="heading">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-5">Built for AI. Nothing else.</h2>
            <p className="text-white/60 leading-relaxed text-lg max-w-2xl mb-16">
              No legacy IT practice to unwind, no generalist playbook to adapt — every person and process here exists to ship AI.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Reveal delay={0} variant="card">
              <div className="glass p-8 h-full flex flex-col">
                <h3 className="text-xl font-display font-bold mb-4 text-white">AI-Only Focus</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  No legacy IT, no distraction. Every consultant, trainer, and engineer here works in AI full-time and has shipped it in production.
                </p>
              </div>
            </Reveal>
            <Reveal delay={60} variant="card">
              <div className="glass p-8 h-full flex flex-col">
                <h3 className="text-xl font-display font-bold mb-4 text-white">Full-Stack Capability</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  From frontier research to enterprise deployment, we cover the entire AI value chain — no hand-offs between teams or vendors.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120} variant="card">
              <div className="glass p-8 h-full flex flex-col">
                <h3 className="text-xl font-display font-bold mb-4 text-white">Outcome-Driven</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  We don't sell hours, we engineer outcomes. Every engagement is structured around measurable readiness milestones leadership can read.
                </p>
              </div>
            </Reveal>
            <Reveal delay={180} variant="card">
              <div className="glass p-8 h-full flex flex-col">
                <h3 className="text-xl font-display font-bold mb-4 text-white">Research-Grounded</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  Our recommendations start from what the latest research proves is possible, not from what was trendy last quarter.
                </p>
              </div>
            </Reveal>
            <Reveal delay={240} variant="card">
              <div className="glass p-8 h-full flex flex-col">
                <h3 className="text-xl font-display font-bold mb-4 text-white">Production-Ready</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  A prototype that impresses in a demo is worthless if it breaks at scale. We build for the realities of production from day one.
                </p>
              </div>
            </Reveal>
            <Reveal delay={300} variant="card">
              <div className="glass p-8 h-full flex flex-col">
                <h3 className="text-xl font-display font-bold mb-4 text-white">Enterprise-Calibrated</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  Governance, compliance, and security aren't bolted on at the end. They're designed into every system we touch.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SEC 3: Five Capabilities */}
      <section
        className="py-24 md:py-32"
        style={{ background: "var(--bg)" }}
      >
        <div className="container">
          <Reveal variant="heading">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-16 max-w-2xl">Five Capabilities. One AI-First Company.</h2>
          </Reveal>

          <div className="bento-grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {[
              { path: "/rd", title: "AI R&D", desc: "Proprietary AI products across healthcare, legal, HR, finance, logistics, and compliance verticals. Built to production standards, not demo decks.", featured: true },
              { path: "/strategy", title: "AI Strategy", desc: "Translating AI from concept to competitive advantage for mid-market and enterprise organizations. Strategy that ships, not just strategy that presents." },
              { path: "/training", title: "AI Training", desc: "Role-specific AI fluency programs — executive boardroom to developer sprint team. Designed by practitioners, not career educators." },
              { path: "/development", title: "AI Development", desc: "AI-native applications, intelligent pipelines, and agentic systems — engineered end to end and handed off with documentation your team can actually use." },
              { path: "/staffing", title: "AI Staffing", desc: "AI-specialized talent vetted against real delivery benchmarks — not résumé keywords. Compliance-first for organizations managing complex workforce requirements." }
            ].map((cap, i) => (
              <Reveal delay={i * 60} variant="card" key={cap.title}>
                <Link
                  href={cap.path}
                  className="group bento-cell flex flex-col h-full min-h-[280px] relative overflow-hidden"
                  style={cap.featured ? { background: "var(--brand-blue)" } : undefined}
                >
                  <h3
                    className="text-2xl font-display font-bold mb-4 flex justify-between items-center"
                    style={cap.featured ? { color: "var(--white)" } : undefined}
                  >
                    {cap.title}
                    <span
                      className="opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-sm font-body"
                      style={{ color: cap.featured ? "var(--white)" : "var(--brand-blue)" }}
                    >Explore &rarr;</span>
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: cap.featured ? "rgba(255,255,255,0.80)" : "var(--text-2)" }}
                  >{cap.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SEC 4: Organization Spectrum */}
      <section className="section-light py-24" style={{ background: "var(--light-base)" }}>
        <div className="container">
          <Reveal variant="heading">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">We Serve Every Layer of Your Organization</h2>
            <p className="text-white/60 text-center max-w-2xl mx-auto mb-12">
              Select a layer to see exactly how we engage with that role — from boardroom decisions to production code.
            </p>
            <OrgSpectrum />
          </Reveal>
        </div>
      </section>

      {/* SEC 5: Resources Preview */}
      <section className="py-24" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <Reveal variant="heading">
              <h2 className="text-4xl font-display font-bold">Thinking Out Loud on AI</h2>
            </Reveal>
            <Link href="/resources" className="btn-ghost">View All &rarr;</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { href: "/resources/why-ai-strategies-fail", tag: "AI Strategy", title: "Why Most Enterprise AI Strategies Fail in Year Two", delay: 0 },
              { href: "/resources/ai-readiness-scorecard", tag: "Guides", title: "The AI Readiness Scorecard", delay: 60 },
              { href: "/resources/llm-production-survival", tag: "Articles", title: "Building an LLM Application That Survives Production", delay: 120 },
            ].map((article) => (
              <Reveal delay={article.delay} variant="card" key={article.href}>
                <Link
                  href={article.href}
                  className="article-card p-8 block h-full group"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r)",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-2)"; }}
                >
                  <div className="tag tag-green mb-6">{article.tag}</div>
                  <h3
                    className="text-xl mb-4 group-hover:text-[#34D399] transition-colors"
                    style={{ fontFamily: "var(--oswald)", fontWeight: 600, color: "var(--white)" }}
                  >
                    {article.title}
                  </h3>
                  <p
                    className="text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                    style={{ color: "var(--green)" }}
                  >
                    Read Article &rarr;
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SEC 6: Final CTA */}
      <section
        className="py-32 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.08)), var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >

        <div className="container relative z-10 flex flex-col items-center text-center">
          <Reveal variant="heading">
            <div className="flex items-center justify-center mb-12">
              <img
                src={logoMark}
                alt="Venakan"
                style={{
                  height: "96px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  filter: "brightness(0) invert(1)"
                }}
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Your AI Journey Starts With a Conversation.</h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
              No pitch decks. No generic discovery calls. Tell us what you're working on — and we'll tell you honestly whether and how we can help.
            </p>
          </Reveal>
          <Link href="/contact" className="btn-primary text-lg px-8 py-4">
            Schedule an AI Readiness Call &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
        {label}
        {required && <span className="text-blue-bright ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        className="form-input"
      />
    </div>
  );
}

const ORG_ROLES = [
  {
    id: "csuite",
    label: "C-Suite",
    icon: Crown,
    accent: "#34D399",
    accentSoft: "rgba(52,211,153,0.12)",
    accentBorder: "rgba(52,211,153,0.35)",
    headline: "Board-ready AI authority",
    sub: "We help executives turn AI from a slide-deck topic into a measurable competitive lever.",
    bullets: [
      "AI strategy & governance frameworks the board can sign off on",
      "Risk posture: regulatory, model, vendor, and reputational exposure",
      "Investment thesis and ROI modeling across a 3-year horizon",
      "Private executive AI fluency briefings — no jargon, no fluff",
    ],
    cta: { label: "Explore AI Strategy", href: "/strategy" },
  },
  {
    id: "directors",
    label: "Directors & VPs",
    icon: Compass,
    accent: "#34D399",
    accentSoft: "rgba(52,211,153,0.12)",
    accentBorder: "rgba(52,211,153,0.35)",
    headline: "Operational owners of AI outcomes",
    sub: "We sit with your VPs to translate strategy into shippable, prioritized AI roadmaps by function.",
    bullets: [
      "Function-specific AI capability roadmaps with milestones",
      "Build vs. buy vs. partner evaluations with honest tradeoffs",
      "Change management playbooks for AI-driven workflow shifts",
      "Cross-functional pilot orchestration that actually reaches prod",
    ],
    cta: { label: "Explore AI Strategy", href: "/strategy" },
  },
  {
    id: "architects",
    label: "Architects",
    icon: Layers3,
    accent: "#34D399",
    accentSoft: "rgba(52,211,153,0.12)",
    accentBorder: "rgba(52,211,153,0.35)",
    headline: "Reference architectures, not whiteboard fantasies",
    sub: "We co-design AI systems with your architects — patterns that survive real load, latency, and cost constraints.",
    bullets: [
      "Reference architectures for RAG, agentic, and multi-model apps",
      "Model selection with explicit cost / latency / quality tradeoffs",
      "Integration patterns with your existing data and identity stack",
      "Evaluation harnesses & guardrail design from day one",
    ],
    cta: { label: "Explore AI Development", href: "/development" },
  },
  {
    id: "developers",
    label: "Developers",
    icon: Code2,
    accent: "#34D399",
    accentSoft: "rgba(52,211,153,0.12)",
    accentBorder: "rgba(52,211,153,0.35)",
    headline: "Hands-on AI engineering, not slide decks",
    sub: "We pair with your engineers on real tickets — shipping production AI features and leveling up muscle memory.",
    bullets: [
      "Production-grade patterns for agents, RAG, and tool-use",
      "Pair-shipping & code review on live AI feature work",
      "Hands-on training in LangChain, LlamaIndex, vector DBs, evals",
      "Prompt and chain testing workflows your team can maintain",
    ],
    cta: { label: "Explore AI Training", href: "/training" },
  },
  {
    id: "data",
    label: "Data Teams",
    icon: Database,
    accent: "#34D399",
    accentSoft: "rgba(52,211,153,0.12)",
    accentBorder: "rgba(52,211,153,0.35)",
    headline: "The pipelines and ops behind every reliable model",
    sub: "We work alongside data and ML teams to build the unglamorous infrastructure that makes AI behave in production.",
    bullets: [
      "Embedding pipelines, feature stores, and retrieval indexes",
      "Model monitoring: drift, hallucination rate, eval dashboards",
      "Synthetic data, labeling workflows, and fine-tuning datasets",
      "Data quality gates for training and continuous evaluation",
    ],
    cta: { label: "Explore AI Development", href: "/development" },
  },
] as const;

function OrgSpectrum() {
  const [activeId, setActiveId] = useState<string>(ORG_ROLES[0].id);
  const active = ORG_ROLES.find((r) => r.id === activeId) ?? ORG_ROLES[0];
  const ActiveIcon = active.icon;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    const n = ORG_ROLES.length;
    const i = ((index % n) + n) % n;
    const role = ORG_ROLES[i];
    setActiveId(role.id);
    tabRefs.current[i]?.focus();
  };

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        e.preventDefault();
        focusTab(0);
        break;
      case "End":
        e.preventDefault();
        focusTab(ORG_ROLES.length - 1);
        break;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Gradient spectrum bar with role markers */}
      <div className="relative mb-3">
        <div
          className="h-[2px] w-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--green), var(--brand-blue), var(--brand-violet))",
          }}
        />
        <div className="hidden md:flex absolute -top-1.5 left-0 right-0 justify-between px-[10%]">
          {ORG_ROLES.map((role) => (
            <span
              key={role.id}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: activeId === role.id ? role.accent : "var(--light-ink-3)",
                boxShadow: activeId === role.id ? `0 0 12px ${role.accent}` : "none",
                transform: activeId === role.id ? "scale(2)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Role tabs */}
      <div
        role="tablist"
        aria-label="Organization layers"
        className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8"
      >
        {ORG_ROLES.map((role, index) => {
          const isActive = activeId === role.id;
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`org-panel-${role.id}`}
              id={`org-tab-${role.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(role.id)}
              onKeyDown={(e) => onTabKeyDown(e, index)}
              className="group relative flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid"
              style={{
                background: isActive ? role.accentSoft : "transparent",
                border: `1px solid ${isActive ? role.accentBorder : "var(--light-border)"}`,
              }}
            >
              <Icon
                size={20}
                strokeWidth={1.6}
                style={{ color: isActive ? role.accent : "var(--light-ink-3)" }}
                className="transition-colors duration-200"
              />
              <span
                className="font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-200"
                style={{ color: isActive ? "var(--light-ink)" : "var(--light-ink-2)" }}
              >
                {role.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div
        key={active.id}
        role="tabpanel"
        id={`org-panel-${active.id}`}
        aria-labelledby={`org-tab-${active.id}`}
        className="glass p-6 md:p-10 animate-[orgPanelIn_360ms_ease-out]"
        style={{ borderColor: active.accentBorder }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-start">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: active.accentSoft,
              border: `1px solid ${active.accentBorder}`,
            }}
          >
            <ActiveIcon size={26} strokeWidth={1.6} style={{ color: active.accent }} />
          </div>
          <div className="flex flex-col gap-2">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: active.accent }}
            >
              {active.label}
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
              {active.headline}
            </h3>
            <p className="text-white/65 leading-relaxed max-w-2xl">{active.sub}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mt-8">
          {active.bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="mt-1 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background: active.accentSoft,
                  border: `1px solid ${active.accentBorder}`,
                }}
              >
                <Check size={11} strokeWidth={3} style={{ color: active.accent }} />
              </span>
              <span className="text-white/75 text-sm leading-relaxed">{b}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
            How we engage this layer
          </span>
          <Link
            href={active.cta.href}
            className="inline-flex items-center gap-2 font-medium text-sm transition-all duration-200 group"
            style={{ color: active.accent }}
          >
            {active.cta.label}
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
