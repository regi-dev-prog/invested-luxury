// =============================================================================
// PARENT CATEGORY PAGE - VOGUE-INSPIRED DESIGN
// =============================================================================
// Route: /fashion, /lifestyle, /wellness, /guides
// Design: Clean, minimal spacing, editorial underline navigation
// =============================================================================

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { 
  PARENT_CATEGORIES, 
  getParentCategory, 
  getSubCategoriesForParent,
  getAllParentSlugs 
} from '@/lib/categories'
import { 
  getArticlesByParentCategoryAlt, 
  getArticleCountsByParentCategory 
} from '@/lib/queries'
import CategoryPage from '@/components/CategoryPage'
import Link from 'next/link'

export const revalidate = 60;
const siteUrl = 'https://investedluxury.com'

interface Props {
  params: { category: string }
}

// Generate static paths for all 4 parent categories
export async function generateStaticParams() {
  return getAllParentSlugs().map((slug) => ({
    category: slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getParentCategory(params.category)
  
  if (!category) {
    return { title: 'Not Found' }
  }
  
  const canonicalUrl = `${siteUrl}/${params.category}`
  
  return {
    title: category.metaTitle,
    description: category.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      url: canonicalUrl,
      siteName: 'InvestedLuxury',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: category.metaTitle,
      description: category.metaDescription,
    },
  }
}

export default async function ParentCategoryPage({ params }: Props) {
  const category = getParentCategory(params.category)
  
  if (!category) {
    notFound()
  }
  
  // Get sub-categories for this parent
  const subCategories = getSubCategoriesForParent(params.category)
  
  // Fetch articles and counts
  const [articles, articleCounts] = await Promise.all([
    getArticlesByParentCategoryAlt(params.category),
    getArticleCountsByParentCategory(params.category)
  ])

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.title,
    description: category.description,
    url: `${siteUrl}/${params.category}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 10).map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/${params.category}/${article.categorySlug}/${article.slug}`,
        name: article.title,
      })),
    },
  }

  return (
    <main className="min-h-screen bg-white">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Hero Section - REDUCED PADDING */}
      <section className="bg-cream pt-8 pb-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title - Elegant serif */}
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-3">
            {category.title}
          </h1>
          
          {/* Description - Tighter spacing */}
          <p className="text-charcoal/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {category.description}
          </p>
        </div>
      </section>
      
      {/* Sub-Category Navigation - VOGUE STYLE */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 py-4">
            {/* "View All" link - always first */}
            <Link
              href={`/${params.category}`}
              className="relative px-1 py-2 text-xs font-medium tracking-widest uppercase text-charcoal transition-colors group"
            >
              View All
              {/* Active underline */}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold transform origin-left transition-transform duration-200" />
            </Link>
            
            {/* Sub-category links */}
            {subCategories.map((sub) => (
              <Link
                key={sub.slug}
                href={sub.path}
                className="relative px-1 py-2 text-xs font-medium tracking-widest uppercase text-charcoal/60 hover:text-charcoal transition-colors group"
              >
                {sub.title}
                {articleCounts[sub.slug] > 0 && (
                  <span className="ml-1.5 text-[10px] text-charcoal/40">
                    ({articleCounts[sub.slug]})
                  </span>
                )}
                {/* Hover underline */}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold transform scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Articles Grid */}
      <CategoryPage
        title=""
        description=""
        articles={articles}
        categorySlug={params.category}
      />
    </main>
  )
}
