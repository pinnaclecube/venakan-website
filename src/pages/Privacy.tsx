import { Reveal } from "@/components/ui/Reveal";

export function Privacy() {
  return (
    <div className="pt-[90px]">
      <section className="py-20 bg-navy grid-bg border-b border-border-mid">
        <div className="container max-w-3xl text-center">
          <Reveal>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Privacy Policy</h1>
            <p className="text-white/60 font-mono text-sm">Last updated: May 2025</p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-navy">
        <div className="container max-w-3xl">
          <Reveal delay={100}>
            <div className="prose prose-invert prose-lg max-w-none text-white/80 font-light leading-relaxed prose-h2:text-white prose-h2:font-display prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6">
              
              <h2>Information We Collect</h2>
              <p>Venakan Info Solutions collects information you provide directly to us when using our website, including contact form submissions (name, email, company, and message content) and newsletter signups. We also automatically collect standard usage data (IP address, browser type, device information) through cookies and analytics services.</p>

              <h2>How We Use Information</h2>
              <p>The information we collect is used to:</p>
              <ul>
                <li>Respond to your inquiries and scoping requests</li>
                <li>Deliver our monthly newsletter (if subscribed)</li>
                <li>Improve our website and service offerings</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Maintain security and prevent fraud</li>
              </ul>

              <h2>Data Sharing</h2>
              <p>Venakan Info Solutions <strong>does not sell your personal data</strong>. We share information only with trusted service providers necessary to operate our website and business (e.g., hosting providers, email delivery services), or when required by law to comply with legal processes.</p>

              <h2>Cookies Policy</h2>
              <p>We use essential cookies to ensure website functionality and analytics cookies to understand how visitors interact with our site. You can control or opt-out of non-essential cookies through our cookie banner or your browser settings.</p>

              <h2>Data Retention</h2>
              <p>Contact form submissions are retained for 24 months to support ongoing business relationships. Server and analytics logs are automatically purged after 90 days. You may request early deletion of your data at any time.</p>

              <h2>Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the processing of your personal data. To exercise these rights, please contact our privacy team.</p>

              <h2>Contact</h2>
              <p>If you have questions about this privacy policy, please contact us at:<br/>
              <a href="mailto:privacy@venakaninfo.com" className="text-brand-blue hover:underline">privacy@venakaninfo.com</a></p>

            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
