import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Methodology | InvestedLuxury',
  description:
    "InvestedLuxury's editorial methodology. How we research, verify pricing, aggregate owner reviews, and apply our cost-per-use investment framework.",
  alternates: {
    canonical: 'https://investedluxury.com/methodology',
  },
  openGraph: {
    type: 'website',
    url: 'https://investedluxury.com/methodology',
    siteName: 'InvestedLuxury',
    title: 'Our Methodology | InvestedLuxury',
    description:
      'How InvestedLuxury reviews luxury and wellness products. The Aggregated Verdict methodology, source aggregation, cost-per-use framework, and editorial independence.',
    images: [{ url: 'https://investedluxury.com/og-image.jpg', width: 1200, height: 630, alt: 'InvestedLuxury' }],
  },
};

export default function MethodologyPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-cream">
        <div className="container-luxury text-center">
          <p className="category-badge mb-4">Methodology</p>
          <h1 className="font-serif text-display text-black mb-6 text-balance max-w-3xl mx-auto">
            How We Review Products at <span className="text-gold">InvestedLuxury</span>
          </h1>
          <p className="text-body-lg text-charcoal max-w-2xl mx-auto">
            Every claim grounded in data. Every recommendation tested against our investment framework. When we cannot verify something firsthand, we say so.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container-luxury">
          <div className="max-w-article mx-auto">
            <h2 className="font-serif text-headline text-black mb-6">The Short Version</h2>
            <div className="article-content">
              <p>
                InvestedLuxury covers luxury fashion, lifestyle, and wellness products through an investment-piece framework. We treat purchases as financial decisions, not just consumption choices. This page explains how we research and write our reviews, what data we use, and where our limits are.
              </p>
              <p>
                We believe transparency about methodology is the foundation of editorial trust. Every claim in our articles is grounded in one of the source categories below. When we cannot verify something firsthand, we say so.
              </p>

              <h2>Two Editorial Approaches</h2>
              <p>
                We use two distinct review methodologies depending on the product category.
              </p>

              <h3>First-Hand Editorial</h3>
              <p>
                For fashion, accessories, jewelry, and most lifestyle products, our editorial team draws on direct ownership, in-person inspection at boutiques, and verified market data. When we write about a Cartier Love bracelet, an Herm&egrave;s Birkin, or a Loro Piana cashmere sweater, we have either handled the product, owned it, or have direct access to authoritative dealer and resale data.
              </p>
              <p>These reviews include verified retail pricing from brand-direct sources, resale value tracking from major authenticated resale platforms and auction houses, cost-per-wear calculations grounded in realistic wear assumptions, discontinuation tracking, and direct experience with construction, fit, and material quality.</p>

              <h3>Aggregated Verdict</h3>
              <p>
                For wellness products, longevity hardware, and large-ticket equipment ranging from $500 to $10,000-plus, our editorial team uses the <strong>Aggregated Verdict</strong> methodology. Items in this category include infrared saunas, smart scales, compression boots, cold plunge tubs, red light therapy panels, sleep tracking systems, and similar home wellness equipment.
              </p>
              <p>
                We chose this methodology deliberately. A $7,000 infrared sauna, a $5,000 cold plunge, or a $1,300 compression boot system cannot be purchased, tested over the 12 to 24 months required to assess long-term durability, and re-purchased for every new editorial review. Single-tester reviews based on 30-day use periods do not capture what matters most: how the product performs after the first year, how the warranty actually behaves, and how the product holds resale value.
              </p>
              <p>
                Our Aggregated Verdict methodology synthesizes far more data than any single tester can generate, while being transparent about our limits.
              </p>

              <h2>The Five Required Sources</h2>
              <p>
                Every wellness or longevity hardware review on InvestedLuxury synthesizes five required source categories.
              </p>

              <h3>Source 1: Verified Buyer Reviews</h3>
              <p>
                For every product, we aggregate at least 200 verified buyer reviews from across the brand&apos;s own website, major retail platforms, consumer review sites, the Better Business Bureau, and brand-specific community forums. We pay particular attention to long-term ownership patterns of 12-plus months, warranty claim experiences, customer service interactions, recurring positive themes that appear across multiple reviewers, and recurring negative themes that suggest structural rather than isolated issues.
              </p>

              <h3>Source 2: Independent Professional Reviews</h3>
              <p>
                For each product, we draw on a minimum of five long-form professional reviews from independent reviewers with documented multi-month or multi-year ownership. We prioritize reviewers with no commercial relationship with the brand being reviewed, documented ownership timeframes, tests of specific claims against measurable benchmarks, and coverage of negative aspects as well as positive.
              </p>
              <p>
                When a reviewer has a dealer relationship or commercial connection to the brand, we name it. When a reviewer is genuinely independent, we name that too.
              </p>

              <h3>Source 3: Community Knowledge</h3>
              <p>
                Reddit communities and product-specific forums reveal information that does not appear in professional reviews: long-term reliability patterns, customer service experiences, niche issues affecting specific user types, and the dropoff rates that no manufacturer publishes. We aggregate at least 10 deep-dive threads per product across relevant communities.
              </p>

              <h3>Source 4: Video Long-Form Reviews</h3>
              <p>
                Independent YouTube reviewers with documented ownership timeframes provide a layer of verification that text reviews cannot. We aggregate at least five long-form video reviews per product, prioritizing channels with multi-year ownership documentation.
              </p>

              <h3>Source 5: Primary Data</h3>
              <p>
                Every review includes primary data verified within seven days of publication: current US retail pricing direct from brand websites, wellness clinic session pricing across five US cities for cost-per-use payback calculations, DEXA scan pricing for body composition products, secondary market resale data from verified sold listings, warranty terms verified from official brand pages, and clinical evidence references from PubMed and peer-reviewed sources.
              </p>

              <h2>The Investment-Piece Framework</h2>
              <p>
                What separates InvestedLuxury from standard product reviews is our investment framing. We apply three calculations to every product worth $300 or more.
              </p>

              <h3>Cost-Per-Use Payback</h3>
              <p>
                For wellness products, we calculate how quickly the product pays back against the cost of equivalent clinic-based services. A $7,000 infrared sauna used three times per week against $42 clinic sessions pays back in 13 to 16 months. A $1,300 compression boot system used four times per week against $55 clinic sessions pays back in under 90 days. We show the math so readers can apply their own usage frequency.
              </p>

              <h3>Resale Value Retention</h3>
              <p>
                For products with active secondary markets, we track resale retention at one, three, and five-year ownership horizons. A Herm&egrave;s Birkin retains 85 to 110 percent of retail. A Cartier Love bracelet retains 72 to 84 percent of luxury premium. A Sunlighten Amplify infrared sauna retains 65 to 75 percent at 1 to 2 years. The math reveals which purchases hold value and which depreciate fast.
              </p>

              <h3>10-Year Cost of Ownership</h3>
              <p>
                For large-ticket equipment with ongoing operating costs (electricity, maintenance, ice for cold plunges), we calculate total 10-year ownership cost. This is the calculation that resolves most premium versus budget decisions. The Ice Barrel at $1,500 looks affordable until you add five years of ice costs and realize the true cost is $3,200 to $4,300.
              </p>

              <h2>What We Will Not Do</h2>
              <p>
                <strong>Fabricate first-hand testing claims.</strong> When we have not personally tested a product, we say so in a transparency block at the top of the relevant article. We do not write &quot;I unboxed this&quot; when we have not.
              </p>
              <p>
                <strong>Recommend products that fail our investment framework.</strong> If a product cannot be defended on cost-per-use math, resale retention, or 10-year cost of ownership, we do not recommend it regardless of the affiliate commission available. Our reviews include &quot;do not buy&quot; recommendations and &quot;buy nothing yet&quot; recommendations for products and buyer profiles that do not match.
              </p>
              <p>
                <strong>Cite anonymous or unverifiable sources.</strong> Every buyer review pattern we describe can be traced to specific platforms. Every professional reviewer we cite can be looked up.
              </p>
              <p>
                <strong>Hide affiliate relationships.</strong> Every article includes affiliate disclosure. Our <Link href="/affiliate-disclosure" className="text-gold hover:underline">disclosure policy</Link> details how our affiliate relationships work and what that means for our editorial independence.
              </p>
              <p>
                <strong>Recommend supplements or pharmaceuticals.</strong> YMYL (Your Money, Your Life) categories require medical credentialing we do not currently have on staff. Until we have a board-certified medical reviewer, we do not write supplement, prescription, or specific dosing recommendations.
              </p>

              <h2>How We Verify Pricing</h2>
              <p>
                Pricing accuracy is foundational. We verify prices within seven days of every article&apos;s publication and refresh prices quarterly. Sources include brand-direct websites, authorized dealer pricing, major retail platforms for fashion and wellness products, and resale platforms for secondary market data.
              </p>
              <p>
                When pricing moves between our research and publication date, we note this in the article. Pricing in our reviews represents a snapshot, not a permanent state. We recommend readers verify current pricing at the brand site before purchase.
              </p>

              <h2>How We Verify Resale Data</h2>
              <p>
                Resale data is harder to verify than retail pricing because secondary markets are thinner and more volatile. We pull verified sold listings (not asking prices) for the past 60 days, cross-reference with authenticated resale platforms for fashion items, exclude outlier sales that suggest non-representative conditions, and report ranges rather than point estimates because the secondary market produces a distribution rather than a single number.
              </p>
              <p>
                When sold-listing data is too thin to support a claim, we say so. We do not invent secondary market data.
              </p>

              <h2>How We Handle Brand Bias</h2>
              <p>
                Every reviewer has biases. Editorial honesty requires naming them.
              </p>
              <p>
                <strong>We prefer brands with strong resale markets.</strong> This means we cover Cartier, Herm&egrave;s, Chanel, and similar more than we cover brands without active secondary markets. This is a structural bias of the investment-piece framework.
              </p>
              <p>
                <strong>We prefer product categories with sustainable economics.</strong> This is a business reality we are transparent about. It does not affect whether we recommend a specific product within a covered category. It affects which categories we cover.
              </p>
              <p>
                <strong>We are skeptical of new launches without independent testing data.</strong> We will cover a newly launched product but our recommendations explicitly note when independent testing has not yet validated manufacturer claims.
              </p>
              <p>
                <strong>We prioritize American English and US pricing for our primary readership.</strong> Our coverage assumes a US buyer. We note when European or other market pricing diverges.
              </p>

              <h2>How We Update Our Reviews</h2>
              <p>
                Reviews are not static. We refresh content on a rolling quarterly schedule. Three months after publication: pricing and availability check, minor corrections. Six months after publication: substantive update with new owner data, new resale snapshots, and any product line changes. Twelve months after publication: full review refresh, including methodology re-application and ranking re-evaluation.
              </p>
              <p>
                When a major product launch changes the category landscape, we update affected articles outside the standard cycle.
              </p>

              <h2>Who Writes Our Reviews</h2>
              <p>
                <strong>The InvestedLuxury Editorial Desk</strong> writes fashion, lifestyle, and accessories coverage. We have direct ownership, boutique inspection access, and dealer relationships.
              </p>
              <p>
                <strong>The IL Wellness Desk</strong> writes wellness, longevity, and home equipment coverage using the Aggregated Verdict methodology. The Wellness Desk does not claim first-hand testing for products we have not personally tested. Where we have first-hand experience with a specific wellness product, we say so explicitly.
              </p>
              <p>
                We do not have a medical reviewer on staff. We do not write supplement recommendations, prescription medication coverage, or specific dosing advice. Until we have a board-certified medical reviewer, our wellness coverage focuses on hardware, equipment, and infrastructure rather than ingestible or pharmaceutical categories.
              </p>

              <h2>A Note on AI and Editorial Tools</h2>
              <p>
                InvestedLuxury uses AI tools to assist with research, source aggregation, and draft preparation. Our editorial team reviews, verifies, and rewrites every published article. AI tools accelerate the source aggregation process but do not produce our final editorial voice or recommendations.
              </p>
              <p>
                Every published article passes human editorial review. Every claim is traceable to a source category listed above. Every recommendation passes our investment framework before publication.
              </p>

              <h2>Questions, Corrections, or Feedback</h2>
              <p>
                If you spot an error in our coverage, find outdated pricing, identify a source we missed, or want to flag a methodology concern, please reach out via our <Link href="/contact" className="text-gold hover:underline">contact page</Link> or email hello@investedluxury.com.
              </p>
              <p>
                We take corrections seriously. When we make a substantive error, we update the article and add a correction note. We do not silently update without disclosure.
              </p>
              <p className="text-charcoal">
                Last updated: June 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-cream">
        <div className="container-luxury text-center">
          <h2 className="font-serif text-headline text-black mb-4">Read Our Reviews</h2>
          <p className="text-body text-charcoal mb-8 max-w-xl mx-auto">
            See the methodology in action across our verticals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/wellness/longevity"
              className="px-6 py-3 bg-black text-white font-medium hover:bg-charcoal transition-colors"
            >
              Longevity Reviews
            </Link>
            <Link
              href="/affiliate-disclosure"
              className="px-6 py-3 border border-black text-black font-medium hover:bg-cream transition-colors"
            >
              Affiliate Disclosure
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 border border-black text-black font-medium hover:bg-cream transition-colors"
            >
              About
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
