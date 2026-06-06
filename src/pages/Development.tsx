import { Link } from "wouter";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceHero } from "@/components/ServiceHero";

const CAPABILITIES = [
  { icon: "⬡", name: "Agentic AI Systems", tag: "Production", tone: "blue" },
  { icon: "◈", name: "LLM / RAG Applications", tag: "Production", tone: "blue" },
  { icon: "◎", name: "AI Data Pipelines", tag: "Enterprise", tone: "violet" },
  { icon: "⬢", name: "Responsible AI Engineering", tag: "Built-in", tone: "green" },
] as const;

function BuildPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="font-mono uppercase tracking-[0.18em] text-[10px] text-[var(--white-muted)] mb-3">
        We Build
      </div>
      <div className="flex flex-col">
        {CAPABILITIES.map((c, i) => (
          <div
            key={c.name}
            className="flex items-center justify-between gap-3 py-2"
            style={{
              borderBottom:
                i === CAPABILITIES.length - 1 ? "none" : "1px solid var(--ven-border)",
            }}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-[16px]" style={{ color: "var(--color-blue-bright)" }}>
                {c.icon}
              </span>
              <span className="font-body font-medium text-[13px] text-white">{c.name}</span>
            </span>
            <span className={`tag tag-${c.tone}`}>{c.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Development() {
  const stack = [
    "OpenAI GPT-4o", "Anthropic Claude", "Google Gemini", "LangChain",
    "LlamaIndex", "Hugging Face", "Pinecone", "Weaviate", "Qdrant",
    "FastAPI", "Python", "TypeScript", "React", "Next.js",
    "AWS SageMaker", "Azure ML", "Google Vertex AI", "PostgreSQL",
    "MongoDB", "Kafka", "Apache Spark", "Docker", "Kubernetes", "Terraform",
  ];

  return (
    <div className="pt-[90px]">
      <ServiceHero
        eyebrow="AI Development"
        h1Line1="We Engineer AI."
        h1Line2="End to End."
        subhead="Production-grade AI-native applications, intelligent pipelines, and agentic systems. We hand off with documentation your team can actually use — no ongoing dependency required."
        chips={["Agentic Systems", "LLM Applications", "Build + Transfer Model"]}
        primaryCta="Talk to Our Engineering Team →"
        secondaryCta="See Our Tech Stack ↓"
        secondaryCtaTo="/development#stack"
        rightPanel={<BuildPanel />}
        stats={[
          { value: "24", label: "Production tools in stack" },
          { value: "3", label: "Engagement models" },
          { value: "0", label: "Vendor lock-in" },
          { value: "100%", label: "Documented handoffs" },
        ]}
      />

      <section className="bg-navy-mid" style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <Reveal variant="card">
            <div className="section-label">Core Capabilities</div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { t: "Agentic AI Systems", d: "Autonomous agents capable of tool-use, multi-step reasoning, and complex workflow execution with robust human-in-the-loop fallback mechanisms." },
              { t: "LLM Applications", d: "Production-grade RAG systems, document intelligence, and generative interfaces built with custom evaluation pipelines and latency optimization." },
              { t: "AI Data Pipelines", d: "Scalable ingestion, embedding generation, and vector database management to feed enterprise knowledge into foundation models securely." },
              { t: "Responsible AI Engineering", d: "Implementing guardrails, prompt injection defenses, bias monitoring, and audit logging required for high-compliance deployments." },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 60} variant="card">
                <div className="glass p-7 h-full bg-[#FFFFFF] hover:bg-[var(--bg-surface)] transition-colors">
                  <h3 className="text-2xl font-display font-bold mb-3 text-white">{c.t}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy">
        <div className="container">
          <Reveal variant="heading">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-10 text-center">How We Engage</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Project-Based", d: "Full lifecycle delivery of a specific AI product from scoping to production deployment." },
              { n: "2", t: "Embedded Team", d: "Dedicated AI engineering pods integrated with your existing technical organization." },
              { n: "3", t: "AI Build + Transfer", d: "We build the v1 architecture, then actively train your team to own and maintain it." },
            ].map((e, i) => (
              <Reveal key={e.n} delay={i * 60} variant="card">
                <div className="glass p-7 text-center h-full">
                  <div className="w-12 h-12 rounded-full bg-[rgba(59,75,204,0.1)] flex items-center justify-center mx-auto mb-5">
                    <span className="text-brand-blue font-bold">{e.n}</span>
                  </div>
                  <h4 className="text-lg font-display font-bold mb-3">{e.t}</h4>
                  <p className="text-white/60 text-sm">{e.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="bg-navy-mid overflow-hidden scroll-mt-24" style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <Reveal variant="heading">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">The Stack</h2>
              <p className="text-white/50 font-mono text-sm tracking-widest uppercase">We are model-agnostic and cloud-agnostic.</p>
            </div>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {stack.map((tech, i) => (
              <Reveal key={tech} delay={Math.min(i * 60, 400)} variant="card">
                <span className="px-5 py-2.5 rounded-full border border-border-mid bg-[#FFFFFF] text-sm text-white/80 hover:border-brand-blue hover:text-white transition-all cursor-default hover:-translate-y-1 inline-block">
                  {tech}
                </span>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/contact" className="btn-primary">
              Talk to Our Engineering Team &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
