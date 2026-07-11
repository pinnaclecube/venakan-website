import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ── Openings come from two sources, both rendered here: ──
//   1. STATIC_OPENINGS — finalized roles defined in this file (source of truth).
//   2. Zinterview — fetched from /api/openings and appended (retained).
// Applications are accepted on our site (résumé → Supabase + email); interviews
// are scheduled in Zinterview manually — no candidate is created on apply.

type SkillGroup = { skillGroupName?: string; skills?: string[] | string };
type JobDetails = {
  jobType?: string;
  workmode?: string;
  location?: string;
  educationMinimum?: string;
  educationIdeal?: string;
  totalOpenPositions?: number;
};
type Trait = { point: string; because?: string; dimension?: string };

type StaticOpening = {
  kind: "static";
  id: string;
  title: string;
  meta: string[];
  tagline: string;
  responsibilities: string[];
  requirements: string[];
  conditions: string[]; // first item = green "active" emphasis; rest neutral
};

type ZinterviewOpening = {
  kind: "zinterview";
  id: string;
  title: string;
  isTechnical?: boolean;
  minExperience?: number;
  maxExperience?: number;
  jobRequirementsAndResponsibilities?: string[];
  businessContext?: string;
  behavioralTraits?: Trait[];
  skillsGroup?: SkillGroup[];
  jobDetails?: JobDetails | null;
};

type Opening = StaticOpening | ZinterviewOpening;

const STATIC_OPENINGS: Omit<StaticOpening, "kind">[] = [
  {
    id: "office-administrator",
    title: "Office Administrator",
    meta: ["Columbus, OH", "Hybrid", "Full-Time", "1–3 years", "Non-technical"],
    tagline:
      "The person who keeps an AI company running while everyone else is teaching machines to think.",
    responsibilities: [
      "Own day-to-day office operations — scheduling, supplies, vendors, and the hundred small things that keep a team moving.",
      "Coordinate meetings, travel, and calendars across founders and delivery teams.",
      "Manage records, documents, and light bookkeeping support with accuracy and discretion.",
      "Be the first friendly point of contact for clients, candidates, and visitors.",
      "Spot the bottleneck before it becomes a problem — and quietly fix it.",
    ],
    requirements: [
      "1–3 years in office administration, operations, or executive support.",
      "Ruthless organization and genuinely strong written communication.",
      "Comfortable with Google Workspace / Microsoft 365 and picking up new tools fast.",
      "Calm under a full inbox; discreet with sensitive information.",
      "Bonus: curiosity about AI — you'll be surrounded by it.",
    ],
    conditions: ["Valid work authorization required", "No C2C", "Direct applicants only"],
  },
  {
    id: "ai-project-manager",
    title: "AI Project Manager",
    meta: ["Columbus, OH", "Hybrid", "Full-Time", "6–8 years", "Technical"],
    tagline:
      "AI projects rarely die because the model was dumb. They die because nobody owned the plan. You'll be the one who owns it — and the one who tells everyone the truth about the timeline.",
    responsibilities: [
      "Own delivery end-to-end — scope, timeline, budget, and the awkward status update everyone else is hoping someone else will send.",
      "Translate fluently between clients who speak ROI and engineers who speak Python — without anything getting lost on the way.",
      "Run planning, standups, and retros people actually find useful, not the calendar-filling kind everyone silently resents.",
      "Hunt down risk and scope creep while they're still small enough to kill quietly.",
      "Keep big AI ambition anchored to what can realistically ship this quarter — and make that trade-off land with the client.",
      "Set the pace for junior PMs and delivery teams, because at this level people watch how you operate.",
    ],
    requirements: [
      "6–8 years managing software, data, or technical delivery — enough scar tissue to see trouble coming.",
      "You've shipped things that mattered, missed a deadline or two, and know exactly why each one slipped.",
      "You get how software is built. You don't need to write it — but nobody's sneaking a fake estimate past you.",
      "Fluent in the tooling (Jira, Notion, or equivalent) and unbothered by learning the next one.",
      "The rare communicator who can say \"no,\" \"not yet,\" and \"that'll cost more\" and keep the room on your side.",
      "Bonus: you've steered AI/ML or agentic projects and lived to tell the tale.",
    ],
    conditions: ["Valid work authorization required", "No C2C", "Direct applicants only"],
  },
  {
    id: "ai-trainer",
    title: "AI Trainer",
    meta: ["Columbus, OH", "Hybrid", "Full-Time", "7–10 years", "Technical"],
    tagline:
      "You've built real AI systems, not just read about them. Now you'll turn a room of sharp early-career engineers into people who ship it. If you can't do it, you can't teach it — and here, you'll do both.",
    responsibilities: [
      "Deliver deep, hands-on training across LLM application development, RAG pipelines, agentic systems, evaluation, and production ops.",
      "Write and review real production-grade code live — trainees learn by watching you work, not by watching slides.",
      "Own and continuously refactor the curriculum so it never drifts from how AI is actually built this month.",
      "Run rigorous code reviews and assess by demonstrated skill — working systems, not attendance.",
      "Take engineers who've never touched an LLM and make the hard parts click, fast.",
    ],
    requirements: [
      "7–10 years in software engineering, with 3+ years building production AI/ML or LLM systems — not experimenting, shipping.",
      "Expert-level Python: async, typing, testing, packaging, and clean architecture are second nature.",
      "Hands-on depth across the modern stack — Anthropic / OpenAI APIs, RAG, vector databases (pgvector, Pinecone), embeddings, and agent frameworks.",
      "You've built and shipped a real RAG or agentic application end-to-end, and can defend every design choice in it.",
      "Solid grasp of prompt engineering, evaluation methodology, cost/latency tuning, and LLM failure modes.",
      "Comfortable with the full delivery stack: FastAPI, React/TypeScript, Git, and cloud deployment (Vercel/AWS).",
      "A genuine teacher — you can explain a hard idea three ways until it lands, and you actually want to.",
    ],
    conditions: ["Valid work authorization required", "No C2C", "Direct applicants only"],
  },
];

const ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function expLabel(o: ZinterviewOpening): string | null {
  const min = o.minExperience;
  const max = o.maxExperience;
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${min}–${max} yrs exp`;
  if (min != null) return `${min}+ yrs exp`;
  return `up to ${max} yrs exp`;
}

function toSkillList(skills?: string[] | string): string[] {
  if (Array.isArray(skills)) return skills.filter(Boolean);
  if (typeof skills === "string") return skills.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export function Careers() {
  const [dynamicOpenings, setDynamicOpenings] = useState<ZinterviewOpening[]>([]);
  const [status, setStatus] = useState<"loading" | "done">("loading");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/openings")
      .then(async (r) => {
        if (!r.ok) throw new Error(`status ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.openings) ? data.openings : [];
        setDynamicOpenings(list.map((o: any) => ({ ...o, kind: "zinterview" as const })));
        setStatus("done");
      })
      .catch(() => {
        // Silently ignore — the static openings still render.
        if (!cancelled) setStatus("done");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openings: Opening[] = [
    ...STATIC_OPENINGS.map((o): StaticOpening => ({ ...o, kind: "static" })),
    ...dynamicOpenings,
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <section className="pt-24" style={{ background: "var(--black-mid)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <span className="section-tag">Careers</span>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-5">
            Build AI. <span className="gradient-text">Nothing else.</span>
          </h1>
          <p className="text-white/60 leading-relaxed text-lg max-w-2xl">
            We hire practitioners who ship AI in production — not résumé keywords. If a role below
            fits, apply directly.
          </p>

          {/* AI-agents review banner */}
          <div
            className="inline-flex items-center gap-2.5 mt-6"
            style={{
              background: "var(--green-dim)",
              border: "1px solid var(--green-border)",
              borderRadius: 9999,
              padding: "8px 16px",
            }}
          >
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.03em", color: "var(--green)", lineHeight: 1.5 }}>
              A team of AI agents reads every application around the clock — no résumé gathers dust here.
            </span>
          </div>
        </div>
      </section>

      {/* Openings */}
      <section style={{ background: "var(--black)" }}>
        <div className="container">
          <div className="flex flex-col gap-5">
            {openings.map((o, i) => (
              <OpeningCard
                key={o.id}
                opening={o}
                index={i}
                expanded={expandedId === o.id}
                onToggle={() => setExpandedId((cur) => (cur === o.id ? null : o.id))}
              />
            ))}
          </div>

          {status === "loading" && (
            <div className="flex items-center gap-3 mt-6" style={{ color: "var(--text-3)" }}>
              <span className="careers-spinner" aria-hidden />
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Loading more roles…
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Local styles: spinner only (palette-safe) */}
      <style>{`
        .careers-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid var(--border-mid);
          border-top-color: var(--green);
          animation: careersSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes careersSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function OpeningCard({
  opening,
  index,
  expanded,
  onToggle,
}: {
  opening: Opening;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [applying, setApplying] = useState(false);

  const meta =
    opening.kind === "static"
      ? opening.meta
      : ([opening.jobDetails?.jobType, opening.jobDetails?.workmode, opening.jobDetails?.location, expLabel(opening)].filter(
          Boolean
        ) as string[]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: Math.min(index * 0.05, 0.3) }}
      className="glass"
      style={{ padding: 0, overflow: "hidden" }}
    >
      {/* Summary row (button toggles detail) */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full text-left"
        style={{ padding: "28px 28px", display: "block", background: "transparent", border: "none", cursor: "pointer" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold mb-2">{opening.title}</h2>
            {meta.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-x-2 gap-y-1"
                style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.04em", color: "var(--text-3)", textTransform: "uppercase" }}
              >
                {meta.map((m, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span style={{ opacity: 0.5 }}>·</span>}
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span
            aria-hidden
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--green)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
              marginTop: 4,
            }}
          >
            {expanded ? "Close ✕" : "View ↓"}
          </span>
        </div>
      </button>

      {/* Detail + Apply */}
      {expanded && (
        <div style={{ padding: "0 28px 28px" }}>
          <div className="divider" style={{ marginBottom: 22 }} />

          {opening.kind === "static" ? (
            <StaticDetail opening={opening} />
          ) : (
            <ZinterviewDetail opening={opening} />
          )}

          {!applying ? (
            <button type="button" className="btn-primary" onClick={() => setApplying(true)}>
              Apply for this role →
            </button>
          ) : (
            <ApplyForm opening={opening} onCancel={() => setApplying(false)} />
          )}
        </div>
      )}
    </motion.div>
  );
}

function BulletList({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 className="font-display text-lg mb-3">{heading}</h3>
      <ul className="flex flex-col gap-2">
        {items.map((r, i) => (
          <li key={i} className="flex items-start gap-3" style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>
            <span style={{ color: "var(--green)", marginTop: 1, flexShrink: 0 }}>›</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StaticDetail({ opening }: { opening: StaticOpening }) {
  return (
    <>
      <p style={{ color: "var(--text-2)", lineHeight: 1.7, marginBottom: 22 }}>{opening.tagline}</p>
      <BulletList heading="Responsibilities" items={opening.responsibilities} />
      <BulletList heading="Requirements" items={opening.requirements} />
      {opening.conditions.length > 0 && (
        <div className="flex flex-wrap gap-2" style={{ marginBottom: 26 }}>
          {opening.conditions.map((c, i) => (
            <span key={i} className={i === 0 ? "badge-active" : "badge-neutral"}>
              {c}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function ZinterviewDetail({ opening }: { opening: ZinterviewOpening }) {
  return (
    <>
      {opening.businessContext && (
        <p style={{ color: "var(--text-2)", lineHeight: 1.7, marginBottom: 22 }}>{opening.businessContext}</p>
      )}

      {opening.jobRequirementsAndResponsibilities && opening.jobRequirementsAndResponsibilities.length > 0 && (
        <BulletList heading="Responsibilities" items={opening.jobRequirementsAndResponsibilities} />
      )}

      {opening.skillsGroup && opening.skillsGroup.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <h3 className="font-display text-lg mb-3">Skills</h3>
          <div className="flex flex-col gap-4">
            {opening.skillsGroup.map((g, i) => {
              const skills = toSkillList(g.skills);
              if (skills.length === 0) return null;
              return (
                <div key={i}>
                  {g.skillGroupName && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 8 }}>
                      {g.skillGroupName}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, j) => (
                      <span key={j} className="tag-green">{s}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {opening.behavioralTraits && opening.behavioralTraits.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <h3 className="font-display text-lg mb-3">What we're really looking for</h3>
          <ul className="flex flex-col gap-4">
            {opening.behavioralTraits.map((t, i) => (
              <li key={i} className="flex flex-col gap-2">
                {t.dimension && <span className="tag-green" style={{ alignSelf: "flex-start" }}>{t.dimension}</span>}
                <span style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>
                  {t.point}
                  {t.because ? <span style={{ color: "var(--text-3)" }}> — {t.because}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

type FormErrors = Partial<Record<"firstName" | "lastName" | "email" | "phone" | "resume", string>>;

function ApplyForm({ opening, onCancel }: { opening: Opening; onCancel: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string>("");

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim()) e.lastName = "Last name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address.";
    if (!phone.trim()) e.phone = "Phone is required.";
    if (!resume) e.resume = "Resume is required.";
    else if (resume.size > MAX_FILE_BYTES) e.resume = "Resume must be 5 MB or smaller.";
    else if (!ALLOWED_MIME.has(resume.type) && !/\.(pdf|doc|docx)$/i.test(resume.name)) {
      e.resume = "Resume must be a PDF or Word document.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setServerError("");
    if (!validate()) return;
    setState("submitting");
    try {
      const fd = new FormData();
      fd.append("openingId", opening.id);
      fd.append("openingTitle", opening.title || "");
      fd.append("firstName", firstName.trim());
      fd.append("lastName", lastName.trim());
      fd.append("email", email.trim());
      fd.append("phone", phone.trim());
      if (experience.trim()) fd.append("experience", experience.trim());
      if (resume) fd.append("resume", resume, resume.name);

      const res = await fetch("/api/apply", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.fieldErrors && typeof data.fieldErrors === "object") {
          setErrors((prev) => ({ ...prev, ...data.fieldErrors }));
        }
        setServerError(data?.error || "We couldn't submit your application, please try again.");
        setState("error");
        return;
      }
      // Success — clear the form.
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setExperience("");
      setResume(null);
      setErrors({});
      setState("success");
    } catch {
      setServerError("We couldn't submit your application, please try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div
        className="flex items-start gap-3"
        style={{ background: "var(--green-dim)", border: "1px solid var(--green-border)", borderRadius: 6, padding: "16px 18px" }}
      >
        <span style={{ color: "var(--green)", fontWeight: 700, marginTop: 1 }}>✓</span>
        <div>
          <p style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 2 }}>
            Thanks — your application has been received.
          </p>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Our AI agents are already poring over it — tireless, thorough, and not the least bit
            impressed by buzzwords. If there's a real fit, you'll hear from us.
          </p>
        </div>
      </div>
    );
  }

  const submitting = state === "submitting";

  return (
    <div
      style={{ background: "var(--black-mid)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 24 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg">Apply — {opening.title}</h3>
        <button
          type="button"
          onClick={onCancel}
          style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", background: "transparent", border: "none", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="First name" required error={errors.firstName}>
          <input className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={submitting} />
        </Field>
        <Field label="Last name" required error={errors.lastName}>
          <input className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={submitting} />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} />
        </Field>
        <Field label="Phone" required error={errors.phone}>
          <input className="form-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={submitting} />
        </Field>
        <Field label="Years of experience (optional)">
          <input className="form-input" type="number" min={0} step={0.5} value={experience} onChange={(e) => setExperience(e.target.value)} disabled={submitting} />
        </Field>
        <Field label="Resume (PDF/DOC, max 5MB)" required error={errors.resume}>
          <input
            className="form-input"
            type="file"
            accept={ACCEPT}
            onChange={(e) => setResume(e.target.files?.[0] ?? null)}
            disabled={submitting}
            style={{ paddingTop: 7 }}
          />
          {resume && !errors.resume && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", marginTop: 4, display: "block" }}>
              {resume.name}
            </span>
          )}
        </Field>
      </div>

      {state === "error" && serverError && (
        <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 14 }}>{serverError}</p>
      )}

      <div className="mt-6">
        <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting} style={submitting ? { opacity: 0.7, cursor: "not-allowed" } : undefined}>
          {submitting ? (
            <>
              <span
                aria-hidden
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid rgba(15,23,42,0.35)",
                  borderTopColor: "var(--black)",
                  display: "inline-block",
                  animation: "careersSpin 0.7s linear infinite",
                }}
              />
              Submitting…
            </>
          ) : (
            <>Submit application →</>
          )}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="form-label">
        {label}
        {required && <span style={{ color: "var(--green)", marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ color: "var(--green)", fontSize: 11, fontFamily: "var(--mono)", marginTop: 4, display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );
}
