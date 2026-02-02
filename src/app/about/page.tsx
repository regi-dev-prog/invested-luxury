import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Regi | InvestedLuxury - Honest Luxury Reviews & Investment Guides',
  description: 'Meet Regi, the founder of InvestedLuxury. Years of buying luxury pieces, honest opinions on what\'s worth it, and no sponsored content dressed up as advice.',
  keywords: ['luxury fashion blog', 'investment pieces', 'honest luxury reviews', 'quiet luxury', 'designer bag reviews', 'luxury lifestyle'],
  openGraph: {
    title: 'About Regi | InvestedLuxury',
    description: 'Not here to convince you to buy anything. Just here to tell you the truth about what I did - and didn\'t.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-cream">
        <div className="container-luxury text-center">
          <p className="category-badge mb-4">About</p>
          <h1 className="font-serif text-display text-black mb-6 text-balance max-w-3xl mx-auto">
            The Art of <span className="text-gold">Invested</span> Living
          </h1>
          <p className="text-body-lg text-charcoal max-w-2xl mx-auto">
            Not here to convince you to buy anything. Just here to tell you the truth about what I did - and didn't.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container-luxury">
          <div className="max-w-article mx-auto">
            <h2 className="font-serif text-headline text-black mb-6">Who I Am</h2>
            <div className="article-content">
              <p>
                I'm Regi. I've been buying luxury pieces for years. Some held their value. Some I still reach for a decade later. Others were expensive lessons.
              </p>
              <p>
                Based in Europe. Obsessed with quality. Skeptical of trends. That's enough.
              </p>

              <h2>Why This Site Exists</h2>
              <p>
                In a world of fast fashion and fleeting trends, I wanted a space for people who think differently about what they buy. People who understand that the pieces we choose should bring joy not just today, but for years to come, and ideally, hold or increase their value along the way.
              </p>
              <p>
                I got tired of luxury content that reads like advertising. Reviews from people who never actually lived with what they're recommending. "Investment piece" thrown around for things that won't hold value past next season.
              </p>
              <p>
                So I started writing the honest version.
              </p>

              <h2>What You'll Find Here</h2>
              <p>
                From <Link href="/fashion/bags" className="text-gold hover:underline">designer handbags</Link> and <Link href="/fashion/watches" className="text-gold hover:underline">timepieces</Link> to <Link href="/fashion/quiet-luxury" className="text-gold hover:underline">quiet luxury essentials</Link> - the full spectrum of pieces that are actually worth your money. I go beyond <Link href="/fashion" className="text-gold hover:underline">fashion</Link> to cover the broader luxury <Link href="/lifestyle" className="text-gold hover:underline">lifestyle</Link>: <Link href="/lifestyle/hotels" className="text-gold hover:underline">hotels</Link> that create lasting memories, <Link href="/lifestyle/art-photography" className="text-gold hover:underline">art</Link> that appreciates in value, and the <Link href="/wellness" className="text-gold hover:underline">wellness practices</Link> that invest in your most valuable asset - yourself.
              </p>
              <p>
                Every guide, review, and recommendation is written with one question in mind: Is this truly worth it?
              </p>
              <p>
                If I loved something, I'll tell you why. If I regretted it, you'll know. If I returned it after two weeks, I'll explain what went wrong.
              </p>
              <p>
                Whether you're new to luxury or a seasoned collector, the <Link href="/guides" className="text-gold hover:underline">in-depth guides</Link> here provide the insights you need to make informed decisions.
              </p>

              <h2>My Promise</h2>
              <p>
                I use affiliate links. I'm not going to pretend otherwise. What I won't do is recommend something just because it pays well.
              </p>
              <p>
                I conduct thorough research, and I share my honest opinions, even when that means recommending against a popular piece. You can trust me because I tell you what you need to hear, not what brands want me to say.
              </p>
              <p className="text-charcoal">
                - R.
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
            <p className="category-badge mb-2">What Guides Me</p>
            <h2 className="font-serif text-headline text-black">My Values</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-gold">
                <span className="font-serif text-2xl text-gold">01</span>
              </div>
              <h3 className="font-serif text-title text-black mb-2">Honesty</h3>
              <p className="text-body text-charcoal">
                Real opinions, even when they're unpopular. If I regretted a purchase, you'll know.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-gold">
                <span className="font-serif text-2xl text-gold">02</span>
              </div>
              <h3 className="font-serif text-title text-black mb-2">Quality</h3>
              <p className="text-body text-charcoal">
                Only pieces that meet rigorous standards for craftsmanship and lasting value.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-gold">
                <span className="font-serif text-2xl text-gold">03</span>
              </div>
              <h3 className="font-serif text-title text-black mb-2">Independence</h3>
              <p className="text-body text-charcoal">
                No sponsored content pretending to be editorial. My recommendations are my own.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container-luxury text-center">
          <h2 className="font-serif text-headline text-black mb-4">Start Exploring</h2>
          <p className="text-body text-charcoal mb-8 max-w-xl mx-auto">
            Ready to discover what's actually worth your investment?
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
              href="/" 
              className="px-6 py-3 border border-black text-black font-medium hover:bg-cream transition-colors"
            >
              Latest Articles
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}