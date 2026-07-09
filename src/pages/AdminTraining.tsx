import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const KEY_STORAGE = "venakan_admin_key";

type Program = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  spec_markdown: string | null;
  spec_type: string | null;
  spec_doc_path: string | null;
  status: "draft" | "published";
  sort_order: number;
  updated_at: string | null;
};

type LookupRow = {
  id: number;
  code?: string;
  label: string;
  sort_order: number;
  active: boolean;
  is_program_eligible?: boolean;
};

type AdminFetch = (path: string, options?: RequestInit) => Promise<Response>;

// Read a File as base64 (payload only).
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

// ── Password gate ──────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }: { onUnlock: (key: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setChecking(true);
    try {
      const res = await fetch("/api/admin/programs", { headers: { "x-admin-key": password } });
      if (res.ok) {
        onUnlock(password);
      } else if (res.status === 401) {
        setError("Incorrect password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="w-full">
      <section className="pt-24 pb-[25px]" style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <div className="max-w-md">
            <div className="glass p-8 md:p-10">
              <h1 className="text-2xl font-display font-bold mb-2">Training Admin</h1>
              <p className="mb-6" style={{ color: "var(--text-2)", fontSize: 14 }}>
                Enter the admin password to continue.
              </p>
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                  <label className="form-label">Admin password</label>
                  <input
                    type="password"
                    className="form-input"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-3" disabled={checking}>
                  {checking ? "Checking…" : "Unlock →"}
                </button>
                {error && (
                  <p style={{ color: "var(--green)", fontFamily: "var(--mono)", fontSize: 11 }}>{error}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Program editor (basics + generate + upload) ─────────────────────────────
function ProgramEditor({
  adminFetch,
  program,
  onDone,
}: {
  adminFetch: AdminFetch;
  program: Program | null;
  onDone: () => void;
}) {
  const [id, setId] = useState<string | null>(program?.id ?? null);
  const [name, setName] = useState(program?.name ?? "");
  const [slug, setSlug] = useState(program?.slug ?? "");
  const [sortOrder, setSortOrder] = useState(String(program?.sort_order ?? 0));
  const [shortDesc, setShortDesc] = useState(program?.short_description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(program?.status ?? "draft");
  const [savingBasics, setSavingBasics] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Upload path — a PDF is the source of truth for a program.
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadErr, setUploadErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [hasPdf, setHasPdf] = useState<boolean>(
    Boolean(program?.spec_doc_path && /\.pdf$/i.test(program.spec_doc_path))
  );

  // Course summary — a short, Coursera-style summary generated from the PDF.
  const [summaryMd, setSummaryMd] = useState(program?.spec_markdown ?? "");
  const [creatingSummary, setCreatingSummary] = useState(false);
  const [savingSummary, setSavingSummary] = useState(false);

  const flash = (m: string) => {
    setMsg(m);
    setErr("");
  };
  const fail = (m: string) => {
    setErr(m);
    setMsg("");
  };

  const saveBasics = async () => {
    setSavingBasics(true);
    setErr("");
    setMsg("");
    try {
      const payload = {
        id: id ?? undefined,
        name,
        slug,
        short_description: shortDesc,
        status,
        sort_order: Number(sortOrder) || 0,
      };
      const res = await adminFetch("/api/admin/programs", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        fail(data?.error || "Could not save.");
        return;
      }
      if (!id && data?.program?.id) setId(data.program.id);
      flash("Saved.");
    } catch (e) {
      fail(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSavingBasics(false);
    }
  };

  const createSummary = async () => {
    if (!id) {
      fail("Save the program and upload a PDF first.");
      return;
    }
    if (!hasPdf) {
      fail("Upload a PDF first, then create the course summary.");
      return;
    }
    setCreatingSummary(true);
    setErr("");
    setMsg("");
    try {
      const res = await adminFetch("/api/admin/generate-summary", {
        method: "POST",
        body: JSON.stringify({ programId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        fail(data?.error || "Could not create the summary.");
        return;
      }
      setSummaryMd(data.summary ?? "");
      flash("Course summary generated — review and edit, then publish.");
    } catch (e) {
      fail(e instanceof Error ? e.message : "Could not create the summary.");
    } finally {
      setCreatingSummary(false);
    }
  };

  const publishSummary = async () => {
    if (!id) return;
    if (!summaryMd.trim()) {
      fail("Generate or write a course summary first.");
      return;
    }
    setSavingSummary(true);
    setErr("");
    setMsg("");
    try {
      const res = await adminFetch("/api/admin/programs", {
        method: "PATCH",
        body: JSON.stringify({ id, spec_markdown: summaryMd }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        fail(data?.error || "Could not publish the summary.");
        return;
      }
      flash("Course summary published to the program.");
    } catch (e) {
      fail(e instanceof Error ? e.message : "Could not publish the summary.");
    } finally {
      setSavingSummary(false);
    }
  };

  const upload = async () => {
    if (!id) {
      fail("Save the program basics first, then upload.");
      return;
    }
    setUploadErr("");
    if (!uploadFile) {
      setUploadErr("Choose a PDF file.");
      return;
    }
    const okType = uploadFile.type === "application/pdf" || /\.pdf$/i.test(uploadFile.name);
    if (!okType) {
      setUploadErr("File must be a PDF.");
      return;
    }
    if (uploadFile.size > 5 * 1024 * 1024) {
      setUploadErr("File must be 5 MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const fileBase64 = await fileToBase64(uploadFile);
      const res = await adminFetch("/api/admin/upload-spec", {
        method: "POST",
        body: JSON.stringify({
          programId: id,
          short_description: shortDesc,
          fileBase64,
          filename: uploadFile.name,
          mimeType: uploadFile.type || "application/pdf",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUploadErr(data?.error || "Upload failed.");
        return;
      }
      setHasPdf(true);
      flash("PDF uploaded. Now create the course summary.");
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <button onClick={onDone} className="btn-ghost self-start" style={{ fontSize: 10 }}>
        ← Back to programs
      </button>

      {/* Basics */}
      <div className="glass p-6 md:p-8 flex flex-col gap-4">
        <h2 className="text-xl font-display font-bold">{id ? "Edit program" : "New program"}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Slug</label>
            <input
              className="form-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. ai-fluency-leaders"
            />
          </div>
          <div>
            <label className="form-label">Sort order</label>
            <input
              type="number"
              className="form-input"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div>
          <label className="form-label">Short description</label>
          <textarea
            className="form-input"
            rows={2}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={saveBasics} className="btn-primary" disabled={savingBasics}>
            {savingBasics ? "Saving…" : id ? "Save Changes" : "Create Program"}
          </button>
          {msg && <span style={{ color: "var(--green)", fontFamily: "var(--mono)", fontSize: 11 }}>{msg}</span>}
          {err && <span style={{ color: "var(--green)", fontFamily: "var(--mono)", fontSize: 11 }}>{err}</span>}
        </div>
      </div>

      {!id && (
        <p style={{ color: "var(--text-3)", fontSize: 13 }}>
          Create the program above to upload a PDF and create a course summary.
        </p>
      )}

      {id && (
        <>
          {/* Step 1 — Upload the program PDF (source of truth) */}
          <div className="glass p-6 md:p-8 flex flex-col gap-4" style={{ borderTop: "2px solid var(--green)" }}>
            <div>
              <span className="section-tag">Step 1 · Upload PDF</span>
              <h3 className="text-lg font-display font-bold">Upload the program PDF</h3>
            </div>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="form-input"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex items-center gap-3">
              <button onClick={upload} className="btn-primary self-start" disabled={uploading}>
                {uploading ? "Uploading…" : "Upload PDF"}
              </button>
              {hasPdf && <span className="badge-active">PDF uploaded</span>}
            </div>
            {uploadErr && (
              <span style={{ color: "var(--green)", fontFamily: "var(--mono)", fontSize: 11 }}>{uploadErr}</span>
            )}
          </div>

          {/* Step 2 — Course summary generated from the PDF */}
          <div className="glass p-6 md:p-8 flex flex-col gap-4">
            <div>
              <span className="section-tag">Step 2 · Course Summary</span>
              <h3 className="text-lg font-display font-bold">Create a course summary from the PDF</h3>
              <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 4 }}>
                A short, Coursera-style overview generated from the uploaded PDF. Edit it, then publish it to the
                program.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={createSummary}
                className="btn-ghost self-start"
                disabled={creatingSummary || !hasPdf}
              >
                {creatingSummary ? "Creating…" : "Create Course Summary"}
              </button>
              {!hasPdf && (
                <span style={{ color: "var(--text-3)", fontSize: 12 }}>Upload a PDF first to enable this.</span>
              )}
            </div>

            <div>
              <label className="form-label">Course summary (raw / rendered)</label>
              <div className="grid md:grid-cols-2 gap-4">
                <textarea
                  className="form-input font-mono"
                  style={{ minHeight: 320, fontSize: 12 }}
                  value={summaryMd}
                  onChange={(e) => setSummaryMd(e.target.value)}
                  placeholder="Generate from the PDF, or write a summary here…"
                />
                <div
                  className="prose prose-invert max-w-none p-4 rounded-md overflow-auto"
                  style={{ minHeight: 320, maxHeight: 460, background: "var(--black)", border: "1px solid var(--border)" }}
                >
                  <ReactMarkdown>{summaryMd || "_Nothing yet._"}</ReactMarkdown>
                </div>
              </div>
            </div>

            <button onClick={publishSummary} className="btn-primary self-start" disabled={savingSummary}>
              {savingSummary ? "Publishing…" : "Publish Course Summary"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Programs panel ──────────────────────────────────────────────────────────
function ProgramsPanel({ adminFetch }: { adminFetch: AdminFetch }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Program | "new" | null>(null);
  const [busyId, setBusyId] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/programs");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load programs.");
      setPrograms(data.programs ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load programs.");
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => {
    if (editing === null) load();
  }, [editing, load]);

  const togglePublish = async (p: Program) => {
    setBusyId(p.id);
    try {
      const res = await adminFetch("/api/admin/programs", {
        method: "PATCH",
        body: JSON.stringify({ id: p.id, status: p.status === "published" ? "draft" : "published" }),
      });
      if (res.ok) load();
    } finally {
      setBusyId("");
    }
  };

  const del = async (p: Program) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setBusyId(p.id);
    try {
      const res = await adminFetch("/api/admin/programs", {
        method: "DELETE",
        body: JSON.stringify({ id: p.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        alert(data?.error || "This program is referenced by registrations. Unpublish it instead.");
        return;
      }
      if (res.ok) load();
      else alert(data?.error || "Could not delete.");
    } finally {
      setBusyId("");
    }
  };

  if (editing !== null) {
    return (
      <ProgramEditor
        adminFetch={adminFetch}
        program={editing === "new" ? null : editing}
        onDone={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold">Programs</h2>
        <button onClick={() => setEditing("new")} className="btn-primary">
          + New Program
        </button>
      </div>

      {loading && <p style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12 }}>Loading…</p>}
      {error && <p style={{ color: "var(--text-2)", fontSize: 13 }}>{error}</p>}

      {!loading && !error && (
        <div className="glass overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Name", "Status", "Sort", "Updated", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontFamily: "var(--mono)",
                      fontSize: 9,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-3)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--text-1)", fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={p.status === "published" ? "badge-active" : "badge-pending"}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-2)" }}>{p.sort_order}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-2)" }}>{fmtDate(p.updated_at)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => togglePublish(p)}
                        disabled={busyId === p.id}
                        className="btn-ghost"
                        style={{ fontSize: 9, padding: "6px 12px" }}
                      >
                        {p.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => setEditing(p)}
                        className="btn-ghost"
                        style={{ fontSize: 9, padding: "6px 12px" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => del(p)}
                        disabled={busyId === p.id}
                        className="btn-ghost"
                        style={{ fontSize: 9, padding: "6px 12px" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {programs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "20px 16px", color: "var(--text-3)" }}>
                    No programs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Form Options (lookup tables) ────────────────────────────────────────────
function LookupTable({
  title,
  table,
  rows,
  adminFetch,
  onChanged,
}: {
  title: string;
  table: "experience" | "eligibility";
  rows: LookupRow[];
  adminFetch: AdminFetch;
  onChanged: () => void;
}) {
  const [drafts, setDrafts] = useState<Record<number, { label: string; sort_order: string }>>({});
  const [busy, setBusy] = useState<number | null>(null);

  const draftFor = (r: LookupRow) => drafts[r.id] ?? { label: r.label, sort_order: String(r.sort_order) };

  const patch = async (id: number, body: Record<string, any>) => {
    setBusy(id);
    try {
      const res = await adminFetch("/api/admin/lookups", {
        method: "PATCH",
        body: JSON.stringify({ table, id, ...body }),
      });
      if (res.ok) onChanged();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Could not update.");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="glass p-6 flex flex-col gap-3">
      <h3 className="text-lg font-display font-bold">{title}</h3>
      <div className="flex flex-col gap-2">
        {rows.map((r) => {
          const d = draftFor(r);
          return (
            <div key={r.id} className="flex flex-wrap items-end gap-2" style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
              <div style={{ flex: "1 1 200px" }}>
                <label className="form-label">Label</label>
                <input
                  className="form-input"
                  value={d.label}
                  onChange={(e) => setDrafts((s) => ({ ...s, [r.id]: { ...draftFor(r), label: e.target.value } }))}
                />
              </div>
              <div style={{ width: 90 }}>
                <label className="form-label">Sort</label>
                <input
                  type="number"
                  className="form-input"
                  value={d.sort_order}
                  onChange={(e) => setDrafts((s) => ({ ...s, [r.id]: { ...draftFor(r), sort_order: e.target.value } }))}
                />
              </div>
              <button
                className="btn-ghost"
                style={{ fontSize: 9, padding: "8px 12px" }}
                disabled={busy === r.id}
                onClick={() => patch(r.id, { label: d.label, sort_order: Number(d.sort_order) || 0 })}
              >
                Save
              </button>
              <button
                className="btn-ghost"
                style={{ fontSize: 9, padding: "8px 12px" }}
                disabled={busy === r.id}
                onClick={() => patch(r.id, { active: !r.active })}
              >
                {r.active ? "Deactivate" : "Activate"}
              </button>
              <span className={r.active ? "badge-active" : "badge-neutral"}>{r.active ? "active" : "inactive"}</span>
            </div>
          );
        })}
        {rows.length === 0 && <p style={{ color: "var(--text-3)", fontSize: 13 }}>No rows.</p>}
      </div>
    </div>
  );
}

function OptionsPanel({ adminFetch }: { adminFetch: AdminFetch }) {
  const [experience, setExperience] = useState<LookupRow[]>([]);
  const [eligibility, setEligibility] = useState<LookupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/lookups");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load options.");
      setExperience(data.experienceRanges ?? []);
      setEligibility(data.eligibilityOptions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load options.");
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-display font-bold">Form Options</h2>
      {loading && <p style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12 }}>Loading…</p>}
      {error && <p style={{ color: "var(--text-2)", fontSize: 13 }}>{error}</p>}
      {!loading && !error && (
        <div className="grid lg:grid-cols-2 gap-5">
          <LookupTable title="Years of experience" table="experience" rows={experience} adminFetch={adminFetch} onChanged={load} />
          <LookupTable title="Employment eligibility" table="eligibility" rows={eligibility} adminFetch={adminFetch} onChanged={load} />
        </div>
      )}
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
export function AdminTraining() {
  const [adminKey, setAdminKey] = useState<string>(() => sessionStorage.getItem(KEY_STORAGE) || "");
  const [authed, setAuthed] = useState<boolean>(() => Boolean(sessionStorage.getItem(KEY_STORAGE)));
  const [tab, setTab] = useState<"programs" | "options">("programs");

  const adminFetch = useCallback<AdminFetch>(
    async (path, options = {}) => {
      const headers: Record<string, string> = { "x-admin-key": adminKey };
      if (options.headers) Object.assign(headers, options.headers as Record<string, string>);
      if (options.body) headers["Content-Type"] = "application/json";
      const res = await fetch(path, { ...options, headers });
      if (res.status === 401) {
        sessionStorage.removeItem(KEY_STORAGE);
        setAdminKey("");
        setAuthed(false);
        throw new Error("Session expired. Please sign in again.");
      }
      return res;
    },
    [adminKey]
  );

  const unlock = (key: string) => {
    sessionStorage.setItem(KEY_STORAGE, key);
    setAdminKey(key);
    setAuthed(true);
  };

  const signOut = () => {
    sessionStorage.removeItem(KEY_STORAGE);
    setAdminKey("");
    setAuthed(false);
  };

  if (!authed) return <PasswordGate onUnlock={unlock} />;

  return (
    <div className="w-full">
      <section className="pt-24 pb-[25px]" style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-display font-bold">Training Admin</h1>
            <button onClick={signOut} className="btn-ghost" style={{ fontSize: 9 }}>
              Sign out
            </button>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setTab("programs")}
              className={tab === "programs" ? "btn-primary" : "btn-ghost"}
              style={{ fontSize: 10 }}
            >
              Programs
            </button>
            <button
              onClick={() => setTab("options")}
              className={tab === "options" ? "btn-primary" : "btn-ghost"}
              style={{ fontSize: 10 }}
            >
              Form Options
            </button>
          </div>
        </div>
      </section>

      <section className="py-[25px]" style={{ background: "var(--bg-base)" }}>
        <div className="container">
          {tab === "programs" ? <ProgramsPanel adminFetch={adminFetch} /> : <OptionsPanel adminFetch={adminFetch} />}
        </div>
      </section>
    </div>
  );
}
