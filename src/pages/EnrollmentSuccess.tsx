import { Link } from "wouter";
import { Reveal } from "@/components/ui/Reveal";

// /enrollment-success — branded confirmation after Stripe redirects back. No
// sensitive data is fetched here; the webhook is the source of truth.
export function EnrollmentSuccess() {
  return (
    <div className="w-full">
      <section className="pt-24 pb-[25px]" style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <Reveal variant="heading">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "var(--green-dim)", color: "var(--green)" }}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-5">
                Welcome to <span className="gradient-text">Venakan Learn!</span>
              </h1>
              <p className="text-lg leading-relaxed mb-4" style={{ color: "var(--text-2)" }}>
                Your payment went through and your seat is confirmed. A welcome email with your next
                steps is on its way — please check your inbox (and your spam folder, just in case).
              </p>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-3)" }}>
                Your payment receipt is sent separately by Stripe.
              </p>
              <Link href="/training" className="btn-ghost">
                Explore Programs →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
