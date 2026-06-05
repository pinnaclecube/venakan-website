import { Link } from "wouter";
import { Reveal } from "@/components/ui/Reveal";
import { NeuralCanvas } from "@/components/ui/NeuralCanvas";
import { useState } from "react";

const articles = [
  { tag: "AI Strategy", tagColor: "blue", slug: "why-ai-strategies-fail", title: "Why Most Enterprise AI Strategies Fail in Year Two", time: "8 min" },
  { tag: "Guides", tagColor: "amber", slug: "ai-readiness-scorecard", title: "The AI Readiness Scorecard: Benchmark Your Organization", time: "10 min" },
  { tag: "Articles", tagColor: "violet", slug: "agentic-vs-automation", title: "Agentic AI vs. Automation: What Every Leader Must Know", time: "6 min" },
  { tag: "Perspectives", tagColor: "blue", slug: "workforce-compliance-talent", title: "Workforce Compliance and AI Talent: What Hiring Managers Need to Know", time: "5 min" },
  { tag: "Articles", tagColor: "violet", slug: "llm-production-survival", title: "Building an LLM Application That Survives Production", time: "12 min" },
  { tag: "Research", tagColor: "blue", slug: "responsible-ai", title: "Responsible AI Is Not a Compliance Checkbox", time: "9 min" }
];

export function Resources() {
  const [activeFilter, setActiveFilter] = useState("All");
  
  const filters = ["All", "AI Strategy", "Guides", "Articles", "Research", "Perspectives"];
  
  const filteredArticles = activeFilter === "All" 
    ? articles 
    : articles.filter(a => a.tag === activeFilter);

  return (
    <div className="pt-[90px]">
      <section className="py-20 md:py-32 relative bg-navy grid-bg overflow-hidden">
        <NeuralCanvas opacity={0.20} />
        <div className="container relative z-10 text-center">
          <Reveal variant="heading">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              AI Intelligence. <span className="gradient-text">For Leaders & Builders.</span>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="py-12 bg-navy-mid border-b border-border-mid">
        <div className="container">
          <Reveal variant="card">
            <div className="flex flex-wrap justify-center gap-3">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full font-mono text-xs tracking-wider uppercase transition-all ${
                    activeFilter === filter 
                      ? "bg-brand-blue text-white border border-brand-blue" 
                      : "bg-[rgba(59,75,204,0.05)] text-white/60 border border-[rgba(238,242,255,0.1)] hover:border-brand-blue/50 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-navy">
        <div className="container">
          {activeFilter === "All" && (
            <Reveal delay={100} variant="card" className="mb-16">
              <div className="glass p-0 overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/2 p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border-mid bg-navy-mid/50">
                  <div className="tag tag-blue mb-6 self-start">Featured • AI Strategy</div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Why Most Enterprise AI Strategies Fail in Year Two</h2>
                  <p className="text-white/60 mb-8 leading-relaxed">
                    Organizations launch AI initiatives with genuine energy. Eighteen months later, the pilots are still in staging and the board is asking hard questions.
                  </p>
                  <Link href="/resources/why-ai-strategies-fail" className="btn-ghost self-start">
                    Read the Article &rarr;
                  </Link>
                </div>
                <div className="md:w-1/2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzQjRCQ0MiIG9wYWNpdHk9IjAuMiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzZCM0ZBOCIgb3BhY2l0eT0iMC4wNSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=')] bg-cover bg-center min-h-[300px]" />
              </div>
            </Reveal>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, i) => (
              <Reveal key={article.slug} delay={(i % 3) * 60} variant="card">
                <Link href={`/resources/${article.slug}`} className="glass p-8 block h-full group flex flex-col items-start">
                  <div className={`tag tag-${article.tagColor} mb-6`}>{article.tag}</div>
                  <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-blue-bright transition-colors flex-grow">{article.title}</h3>
                  <div className="flex items-center justify-between w-full mt-4">
                    <span className="text-white/40 font-mono text-sm">{article.time} read</span>
                    <span className="text-brand-blue opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">&rarr;</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-navy-mid">
        <div className="container max-w-3xl text-center">
          <Reveal variant="heading">
            <h2 className="text-3xl font-display font-bold mb-8">Stay Ahead of the AI Curve.</h2>
            <form className="flex flex-col sm:flex-row gap-4 justify-center" onSubmit={e => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your work email" 
                className="bg-navy border border-border-mid rounded-lg px-6 py-4 min-w-[300px] text-white focus:outline-none focus:border-brand-blue"
              />
              <button className="btn-primary">Subscribe</button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
