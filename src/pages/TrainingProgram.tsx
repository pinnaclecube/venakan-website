import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Reveal } from "@/components/ui/Reveal";
import NotFound from "@/pages/not-found";

type ProgramDetail = {
  slug: string;
  name: string;
  short_description: string | null;
  spec_type: "generated" | "uploaded" | null;
  spec_markdown: string | null;
  doc_url: string | null;
  doc_is_pdf: boolean;
};

// Same prose treatment as ArticleLayout: green Oswald H2s, text-2 body,
// green left-border callouts (blockquotes).
const PROSE =
  "prose prose-lg max-w-none font-body font-light text-[17px] " +
  "prose-headings:[font-family:var(--oswald)] " +
  "prose-h2:text-[var(--green)] prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 " +
  "prose-h3:text-white prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 " +
  "prose-p:mb-6 prose-p:text-[var(--text-2)] prose-li:text-[var(--text-2)] prose-li:my-1 " +
  "prose-strong:text-white prose-a:text-[var(--green)] " +
  "prose-blockquote:border-l-[3px] prose-blockquote:border-[var(--green)] prose-blockquote:bg-[var(--green-dim)] " +
  "prose-blockquote:not-italic prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:text-[var(--text-2)]";

export function TrainingProgram() {
  const params = useParams();
  const slug = params.slug ?? "";

  const { data, isLoading, isError } = useQuery<ProgramDetail | null>({
    queryKey: ["program", slug],
    queryFn: async () => {
      const res = await fetch(`/api/program?slug=${encodeURIComponent(slug)}`);
      if (res.status === 404) return null; // unknown slug or draft
      if (!res.ok) throw new Error("Failed to load program");
      return res.json();
    },
    retry: false,
    enabled: slug.length > 0,
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <section className="py-20" style={{ background: "var(--bg)" }}>
          <div className="container">
            <p style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12 }}>Loading…</p>
          </div>
        </section>
      </div>
    );
  }

  // Unknown slug / draft → 404.
  if (data === null) return <NotFound />;

  if (isError || !data) {
    return (
      <div className="w-full">
        <section className="py-20" style={{ background: "var(--bg)" }}>
          <div className="container">
            <p style={{ color: "var(--text-2)" }}>We couldn't load this program. Please try again.</p>
          </div>
        </section>
      </div>
    );
  }

  const hasDoc = Boolean(data.doc_url);
  const showInlinePdf = hasDoc && data.doc_is_pdf;
  const isGenerated = data.spec_type === "generated" && Boolean(data.spec_markdown);

  return (
    <div className="w-full">
      {/* Hero */}
      <section
        className="py-20 grid-bg"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="container max-w-4xl">
          <Reveal variant="heading">
            <div className="tag tag-green mb-6">AI Training</div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]"
              style={{ fontFamily: "var(--oswald)", color: "var(--white)" }}
            >
              {data.name}
            </h1>
            {data.short_description && (
              <p className="text-lg leading-relaxed max-w-2xl" style={{ color: "var(--text-2)" }}>
                {data.short_description}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-8">
              {hasDoc && (
                <a href={data.doc_url!} target="_blank" rel="noreferrer" className="btn-primary">
                  Download PDF &darr;
                </a>
              )}
              <Link href={`/training/register?track=${encodeURIComponent(data.slug)}`} className="btn-ghost">
                Register Your Interest &rarr;
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Body */}
      <section className="py-20" style={{ background: "var(--bg)" }}>
        <div className="container max-w-[820px] mx-auto">
          <Reveal delay={100} variant="body">
            {isGenerated ? (
              <div className={PROSE} style={{ color: "var(--text-2)", lineHeight: 1.85 }}>
                <ReactMarkdown>{data.spec_markdown ?? ""}</ReactMarkdown>
              </div>
            ) : hasDoc ? (
              <div>
                {showInlinePdf ? (
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <object
                      data={data.doc_url!}
                      type="application/pdf"
                      style={{ width: "100%", height: "80vh", display: "block" }}
                    >
                      <p className="p-6" style={{ color: "var(--text-2)" }}>
                        Your browser can't display the PDF inline.{" "}
                        <a href={data.doc_url!} className="text-[var(--green)]" target="_blank" rel="noreferrer">
                          Download it instead.
                        </a>
                      </p>
                    </object>
                  </div>
                ) : (
                  <div className="glass p-8 text-center">
                    <p className="mb-6" style={{ color: "var(--text-2)" }}>
                      The full program specification is available as a document.
                    </p>
                    <a href={data.doc_url!} target="_blank" rel="noreferrer" className="btn-primary">
                      Download Specification &darr;
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--text-2)" }}>
                {data.short_description || "Full details for this program are coming soon."}
              </p>
            )}

            {/* Closing CTA */}
            <div className="mt-16 glass p-10 text-center rounded-xl">
              <h3 className="text-2xl font-display font-bold mb-6 text-white">
                Ready to join this program?
              </h3>
              <Link
                href={`/training/register?track=${encodeURIComponent(data.slug)}`}
                className="btn-primary"
              >
                Register Your Interest &rarr;
              </Link>
            </div>

            <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
              <Link href="/training" className="transition-colors flex items-center gap-2 text-[var(--green)] hover:text-white">
                &larr; Back to Training
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
