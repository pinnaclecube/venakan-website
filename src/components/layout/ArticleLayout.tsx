import React from "react";
import { Link } from "wouter";
import { Reveal } from "@/components/ui/Reveal";

interface ArticleLayoutProps {
  tag: string;
  tagColor: "blue" | "violet" | "amber" | "green";
  title: string;
  time: string;
  children: React.ReactNode;
}

export function ArticleLayout({ tag, tagColor, title, time, children }: ArticleLayoutProps) {
  return (
    <div className="w-full">
      {/* Short hero */}
      <section className="py-20 grid-bg" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="container max-w-4xl">
          <Reveal variant="heading">
            <div className="tag tag-green mb-6">{tag}</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]" style={{ fontFamily: "var(--oswald)", color: "var(--white)" }}>{title}</h1>
            <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-2)" }}>
              <span className="font-medium">Venakan Research | Venakan Info Solutions</span>
              <span>&bull;</span>
              <span>{time} read</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Content */}
      <section className="py-20" style={{ background: "var(--bg)" }}>
        <div className="container max-w-[760px] mx-auto">
          <Reveal delay={100} variant="body">
            <div className="prose prose-lg max-w-none font-body font-light text-[17px] prose-h2:text-[var(--green)] prose-h2:[font-family:var(--oswald)] prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-p:mb-6 prose-p:text-[var(--text-2)] prose-strong:text-white" style={{ color: "var(--text-2)", lineHeight: 1.85 }}>
              {children}
            </div>

            <div className="mt-16 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
              <Link href="/resources" className="transition-colors flex items-center gap-2 text-[var(--green)] hover:text-white">
                &larr; Back to Resources
              </Link>
            </div>
            
            <div className="mt-16 glass p-10 text-center rounded-xl">
              <h3 className="text-2xl font-display font-bold mb-6 text-white">Ready to apply this to your organization?</h3>
              <Link href="/contact" className="btn-primary">
                Talk to Our Team &rarr;
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 my-8 rounded-r-xl rounded-l-none font-medium text-lg italic" style={{ background: "var(--green-dim)", borderLeft: "3px solid var(--green)", color: "var(--text-2)" }}>
      {children}
    </div>
  );
}
