import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Reveal } from "@/components/ui/Reveal";

// ── Shape returned by /api/registration-options ──
type RegistrationOptions = {
  programs: { id: string; slug: string; name: string }[];
  experienceRanges: { id: number; label: string }[];
  eligibilityOptions: { id: number; label: string }[];
};

const RESUME_MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const RESUME_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const isResumeType = (f: File) => RESUME_MIME.includes(f.type) || /\.(pdf|docx)$/i.test(f.name);

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  phone: z.string().trim().min(1, "Phone is required."),
  programId: z.string().min(1, "Select a program track."),
  experienceRangeId: z.string().min(1, "Select your years of experience."),
  eligibilityId: z.string().min(1, "Select your employment eligibility."),
  linkedinUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Enter a valid URL (including https://).")
    .optional(),
  resume: z
    .custom<File>((v) => v instanceof File, { message: "Resume is required." })
    .refine((f) => !(f instanceof File) || isResumeType(f), "Resume must be a PDF or DOCX file.")
    .refine((f) => !(f instanceof File) || f.size <= RESUME_MAX_BYTES, "Resume must be 3 MB or smaller."),
});

type FormValues = z.infer<typeof schema>;

// Read a File as base64 (data-URL payload only, no prefix).
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span
      style={{ color: "var(--green)", fontSize: 11, fontFamily: "var(--mono)", marginTop: 4, display: "block" }}
    >
      {message}
    </span>
  );
}

export function TrainingRegister() {
  const search = useSearch();
  const trackSlug = new URLSearchParams(search).get("track") ?? "";

  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [resumeName, setResumeName] = useState("");

  const {
    data: options,
    isLoading: optionsLoading,
    isError: optionsError,
  } = useQuery<RegistrationOptions>({
    queryKey: ["registration-options"],
    queryFn: async () => {
      const res = await fetch("/api/registration-options");
      if (!res.ok) throw new Error("Failed to load registration options");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      programId: "",
      experienceRangeId: "",
      eligibilityId: "",
      linkedinUrl: "",
    },
  });

  // Preselect the program track from ?track=<slug> once options arrive.
  useEffect(() => {
    if (!options || !trackSlug) return;
    const match = options.programs.find((p) => p.slug === trackSlug);
    if (match) setValue("programId", match.id, { shouldValidate: false });
  }, [options, trackSlug, setValue]);

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    try {
      const file = values.resume as File;
      const resumeBase64 = await fileToBase64(file);
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        programId: values.programId,
        experienceRangeId: Number(values.experienceRangeId),
        eligibilityId: Number(values.eligibilityId),
        linkedinUrl: values.linkedinUrl || undefined,
        resumeBase64,
        resumeFilename: file.name,
        resumeMimeType:
          file.type || (/\.docx$/i.test(file.name) ? RESUME_MIME[1] : RESUME_MIME[0]),
      };

      const res = await fetch("/api/training-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data?.error || "We couldn't submit your registration. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full">
      {/* HERO */}
      <section
        className="pt-20 md:pt-24 pb-[25px] grid-bg-fine border-b border-border-mid"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="container">
          <Reveal variant="heading">
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.05] tracking-[-0.02em] mb-5">
              <span className="block">Reserve your place in</span>
              <span className="block gradient-text">Venakan AI Training.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
              Tell us who you are and which track fits. We'll follow up with curriculum details,
              schedule, and next steps — no obligation.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FORM */}
      <section className="py-[25px]" style={{ background: "var(--bg-base)" }}>
        <div className="container">
          <div className="max-w-2xl">
            <Reveal variant="card">
              <div className="glass p-8 md:p-12 relative overflow-hidden">
                {submitted ? (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8 text-center animate-in fade-in duration-500 motion-reduce:animate-none"
                    style={{ background: "var(--black-mid)" }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                      style={{ background: "var(--green-dim)", color: "var(--green)" }}
                    >
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-2">You're registered.</h3>
                    <p className="text-white/60 max-w-sm">
                      Thanks for your interest. We'll be in touch with the details for your track shortly.
                    </p>
                  </div>
                ) : null}

                {optionsError ? (
                  <p style={{ color: "var(--text-2)", fontSize: 14 }}>
                    We couldn't load the registration form right now. Please refresh and try again.
                  </p>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
                    {/* First / Last name */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">First name</label>
                        <input className="form-input" autoComplete="given-name" {...register("firstName")} />
                        <FieldError message={errors.firstName?.message} />
                      </div>
                      <div>
                        <label className="form-label">Last name</label>
                        <input className="form-input" autoComplete="family-name" {...register("lastName")} />
                        <FieldError message={errors.lastName?.message} />
                      </div>
                    </div>

                    {/* Email / Phone */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">Email</label>
                        <input type="email" className="form-input" autoComplete="email" {...register("email")} />
                        <FieldError message={errors.email?.message} />
                      </div>
                      <div>
                        <label className="form-label">Phone</label>
                        <input type="tel" className="form-input" autoComplete="tel" {...register("phone")} />
                        <FieldError message={errors.phone?.message} />
                      </div>
                    </div>

                    {/* Program track */}
                    <div>
                      <label className="form-label">Program track</label>
                      <select className="form-input" disabled={optionsLoading} {...register("programId")}>
                        <option value="">{optionsLoading ? "Loading…" : "Select a track…"}</option>
                        {options?.programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.programId?.message} />
                    </div>

                    {/* Years of experience */}
                    <div>
                      <label className="form-label">Years of experience</label>
                      <select className="form-input" disabled={optionsLoading} {...register("experienceRangeId")}>
                        <option value="">{optionsLoading ? "Loading…" : "Select a range…"}</option>
                        {options?.experienceRanges.map((r) => (
                          <option key={r.id} value={String(r.id)}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.experienceRangeId?.message} />
                    </div>

                    {/* Employment eligibility */}
                    <div>
                      <label className="form-label">Employment eligibility</label>
                      <select className="form-input" disabled={optionsLoading} {...register("eligibilityId")}>
                        <option value="">{optionsLoading ? "Loading…" : "Select an option…"}</option>
                        {options?.eligibilityOptions.map((o) => (
                          <option key={o.id} value={String(o.id)}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.eligibilityId?.message} />
                    </div>

                    {/* LinkedIn (optional) */}
                    <div>
                      <label className="form-label">LinkedIn URL (optional)</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://linkedin.com/in/…"
                        {...register("linkedinUrl")}
                      />
                      <FieldError message={errors.linkedinUrl?.message} />
                    </div>

                    {/* Resume */}
                    <div>
                      <label className="form-label">Resume (PDF or DOCX, max 3MB)</label>
                      <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="form-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setResumeName(file?.name ?? "");
                          setValue("resume", file as File, { shouldValidate: true });
                        }}
                      />
                      {resumeName && !errors.resume && (
                        <span
                          style={{
                            color: "var(--text-3)",
                            fontSize: 11,
                            fontFamily: "var(--mono)",
                            marginTop: 4,
                            display: "block",
                          }}
                        >
                          {resumeName}
                        </span>
                      )}
                      <FieldError message={errors.resume?.message as string | undefined} />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full justify-center py-4 mt-2"
                      disabled={isSubmitting || optionsLoading}
                    >
                      {isSubmitting ? "Submitting…" : "Register Your Interest →"}
                    </button>

                    {serverError && (
                      <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 2 }}>{serverError}</p>
                    )}
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
