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
    <div className="pt-[90px]">
      {/* Short hero */}
      <section className="py-20 grid-bg border-b border-border" style={{ background: "var(--bg-surface)" }}>
        <div className="container max-w-4xl">
          <Reveal variant="heading">
            <div className={`tag tag-${tagColor} mb-6`}>{tag}</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-[1.1]" style={{ color: "var(--ink-primary)" }}>{title}</h1>
            <div className="flex items-center gap-4 text-white/60 text-sm">
              <span className="font-medium">Venakan Research | Venakan Info Solutions</span>
              <span>&bull;</span>
              <span>{time} read</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Content */}
      <section className="py-20" style={{ background: "var(--bg-base)" }}>
        <div className="container max-w-[760px] mx-auto">
          <Reveal delay={100} variant="body">
            <div className="prose prose-lg max-w-none font-body font-light text-[17px] prose-h2:text-blue-bright prose-h2:font-display prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-p:mb-6" style={{ color: "var(--ink-secondary)", lineHeight: 1.85 }}>
              {children}
            </div>

            <div className="mt-16 pt-8 border-t border-border-mid">
              <Link href="/resources" className="text-brand-blue hover:text-white transition-colors flex items-center gap-2">
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
    <div className="p-6 my-8 rounded-r-xl rounded-l-none font-medium text-lg italic" style={{ background: "rgba(59,75,204,0.04)", borderLeft: "3px solid var(--brand-blue)", color: "var(--ink-secondary)" }}>
      {children}
    </div>
  );
}
