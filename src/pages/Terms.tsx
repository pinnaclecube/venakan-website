import { Reveal } from "@/components/ui/Reveal";

export function Terms() {
  return (
    <div className="pt-[90px]">
      <section className="py-20 bg-navy grid-bg border-b border-border-mid">
        <div className="container max-w-3xl text-center">
          <Reveal>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Terms of Use</h1>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-navy">
        <div className="container max-w-3xl">
          <Reveal delay={100}>
            <div className="prose prose-invert prose-lg max-w-none text-white/80 font-light leading-relaxed prose-h2:text-white prose-h2:font-display prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6">
              
              <h2>Acceptance of Terms</h2>
              <p>By accessing and using the Venakan Info Solutions website, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website.</p>

              <h2>Intellectual Property</h2>
              <p>All content on this website, including text, articles, graphics, logos, and design elements, is the exclusive property of Venakan Info Solutions and is protected by copyright, trademark, and other intellectual property laws. "Venakan Info Solutions" and our logos are trademarks of our company.</p>

              <h2>Permitted Use</h2>
              <p>You may view, download, and print content from our website for your personal, non-commercial use, provided you maintain all copyright and proprietary notices. You may share our public articles via social media or email using the original URLs.</p>

              <h2>Prohibited Conduct</h2>
              <p>You may not: (a) republish our articles or content as your own; (b) use automated systems, scrapers, or bots to extract data from our site; (c) attempt to gain unauthorized access to any portion of the site; (d) use the site in any manner that could disable, overburden, or impair our servers.</p>

              <h2>Disclaimer of Warranties</h2>
              <p>The website is provided on an "AS IS" and "AS AVAILABLE" basis. Venakan Info Solutions makes no warranties, expressed or implied, regarding the website's operation, uninterrupted availability, or the accuracy of its content.</p>

              <h2>Limitation of Liability</h2>
              <p>In no event shall Venakan Info Solutions, its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the website.</p>

              <h2>Governing Law</h2>
              <p>These terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.</p>

              <h2>Contact</h2>
              <p>If you have questions about these Terms, please contact us at:<br/>
              <a href="mailto:legal@venakaninfo.com" className="text-brand-blue hover:underline">legal@venakaninfo.com</a></p>

            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
