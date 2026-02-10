import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
};

// ============================================================================
// DATA FETCHING
// ============================================================================

async function searchArticles(query: string) {
  if (!query || query.trim().length === 0) return [];

  const searchQuery = `*[_type == "article" && (
    title match $q ||
    excerpt match $q ||
    pt::text(body) match $q
  )] | order(publishedAt desc) [0...30] {
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

  return await client.fetch(searchQuery, { q: `${query.trim()}*` });
}

async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) return [];

  const searchQuery = `*[_type == "product" && (
    name match $q ||
    brand->name match $q
  )] | order(_createdAt desc) [0...12] {
    _id,
    name,
    price,
    currency,
    "slug": slug.current,
    "brand": brand->name,
    image { asset, alt },
    imageUrl,
    "affiliateUrl": affiliateLinks[0].url
  }`;

  return await client.fetch(searchQuery, { q: `${query.trim()}*` });
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

function getArticleUrl(article: any) {
  if (!article?.category) return '#';
  const parent = article.category.parentCategory || 'fashion';
  const sub = article.category.slug;
  return `/${parent}/${sub}/${article.slug}`;
}

function formatPrice(price: number, currency: string = 'USD') {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] || '$'}${price?.toLocaleString() || '0'}`;
}

function getProductImageUrl(product: any): string | null {
  if (product.image?.asset) {
    return urlFor(product.image).width(300).height(400).url();
  }
  if (product.imageUrl) return product.imageUrl;
  return null;
}

// ============================================================================
// PAGE
// ============================================================================

interface Props {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || '';
  const [articles, products] = await Promise.all([
    searchArticles(query),
    searchProducts(query),
  ]);

  const totalResults = articles.length + products.length;

  return (
    <main className="min-h-screen bg-white">
      {/* Search Header */}
      <section className="py-12 md:py-16 border-b border-gray-100">
        <div className="container-luxury">
          <p className="text-xs font-sans uppercase tracking-wider text-charcoal-light mb-3">
            {query
              ? `${totalResults} result${totalResults !== 1 ? 's' : ''} for`
              : 'Search'}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-black">
            {query ? `"${query}"` : 'What are you looking for?'}
          </h1>

          {/* Search form */}
          <form action="/search" method="GET" className="mt-8 max-w-xl">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search articles, brands, categories..."
                className="w-full border-b-2 border-black pb-3 text-lg font-serif bg-transparent focus:outline-none focus:border-gold transition-colors placeholder:text-charcoal-light pr-10"
              />
              <button
                type="submit"
                className="absolute right-0 bottom-3 text-charcoal hover:text-gold transition-colors"
                aria-label="Search"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* No query state */}
      {!query && (
        <section className="py-16">
          <div className="container-luxury text-center text-charcoal-light">
            <p className="text-lg">Enter a search term to find articles and products.</p>
          </div>
        </section>
      )}

      {/* No results */}
      {query && totalResults === 0 && (
        <section className="py-16">
          <div className="container-luxury text-center">
            <p className="text-lg text-charcoal mb-6">
              No results found for &quot;{query}&quot;.
            </p>
            <p className="text-sm text-charcoal-light mb-8">
              Try different keywords or browse our categories.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Bags', href: '/fashion/bags' },
                { label: 'Watches', href: '/fashion/watches' },
                { label: 'Hotels', href: '/lifestyle/hotels' },
                { label: 'Longevity', href: '/wellness/longevity' },
              ].map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="px-5 py-2 border border-black text-xs uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product results */}
      {products.length > 0 && (
        <section className="py-12 border-b border-gray-100">
          <div className="container-luxury">
            <h2 className="font-serif text-xl md:text-2xl text-black mb-8">Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {products.map((product: any) => {
                const imageUrl = getProductImageUrl(product);
                return (
                  <a
                    key={product._id}
                    href={product.affiliateUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="aspect-[3/4] bg-gray-50 mb-3 overflow-hidden relative">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.image?.alt || `${product.brand} ${product.name}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-charcoal-light">Image</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wider text-black">
                      {product.brand}
                    </p>
                    <p className="text-sm text-charcoal leading-snug mt-1">
                      {product.name}
                    </p>
                    <p className="text-sm text-black mt-1">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Article results */}
      {articles.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container-luxury">
            <h2 className="font-serif text-xl md:text-2xl text-black mb-8">
              {products.length > 0 ? 'Articles' : ''}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: any) => (
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
          </div>
        </section>
      )}
    </main>
  );
}