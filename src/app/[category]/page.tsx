// =============================================================================
// PARENT CATEGORY PAGE - Full SEO
// =============================================================================
// Route: /fashion, /lifestyle, /wellness, /guides
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
  
  const canonicalUrl = `${siteUrl}${category.path}`
  
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
      images: [
        {
          url: `${siteUrl}/og-${params.category}.jpg`,
          width: 1200,
          height: 630,
          alt: category.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: category.metaTitle,
      description: category.metaDescription,
      images: [`${siteUrl}/og-${params.category}.jpg`],
    },
  }
}

export default async function ParentCategoryPage({ params }: Props) {
  const category = getParentCategory(params.category)
  
  if (!category) {
    notFound()
  }
  
  const articles = await getArticlesByParentCategoryAlt(params.category)
  const subCategories = getSubCategoriesForParent(params.category)
  const articleCounts = await getArticleCountsByParentCategory(params.category)
  
  // JSON-LD BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.title,
        item: `${siteUrl}${category.path}`,
      },
    ],
  }

  // JSON-LD CollectionPage Schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title,
    description: category.description,
    url: `${siteUrl}${category.path}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 10).map((article: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/${params.category}/${article.categories?.[0] || 'article'}/${article.slug}`,
      })),
    },
  }
  
  return (
    <main>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Hero Section */}
      <section className="bg-cream py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-cormorant text-4xl md:text-5xl font-light text-charcoal mb-4">
            {category.title}
          </h1>
          <p className="text-charcoal/70 text-lg max-w-2xl mx-auto">
            {category.description}
          </p>
        </div>
      </section>
      
      {/* Sub-Category Navigation */}
      <section className="border-b border-gray-200 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="flex flex-wrap justify-center gap-4" aria-label="Sub-categories">
            {subCategories.map((sub) => (
              <Link
                key={sub.slug}
                href={sub.path}
                className="px-4 py-2 text-sm font-medium text-charcoal/70 hover:text-charcoal hover:bg-cream rounded-full transition-colors"
              >
                {sub.title}
                {articleCounts[sub.slug] > 0 && (
                  <span className="ml-2 text-xs text-charcoal/50">
                    ({articleCounts[sub.slug]})
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      
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