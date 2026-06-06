import { Link } from "wouter";
import logoMark from "@/assets/venakan-logo.png";
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
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="container">
        {/* Top Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-16 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/" className="flex items-center" aria-label="Venakan">
            <img
              src={logoMark}
              alt="Venakan"
              style={{
                height: "64px",
                width: "auto",
                objectFit: "contain",
                display: "block",
                filter: "drop-shadow(0 0 12px rgba(96,165,250,0.3))"
              }}
            />
          </Link>
          <h2 className="font-display text-2xl md:text-3xl font-bold max-w-md md:text-right">
            Pure AI.<br />
            <span className="gradient-text">Research to Results.</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <p className="text-white/60 text-sm leading-relaxed">
              Venakan Info Solutions is an AI-only company specializing in R&D, Strategy, Training, Development, and Staffing.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-[var(--bg-inset)] border-[var(--border)] text-[var(--ink-secondary)] hover:bg-[rgba(59,75,204,0.08)] hover:border-[rgba(59,75,204,0.25)] hover:text-[var(--brand-blue)]">
                in
              </a>
              <a href="#" className="w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-[var(--bg-inset)] border-[var(--border)] text-[var(--ink-secondary)] hover:bg-[rgba(59,75,204,0.08)] hover:border-[rgba(59,75,204,0.25)] hover:text-[var(--brand-blue)]">
                x
              </a>
              <a href="#" className="w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-[var(--bg-inset)] border-[var(--border)] text-[var(--ink-secondary)] hover:bg-[rgba(59,75,204,0.08)] hover:border-[rgba(59,75,204,0.25)] hover:text-[var(--brand-blue)]">
                gh
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs tracking-wider uppercase text-white/40 mb-2">Services</h4>
            <Link href="/rd" className="text-sm text-white/80 hover:text-blue-bright transition-colors">AI R&D</Link>
            <Link href="/strategy" className="text-sm text-white/80 hover:text-blue-bright transition-colors">AI Strategy</Link>
            <Link href="/training" className="text-sm text-white/80 hover:text-blue-bright transition-colors">AI Training</Link>
            <Link href="/development" className="text-sm text-white/80 hover:text-blue-bright transition-colors">AI Development</Link>
            <Link href="/staffing" className="text-sm text-white/80 hover:text-blue-bright transition-colors">AI Staffing</Link>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs tracking-wider uppercase text-white/40 mb-2">Company</h4>
            <Link href="/about" className="text-sm text-white/80 hover:text-blue-bright transition-colors">About Us</Link>
            <Link href="/resources" className="text-sm text-white/80 hover:text-blue-bright transition-colors">Resources Hub</Link>
            <Link href="/contact" className="text-sm text-white/80 hover:text-blue-bright transition-colors">Contact</Link>
            <a href="mailto:info@venakaninfo.com" className="text-sm text-white/80 hover:text-blue-bright transition-colors mt-2 font-mono">info@venakaninfo.com</a>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs tracking-wider uppercase text-white/40 mb-2">Intelligence</h4>
            <p className="text-sm text-white/60">Insights from our AI research team, delivered monthly.</p>
            {subscribed ? (
              <div className="flex items-center gap-3 p-3 glass border-green-500/30 bg-green-500/10 text-green-400 text-sm">
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
                  className="bg-[var(--bg-base)] border border-border-mid rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue transition-colors"
                />
                <button type="submit" className="btn-ghost py-2.5 justify-center w-full">Subscribe</button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} Venakan Info Solutions. All rights reserved.</p>
          <p className="text-sm font-medium gradient-text">Made with AI. Built for AI.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white transition-colors">Privacy</Link>
            <Link href="/disclaimer" className="text-xs text-white/40 hover:text-white transition-colors">Disclaimer</Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
