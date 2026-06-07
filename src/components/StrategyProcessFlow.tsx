import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Reveal } from "@/components/ui/Reveal";

interface Stage {
  num: string;
  name: string;
  tagline: string;
  input: string;
  process: string;
  outcome: string;
  deliverables: string[];
  gate: string;
}

const STAGES: Stage[] = [
  {
    num: "01",
    name: "Assess",
    tagline: "Baseline your organization.",
    input:
      "Executive interviews (CEO, CFO, CTO), staff readiness survey, data environment, current systems inventory",
    process:
      "5-pillar maturity scoring · data readiness assessment · regulatory pre-screen · NIST AI RMF baseline · contradiction detection",
    outcome:
      "A clear-eyed baseline — where you actually are, where the gaps are, and where leadership disagrees",
    deliverables: ["AI Readiness Report"],
    gate: "Report must be approved before Design begins.",
  },
  {
    num: "02",
    name: "Design",
    tagline: "Build the governance and the portfolio.",
    input:
      "Approved readiness report, priority business goals, regulatory jurisdiction, risk appetite",
    process:
      "Governance structure · ethics charter drafting · use-case scoring · risk register build · technology decisions",
    outcome:
      "A defensible governance foundation and a prioritized portfolio of AI use cases worth funding",
    deliverables: ["Signed Ethics Charter", "Scored Use Cases", "Risk Register"],
    gate: "Charter draft and scored use cases required before Execute.",
  },
  {
    num: "03",
    name: "Execute",
    tagline: "Turn the plan into running systems.",
    input: "Prioritized use cases, budget envelope, executive sponsor commitment",
    process:
      "Roadmap sequencing · business case modeling · pilot design · change management · talent plan",
    outcome:
      "Funded initiatives moving from idea to pilot to production — with the board aligned",
    deliverables: ["Funded Roadmap", "Business Cases", "Board Presentation"],
    gate: "At least one initiative in pilot or production unlocks Monitor.",
  },
  {
    num: "04",
    name: "Monitor",
    tagline: "Prove it's working.",
    input: "Pilots in production, defined success metrics, baseline KPIs",
    process:
      "KPI instrumentation · benefits realization tracking · MLOps health monitoring · compliance dashboards",
    outcome:
      "Live visibility into whether your AI is delivering value — and early warning when it isn't",
    deliverables: ["Performance Dashboard", "Maturity Tracker"],
    gate: "Runs continuously alongside Govern.",
  },
  {
    num: "05",
    name: "Govern",
    tagline: "Keep it safe, compliant, and scaling.",
    input: "Deployed AI systems, vendor contracts, sector-specific obligations",
    process:
      "AIGC operations · vendor management · sector compliance · sustainability reporting · legal review",
    outcome:
      "An audit-ready governance operation that scales with your AI estate instead of breaking under it",
    deliverables: ["Audit-Ready Governance Operation"],
    gate: "Ongoing — governance is the operating system, not a phase.",
  },
];

const IconAdjustments = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="6" cy="10" r="2" /><circle cx="6" cy="10" r="2" />
    <path d="M6 4v4M6 12v8" />
    <circle cx="12" cy="16" r="2" /><path d="M12 4v10M12 18v2" />
    <circle cx="18" cy="7" r="2" /><path d="M18 4v1M18 9v11" />
  </svg>
);
const IconShieldCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const IconRefresh = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4" />
    <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
  </svg>
);

const GOV_TILES = [
  {
    Icon: IconAdjustments,
    title: "Adaptive by design",
    body:
      "Every recommendation adapts to your size, jurisdiction, sector, and AI maturity — a 40-person startup and a 5,000-person bank get different roadmaps.",
  },
  {
    Icon: IconShieldCheck,
    title: "Audit-ready always",
    body:
      "Versioned decisions, immutable logs, and signed charters — every choice is defensible under regulatory review.",
  },
  {
    Icon: IconRefresh,
    title: "Continuous, not one-off",
    body:
      "Quarterly maturity reviews, KPI tracking, and compliance monitoring keep the strategy alive long after kickoff.",
  },
];

function StageDetail({ stage }: { stage: Stage }) {
  return (
    <div className="spf-detail-inner">
      <div className="spf-blocks">
        <div className="spf-block">
          <div className="spf-block-label spf-label-cyan">Example Input</div>
          <p className="spf-block-text">{stage.input}</p>
        </div>
        <div className="spf-block">
          <div className="spf-block-label spf-label-blue">Process</div>
          <p className="spf-block-text">{stage.process}</p>
        </div>
        <div className="spf-block">
          <div className="spf-block-label spf-label-violet">Outcome</div>
          <p className="spf-block-text">{stage.outcome}</p>
        </div>
      </div>
      <div className="spf-divider" />
      <div className="spf-deliverable-row">
        {stage.deliverables.map((d) => (
          <span key={d} className="spf-deliverable-tag">{d}</span>
        ))}
      </div>
      <p className="spf-gate-italic">{stage.gate}</p>
    </div>
  );
}

export function StrategyProcessFlow() {
  const [, navigate] = useLocation();
  const [active, setActive] = useState(0);
  const [openTiles, setOpenTiles] = useState<boolean[]>([false, false, false]);
  const [isMobile, setIsMobile] = useState(false);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fillPct = (active / (STAGES.length - 1)) * 100;

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(i + 1, STAGES.length - 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(i - 1, 0);
    else return;
    e.preventDefault();
    setActive(next);
    nodeRefs.current[next]?.focus();
  };

  return (
    <section className="spf" aria-labelledby="spf-heading">
      <style>{spfCss}</style>
      <div className="container">
        <Reveal variant="heading">
          <h2 id="spf-heading" className="spf-h1">
            From AI Strategy to <span className="gradient-text">AI Capability</span>
          </h2>
          <p className="spf-subhead">
            Most organizations have an AI strategy. Very few have an AI capability. Click any stage
            below to see exactly how we close that gap — research to results, with governance built
            in from day one.
          </p>
        </Reveal>

        <Reveal delay={120} variant="card">
          <div className="spf-stepper">
            <div className="spf-nodes" role="tablist" aria-label="AI strategy implementation stages">
              {!isMobile && (
                <div className="spf-track" aria-hidden="true">
                  <div className="spf-track-fill" style={{ width: `${fillPct}%` }} />
                </div>
              )}
              {STAGES.map((stage, i) => {
                const isActive = i === active;
                const filled = i <= active;
                return (
                  <div className={`spf-node-wrap${isActive ? " is-active" : ""}`} key={stage.num}>
                    {isMobile && (
                      <span
                        className={`spf-rail${i < active ? " is-filled" : ""}${i === STAGES.length - 1 ? " is-last" : ""}`}
                        aria-hidden="true"
                      />
                    )}
                    <button
                      ref={(el) => { nodeRefs.current[i] = el; }}
                      className={`spf-node${isActive ? " is-active" : ""}${filled ? " is-filled" : ""}`}
                      role="tab"
                      aria-selected={isActive}
                      aria-expanded={isActive}
                      aria-controls={`spf-panel-${i}`}
                      id={`spf-tab-${i}`}
                      onClick={() => setActive(i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                    >
                      <span className="spf-badge">{stage.num}</span>
                      <span className="spf-node-text">
                        <span className="spf-node-name">{stage.name}</span>
                        <span className="spf-node-tagline">{stage.tagline}</span>
                      </span>
                    </button>

                    {isMobile && (
                      <div
                        id={`spf-panel-${i}`}
                        role="region"
                        aria-labelledby={`spf-tab-${i}`}
                        className={`spf-detail spf-detail-mobile${isActive ? " is-open" : ""}`}
                      >
                        <StageDetail stage={stage} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!isMobile && (
              <div
                id={`spf-panel-${active}`}
                role="region"
                aria-labelledby={`spf-tab-${active}`}
                className="spf-detail spf-detail-desktop is-open"
              >
                <StageDetail key={active} stage={STAGES[active]} />
              </div>
            )}

            <p className="spf-gate-note">
              Each stage gates the next. You cannot design what you have not assessed.
            </p>
          </div>
        </Reveal>

        <Reveal delay={160} variant="heading">
          <div className="spf-gov-band">
            <h3 className="spf-gov-title">
              Governance Isn't a Phase — It's the Operating System
            </h3>
            <p className="spf-gov-body">
              Strategy decays the moment it stops being managed. Venakan engagements leave you with a
              living governance operation, not a slide deck.
            </p>

            <div className="spf-tiles">
              {GOV_TILES.map((tile, i) => {
                const open = openTiles[i];
                const { Icon } = tile;
                return (
                  <button
                    key={tile.title}
                    className={`spf-tile${open ? " is-open" : ""}`}
                    aria-expanded={open}
                    aria-controls={`spf-gov-${i}`}
                    onClick={() =>
                      setOpenTiles((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                    }
                  >
                    <span className="spf-tile-head">
                      <span className="spf-tile-icon"><Icon /></span>
                      <span className="spf-tile-title">{tile.title}</span>
                      <span className="spf-chevron" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </span>
                    <span id={`spf-gov-${i}`} className={`spf-tile-body${open ? " is-open" : ""}`}>
                      <span className="spf-tile-body-text">{tile.body}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="spf-disclaimer">
              All compliance outputs are for engagement planning only. They are not legal advice.
              Regulated-sector deployments require qualified legal review.
            </p>
          </div>
        </Reveal>

        <div className="spf-cta-row">
          <button className="spf-cta-primary" onClick={() => navigate("/contact")}>
            Start with an Assessment
          </button>
          <button className="spf-cta-secondary" onClick={() => navigate("/rd")}>
            See how we build the AI itself
          </button>
        </div>
      </div>
    </section>
  );
}

const spfCss = `
.spf { background: var(--bg-surface); }
.spf .spf-h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--ink-primary);
  margin: 0 0 18px;
}
.spf .spf-subhead {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink-secondary);
  max-width: 560px;
  margin: 0 0 48px;
}

/* Stepper */
.spf .spf-stepper { position: relative; }
.spf .spf-nodes {
  position: relative;
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}
.spf .spf-track {
  position: absolute;
  top: 21px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: var(--border);
  border-radius: 2px;
  z-index: 0;
}
.spf .spf-track-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-brand-blue), var(--color-brand-violet));
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.spf .spf-node-wrap { flex: 1; position: relative; z-index: 1; }
.spf .spf-node {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 16px 12px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s, background 0.3s;
}
.spf .spf-node:hover { border-color: var(--border-mid); }
.spf .spf-node.is-active {
  border-color: var(--color-blue-bright);
  box-shadow: 0 0 0 1px rgba(59,75,204,0.25), 0 0 36px rgba(59,75,204,0.10);
  transform: scale(1.02);
  background: var(--surface-2);
}
.spf .spf-node:focus-visible {
  outline: 2px solid var(--color-blue-bright);
  outline-offset: 3px;
}
.spf .spf-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 400;
  color: var(--ink-tertiary);
  background: var(--bg-inset);
  border: 1px solid var(--border-mid);
  transition: all 0.3s;
}
.spf .spf-node.is-filled .spf-badge {
  color: #fff;
  background: linear-gradient(135deg, var(--color-brand-blue), var(--color-brand-violet));
  border-color: transparent;
}
.spf .spf-node.is-active .spf-badge {
  box-shadow: 0 0 16px rgba(59,75,204,0.30);
}
.spf .spf-node-text { display: flex; flex-direction: column; gap: 4px; }
.spf .spf-node-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  color: var(--ink-primary);
}
.spf .spf-node-tagline {
  font-family: var(--font-body);
  font-size: 12px;
  line-height: 1.4;
  color: var(--ink-tertiary);
}

/* Detail panel */
.spf .spf-detail {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.4s ease, opacity 0.4s ease;
}
.spf .spf-detail.is-open { max-height: 1200px; opacity: 1; }
.spf .spf-detail-desktop {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  margin-bottom: 18px;
}
.spf .spf-detail-inner { padding: 28px; }
.spf .spf-detail-desktop .spf-detail-inner {
  padding: 32px;
  animation: spfFadeIn 0.4s ease;
}
@keyframes spfFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.spf .spf-blocks {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.spf .spf-block-label {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10.5px;
  margin-bottom: 10px;
}
.spf .spf-label-cyan { color: var(--color-cyan); }
.spf .spf-label-blue { color: var(--color-blue-bright); }
.spf .spf-label-violet { color: var(--color-violet-bright); }
.spf .spf-block-text {
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.6;
  color: var(--ink-secondary);
  margin: 0;
}
.spf .spf-divider {
  height: 1px;
  background: var(--border);
  margin: 24px 0;
}
.spf .spf-deliverable-row { display: flex; flex-wrap: wrap; gap: 10px; }
.spf .spf-deliverable-tag {
  font-family: var(--font-mono);
  font-size: 12.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-violet-bright);
  background: rgba(107,63,168,0.18);
  border-radius: 8px;
  padding: 6px 12px;
}
.spf .spf-gate-italic {
  font-family: var(--font-body);
  font-style: italic;
  font-size: 13px;
  color: var(--ink-tertiary);
  margin: 16px 0 0;
}
.spf .spf-gate-note {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-tertiary);
  margin: 4px 0 0;
}

/* Governance band */
.spf .spf-gov-band {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 40px;
  margin-top: 56px;
}
.spf .spf-gov-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  color: var(--ink-primary);
  margin: 0 0 12px;
}
.spf .spf-gov-body {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  color: var(--ink-secondary);
  max-width: 640px;
  margin: 0 0 28px;
}
.spf .spf-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 16px;
}
.spf .spf-tile {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
}
.spf .spf-tile:hover { transform: translateY(-2px); border-color: var(--border-mid); }
.spf .spf-tile.is-open { border-color: var(--color-blue-bright); }
.spf .spf-tile:focus-visible {
  outline: 2px solid var(--color-blue-bright);
  outline-offset: 3px;
}
.spf .spf-tile-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.spf .spf-tile-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(59,75,204,0.12);
  color: var(--color-blue-bright);
  flex-shrink: 0;
}
.spf .spf-tile-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: var(--ink-primary);
  flex: 1;
}
.spf .spf-chevron {
  display: flex;
  color: var(--ink-tertiary);
  transition: transform 0.3s ease, color 0.3s;
}
.spf .spf-tile.is-open .spf-chevron { transform: rotate(180deg); color: var(--color-blue-bright); }
.spf .spf-tile-body {
  display: block;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.4s ease, opacity 0.4s ease, margin-top 0.4s ease;
}
.spf .spf-tile-body.is-open { max-height: 280px; opacity: 1; margin-top: 14px; }
.spf .spf-tile-body-text {
  font-family: var(--font-body);
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--ink-secondary);
}
.spf .spf-disclaimer {
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
  color: var(--ink-tertiary);
  margin: 24px 0 0;
}

/* CTA row */
.spf .spf-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 40px;
}
.spf .spf-cta-primary {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, var(--color-brand-blue), var(--color-brand-violet));
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
}
.spf .spf-cta-primary:hover {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 10px 36px rgba(59,75,204,0.4);
}
.spf .spf-cta-secondary {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  color: var(--ink-primary);
  background: transparent;
  border: 1px solid var(--border-mid);
  border-radius: 8px;
  padding: 14px 28px;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s, transform 0.2s;
}
.spf .spf-cta-secondary:hover {
  border-color: rgba(59,75,204,0.45);
  background: rgba(59,75,204,0.06);
  transform: translateY(-1px);
}
.spf .spf-cta-primary:focus-visible,
.spf .spf-cta-secondary:focus-visible {
  outline: 2px solid var(--color-blue-bright);
  outline-offset: 3px;
}

/* Mobile: vertical stack + inline detail relocation */
@media (max-width: 860px) {
  .spf .spf-nodes { flex-direction: column; gap: 0; }
  .spf .spf-node-wrap { display: flex; flex-direction: column; padding-left: 56px; position: relative; padding-bottom: 8px; }
  .spf .spf-rail {
    position: absolute;
    left: 20px;
    top: 42px;
    bottom: 0;
    width: 2px;
    background: var(--border);
  }
  .spf .spf-rail.is-filled {
    background: linear-gradient(180deg, var(--color-brand-blue), var(--color-brand-violet));
  }
  .spf .spf-rail.is-last { display: none; }
  .spf .spf-node {
    flex-direction: row;
    align-items: center;
    text-align: left;
    gap: 14px;
    padding: 12px 14px;
    margin-left: -56px;
    padding-left: 0;
    background: transparent;
    border: none;
  }
  .spf .spf-node .spf-badge { margin-left: 0; }
  .spf .spf-node-wrap .spf-node { padding: 0; }
  .spf .spf-node.is-active { transform: none; box-shadow: none; background: transparent; }
  .spf .spf-node.is-active .spf-node-name { color: var(--color-blue-bright); }
  .spf .spf-badge { width: 40px; height: 40px; flex-shrink: 0; }
  .spf .spf-node-text { gap: 2px; }
  .spf .spf-detail-mobile {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    margin: 4px 0 16px;
  }
  .spf .spf-detail-mobile.is-open { border-color: rgba(59,75,204,0.25); }
  .spf .spf-blocks { grid-template-columns: 1fr; gap: 18px; }
  .spf .spf-gov-band { padding: 28px 22px; }
  .spf .spf-detail-inner { padding: 22px; }
}
`;
