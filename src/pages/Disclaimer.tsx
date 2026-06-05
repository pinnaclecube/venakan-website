import { Reveal } from "@/components/ui/Reveal";

export function Disclaimer() {
  return (
    <div className="pt-[90px]">
      <section className="py-20 bg-navy grid-bg border-b border-border-mid">
        <div className="container max-w-3xl text-center">
          <Reveal variant="heading">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Disclaimer</h1>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-navy">
        <div className="container max-w-3xl">
          <Reveal delay={100} variant="heading">
            <div className="prose prose-invert prose-lg max-w-none text-white/80 font-light leading-relaxed prose-h2:text-white prose-h2:font-display prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6">
              
              <h2>No Professional Advice</h2>
              <p>The information contained on this website and in our resources hub is for general informational purposes only. It does not constitute legal, financial, investment, or technical advice. Engaging with our website does not create a consultant-client relationship. You should consult appropriate professionals before making business decisions based on this content.</p>

              <h2>AI Content Accuracy</h2>
              <p>While Venakan Info Solutions strives to provide accurate and up-to-date information regarding artificial intelligence technologies, the field evolves rapidly. Technical paradigms, model capabilities, and regulatory frameworks discussed in our articles may change after publication. We do not warrant the absolute accuracy, completeness, or ongoing validity of the information provided.</p>

              <h2>External Links</h2>
              <p>This website may contain links to external sites not operated by Venakan Info Solutions. We have no control over the content and practices of these sites and cannot accept responsibility or liability for their respective privacy policies or terms of use.</p>

              <h2>Forward-Looking Statements</h2>
              <p>Certain content on this site may contain forward-looking statements about technology trends, market conditions, or industry regulations. These statements are based on our current expectations and involve assumptions and risks. Actual outcomes may differ materially from those projected.</p>

              <h2>Contact</h2>
              <p>If you have questions about this disclaimer, please contact us at:<br/>
              <a href="mailto:info@venakaninfo.com" className="text-brand-blue hover:underline">info@venakaninfo.com</a></p>

            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
