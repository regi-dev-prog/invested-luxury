import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Who Is InvestedLuxury For? Luxury Investment Analysis',
  description: 'InvestedLuxury helps you make smarter luxury purchases with resale data, cost-per-wear analysis, and honest brand comparisons. Find out if we\'re right for you.',
  keywords: ['luxury investment analysis', 'investment bags', 'luxury resale value', 'cost per wear', 'quiet luxury', 'designer bag worth it'],
  alternates: {
    canonical: 'https://investedluxury.com/who-is-investedluxury-for',
  },
  openGraph: {
    title: 'Who Is InvestedLuxury For? | InvestedLuxury',
    description: 'Honest breakdown of who gets value from InvestedLuxury and who doesn\'t. If you want real data on luxury purchases, you\'re in the right place.',
    type: 'website',
    url: 'https://investedluxury.com/who-is-investedluxury-for',
    siteName: 'InvestedLuxury',
    images: [{ url: 'https://investedluxury.com/og-image.jpg', width: 1200, height: 630, alt: 'InvestedLuxury' }],
  },
};

export default function WhoIsThisForPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-cream">
        <div className="container-luxury text-center">
          <p className="category-badge mb-4">Who We Are</p>
          <h1 className="font-serif text-display text-black mb-6 text-balance max-w-3xl mx-auto">
            Who <span className="text-gold">InvestedLuxury</span> Is Actually For
          </h1>
          <p className="text-body-lg text-charcoal max-w-2xl mx-auto">
            And who it's not for. Because knowing that saves everyone time.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container-luxury">
          <div className="max-w-article mx-auto">
            <div className="article-content">
              <p>
                Look, I started this site because I was tired of googling "is [expensive thing] worth it" and getting the same recycled listicle from someone who clearly never held the bag. Or wore the coat. Or, like, did any math whatsoever before declaring something an "investment piece."
              </p>
              <p>
                So here's who we are, and who we're not, spelled out.
              </p>

              <h2>This is for you if...</h2>
              <p>
                You're about to drop real money on something. Maybe $800, maybe $5,000, maybe more. And you want someone to show you the actual numbers before you do it. Not vibes. Numbers.
              </p>
              <p>
                Cost-per-wear. Resale percentages from The RealReal and Vestiaire Collective. Side-by-side comparisons with alternatives you didn't know existed.
              </p>
              <p>
                That's what we do here.
              </p>
              <p>
                More specifically? You'll get something out of InvestedLuxury if you're the kind of person who:
              </p>
              <p>
                Has been circling a specific designer purchase for weeks (the Totême coat, the DeMellier bag, the Loro Piana sweater, whatever it is) and wants an honest breakdown before committing. Not a sponsored "review" that's basically a press release with affiliate links. We have affiliate links too, obviously. But we also tell you when something isn't worth it, which is kind of the whole point.
              </p>
              <p>
                <strong>Is building a wardrobe around fewer, better things.</strong> Capsule wardrobe people, <Link href="/fashion/quiet-luxury" className="text-gold hover:underline">quiet luxury</Link> people, the "I'd rather own five perfect pieces than fifty okay ones" crowd. We write for you constantly.
              </p>
              <p>
                <strong>Cares about resale value even if you never plan to resell.</strong> Because knowing a <Link href="/fashion/bags" className="text-gold hover:underline">bag</Link> retains 70% of its value tells you something about its quality and desirability that no marketing copy ever will.
              </p>
              <p>
                <strong>Shops across luxury markets.</strong> Our readers are mostly in the US, UK, UAE, Singapore, and Hong Kong. Age-wise, most of you are somewhere between 28 and 55, but honestly I've gotten emails from 22-year-olds saving for their first designer bag and 60-year-olds rethinking their <Link href="/fashion/jewelry" className="text-gold hover:underline">jewelry</Link> collection. If the approach resonates, the age thing is irrelevant.
              </p>
              <p>
                <strong>Is curious about luxury wellness and travel with the same "is this actually worth it" lens.</strong> <Link href="/wellness/longevity" className="text-gold hover:underline">Longevity clinics</Link>, <Link href="/lifestyle/hotels" className="text-gold hover:underline">boutique hotels</Link>, biohacking supplements, first class versus business class. We apply the same cost-per-value math to all of it.
              </p>

              <h2>This is NOT for you if...</h2>
              <p>
                I'd rather save us both the time.
              </p>
              <p>
                <strong>We don't cover fast fashion.</strong> No budget dupes, no "get the look for less." Every product we analyze starts at around $300 and most sit in the $500 to $5,000 range. That's not snobbery, it's just... the lane we're in.
              </p>
              <p>
                <strong>We don't do universally positive reviews.</strong> I genuinely upset a reader once because I said her favorite brand's stitching quality didn't justify the price increase. (She came around eventually. I think.) If a $2,000 bag performs worse on resale than a $900 alternative, we're going to say that.
              </p>
              <p>
                <strong>We're not a coupon site.</strong> Sometimes we mention Mytheresa seasonal sales or SSENSE markdowns, sure. But if you're here looking for promo codes, this isn't it.
              </p>
              <p>
                <strong>We don't do trend forecasting or celebrity style content.</strong> We only talk about trends when they directly affect investment value. Like how the quiet luxury wave changed resale prices for logoless bags from The Row and Khaite. That matters. What someone wore to Cannes doesn't, at least not here.
              </p>
              <p>
                And if what you want is a quick list of "50 Best Bags" with no analysis behind it? We are not your people. Every piece we publish has verified current pricing, real resale data, and cost-per-wear math. It takes longer to produce. That's on purpose.
              </p>

              <h2>How we actually build our content</h2>
              <p>
                Okay so this part might sound boring but it's kind of the whole reason InvestedLuxury exists, so bear with me.
              </p>
              <p>
                Every article follows the same research process. Every single one.
              </p>
              <p>
                First, we pull current retail prices from the actual retailers. Net-a-Porter, Mytheresa, SSENSE, Farfetch, brand sites directly. Not "last time we checked" prices. Current ones.
              </p>
              <p>
                Then we look at resale. Not estimates, not projections. We check sold listings on The RealReal, Vestiaire Collective, and Rebag. What did this bag ACTUALLY sell for secondhand? What percentage of retail is that? Is that number going up or down over the past year?
              </p>
              <p>
                Then the cost-per-wear calculation, which honestly is the thing most luxury content completely ignores. A $3,000 bag you carry 300 days a year costs you $10 a day. A $1,500 bag you used six times because the strap was uncomfortable cost you $250 per wear. That math changes everything.
              </p>
              <p>
                And then we compare. Every featured product gets measured against at least two alternatives at different price points. Sometimes the expensive option wins. Sometimes the cheaper one does. We don't have a narrative to protect.
              </p>
              <p>
                Last thing: construction details. Materials, hardware, stitching, where it's made. We verify what we can and skip what we can't rather than just repeating whatever the brand says on its product page.
              </p>

              <h2>Quick example of what this looks like</h2>
              <p>
                Say you're wondering about the <Link href="/fashion/clothing" className="text-gold hover:underline">Totême Signature Wool Cashmere Coat</Link>. Retails for $1,190.
              </p>
              <p>
                Here's the kind of thing we'd tell you: pre-owned versions in good condition are selling for $400 to $650 on Vestiaire Collective right now. That's roughly 35 to 55% value retention. If you wear it 120 times across three winters (realistic for a solid coat), your cost-per-wear is around $9.90. Compare that to the Max Mara Madame at $2,690 with slightly better resale, or the COS double-faced wool coat at $390 with basically no resale market. The Totême lands in a sweet spot.
              </p>
              <p>
                That's the level of detail. On every product. In every article.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Cover */}
      <section className="py-20 bg-cream">
        <div className="container-luxury">
          <div className="text-center mb-12">
            <p className="category-badge mb-2">Our Coverage</p>
            <h2 className="font-serif text-headline text-black">What We Cover</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-gold">
                <span className="font-serif text-2xl text-gold">01</span>
              </div>
              <h3 className="font-serif text-title text-black mb-2">Fashion</h3>
              <p className="text-body text-charcoal">
                <Link href="/fashion/bags" className="text-gold hover:underline">Investment bags</Link>, <Link href="/fashion/shoes" className="text-gold hover:underline">designer shoes</Link>, coats, jewelry, watches, quiet luxury clothing, capsule wardrobes. Always with resale data and cost-per-wear.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-gold">
                <span className="font-serif text-2xl text-gold">02</span>
              </div>
              <h3 className="font-serif text-title text-black mb-2">Wellness</h3>
              <p className="text-body text-charcoal">
                <Link href="/wellness/longevity" className="text-gold hover:underline">Longevity clinics</Link>, NAD+ therapy, red light therapy, <Link href="/wellness/retreats" className="text-gold hover:underline">luxury retreats</Link>. Evaluated honestly for whether the results match the price tag.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-gold">
                <span className="font-serif text-2xl text-gold">03</span>
              </div>
              <h3 className="font-serif text-title text-black mb-2">Travel</h3>
              <p className="text-body text-charcoal">
                <Link href="/lifestyle/hotels" className="text-gold hover:underline">Luxury hotels</Link>, boutique properties, first class vs business class, airport lounges. Is the upgrade actually worth it?
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-gold">
                <span className="font-serif text-2xl text-gold">04</span>
              </div>
              <h3 className="font-serif text-title text-black mb-2">Guides</h3>
              <p className="text-body text-charcoal">
                First designer bag <Link href="/guides" className="text-gold hover:underline">guides</Link>, seasonal buying strategies, gift guides with price-per-value analysis instead of just pretty pictures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="container-luxury text-center">
          <p className="text-body-lg text-charcoal mb-8 max-w-2xl mx-auto">
            That's us. That's what we do. And if that sounds like what you've been looking for, honestly? Welcome. You're in the right place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/fashion/bags"
              className="px-6 py-3 bg-black text-white font-medium hover:bg-charcoal transition-colors"
            >
              Investment Bags
            </Link>
            <Link
              href="/guides"
              className="px-6 py-3 border border-black text-black font-medium hover:bg-cream transition-colors"
            >
              Investment Guides
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 border border-black text-black font-medium hover:bg-cream transition-colors"
            >
              About Regi
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
