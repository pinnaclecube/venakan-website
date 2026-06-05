import { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { NeuralCanvas } from "@/components/ui/NeuralCanvas";

export interface ServiceHeroStat {
  value: string;
  label: string;
}

export interface ServiceHeroProps {
  eyebrow: string;
  h1Line1: string;
  h1Line2: string;
  subhead: string;
  chips?: string[];
  primaryCta: string;
  secondaryCta?: string;
  secondaryCtaTo?: string;
  rightPanel?: ReactNode;
  stats?: ServiceHeroStat[];
}

function parseStat(value: string): { numeric: number | null; prefix: string; suffix: string } {
  const match = value.match(/^([^\d.-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { numeric: null, prefix: value, suffix: "" };
  return { numeric: parseFloat(match[2]), prefix: match[1], suffix: match[3] };
}

function StatItem({ value, label }: ServiceHeroStat) {
  const { numeric, prefix, suffix } = parseStat(value);
  const [display, setDisplay] = useState<string>(numeric === null ? value : `${prefix}0${suffix}`);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (numeric === null) return;
    const node = ref.current;
    if (!node) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 900;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = numeric * eased;
          const formatted = Number.isInteger(numeric)
            ? Math.round(current).toString()
            : current.toFixed(1);
          setDisplay(`${prefix}${formatted}${suffix}`);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [numeric, prefix, suffix]);

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span
        className="font-display font-extrabold text-[28px] leading-none gradient-text tabular-nums"
        aria-label={value}
      >
        {display}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--white-muted)]">
        {label}
      </span>
    </div>
  );
}

function SecondaryCtaLink({ to, label }: { to: string; label: string }) {
  const hashIndex = to.indexOf("#");
  const isInPageHash =
    hashIndex !== -1 &&
    (to.startsWith("#") ||
      (typeof window !== "undefined" && to.slice(0, hashIndex) === window.location.pathname));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isInPageHash) return;
    const id = to.slice(hashIndex + 1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  };

  if (hashIndex === -1) {
    return (
      <Link href={to} className="btn-ghost" style={{ fontSize: 15, padding: "13px 28px" }}>
        {label}
      </Link>
    );
  }

  return (
    <a
      href={to}
      onClick={handleClick}
      className="btn-ghost"
      style={{ fontSize: 15, padding: "13px 28px" }}
    >
      {label}
    </a>
  );
}

function DefaultStatsPanel({ stats }: { stats: ServiceHeroStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-7 h-full content-center">
      {stats.map((s) => (
        <StatItem key={s.label} value={s.value} label={s.label} />
      ))}
    </div>
  );
}

export function ServiceHero({
  eyebrow,
  h1Line1,
  h1Line2,
  subhead,
  chips = [],
  primaryCta,
  secondaryCta,
  secondaryCtaTo,
  rightPanel,
  stats = [],
}: ServiceHeroProps) {
  const panelContent =
    rightPanel ?? (stats.length > 0 ? <DefaultStatsPanel stats={stats} /> : null);

  return (
    <section className="hero-service relative bg-navy grid-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <NeuralCanvas opacity={0.22} />
      </div>

      <div className="container relative">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--white-muted)] mb-5"
        >
          <Link href="/" className="hover:text-[var(--color-blue-bright)] transition-colors">
            Home
          </Link>
          <span className="mx-2 opacity-50">→</span>
          <span className="text-[var(--color-blue-bright)]">{eyebrow}</span>
        </nav>

        <div className="hero-service-grid grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-12 items-stretch">
          {/* LEFT */}
          <div className="flex flex-col">
            <div className="tag tag-blue self-start mb-6 gap-2">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-[var(--color-blue-bright)] opacity-60 animate-ping" />
                <span className="relative rounded-full bg-[var(--color-blue-bright)] w-1.5 h-1.5" />
              </span>
              {eyebrow}
            </div>

            <h1
              className="font-display font-extrabold leading-[1.02] text-white hero-service-h1"
              style={{ fontSize: "clamp(40px, 5.5vw, 68px)", letterSpacing: "-0.04em" }}
            >
              <span className="block">{h1Line1}</span>
              <span className="block gradient-text">{h1Line2}</span>
            </h1>

            <p
              className="mt-6 text-[16px] font-light leading-[1.72] text-[var(--white-dim)]"
              style={{ maxWidth: 500 }}
            >
              {subhead}
            </p>

            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-7">
                {chips.slice(0, 3).map((chip) => (
                  <span
                    key={chip}
                    className="font-mono uppercase tracking-[0.08em]"
                    style={{
                      fontSize: 10,
                      color: "var(--color-blue-bright)",
                      padding: "4px 12px",
                      borderRadius: 100,
                      border: "1px solid rgba(96,165,250,0.22)",
                      background: "rgba(59,75,204,0.08)",
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/contact"
                className="btn-primary"
                style={{ fontSize: 15, padding: "13px 28px" }}
              >
                {primaryCta}
              </Link>
              {secondaryCta && secondaryCtaTo && (
                <SecondaryCtaLink to={secondaryCtaTo} label={secondaryCta} />
              )}
            </div>
          </div>

          {/* RIGHT */}
          {panelContent && (
            <div className="glass h-full hero-service-right" style={{ padding: 28 }}>
              {panelContent}
            </div>
          )}
        </div>

        {/* STATS STRIP */}
        {stats.length > 0 && rightPanel && (
          <div
            className="mt-10 pt-7 border-t flex flex-wrap gap-y-6 gap-x-10 justify-between"
            style={{ borderColor: "var(--ven-border)" }}
          >
            {stats.map((s) => (
              <StatItem key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
