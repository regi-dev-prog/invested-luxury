import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

// Add this line after the imports
export const revalidate = 60; // Revalidate every 60 seconds

// ============================================================================
// METADATA
// ============================================================================
export const metadata: Metadata = {
  title: 'InvestedLuxury | Curated Luxury Fashion & Lifestyle',
  description: 'Discover investment-worthy pieces in luxury fashion, watches, jewelry, and lifestyle. Expert guides, reviews, and curated recommendations for discerning collectors.',
  alternates: {
    canonical: 'https://investedluxury.com',
  },
  openGraph: {
    title: 'InvestedLuxury | Curated Luxury Fashion & Lifestyle',
    description: 'Discover investment-worthy pieces in luxury fashion, watches, jewelry, and lifestyle.',
    url: 'https://investedluxury.com',
    type: 'website',
  },
};

// ============================================================================
// DATA FETCHING
// ============================================================================

// Fetch hero article (featured)
async function getHeroArticle() {
  const query = `*[_type == "article" && featured == true] | order(publishedAt desc) [0] {
    title,
    "slug": slug.current,
    excerpt,
    mainImage,
    publishedAt,
    "author": author->name,
    "category": categories[0]->{
      title,
      "slug": slug.current,
      parentCategory
    }
  }`;
  return await client.fetch(query);
}

// Fetch latest articles
async function getLatestArticles(limit: number = 3) {
  const query = `*[_type == "article"] | order(publishedAt desc) [0...${limit}] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    mainImage,
    publishedAt,
    "category": categories[0]->{
      title,
      "slug": slug.current,
      parentCategory
    }
  }`;
  return await client.fetch(query);
}

// Fetch featured products for "Currently Coveting" section
async function getFeaturedProducts(limit: number = 6) {
  const query = `*[_type == "product" && featured == true && status == "published"] | order(displayOrder asc, _createdAt desc) [0...${limit}] {
    _id,
    name,
    price,
    currency,
    "slug": slug.current,
    "brand": brand->name,
    "image": images[0],
    "affiliateUrl": affiliateLinks[0].url,
    "retailer": affiliateLinks[0].retailer
  }`;
  return await client.fetch(query);
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateString?: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatPrice(price: number, currency: string = 'USD') {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] || '$'}${price?.toLocaleString() || '0'}`;
}

function getArticleUrl(article: any) {
  if (!article?.category) return '#';
  const parent = article.category.parentCategory || 'fashion';
  const sub = article.category.slug;
  return `/${parent}/${sub}/${article.slug}`;
}

// Static categories
const categories = [
  { title: 'Bags', description: 'Investment-worthy designer handbags', href: '/fashion/bags' },
  { title: 'Shoes', description: 'Designer footwear that lasts', href: '/fashion/shoes' },
  { title: 'Quiet Luxury', description: 'Understated elegance', href: '/fashion/quiet-luxury' },
  { title: 'Watches', description: 'Timepieces that transcend trends', href: '/fashion/watches' },
  { title: 'Jewelry', description: 'Pieces that hold their value', href: '/fashion/jewelry' },
  { title: 'Hotels', description: 'Extraordinary stays worldwide', href: '/lifestyle/hotels' },
  { title: 'Travel', description: 'First class experiences', href: '/lifestyle/travel' },
  { title: 'Longevity', description: 'Science-backed wellness', href: '/wellness/longevity' },
];

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function Home() {
  const [heroArticle, latestArticles, featuredProducts] = await Promise.all([
    getHeroArticle(),
    getLatestArticles(4),
    getFeaturedProducts(6),
  ]);

  const otherArticles = latestArticles.filter(
    (a: any) => a.slug !== heroArticle?.slug
  );

  // JSON-LD for homepage (ItemList of articles)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: latestArticles.map((article: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        url: `https://investedluxury.com${getArticleUrl(article)}`,
      },
    })),
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="bg-white">
        <div className="container-luxury">
          {heroArticle ? (
            <Link 
              href={getArticleUrl(heroArticle)}
              className="block group"
            >
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 py-12 lg:py-16">
                {/* Image Side */}
                <div className="relative aspect-[4/5] lg:aspect-[3/4] bg-cream overflow-hidden">
                  {heroArticle.mainImage ? (
                    <Image
                      src={urlFor(heroArticle.mainImage).width(800).height(1000).url()}
                      alt={heroArticle.mainImage.alt || heroArticle.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-charcoal-light text-sm">Featured Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>

                {/* Content Side */}
                <div className="flex flex-col justify-center lg:py-12">
                  <span className="text-gold text-xs font-sans font-semibold uppercase tracking-[0.2em] mb-4">
                    {heroArticle.category?.title || 'Featured'}
                  </span>
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-black mb-6 leading-tight">
                    {heroArticle.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-charcoal font-serif italic mb-8 leading-relaxed">
                    {heroArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-charcoal-light">
                    {heroArticle.author && <span>By {heroArticle.author}</span>}
                    {heroArticle.author && heroArticle.publishedAt && (
                      <span className="w-1 h-1 bg-charcoal-light rounded-full" />
                    )}
                    {heroArticle.publishedAt && <span>{formatDate(heroArticle.publishedAt)}</span>}
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
          ) : (
            <div className="py-12 lg:py-16 text-center text-charcoal-light">
              <p>No featured article yet. Mark an article as &quot;Featured&quot; in Sanity.</p>
            </div>
          )}
        </div>

        <div className="container-luxury">
          <div className="h-px bg-gold/30" />
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="py-16 bg-white">
        <div className="container-luxury">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-black">Latest</h2>
            <Link href="/fashion" className="text-sm font-sans font-medium uppercase tracking-wider text-charcoal hover:text-gold transition-colors">
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
           {(otherArticles.length > 0 ? otherArticles : latestArticles).slice(0, 3).map((article: any) => (

              <article key={article._id} className="group">
                <Link href={getArticleUrl(article)}>
                  <div className="relative aspect-[3/4] overflow-hidden mb-5 bg-cream">
                    {article.mainImage ? (
                      <Image
                        src={urlFor(article.mainImage).width(500).height(667).url()}
                        alt={article.mainImage.alt || article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-charcoal-light text-sm">Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </div>
                  <div className="space-y-3">
                    <span className="text-xs font-sans font-semibold uppercase tracking-wider text-gold">
                      {article.category?.title || 'Article'}
                    </span>
                    <h3 className="font-serif text-xl text-black group-hover:text-charcoal transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-sm text-charcoal line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-charcoal-light pt-1">
                      <time>{formatDate(article.publishedAt)}</time>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {latestArticles.length === 0 && (
            <div className="text-center py-12 text-charcoal-light">
              <p>No articles yet. Create some in Sanity!</p>
            </div>
          )}
        </div>
      </section>

      {/* Currently Coveting Section (Featured Products) */}
      {featuredProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-white border-t border-gray-100">
          <div className="container-luxury">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <div>
                <p className="text-sm text-charcoal mb-1">Fashion&apos;s Most-Wanted—Seen Here First.</p>
                <h2 className="font-serif text-2xl md:text-3xl italic text-black">
                  Currently Coveting
                </h2>
              </div>
              <Link 
                href="/fashion"
                className="hidden md:inline-block px-5 py-2.5 border border-black text-xs uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors"
              >
                Shop All
              </Link>
            </div>

            <div className="relative">
              <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                {featuredProducts.map((product: any) => (
                  <a 
                    key={product._id}
                    href={product.affiliateUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-[160px] md:w-auto group"
                  >
                    <div className="aspect-[3/4] bg-gray-50 mb-4 flex items-center justify-center overflow-hidden relative">
                      {product.image ? (
                        <Image
                          src={urlFor(product.image).width(300).height(400).url()}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-xs text-charcoal-light">Image</span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-black">
                        {product.brand}
                      </p>
                      <p className="text-sm text-charcoal line-clamp-1">
                        {product.name}
                      </p>
                      <div className="pt-2">
                        <p className="text-sm text-black">
                          {formatPrice(product.price, product.currency)}
                        </p>
                        <p className="text-xs text-charcoal group-hover:text-gold transition-colors flex items-center gap-1">
                          Shop Now
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

            <div className="mt-6 text-center md:hidden">
              <Link 
                href="/fashion"
                className="inline-block px-6 py-2.5 border border-black text-xs uppercase tracking-wider text-black"
              >
                Shop All
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
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

      {/* Newsletter Section */}
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
