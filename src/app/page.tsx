import Link from 'next/link';

// Featured hero article
const heroArticle = {
  title: 'The Art of Quiet Luxury',
  subtitle: 'Why the World\'s Most Discerning Dressers Are Embracing Understated Elegance',
  category: 'Fashion',
  categorySlug: 'fashion/quiet-luxury',
  slug: 'quiet-luxury-rise-stealth-wealth',
  author: 'Editorial Team',
  date: 'December 2025',
};

// Most Wanted Products
const mostWantedProducts = [
  {
    id: '1',
    brand: 'TOTÊME',
    name: 'Scarf-Detail Wool Coat',
    price: '€1,790',
    image: null,
    link: 'https://www.net-a-porter.com',
    retailer: 'NET-A-PORTER',
  },
  {
    id: '2',
    brand: 'THE ROW',
    name: 'Margaux 15 Leather Bag',
    price: '€4,800',
    image: null,
    link: 'https://www.therow.com',
    retailer: 'THE ROW',
  },
  {
    id: '3',
    brand: 'CARTIER',
    name: 'Tank Française Watch',
    price: '€4,150',
    image: null,
    link: 'https://www.cartier.com',
    retailer: 'CARTIER',
  },
  {
    id: '4',
    brand: 'CELINE',
    name: 'Triomphe 01 Sunglasses',
    price: '€460',
    image: null,
    link: 'https://www.celine.com',
    retailer: 'CELINE',
  },
  {
    id: '5',
    brand: 'BOTTEGA VENETA',
    name: 'Jodie Mini Bag',
    price: '€3,000',
    image: null,
    link: 'https://www.bottegaveneta.com',
    retailer: 'BOTTEGA VENETA',
  },
  {
    id: '6',
    brand: 'LORO PIANA',
    name: 'Baby Cashmere Sweater',
    price: '€1,550',
    image: null,
    link: 'https://www.loropiana.com',
    retailer: 'LORO PIANA',
  },
];

// Placeholder data until Sanity is connected
const featuredArticles = [
  {
    id: '1',
    title: 'The Row Handbags: Complete Brand Guide',
    excerpt: 'Everything you need to know about The Row bags—from the iconic Margaux to where to buy.',
    category: 'Bags',
    categorySlug: 'fashion/bags',
    slug: 'the-row-handbags-guide',
    date: 'December 2, 2025',
    readTime: '12 min read',
  },
  {
    id: '2',
    title: 'Omega vs Rolex: Which Watch to Buy?',
    excerpt: 'An investment-focused comparison of two iconic watchmakers to help you decide.',
    category: 'Watches',
    categorySlug: 'fashion/watches',
    slug: 'omega-vs-rolex-comparison',
    date: 'December 1, 2025',
    readTime: '10 min read',
  },
  {
    id: '3',
    title: 'Business Class vs First Class: Is It Worth It?',
    excerpt: 'Breaking down the real differences and when the upgrade makes sense.',
    category: 'Travel',
    categorySlug: 'lifestyle/travel',
    slug: 'business-class-vs-first-class',
    date: 'November 28, 2025',
    readTime: '8 min read',
  },
];

const categories = [
  {
    title: 'Bags',
    description: 'Investment-worthy designer handbags',
    href: '/fashion/bags',
    count: 12,
  },
  {
    title: 'Shoes',
    description: 'Designer footwear that lasts',
    href: '/fashion/shoes',
    count: 8,
  },
  {
    title: 'Quiet Luxury',
    description: 'Understated elegance',
    href: '/fashion/quiet-luxury',
    count: 15,
  },
  {
    title: 'Watches',
    description: 'Timepieces that transcend trends',
    href: '/fashion/watches',
    count: 10,
  },
  {
    title: 'Jewelry',
    description: 'Pieces that hold their value',
    href: '/fashion/jewelry',
    count: 8,
  },
  {
    title: 'Hotels',
    description: 'Extraordinary stays worldwide',
    href: '/lifestyle/hotels',
    count: 6,
  },
  {
    title: 'Travel',
    description: 'First class experiences',
    href: '/lifestyle/travel',
    count: 5,
  },
  {
    title: 'Longevity',
    description: 'Science-backed wellness',
    href: '/wellness/longevity',
    count: 4,
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section - Editorial Style */}
      <section className="bg-white">
        <div className="container-luxury">
          {/* Main Featured Article */}
          <Link 
            href={`/${heroArticle.categorySlug}/${heroArticle.slug}`}
            className="block group"
          >
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 py-12 lg:py-16">
              {/* Image Side */}
              <div className="relative aspect-[4/5] lg:aspect-[3/4] bg-cream overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-charcoal-light text-sm">Featured Image</span>
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
              </div>

              {/* Content Side */}
              <div className="flex flex-col justify-center lg:py-12">
                <span className="text-gold text-xs font-sans font-semibold uppercase tracking-[0.2em] mb-4">
                  {heroArticle.category}
                </span>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-black mb-6 leading-tight">
                  {heroArticle.title}
                </h1>
                <p className="text-xl md:text-2xl text-charcoal font-serif italic mb-8 leading-relaxed">
                  {heroArticle.subtitle}
                </p>
                <div className="flex items-center gap-3 text-sm text-charcoal-light">
                  <span>By {heroArticle.author}</span>
                  <span className="w-1 h-1 bg-charcoal-light rounded-full" />
                  <span>{heroArticle.date}</span>
                </div>
                <div className="mt-8">
                  <span className="inline-flex items-center text-sm font-medium uppercase tracking-wider text-black group-hover:text-gold transition-colors">
                    Read Article
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Thin gold divider */}
        <div className="container-luxury">
          <div className="h-px bg-gold/30" />
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="py-16 bg-white">
        <div className="container-luxury">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-black">Latest</h2>
            <Link href="/articles" className="text-sm font-sans font-medium uppercase tracking-wider text-charcoal hover:text-gold transition-colors">
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <article key={article.id} className="group">
                <Link href={`/${article.categorySlug}/${article.slug}`}>
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden mb-5 bg-cream">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-charcoal-light text-sm">Image</span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </div>
                  {/* Content */}
                  <div className="space-y-3">
                    <span className="text-xs font-sans font-semibold uppercase tracking-wider text-gold">
                      {article.category}
                    </span>
                    <h3 className="font-serif text-xl text-black group-hover:text-charcoal transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-sm text-charcoal line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-charcoal-light pt-1">
                      <time>{article.date}</time>
                      <span>·</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Most Wanted Section - Vogue/Grazia Style with Mobile Carousel */}
      <section className="py-12 md:py-16 bg-white border-t border-gray-100">
        <div className="container-luxury">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div>
              <p className="text-sm text-charcoal mb-1">Fashion&apos;s Most-Wanted—Seen Here First.</p>
              <h2 className="font-serif text-2xl md:text-3xl italic text-black">
                Editor&apos;s Picks
              </h2>
            </div>
            <Link 
              href="/shopping"
              className="hidden md:inline-block px-5 py-2.5 border border-black text-xs uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors"
            >
              Shop Trending Now
            </Link>
          </div>

          {/* Products - Horizontal scroll on mobile, grid on desktop */}
          <div className="relative">
            <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              {mostWantedProducts.map((product) => (
                <a 
                  key={product.id}
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-[160px] md:w-auto group"
                >
                  {/* Product Image */}
                  <div className="aspect-[3/4] bg-gray-50 mb-4 flex items-center justify-center overflow-hidden">
                    <span className="text-xs text-charcoal-light">Image</span>
                  </div>
                  
                  {/* Product Info - Vogue Style */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-black">
                      {product.brand}
                    </p>
                    <p className="text-sm text-charcoal line-clamp-1">
                      {product.name}
                    </p>
                    <div className="pt-2">
                      <p className="text-sm text-black">{product.price}</p>
                      <p className="text-xs text-charcoal group-hover:text-gold transition-colors flex items-center gap-1">
                        {product.retailer}
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="mt-6 text-center md:hidden">
            <Link 
              href="/shopping"
              className="inline-block px-6 py-2.5 border border-black text-xs uppercase tracking-wider text-black"
            >
              Shop All Trending
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section - Clean Grid */}
      <section className="py-16 bg-cream">
        <div className="container-luxury">
          <h2 className="font-serif text-2xl md:text-3xl text-black mb-10 text-center">
            Explore by Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link 
                key={category.title}
                href={category.href}
                className="group p-6 md:p-8 bg-white hover:shadow-lg transition-all duration-300 text-center"
              >
                <h3 className="font-serif text-xl md:text-2xl text-black group-hover:text-gold transition-colors mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-charcoal hidden md:block">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section - Minimal */}
      <section className="py-20 bg-white">
        <div className="container-luxury">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-black mb-4">
              The Inner Circle
            </h2>
            <p className="text-charcoal mb-8">
              Curated insights on investment-worthy pieces, delivered weekly.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors text-sm"
                required
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-charcoal transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-charcoal-light mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
