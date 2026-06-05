import { Link } from "wouter";
import { Reveal } from "@/components/ui/Reveal";
import { NeuralCanvas } from "@/components/ui/NeuralCanvas";
import logoMark from "@/assets/venakan-logo.png";
import { useEffect, useId, useRef, useState } from "react";
import { Crown, Compass, Layers3, Code2, Database, Check, ArrowRight } from "lucide-react";

const INTERESTS = [
  "AI Strategy",
  "AI R&D",
  "AI Training",
  "AI Development",
  "AI Staffing",
  "Just Exploring",
];

const HERO_STATS = [
  { value: "12+", label: "AI Verticals" },
  { value: "5", label: "Capabilities" },
  { value: "100%", label: "AI-Specialized" },
  { value: "360°", label: "Org Coverage" },
];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#3B4BCC,#60A5FA)",
  "linear-gradient(135deg,#6B3FA8,#A78BFA)",
  "linear-gradient(135deg,#60A5FA,#22D3EE)",
  "linear-gradient(135deg,#A78BFA,#3B4BCC)",
];

export function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
      <section
        ref={heroRef}
        className="hero-home relative min-h-[100dvh] flex items-center overflow-hidden grid-bg pb-20"
      >
        <NeuralCanvas opacity={0.42} />

        {/* Spotlight */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
          style={{
            background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59,75,204,0.07), transparent 55%)`,
          }}
        />

        <div className="container hero-grid relative z-10 grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-12 lg:gap-16 items-center">
          {/* LEFT 65% */}
          <div className="flex flex-col items-start gap-8">
            <Reveal delay={0}>
              <div className="tag tag-blue">
                <span className="w-2 h-2 rounded-full bg-blue-bright animate-pulse" />
                AI-First. Always.
              </div>
            </Reveal>

            <div className="flex flex-col gap-2 hero-h1-stack">
              <Reveal delay={80}>
                <h1
                  className="font-display font-extrabold tracking-[-0.04em] leading-[1.05] text-white hero-h1-line1"
                  style={{ fontSize: "clamp(32px, 7vw, 104px)" }}
                >
                  Pure AI.
                </h1>
              </Reveal>

              <Reveal delay={180}>
                <h1
                  className="font-display font-extrabold tracking-[-0.04em] leading-[1.05] gradient-text pb-1 hero-h1-line2"
                  style={{ fontSize: "clamp(26px, 5.5vw, 80px)" }}
                >
                  Research to Results.
                </h1>
              </Reveal>
            </div>

            <Reveal delay={280}>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
                Venakan Info Solutions is an AI-only company &mdash; R&amp;D, Strategy, Training,
                Development, and Staffing. We go deeper than AI adoption. We build the AI
                capability your organization runs on.
              </p>
            </Reveal>

            {/* Trust metrics row */}
            <Reveal delay={380}>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-2">
                {HERO_STATS.map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-8">
                    <div className="flex flex-col">
                      <span className="font-display text-2xl md:text-3xl font-bold text-white leading-none">
                        {stat.value}
                      </span>
                      <span className="font-mono text-[10px] md:text-[11px] text-blue-bright uppercase tracking-[0.14em] mt-1.5">
                        {stat.label}
                      </span>
                    </div>
                    {i < HERO_STATS.length - 1 && (
                      <span className="hidden md:block w-px h-10 bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Social proof row */}
            <Reveal delay={480}>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {AVATAR_GRADIENTS.map((bg, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 border-navy"
                      style={{ background: bg }}
                    />
                  ))}
                </div>
                <p className="text-sm text-white/60">
                  <span className="text-white font-medium">Trusted by AI leaders</span> across
                  healthcare, finance &amp; legal
                </p>
              </div>
            </Reveal>

            {/* Scroll cue */}
            <Reveal delay={600}>
              <div className="hidden md:flex items-center gap-3 mt-4 text-white/40">
                <div className="relative w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
                  <span className="w-1 h-1.5 rounded-full bg-white/60 animate-[scrollCue_1.8s_ease-in-out_infinite]" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                  Scroll to explore
                </span>
              </div>
            </Reveal>
          </div>

          {/* RIGHT 35% — Glass Form Card */}
          <Reveal from="right" delay={200}>
            <div className="relative w-full max-w-md mx-auto lg:mx-0">
              {/* Gradient top border glow */}
              <div
                aria-hidden
                className="absolute -top-px left-6 right-6 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #60A5FA, #A78BFA, transparent)",
                }}
              />
              <div
                aria-hidden
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-2/3 h-6 blur-xl opacity-60"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #3B4BCC, #6B3FA8, transparent)",
                }}
              />

              <div className="glass p-6 md:p-7 relative overflow-hidden">
                {/* Live badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                    Start a conversation
                  </span>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                      Responding within 1 day
                    </span>
                  </div>
                </div>

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
                          "linear-gradient(135deg, rgba(59,75,204,0.2), rgba(107,63,168,0.2))",
                        border: "1px solid rgba(96,165,250,0.3)",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#60A5FA"
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
                                background: active
                                  ? "linear-gradient(135deg, rgba(59,75,204,0.25), rgba(107,63,168,0.25))"
                                  : "rgba(238,242,255,0.04)",
                                border: active
                                  ? "1px solid rgba(96,165,250,0.5)"
                                  : "1px solid rgba(238,242,255,0.08)",
                                color: active ? "#EEF2FF" : "rgba(238,242,255,0.6)",
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
                        className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/30 resize-none focus:outline-none transition-colors"
                        style={{
                          background: "rgba(238,242,255,0.03)",
                          border: "1px solid rgba(238,242,255,0.08)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "rgba(96,165,250,0.5)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(238,242,255,0.08)";
                        }}
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

                    <p className="text-[10px] text-white/40 text-center font-mono uppercase tracking-wider">
                      No sales pitch. No spam. Just a real reply.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SEC 2: The Venakan Difference */}
      <section className="py-24 md:py-32 bg-navy-mid relative z-10">
        <div className="container">
          <Reveal>
            <div className="section-label">The Venakan Difference</div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-16">We Don't Do IT. We Do AI.</h2>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal delay={0}>
              <div className="glass p-8 h-full flex flex-col">
                <h3 className="text-xl font-display font-bold mb-4 text-white">AI-Only Focus</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  No legacy IT. No distraction. Every consultant, trainer, and developer on our team lives in AI — and has shipped it in production environments.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="glass p-8 h-full flex flex-col">
                <h3 className="text-xl font-display font-bold mb-4 text-white">Full-Stack Capability</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  From frontier research to enterprise deployment — we operate across the entire AI value chain without hand-offs between teams or vendors.
                </p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="glass p-8 h-full flex flex-col">
                <h3 className="text-xl font-display font-bold mb-4 text-white">Outcome-Driven</h3>
                <p className="text-white/60 leading-relaxed text-sm">
                  We don't sell hours. We engineer outcomes. Every engagement is structured around measurable AI readiness milestones that the board can read.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SEC 3: Five Capabilities */}
      <section className="py-24 md:py-32 bg-navy grid-bg">
        <div className="container">
          <Reveal>
            <div className="section-label">What We Do</div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-16 max-w-2xl">Five Capabilities. One AI-First Company.</h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              { path: "/rd", title: "AI R&D", desc: "Proprietary AI products across healthcare, legal, HR, finance, logistics, and compliance verticals. Built to production standards, not demo decks." },
              { path: "/strategy", title: "AI Strategy", desc: "Translating AI from concept to competitive advantage for mid-market and enterprise organizations. Strategy that ships, not just strategy that presents." },
              { path: "/training", title: "AI Training", desc: "Role-specific AI fluency programs — executive boardroom to developer sprint team. Designed by practitioners, not career educators." },
              { path: "/development", title: "AI Development", desc: "AI-native applications, intelligent pipelines, and agentic systems — engineered end to end and handed off with documentation your team can actually use." },
              { path: "/staffing", title: "AI Staffing", desc: "AI-specialized talent vetted against real delivery benchmarks — not résumé keywords. Compliance-first for organizations managing complex workforce requirements." }
            ].map((cap, i) => (
              <Reveal delay={i * 50} key={cap.title}>
                <Link href={cap.path} className="group block glass p-8 h-full min-h-[280px] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-0 bg-brand-blue transition-all duration-300 group-hover:h-full" />
                  <h3 className="text-2xl font-display font-bold mb-4 flex justify-between items-center">
                    {cap.title}
                    <span className="text-brand-blue opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-sm font-body">Explore &rarr;</span>
                  </h3>
                  <p className="text-white/60 leading-relaxed">{cap.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SEC 4: Organization Spectrum */}
      <section className="py-24 bg-navy-mid">
        <div className="container">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">We Serve Every Layer of Your Organization</h2>
            <p className="text-white/60 text-center max-w-2xl mx-auto mb-12">
              Select a layer to see exactly how we engage with that role — from boardroom decisions to production code.
            </p>
            <OrgSpectrum />
          </Reveal>
        </div>
      </section>

      {/* SEC 5: Resources Preview */}
      <section className="py-24 bg-navy">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <Reveal>
              <div className="section-label">Resources</div>
              <h2 className="text-4xl font-display font-bold">Thinking Out Loud on AI</h2>
            </Reveal>
            <Reveal>
              <Link href="/resources" className="btn-ghost">View All &rarr;</Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal delay={0}>
              <Link href="/resources/why-ai-strategies-fail" className="glass p-8 block h-full group">
                <div className="tag tag-blue mb-6">AI Strategy</div>
                <h3 className="text-xl font-display font-bold mb-4 group-hover:text-blue-bright transition-colors">Why Most Enterprise AI Strategies Fail in Year Two</h3>
                <p className="text-brand-blue text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">Read Article &rarr;</p>
              </Link>
            </Reveal>
            <Reveal delay={100}>
              <Link href="/resources/ai-readiness-scorecard" className="glass p-8 block h-full group">
                <div className="tag tag-amber mb-6">Guides</div>
                <h3 className="text-xl font-display font-bold mb-4 group-hover:text-amber-400 transition-colors">The AI Readiness Scorecard</h3>
                <p className="text-brand-blue text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">Read Article &rarr;</p>
              </Link>
            </Reveal>
            <Reveal delay={200}>
              <Link href="/resources/llm-production-survival" className="glass p-8 block h-full group">
                <div className="tag tag-violet mb-6">Articles</div>
                <h3 className="text-xl font-display font-bold mb-4 group-hover:text-violet-bright transition-colors">Building an LLM Application That Survives Production</h3>
                <p className="text-brand-blue text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">Read Article &rarr;</p>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SEC 6: Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy to-navy-mid z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,75,204,0.15),transparent_70%)] z-0" />
        
        <div className="container relative z-10 flex flex-col items-center text-center">
          <Reveal>
            <div className="flex items-center justify-center mb-12">
              <img
                src={logoMark}
                alt="Venakan"
                style={{
                  height: "96px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  filter: "drop-shadow(0 0 24px rgba(96,165,250,0.4))"
                }}
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Your AI Journey Starts With a Conversation.</h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
              No pitch decks. No generic discovery calls. Tell us what you're working on — and we'll tell you honestly whether and how we can help.
            </p>
            <Link href="/contact" className="btn-primary text-lg px-8 py-4">
              Schedule an AI Readiness Call &rarr;
            </Link>
          </Reveal>
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
        className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none transition-colors"
        style={{
          background: "rgba(238,242,255,0.03)",
          border: "1px solid rgba(238,242,255,0.08)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(96,165,250,0.5)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(238,242,255,0.08)";
        }}
      />
    </div>
  );
}

const ORG_ROLES = [
  {
    id: "csuite",
    label: "C-Suite",
    icon: Crown,
    accent: "#60A5FA",
    accentSoft: "rgba(96,165,250,0.12)",
    accentBorder: "rgba(96,165,250,0.35)",
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
    accent: "#7DA3F8",
    accentSoft: "rgba(125,163,248,0.12)",
    accentBorder: "rgba(125,163,248,0.35)",
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
    accent: "#A78BFA",
    accentSoft: "rgba(167,139,250,0.12)",
    accentBorder: "rgba(167,139,250,0.35)",
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
    accent: "#C084FC",
    accentSoft: "rgba(192,132,252,0.12)",
    accentBorder: "rgba(192,132,252,0.35)",
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
    accent: "#22D3EE",
    accentSoft: "rgba(34,211,238,0.12)",
    accentBorder: "rgba(34,211,238,0.35)",
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
        <div className="h-[2px] w-full bg-gradient-to-r from-blue-bright via-brand-blue to-cyan rounded-full" />
        <div className="hidden md:flex absolute -top-1.5 left-0 right-0 justify-between px-[10%]">
          {ORG_ROLES.map((role) => (
            <span
              key={role.id}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: activeId === role.id ? role.accent : "rgba(238,242,255,0.3)",
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
                background: isActive ? role.accentSoft : "rgba(238,242,255,0.025)",
                border: `1px solid ${isActive ? role.accentBorder : "rgba(238,242,255,0.06)"}`,
              }}
            >
              <Icon
                size={20}
                strokeWidth={1.6}
                style={{ color: isActive ? role.accent : "rgba(238,242,255,0.55)" }}
                className="transition-colors duration-200"
              />
              <span
                className="font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-200"
                style={{ color: isActive ? "#EEF2FF" : "rgba(238,242,255,0.6)" }}
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
