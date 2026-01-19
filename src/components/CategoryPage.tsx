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

// =========================================================================
// FIXED: Helper to build article URL with subcategory
// =========================================================================
// This function handles both parent category pages and sub-category pages:
//
// FROM PARENT CATEGORY PAGE (/fashion):
//   categorySlug = "fashion" (no slash)
//   → Need to add subcategory from article.categories
//   → Result: /fashion/bags/article-slug ✅
//
// FROM SUB-CATEGORY PAGE (/fashion/bags):
//   categorySlug = "fashion/bags" (already has slash)
//   → DON'T add subcategory again
//   → Result: /fashion/bags/article-slug ✅
// =========================================================================
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
  categorySlug 
}: CategoryPageProps) {
  
  // Separate featured and regular articles
  const featuredArticle = articles.find(a => a.featured) || articles[0];
  const regularArticles = articles.filter(a => a !== featuredArticle);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Title */}
      {(title || description) && (
        <section className="bg-cream/30 pt-8 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            {breadcrumb && (
              <nav className="mb-6 text-sm text-charcoal/50">
                <Link href="/" className="hover:text-charcoal transition-colors">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <Link href={breadcrumb.parentHref} className="hover:text-charcoal transition-colors">
                  {breadcrumb.parent}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-charcoal">{breadcrumb.current}</span>
              </nav>
            )}

            {/* Title */}
            {title && (
              <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
                {title}
              </h1>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="text-lg text-charcoal/70 italic mb-4">
                {subtitle}
              </p>
            )}

            {/* Description */}
            {description && (
              <p className="text-charcoal/70 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* No Articles State */}
          {articles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-charcoal/60 text-lg">
                No articles yet. Check back soon.
              </p>
            </div>
          )}

          {/* Featured Article */}
          {featuredArticle && articles.length > 0 && (
            <article className="mb-16">
              <Link href={getArticleUrl(categorySlug, featuredArticle)} className="group block">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                    {featuredArticle.mainImage ? (
                      <Image
                        src={urlFor(featuredArticle.mainImage).width(800).height(600).url()}
                        alt={featuredArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-cream to-cream/50" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <span className="text-xs font-medium tracking-widest text-gold uppercase">
                      Featured
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl text-charcoal group-hover:text-gold transition-colors">
                      {featuredArticle.title}
                    </h2>
                    {featuredArticle.excerpt && (
                      <p className="text-charcoal/70 leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-charcoal/50">
                      {featuredArticle.publishedAt && (
                        <span>{formatDate(featuredArticle.publishedAt)}</span>
                      )}
                      {featuredArticle.readTime && (
                        <>
                          <span>•</span>
                          <span>{featuredArticle.readTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          )}

          {/* Regular Articles Grid */}
          {regularArticles.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article) => (
                <article key={article._id || article.id || article.slug}>
                  <Link href={getArticleUrl(categorySlug, article)} className="group block">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-cream mb-4">
                      {article.mainImage ? (
                        <Image
                          src={urlFor(article.mainImage).width(600).height(450).url()}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-cream to-cream/50" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="font-serif text-xl text-charcoal group-hover:text-gold transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-charcoal/60 text-sm line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-charcoal/50">
                        {article.publishedAt && (
                          <span>{formatDate(article.publishedAt)}</span>
                        )}
                        {article.readTime && (
                          <>
                            <span>•</span>
                            <span>{article.readTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}