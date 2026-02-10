import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

export const revalidate = 60;

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
    siteName: 'InvestedLuxury',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvestedLuxury | Curated Luxury Fashion & Lifestyle',
    description: 'Discover investment-worthy pieces in luxury fashion, watches, jewelry, and lifestyle.',
  },
};

// ============================================================================
// DATA FETCHING
// ============================================================================

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

async function getLatestArticles(limit: number = 10) {
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

async function getFeaturedProducts(limit: number = 6) {
  const query = `*[_type == "product" && featured == true] | order(displayOrder asc, _createdAt desc) [0...${limit}] {
    _id,
    name,
    price,
    currency,
    "slug": slug.current,
    "brand": brand->name,
    "image": images[0],
    imageUrl,
    "affiliateUrl": affiliateLinks[0].url
  }`;
  return await client.fetch(query);
}

async function getArticlesByCategory(parentCategory: string, subcategorySlug: string, excludeIds: string[], limit: number = 4) {
  const excludeFilter = excludeIds.length > 0 
    ? `&& !(_id in [${excludeIds.map(id => `"${id}"`).join(',')}])` 
    : '';
  const query = `*[_type == "article" && categories[0]->slug.current == "${subcategorySlug}" && categories[0]->parentCategory == "${parentCategory}" ${excludeFilter}] | order(publishedAt desc) [0...${limit}] {
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

function getProductImageUrl(product: any): string | null {
  if (product.image) {
    return urlFor(product.image).width(300).height(400).url();
  }
  if (product.imageUrl) {
    return product.imageUrl;
  }
  return null;
}

// ============================================================================
// CATEGORY DEFINITIONS
// ============================================================================

const categoryDefinitions = [
  { title: 'Bags', slug: 'bags', parent: 'fashion', href: '/fashion/bags' },
  { title: 'Shoes', slug: 'shoes', parent: 'fashion', href: '/fashion/shoes' },
  { title: 'Quiet Luxury', slug: 'quiet-luxury', parent: 'fashion', href: '/fashion/quiet-luxury' },
  { title: 'Watches', slug: 'watches', parent: 'fashion', href: '/fashion/watches' },
  { title: 'Jewelry', slug: 'jewelry', parent: 'fashion', href: '/fashion/jewelry' },
  { title: 'Clothing', slug: 'clothing', parent: 'fashion', href: '/fashion/clothing' },
  { title: 'Hotels', slug: 'hotels', parent: 'lifestyle', href: '/lifestyle/hotels' },
  { title: 'Travel', slug: 'travel', parent: 'lifestyle', href: '/lifestyle/travel' },
  { title: 'Longevity', slug: 'longevity', parent: 'wellness', href: '/wellness/longevity' },
  { title: 'Retreats', slug: 'retreats', parent: 'wellness', href: '/wellness/retreats' },
];

// Static categories for "Explore by Category" section
const exploreCategories = [
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
    getLatestArticles(30), // Fetch more to have enough for category sections
    getFeaturedProducts(6),
  ]);

  // Separate hero from the rest
  const otherArticles = latestArticles.filter(
    (a: any) => a.slug !== heroArticle?.slug
  );

  // First 6 articles for the "Latest" section
  const latestSixArticles = otherArticles.slice(0, 6);

  // Collect IDs of articles already shown (hero + latest 6)
  const shownArticleIds = new Set<string>();
  if (heroArticle?._id) shownArticleIds.add(heroArticle._id);
  latestSixArticles.forEach((a: any) => shownArticleIds.add(a._id));

  // Group remaining articles by category for category grids
  const remainingArticles = otherArticles.filter(
    (a: any) => !shownArticleIds.has(a._id)
  );

  // Build category sections from remaining articles
  const categorySections: { title: string; href: string; articles: any[] }[] = [];
  const usedInCategories = new Set<string>();

  for (const cat of categoryDefinitions) {
    const catArticles = remainingArticles.filter(
      (a: any) =>
        a.category?.slug === cat.slug &&
        a.category?.parentCategory === cat.parent &&
        !usedInCategories.has(a._id)
    );

    if (catArticles.length > 0) {
      const toShow = catArticles.slice(0, 4);
      toShow.forEach((a: any) => usedInCategories.add(a._id));
      categorySections.push({
        title: cat.title,
        href: cat.href,
        articles: toShow,
      });
    }
  }

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: latestArticles.slice(0, 10).map((article: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        url: `https://investedluxury.com${getArticleUrl(article)}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ================================================================ */}
      {/* HERO SECTION                                                      */}
      {/* ================================================================ */}
      <section className="bg-white">
        <div className="container-luxury">
          {heroArticle ? (
            <Link href={getArticleUrl(heroArticle)} className="block group">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 py-12 lg:py-16">
                <div className="relative aspect-[4/5] lg:aspect-[3/4] bg-cream overflow-hidden">
                  {heroArticle.mainImage ? (
                    <Image
                      src={urlFor(heroArticle.mainImage).width(800).height(1000).url()}
                      alt={heroArticle.mainImage.alt || heroArticle.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-charcoal-light">Featured Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>

                <div className="flex flex-col justify-center lg:py-8">
                  <span className="text-xs font-sans font-semibold uppercase tracking-widest text-gold mb-4">
                    {heroArticle.category?.title || 'Featured'}
                  </span>
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-black leading-tight mb-6 group-hover:text-charcoal transition-colors">
                    {heroArticle.title}
                  </h1>
                  <p className="text-charcoal text-base md:text-lg leading-relaxed mb-6 max-w-lg">
                    {heroArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-charcoal-light">
                    {heroArticle.author && <span>By {heroArticle.author}</span>}
                    {heroArticle.author && heroArticle.publishedAt && <span>·</span>}
                    <time>{formatDate(heroArticle.publishedAt)}</time>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="py-20 text-center text-charcoal-light">
              <p>Mark an article as &quot;Featured&quot; in Sanity.</p>
            </div>
          )}
        </div>

        <div className="container-luxury">
          <div className="h-px bg-gold/30" />
        </div>
      </section>

      {/* ================================================================ */}
      {/* CURRENTLY COVETING (Product Strip) — right after hero              */}
      {/* ================================================================ */}
      {featuredProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-white border-t border-gray-100">
          <div className="container-luxury">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <div>
                <p className="text-sm text-charcoal mb-1">
                  Fashion&apos;s Most-Wanted—Seen Here First.
                </p>
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
                {featuredProducts.map((product: any) => {
                  const imageUrl = getProductImageUrl(product);
                  return (
                    <a
                      key={product._id}
                      href={product.affiliateUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 w-[160px] md:w-auto group"
                    >
                      <div className="aspect-[3/4] bg-gray-50 mb-4 flex items-center justify-center overflow-hidden relative">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.image?.alt || `${product.brand} ${product.name}`}
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
                        {/* Product name - NO truncation */}
                        <p className="text-sm text-charcoal leading-snug">
                          {product.name}
                        </p>
                        <div className="pt-2">
                          <p className="text-sm text-black">
                            {formatPrice(product.price, product.currency)}
                          </p>
                          <p className="text-xs text-charcoal group-hover:text-gold transition-colors flex items-center gap-1">
                            Shop Now
                            <svg
                              className="w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
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

      {/* ================================================================ */}
      {/* LATEST SECTION (6 articles)                                       */}
      {/* ================================================================ */}
      <section className="py-16 bg-white">
        <div className="container-luxury">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-black">Latest</h2>
            <Link
              href="/fashion"
              className="text-sm font-sans font-medium uppercase tracking-wider text-charcoal hover:text-gold transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestSixArticles.map((article: any) => (
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

      {/* ================================================================ */}
      {/* CATEGORY ARTICLE GRIDS (no repeats)                               */}
      {/* ================================================================ */}
      {categorySections.length > 0 &&
        categorySections.map((section, index) => (
          <section
            key={section.title}
            className={`py-16 ${index % 2 === 0 ? 'bg-cream' : 'bg-white'}`}
          >
            <div className="container-luxury">
              <div className="flex items-center justify-between mb-10">
                <h2 className="font-serif text-2xl md:text-3xl text-black">
                  {section.title}
                </h2>
                <Link
                  href={section.href}
                  className="text-sm font-sans font-medium uppercase tracking-wider text-charcoal hover:text-gold transition-colors"
                >
                  View All →
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {section.articles.map((article: any) => (
                  <article key={article._id} className="group">
                    <Link href={getArticleUrl(article)}>
                      <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-cream">
                        {article.mainImage ? (
                          <Image
                            src={urlFor(article.mainImage).width(400).height(533).url()}
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
                      <div className="space-y-2">
                        <span className="text-xs font-sans font-semibold uppercase tracking-wider text-gold">
                          {article.category?.title || 'Article'}
                        </span>
                        <h3 className="font-serif text-lg text-black group-hover:text-charcoal transition-colors leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-sm text-charcoal line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

      {/* ================================================================ */}
      {/* EXPLORE BY CATEGORY                                               */}
      {/* ================================================================ */}
      <section className="py-16 bg-cream">
        <div className="container-luxury">
          <h2 className="font-serif text-2xl md:text-3xl text-black mb-10 text-center">
            Explore by Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {exploreCategories.map((category) => (
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


    </>
  );
}