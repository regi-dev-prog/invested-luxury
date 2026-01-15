import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

interface Article {
  id?: string;
  _id?: string;
  title: string;
  excerpt?: string;
  slug: string;
  date?: string;
  publishedAt?: string;
  readTime?: string;
  featured?: boolean;
  mainImage?: any;
  categories?: string[]; // Array of category slugs
}

interface CategoryPageProps {
  title: string;
  subtitle?: string;
  description: string;
  breadcrumb?: {
    parent: string;
    parentHref: string;
    current: string;
  };
  articles: Article[];
  categorySlug?: string;
}

// Helper to format date
function formatDate(dateString?: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper to build article URL with subcategory
function getArticleUrl(categorySlug: string | undefined, article: Article): string {
  // If categorySlug already contains "/" (e.g., "fashion/bags"), it's from a sub-category page
  // Don't add the subcategory again
  if (categorySlug?.includes('/')) {
    return `/${categorySlug}/${article.slug}`;
  }
  
  // From parent category page (e.g., "fashion"), need to add subcategory
  const subCategory = article.categories?.[0] || 'article';
  return `/${categorySlug}/${subCategory}/${article.slug}`;
}

export default function CategoryPage({
  title,
  subtitle,
  description,
  breadcrumb,
  articles,
  categorySlug,
}: CategoryPageProps) {
  const featuredArticle = articles.find(a => a.featured) || articles[0];
  const otherArticles = articles.filter(a => (a.id || a._id) !== (featuredArticle?.id || featuredArticle?._id));

  // Check if hero section should be shown
  const showHeroSection = title || subtitle || description || breadcrumb;

  return (
    <>
      {/* Hero Section - Only render if there's content */}
      {showHeroSection && (
        <section className="bg-cream">
          <div className="container-luxury py-12 lg:py-16">
          {/* Breadcrumb */}
            {breadcrumb && (
              <nav className="mb-8">
                <ol className="flex items-center gap-2 text-sm text-charcoal-light">
                  <li>
                    <Link href="/" className="hover:text-gold transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link href={breadcrumb.parentHref} className="hover:text-gold transition-colors">
                      {breadcrumb.parent}
                    </Link>
                  </li>
                  <li>/</li>
                  <li className="text-charcoal">{breadcrumb.current}</li>
                </ol>
              </nav>
            )}

            {/* Title */}
            <div className="max-w-3xl">
              {title && (
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-black mb-4">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xl md:text-2xl font-serif italic text-charcoal mb-6">
                  {subtitle}
                </p>
              )}
              {description && (
                <p className="text-charcoal leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Article */}
      {featuredArticle && (
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="container-luxury">
            <Link 
              href={getArticleUrl(categorySlug, featuredArticle)}
              className="block group"
            >
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-cream overflow-hidden">
                  {featuredArticle.mainImage ? (
                    <Image
                      src={urlFor(featuredArticle.mainImage).width(800).height(600).url()}
                      alt={featuredArticle.mainImage.alt || featuredArticle.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-charcoal-light text-sm">Featured Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center">
                  <span className="text-gold text-xs font-sans font-semibold uppercase tracking-[0.2em] mb-3">
                    Featured
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-black mb-4 leading-tight group-hover:text-charcoal transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-charcoal mb-6 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-charcoal-light">
                    <time>{formatDate(featuredArticle.date || featuredArticle.publishedAt)}</time>
                    {featuredArticle.readTime && (
                      <>
                        <span className="w-1 h-1 bg-charcoal-light rounded-full" />
                        <span>{featuredArticle.readTime}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-6">
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
        </section>
      )}

      {/* Article Grid */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container-luxury">
          <h2 className="font-serif text-2xl md:text-3xl text-black mb-10">
            Latest Articles
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherArticles.map((article) => (
              <article key={article.id || article._id || article.slug} className="group">
                <Link href={getArticleUrl(categorySlug, article)}>
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden mb-5 bg-cream">
                    {article.mainImage ? (
                      <Image
                        src={urlFor(article.mainImage).width(500).height(375).url()}
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
                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="font-serif text-xl text-black group-hover:text-charcoal transition-colors leading-snug">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-charcoal line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-charcoal-light pt-1">
                      <time>{formatDate(article.date || article.publishedAt)}</time>
                      {article.readTime && (
                        <>
                          <span>·</span>
                          <span>{article.readTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {otherArticles.length === 0 && !featuredArticle && (
            <div className="text-center py-12">
              <p className="text-charcoal">More articles coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-cream">
        <div className="container-luxury">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl text-black mb-4">
              Stay Informed
            </h2>
            <p className="text-charcoal mb-8">
              Get our latest guides and investment insights delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors text-sm bg-white"
                required
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-charcoal transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}