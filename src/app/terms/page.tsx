import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'InvestedLuxury Terms of Service - Terms and conditions for using our website.',
  alternates: {
    canonical: 'https://investedluxury.com/terms',
  },
};

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-cream">
        <div className="container-luxury text-center">
          <h1 className="font-serif text-display text-black mb-4">
            Terms of Service
          </h1>
          <p className="text-body text-charcoal">
            Last updated: December 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="container-luxury">
          <div className="max-w-article mx-auto article-content">
            <p>
              Welcome to InvestedLuxury. By accessing or using our website at investedluxury.com (&quot;the Site&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all the terms and conditions of this agreement, you may not access the website or use any services.
            </p>

            <h2>Use of the Website</h2>
            <p>
              You may use our website only for lawful purposes and in accordance with these Terms. You agree not to use the website in any way that violates any applicable federal, state, local, or international law or regulation, or to engage in any conduct that restricts or inhibits anyone&apos;s use or enjoyment of the website.
            </p>

            <h2>Intellectual Property Rights</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Spain
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website without our prior written consent.
            </p>

            <h2>Editorial Content and Opinions</h2>
            <p>
              The content published on InvestedLuxury, including articles, reviews, and guides, represents the opinions of our editorial team and individual authors. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information contained on the website.
            </p>
            <p>
              Any reliance you place on such information is strictly at your own risk. We recommend conducting your own research and consulting with professionals before making significant purchasing decisions.
            </p>

            <h2>Affiliate Disclosure and Relationships</h2>
            <p>
              InvestedLuxury participates in affiliate marketing programs, which means we may earn commissions on purchases made through links on our website. These affiliate relationships do not affect our editorial independence or the price you pay for products.
            </p>
            <p>
              Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on affiliated sites at the time of purchase will apply to the purchase of the product.
            </p>

            <h2>User Contributions</h2>
            <p>
              The website may contain comment sections, forums, or other interactive features that allow users to post, submit, or transmit content. By providing any user contribution, you grant us the right to use, reproduce, modify, and distribute such content in any media.
            </p>
            <p>
              You represent and warrant that your contributions do not violate any applicable law or third-party rights, including intellectual property rights and privacy rights.
            </p>

            <h2>Disclaimer of Warranties</h2>
            <p>
              THE WEBSITE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. NEITHER INVESTEDLUXURY NOR ANY PERSON ASSOCIATED WITH INVESTEDLUXURY MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE COMPLETENESS, SECURITY, RELIABILITY, QUALITY, ACCURACY, OR AVAILABILITY OF THE WEBSITE.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              IN NO EVENT WILL INVESTEDLUXURY, ITS AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE WEBSITE, ANY WEBSITES LINKED TO IT, ANY CONTENT ON THE WEBSITE, OR SUCH OTHER WEBSITES.
            </p>

            <h2>Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless InvestedLuxury, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees arising out of or relating to your violation of these Terms or your use of the website.
            </p>

            <h2>Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We may revise and update these Terms from time to time in our sole discretion. All changes are effective immediately when we post them. Your continued use of the website following the posting of revised Terms means that you accept and agree to the changes.
            </p>

            <h2>Contact Information</h2>
            <p>
              Questions or comments about the website or these Terms may be directed to us at:
            </p>
            <p>
              Email: legal@investedluxury.com
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
