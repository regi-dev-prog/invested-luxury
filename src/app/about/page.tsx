import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about InvestedLuxury - your guide to investment-worthy luxury fashion and lifestyle pieces.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-cream">
        <div className="container-luxury text-center">
          <p className="category-badge mb-4">About Us</p>
          <h1 className="font-serif text-display text-black mb-6 text-balance max-w-3xl mx-auto">
            The Art of <span className="text-gold">Invested</span> Living
          </h1>
          <p className="text-body-lg text-charcoal max-w-2xl mx-auto">
            Where discerning taste meets timeless value. We curate the extraordinary for those who understand that true luxury is an investment.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container-luxury">
          <div className="max-w-article mx-auto">
            <h2 className="font-serif text-headline text-black mb-6">Our Philosophy</h2>
            <div className="article-content">
              <p>
                In a world of fast fashion and fleeting trends, InvestedLuxury stands as a beacon for those who seek more. We believe that the pieces we choose to bring into our lives should bring joy not just today, but for years to come - and ideally, hold or increase their value along the way.
              </p>
              <p>
                Our editorial team combines deep industry expertise with a genuine passion for quality craftsmanship. Every guide, review, and recommendation is crafted with one question in mind: Is this truly worth the investment?
              </p>

              <h2>What We Cover</h2>
              <p>
                From designer handbags and timepieces to quiet luxury essentials, our <Link href="/fashion" className="text-gold hover:underline">fashion coverage</Link> explores the full spectrum of investment-worthy pieces. We go beyond clothing to encompass the broader luxury <Link href="/lifestyle" className="text-gold hover:underline">lifestyle</Link> - the hotels that create lasting memories, the art that appreciates in value, and the <Link href="/wellness" className="text-gold hover:underline">wellness practices</Link> that invest in your most valuable asset: yourself.
              </p>
              <p>
                Whether you're new to luxury or a seasoned collector, our <Link href="/guides" className="text-gold hover:underline">in-depth guides</Link> provide the insights you need to make informed decisions.
              </p>

              <h2>Our Promise</h2>
              <p>
                Every piece of content on InvestedLuxury is created with integrity. We conduct thorough research, consult industry experts, and share our honest opinions - even when that means recommending against a popular piece. Our readers trust us because we tell them what they need to hear, not what brands want us to say.
              </p>

              <h2 id="affiliate-disclosure">Affiliate Disclosure</h2>
              <p>
                InvestedLuxury is reader-supported. When you purchase through links on our site, we may earn an affiliate commission at no additional cost to you. This helps us maintain our editorial independence and continue providing the in-depth content our readers expect.
              </p>
              <p>
                Our affiliate relationships never influence our editorial content. We recommend products based solely on their merit and investment potential, regardless of whether we have an affiliate partnership with the brand. For more details, see our <Link href="/privacy-policy" className="text-gold hover:underline">privacy policy</Link> and <Link href="/terms" className="text-gold hover:underline">terms of service</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-cream">
        <div className="container-luxury">
          <div className="text-center mb-12">
            <p className="category-badge mb-2">Our Values</p>
            <h2 className="font-serif text-headline text-black">What Guides Us</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-gold">
                <span className="font-serif text-2xl text-gold">01</span>
              </div>
              <h3 className="font-serif text-title text-black mb-2">Authenticity</h3>
              <p className="text-body text-charcoal">
                Honest reviews and recommendations you can trust, always.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-gold">
                <span className="font-serif text-2xl text-gold">02</span>
              </div>
              <h3 className="font-serif text-title text-black mb-2">Quality</h3>
              <p className="text-body text-charcoal">
                Only pieces that meet our rigorous standards for craftsmanship and value.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-gold">
                <span className="font-serif text-2xl text-gold">03</span>
              </div>
              <h3 className="font-serif text-title text-black mb-2">Expertise</h3>
              <p className="text-body text-charcoal">
                Deep industry knowledge combined with market insights and trend analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

     
    </>
  );
}