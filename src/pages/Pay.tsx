import { Reveal } from "@/components/ui/Reveal";

// Bare /pay — a stable home for the payment experience on venakan.com and a
// graceful landing for anyone who strips the token from their link.
export function Pay() {
  return (
    <div className="w-full">
      <section className="pt-24 pb-[25px] grid-bg-fine border-b border-border-mid" style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <div className="max-w-2xl">
            <Reveal variant="heading">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-5">
                Enrollment <span className="gradient-text">Payments</span>
              </h1>
              <p className="text-lg leading-relaxed mb-4" style={{ color: "var(--text-2)" }}>
                Tuition payments are made through a secure, personal link we email you after your
                application is approved. There's nothing to pay here directly.
              </p>
              <p className="text-lg leading-relaxed mb-4" style={{ color: "var(--text-2)" }}>
                Payments are processed by <strong className="text-white">Stripe</strong> — your card
                details never touch our servers.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: "var(--text-2)" }}>
                Can't find your payment link? Email{" "}
                <a href="mailto:hello@venakan.com" style={{ color: "var(--green)" }}>
                  hello@venakan.com
                </a>{" "}
                and we'll re-send it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
