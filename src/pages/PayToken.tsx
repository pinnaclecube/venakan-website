import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Reveal } from "@/components/ui/Reveal";

type PayData = {
  firstName: string;
  programName: string;
  amount: string;
  amountCents: number;
  currency: string;
  state: "ready" | "enrolled" | "full";
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <section className="pt-24 pb-[25px]" style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <div className="max-w-lg mx-auto">{children}</div>
        </div>
      </section>
    </div>
  );
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass p-8 md:p-10 text-center">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-4">{title}</h1>
      <p className="leading-relaxed" style={{ color: "var(--text-2)" }}>
        {children}
      </p>
    </div>
  );
}

export function PayToken() {
  const params = useParams();
  const token = params.token ?? "";
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState("");

  const { data, isLoading, isError } = useQuery<PayData | null>({
    queryKey: ["pay", token],
    queryFn: async () => {
      const res = await fetch(`/api/pay/${encodeURIComponent(token)}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to load payment details");
      return res.json();
    },
    retry: false,
    enabled: token.length > 0,
  });

  const proceed = async () => {
    setErr("");
    setStarting(true);
    try {
      const res = await fetch(`/api/pay/${encodeURIComponent(token)}/checkout`, { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        const base = d?.error || "Could not start checkout. Please try again.";
        setErr(d?.detail ? `${base} (${d.detail})` : base);
        setStarting(false);
        return;
      }
      if (d?.url) {
        window.location.href = d.url; // redirect to Stripe hosted checkout
      } else {
        setErr("Could not start checkout. Please try again.");
        setStarting(false);
      }
    } catch {
      setErr("Network error. Please try again.");
      setStarting(false);
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <p style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12 }}>Loading…</p>
      </Shell>
    );
  }

  // Unknown / expired token
  if (data === null || isError || !data) {
    return (
      <Shell>
        <Message title="Payment link not found">
          This payment link is invalid or has expired. If you were approved for a program, email{" "}
          <a href="mailto:hello@venakan.com" style={{ color: "var(--green)" }}>
            hello@venakan.com
          </a>{" "}
          and we'll send you a fresh link.
        </Message>
      </Shell>
    );
  }

  if (data.state === "enrolled") {
    return (
      <Shell>
        <Message title="You're already enrolled">
          Check your email for your next steps. Questions? Email{" "}
          <a href="mailto:hello@venakan.com" style={{ color: "var(--green)" }}>
            hello@venakan.com
          </a>
          .
        </Message>
      </Shell>
    );
  }

  if (data.state === "full") {
    return (
      <Shell>
        <Message title="This cohort is now full">
          Unfortunately this cohort filled up before your payment was completed. Please email{" "}
          <a href="mailto:hello@venakan.com" style={{ color: "var(--green)" }}>
            hello@venakan.com
          </a>{" "}
          — we'll help you find the next available cohort.
        </Message>
      </Shell>
    );
  }

  // ready → payment card
  return (
    <Shell>
      <Reveal variant="card">
        <div className="glass overflow-hidden" style={{ padding: 0 }}>
          {/* Navy header */}
          <div style={{ background: "var(--black)", padding: "20px 28px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)" }}>
              Venakan Learn · Enrollment
            </div>
          </div>

          <div style={{ padding: "28px" }}>
            {data.firstName && (
              <p className="mb-2" style={{ color: "var(--text-3)", fontSize: 14 }}>
                Hi {data.firstName},
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-6">{data.programName}</h1>

            <div className="flex items-baseline justify-between py-4" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
                Tuition
              </span>
              <span className="text-2xl font-display font-bold" style={{ color: "var(--green)" }}>
                {data.amount}
              </span>
            </div>

            <button
              type="button"
              onClick={proceed}
              className="btn-primary w-full justify-center py-4 mt-6"
              disabled={starting}
            >
              {starting ? "Redirecting…" : "Proceed to Payment →"}
            </button>

            {err && (
              <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 12 }}>{err}</p>
            )}

            <p className="mt-5 text-center" style={{ color: "var(--text-3)", fontSize: 12, lineHeight: 1.6 }}>
              Payments are securely processed by Stripe. You'll be redirected to Stripe's checkout to
              complete your enrollment.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="text-center mt-6">
        <Link href="/training" className="text-[var(--green)] hover:text-white transition-colors" style={{ fontSize: 13 }}>
          ← Back to programs
        </Link>
      </div>
    </Shell>
  );
}
