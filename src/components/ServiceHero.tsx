import { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "wouter";

export interface ServiceHeroStat {
  value: string;
  label: string;
}

export interface ServiceHeroProps {
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
        className="font-extrabold text-[28px] leading-none tabular-nums"
        style={{ color: "var(--green)", fontFamily: "var(--oswald)" }}
        aria-label={value}
      >
        {display}
      </span>
      <span
        className="text-[10px] uppercase tracking-[0.14em]"
        style={{ fontFamily: "var(--mono)", color: "var(--text-3)" }}
      >
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
    <section
      className="hero-service relative grid-bg-fine overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 60% 80% at 85% 50%, rgba(52,211,153,0.07) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 15% 30%, rgba(52,211,153,0.10) 0%, transparent 55%), var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container relative">
        <div className="hero-service-grid grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-12 items-stretch">
          {/* LEFT */}
          <div className="flex flex-col">
            <h1
              className="font-extrabold leading-[1.02] hero-service-h1"
              style={{
                fontSize: "clamp(40px, 5.5vw, 68px)",
                letterSpacing: "-0.04em",
                fontFamily: "var(--oswald)",
              }}
            >
              <span className="block" style={{ color: "var(--white)" }}>
                {h1Line1}
              </span>
              <span
                className="block gradient-text"
                style={{ fontFamily: "var(--oswald)" }}
              >
                {h1Line2}
              </span>
            </h1>

            <p
              className="mt-6 text-[16px] leading-[1.72]"
              style={{
                maxWidth: 500,
                fontFamily: "var(--oswald)",
                fontWeight: 300,
                color: "var(--text-2)",
              }}
            >
              {subhead}
            </p>

            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-7">
                {chips.slice(0, 3).map((chip) => (
                  <span
                    key={chip}
                    className="uppercase tracking-[0.08em]"
                    style={{
                      fontSize: 9,
                      fontFamily: "var(--mono)",
                      color: "var(--green)",
                      padding: "4px 12px",
                      borderRadius: 100,
                      border: "1px solid var(--green-border)",
                      background: "var(--green-dim)",
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
            <div
              className="glass h-full hero-service-right"
              style={{
                padding: 28,
                background: "rgba(15,23,42,0.80)",
                border: "1px solid var(--border-mid)",
                backdropFilter: "blur(16px)",
              }}
            >
              {panelContent}
            </div>
          )}
        </div>

        {/* STATS STRIP */}
        {stats.length > 0 && rightPanel && (
          <div
            className="mt-10 pt-7 flex flex-wrap gap-y-6 gap-x-10 justify-between"
            style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}
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
