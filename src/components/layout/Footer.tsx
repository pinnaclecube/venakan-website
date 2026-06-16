import { Link } from "wouter";
import { useState } from "react";
import { Check } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer
      className="pt-20 pb-8 mt-24"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="container">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
              Built exclusively for AI. No legacy IT practice. No generalist consulting. Just AI &mdash; from day one.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-[rgba(255,255,255,0.05)] border-[var(--border)] text-[var(--text-3)] hover:bg-[var(--blue-dim)] hover:border-[var(--blue-border)] hover:text-[#34D399]">
                in
              </a>
              <a href="#" className="w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-[rgba(255,255,255,0.05)] border-[var(--border)] text-[var(--text-3)] hover:bg-[var(--blue-dim)] hover:border-[var(--blue-border)] hover:text-[#34D399]">
                x
              </a>
              <a href="#" className="w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-[rgba(255,255,255,0.05)] border-[var(--border)] text-[var(--text-3)] hover:bg-[var(--blue-dim)] hover:border-[var(--blue-border)] hover:text-[#34D399]">
                gh
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-4">
            <h4 style={{ fontFamily: "var(--oswald)", fontWeight: 500, fontSize: "15px", color: "var(--white)", marginBottom: "16px" }}>Services</h4>
            <Link href="/rd" className="transition-colors hover:!text-[var(--green)]" style={{ fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-2)" }}>AI R&D</Link>
            <Link href="/strategy" className="transition-colors hover:!text-[var(--green)]" style={{ fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-2)" }}>AI Strategy</Link>
            <Link href="/training" className="transition-colors hover:!text-[var(--green)]" style={{ fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-2)" }}>AI Training</Link>
            <Link href="/development" className="transition-colors hover:!text-[var(--green)]" style={{ fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-2)" }}>AI Development</Link>
            <Link href="/staffing" className="transition-colors hover:!text-[var(--green)]" style={{ fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-2)" }}>AI Staffing</Link>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4">
            <h4 style={{ fontFamily: "var(--oswald)", fontWeight: 500, fontSize: "15px", color: "var(--white)", marginBottom: "16px" }}>Company</h4>
            <Link href="/about" className="transition-colors hover:!text-[var(--green)]" style={{ fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-2)" }}>About Us</Link>
            <Link href="/resources" className="transition-colors hover:!text-[var(--green)]" style={{ fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-2)" }}>Resources Hub</Link>
            <Link href="/careers" className="transition-colors hover:!text-[var(--green)]" style={{ fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-2)" }}>Careers</Link>
            <Link href="/contact" className="transition-colors hover:!text-[var(--green)]" style={{ fontFamily: "var(--font)", fontSize: "13px", color: "var(--text-2)" }}>Contact</Link>
            <a href="mailto:info@venakaninfo.com" className="transition-colors hover:!text-[var(--green)] mt-2" style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--text-2)" }}>info@venakaninfo.com</a>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h4 style={{ fontFamily: "var(--oswald)", fontWeight: 500, fontSize: "15px", color: "var(--white)", marginBottom: "16px" }}>Intelligence</h4>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>Insights from our AI research team, delivered monthly.</p>
            {subscribed ? (
              <div className="flex items-center gap-3 p-3 glass text-sm" style={{ borderColor: "var(--green-border)", background: "var(--green-dim)", color: "var(--green)" }}>
                <Check size={16} /> Subscribed successfully.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3 mt-2">
                <input
                  type="email"
                  placeholder="Your work email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
                <button type="submit" className="btn-primary py-2.5 justify-center w-full">Subscribe</button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t"
          style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
        >
          <p style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)" }}>&copy; {new Date().getFullYear()} Venakan Info Solutions. All rights reserved.</p>
          <p className="font-medium" style={{ fontFamily: "var(--mono)", color: "var(--green)" }}>Made with AI. Built for AI.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs transition-colors hover:!text-[var(--green)]" style={{ color: "var(--text-3)" }}>Privacy</Link>
            <Link href="/disclaimer" className="text-xs transition-colors hover:!text-[var(--green)]" style={{ color: "var(--text-3)" }}>Disclaimer</Link>
            <Link href="/terms" className="text-xs transition-colors hover:!text-[var(--green)]" style={{ color: "var(--text-3)" }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
