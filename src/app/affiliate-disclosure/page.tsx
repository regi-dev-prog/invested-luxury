import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | InvestedLuxury',
  description: "InvestedLuxury's affiliate disclosure. How we earn commissions, how it works, and how this does not affect our editorial recommendations.",
  alternates: {
    canonical: 'https://investedluxury.com/affiliate-disclosure',
  },
  openGraph: {
    type: 'website',
    url: 'https://investedluxury.com/affiliate-disclosure',
    siteName: 'InvestedLuxury',
    title: 'Affiliate Disclosure | InvestedLuxury',
    description: "InvestedLuxury's affiliate disclosure. How we earn commissions, how it works, and how this does not affect our editorial recommendations.",
    images: [{ url: 'https://investedluxury.com/og-image.jpg', width: 1200, height: 630, alt: 'InvestedLuxury' }],
  },
};

export default function AffiliateDisclosurePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Affiliate Disclosure</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: June 2026</p>

      <div className="bg-stone-100 border border-stone-200 rounded-lg p-6 mb-10">
        <h2 className="text-lg font-semibold mb-3">The Short Version</h2>
        <p className="text-stone-700">
          <strong>InvestedLuxury earns money through affiliate links.</strong> When you click a link
          to a product on our site and make a purchase, we may earn a commission. This comes at
          absolutely no extra cost to you. The price you pay is the same whether you use our link
          or go directly to the retailer.
        </p>
      </div>

      <section className="prose prose-lg max-w-none">
        <h2>How InvestedLuxury Earns Revenue</h2>
        <p>
          InvestedLuxury is a reader-supported publication. When you click a link in one of our
          articles and complete a purchase from a retailer or brand, we sometimes earn a commission.
          This page explains how that works and what it means for our editorial independence.
        </p>
        <p>
          We believe transparent disclosure is non-negotiable. The FTC requires it. Our readers
          deserve it. And our editorial credibility depends on it.
        </p>

        <h2>How Affiliate Commissions Work</h2>
        <p>
          When you click certain product links in our articles, you may be directed to a
          retailer&apos;s website through a tracked link. If you complete a purchase during that
          browsing session, the retailer pays InvestedLuxury a small commission on the sale.
        </p>
        <p>
          The commission is paid by the retailer, not by you. The price you pay is the same whether
          you click our link or navigate to the retailer directly. We do not receive any data about
          your purchase beyond the fact that a commission was earned. We never see your payment
          information, contact details, or order specifics.
        </p>
        <p>
          Commissions typically range from 4 to 15 percent of the sale price, depending on the
          retailer, the product category, and the specific affiliate program. For high-ticket items,
          a single commission can be material. For lower-ticket items, commissions are smaller.
        </p>

        <h2>How We Identify Affiliate Links</h2>
        <p>
          Every InvestedLuxury article that contains affiliate links includes an affiliate
          disclosure notice. Articles that include affiliate links display this disclosure
          prominently, typically at the top of the article (in the transparency block for wellness
          coverage) and in any &quot;where to buy&quot; section.
        </p>
        <p>
          We do not hide affiliate links inside generic text. Where a link directs to a retailer
          through an affiliate relationship, the disclosure makes that clear.
        </p>

        <h2>How Affiliate Relationships Affect Our Editorial (And How They Don&apos;t)</h2>
        <p>
          This is the most important question in any disclosure. Here is our honest answer:
        </p>
        <p>
          <strong>Affiliate availability does affect which categories we cover comprehensively.</strong>{' '}
          We are a business. We focus our editorial energy on product categories where affiliate
          revenue can sustain the level of research depth our reviews require.
        </p>
        <p>
          <strong>
            Affiliate availability does NOT affect which products we recommend within a covered
            category.
          </strong>{' '}
          When we recommend one brand over another in a comparison review, it is because the
          investment-piece framework (cost-per-use, resale retention, 10-year cost of ownership)
          points in that direction. Where two products have similar editorial standing and different
          commission rates, our recommendation reflects the editorial assessment. Commission rate is
          not a tiebreaker.
        </p>
        <p>
          <strong>
            We recommend products with no available affiliate program when those products are the
            correct answer.
          </strong>{' '}
          Some heritage luxury houses (Herm&egrave;s, Cartier, Van Cleef, and others) do not run
          affiliate programs. We recommend their products anyway, when appropriate, with no
          monetization path. We route readers to authorized retailers for primary purchases, and to
          authenticated resale platforms for secondary market acquisitions where appropriate.
        </p>
        <p>
          <strong>We sometimes recommend buyers &quot;buy nothing&quot; or &quot;wait.&quot;</strong>{' '}
          Several of our wellness articles explicitly state that a meaningful portion of buyers
          should not purchase the products we cover, particularly when usage commitment is
          uncertain, when the buyer falls outside the product&apos;s accuracy range, or when a
          cheaper alternative is the right answer. We earn no commission on these recommendations.
          We make them because they are correct.
        </p>
        <p>
          <strong>Our long-term credibility depends on getting this right.</strong> Short-term
          affiliate revenue does not justify recommending the wrong product for a reader. Our
          investment-piece framework (see our <Link href="/methodology">methodology page</Link>) is
          applied before affiliate considerations, not after.
        </p>

        <h2>What We Will Not Do</h2>
        <p>
          <strong>We will not accept payment for editorial coverage.</strong> No brand pays for
          placement, ranking position, or favorable review in our content. If a brand offers
          compensation in exchange for coverage, we decline.
        </p>
        <p>
          <strong>We will not accept free products in exchange for positive reviews.</strong> Where
          we accept review samples (limited to specific cases), we disclose this in the relevant
          article. The review sample does not affect our verdict.
        </p>
        <p>
          <strong>We will not write sponsored content disguised as editorial.</strong> If we ever
          produce sponsored content, it will be clearly marked as such. To date, InvestedLuxury has
          not published any sponsored content.
        </p>
        <p>
          <strong>
            We will not include affiliate links to products we do not recommend.
          </strong>{' '}
          Every affiliate link in our articles routes to a product we have evaluated and consider
          appropriate for at least one buyer segment. We do not pad articles with links to products
          we would not buy ourselves.
        </p>
        <p>
          <strong>
            We will not modify our editorial recommendations based on affiliate commission rates.
          </strong>{' '}
          Editorial assessment comes first. Commission rate is not a factor in our final
          recommendations.
        </p>

        <h2>Cookies and Tracking</h2>
        <p>
          Affiliate links use tracking cookies to attribute purchases to InvestedLuxury for
          commission purposes. These cookies are placed by the retailer or affiliate network, not by
          InvestedLuxury directly. Typical cookie duration ranges from 1 to 30 days, depending on
          the retailer.
        </p>
        <p>
          You can choose to disable affiliate cookies in your browser settings. Disabling them does
          not affect your ability to read InvestedLuxury content or complete purchases. It only
          affects whether we receive credit for the commission.
        </p>
        <p>
          For more information about how we and our partners use cookies, please see our{' '}
          <Link href="/privacy-policy">privacy policy</Link>.
        </p>

        <h2>Reader Trust and Editorial Independence</h2>
        <p>
          We understand that affiliate revenue creates a structural incentive to recommend products
          that pay us. Our defense against that incentive is methodological rigor (see our{' '}
          <Link href="/methodology">methodology page</Link>) and editorial transparency (this page).
        </p>
        <p>
          If you ever question whether one of our recommendations is editorially honest or
          affiliate-driven, please reach out. We will explain the specific reasoning behind any
          recommendation and walk through the investment-piece framework calculations that informed
          the call.
        </p>
        <p>
          We have published articles that recommend buyers wait for a product launch, buy a
          competitor we do not monetize, or buy nothing at all. These articles are part of our
          public record. They are the proof of our editorial independence.
        </p>

        <h2>FTC Compliance Statement</h2>
        <p>
          InvestedLuxury complies with the Federal Trade Commission&apos;s guidelines on
          endorsements and testimonials, as outlined in 16 CFR Part 255. Specifically:
        </p>
        <ul>
          <li>We disclose material connections between InvestedLuxury and the brands or retailers we cover</li>
          <li>We do not present sponsored content as independent editorial</li>
          <li>We disclose affiliate relationships clearly and conspicuously</li>
          <li>We honor the FTC&apos;s &quot;clear and conspicuous&quot; standard for affiliate disclosure</li>
        </ul>
        <p>
          This disclosure page constitutes our standing disclosure of affiliate relationships.
          Individual articles include in-context disclosures where affiliate links appear.
        </p>

        <h2>International Reader Disclosure</h2>
        <p>
          InvestedLuxury serves readers in the United States, United Kingdom, United Arab Emirates,
          Singapore, Hong Kong, and other markets. Affiliate relationships and commission rates may
          vary by reader location. The brands and retailers we cover may have different
          availability, pricing, or affiliate participation in different markets.
        </p>
        <p>
          For European Union readers, our processing of affiliate-related data complies with GDPR.
          For United Kingdom readers, our processing complies with UK GDPR.
        </p>

        <h2>Questions, Concerns, or Feedback</h2>
        <p>
          If you have questions about how affiliate relationships work at InvestedLuxury, want to
          flag a potential conflict of interest, or believe we have failed to disclose something we
          should have, please reach out:
        </p>
        <ul>
          <li>Email: hello@investedluxury.com</li>
          <li>Or use our <Link href="/contact">contact page</Link></li>
        </ul>
        <p>
          We take disclosure concerns seriously. When we identify a disclosure gap, we update the
          affected article and add a correction note. We do not silently update without
          acknowledgment.
        </p>

        <h2>How This Page Is Maintained</h2>
        <p>
          This disclosure page is reviewed quarterly and updated whenever a material change occurs
          in how we earn affiliate revenue. Last updated: June 2026.
        </p>
        <p>
          For a deeper explanation of our editorial methodology, including how we research, verify,
          and review products before affiliate considerations enter the picture, see our{' '}
          <Link href="/methodology">methodology page</Link>.
        </p>

        <p className="italic mt-12 text-stone-600">
          Affiliate commissions help us produce the level of research depth our reviews require.
          Reader trust is the asset we protect above all others.
        </p>
      </section>
    </main>
  );
}
