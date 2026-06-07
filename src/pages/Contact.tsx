import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-[90px]">
      <section className="py-20 md:py-24 grid-bg-fine border-b border-border-mid" style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <Reveal variant="heading">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Start the Conversation.</h1>
            <p className="text-xl text-white/70 max-w-2xl leading-relaxed">
              No pitch decks. No generic discovery calls. Tell us what you're working on — and we'll tell you honestly whether and how we can help.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24" style={{ background: "var(--bg-base)" }}>
        <div className="container">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16">
            
            <Reveal delay={0} variant="card">
              <div className="glass p-8 md:p-12 relative overflow-hidden">
                {submitted ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-10 p-8 text-center animate-in fade-in duration-500" style={{ background: "rgba(15,23,42,0.95)" }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--green-dim)", color: "var(--green)" }}>
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-2">Thank you.</h3>
                    <p className="text-white/60">We'll be in touch within one business day.</p>
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white/80">What are you interested in?</label>
                    <select className="form-input" required>
                      <option value="">Select an option...</option>
                      <option value="rd">AI R&D Partnership</option>
                      <option value="strategy">AI Strategy Engagement</option>
                      <option value="training">AI Training Program</option>
                      <option value="development">AI Development Project</option>
                      <option value="staffing">AI Staffing</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-white/80">Company Name</label>
                      <input type="text" required className="form-input" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-white/80">Your Name</label>
                      <input type="text" required className="form-input" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white/80">Work Email</label>
                    <input type="email" required className="form-input" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white/80">What are you working on?</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us about your AI goals or challenges..."
                      className="form-input resize-y"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center py-4 mt-2">
                    Send Message &rarr;
                  </button>
                </form>
              </div>
            </Reveal>

            <Reveal delay={60} from="right" variant="card">
              <div className="flex flex-col gap-12">
                <div>
                  <h3 className="text-sm font-mono tracking-widest text-white/40 uppercase mb-6">Direct Contact</h3>
                  <div className="flex flex-col gap-4">
                    <a href="mailto:info@venakaninfo.com" className="text-xl font-mono hover:text-brand-blue transition-colors">info@venakaninfo.com</a>
                    <a href="https://linkedin.com/company/venakaninfo" target="_blank" rel="noreferrer" className="text-lg hover:text-brand-blue transition-colors">linkedin.com/company/venakaninfo</a>
                    <p className="text-lg text-white/60">venakaninfo.com</p>
                  </div>
                </div>

                <div className="w-16 h-px bg-border-mid" />

                <div>
                  <h3 className="text-sm font-mono tracking-widest text-white/40 uppercase mb-6">What to expect</h3>
                  <p className="text-lg text-white/80 leading-relaxed mb-8">
                    We respond within one business day. If your inquiry is urgent, note that in your message.
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="p-5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "2px solid var(--brand-blue)" }}>
                      <p className="text-sm text-white/80"><strong className="text-white">Quick inquiry?</strong> 24hr response.</p>
                    </div>
                    <div className="p-5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "2px solid var(--brand-violet)" }}>
                      <p className="text-sm text-white/80"><strong className="text-white">Complex engagement?</strong> We'll schedule a 30-min scoping call.</p>
                    </div>
                    <div className="p-5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "2px solid var(--green)" }}>
                      <p className="text-sm text-white/80"><strong className="text-white">Partnership?</strong> Let's talk about co-development.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>
    </div>
  );
}
