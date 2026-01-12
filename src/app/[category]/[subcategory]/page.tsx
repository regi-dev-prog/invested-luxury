// =============================================================================
// SUB-CATEGORY PAGE - Full SEO
// =============================================================================
// Route: /fashion/bags, /lifestyle/hotels, /wellness/longevity, etc.
// =============================================================================

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { 
  SUB_CATEGORIES,
  PARENT_CATEGORIES,
  getSubCategory,
  getParentCategory,
  getSubCategoriesForParent,
  getAllParentSlugs,
} from '@/lib/categories'
import { getArticlesBySubCategory } from '@/lib/queries'
import CategoryPage from '@/components/CategoryPage'
export const revalidate = 60;
const siteUrl = 'https://investedluxury.com'

interface Props {
  params: { 
    category: string
    subcategory: string
  }
}

// Generate static paths for all 17 sub-categories
export async function generateStaticParams() {
  const paths: { category: string; subcategory: string }[] = []
  
  for (const parentSlug of getAllParentSlugs()) {
    const parent = PARENT_CATEGORIES[parentSlug]
    
    for (const subSlug of parent.childSlugs) {
      paths.push({
        category: parentSlug,
        subcategory: subSlug,
      })
    }
  }
  
  return paths
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const subCategory = getSubCategory(params.subcategory)
  const parentCategory = getParentCategory(params.category)
  
  if (!subCategory || !parentCategory) {
    return { title: 'Not Found' }
  }
  
  // Validate parent-child relationship
  if (subCategory.parentSlug !== params.category) {
    return { title: 'Not Found' }
  }
  
  const canonicalUrl = `${siteUrl}${subCategory.path}`
  
  return {
    title: subCategory.metaTitle,
    description: subCategory.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: subCategory.metaTitle,
      description: subCategory.metaDescription,
      url: canonicalUrl,
      siteName: 'InvestedLuxury',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/og-${params.subcategory}.jpg`,
          width: 1200,
          height: 630,
          alt: subCategory.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: subCategory.metaTitle,
      description: subCategory.metaDescription,
      images: [`${siteUrl}/og-${params.subcategory}.jpg`],
    },
  }
}

export default async function SubCategoryPage({ params }: Props) {
  const subCategory = getSubCategory(params.subcategory)
  const parentCategory = getParentCategory(params.category)
  
  if (!subCategory || !parentCategory) {
    notFound()
  }
  
  // Validate parent-child relationship
  if (subCategory.parentSlug !== params.category) {
    notFound()
  }
  
  const articles = await getArticlesBySubCategory(params.subcategory)
  const siblingCategories = getSubCategoriesForParent(params.category)
  
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
        name: parentCategory.title,
        item: `${siteUrl}${parentCategory.path}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: subCategory.title,
        item: `${siteUrl}${subCategory.path}`,
      },
    ],
  }

  // JSON-LD CollectionPage Schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: subCategory.title,
    description: subCategory.description,
    url: `${siteUrl}${subCategory.path}`,
    isPartOf: {
      "@type": "WebPage",
      name: parentCategory.title,
      url: `${siteUrl}${parentCategory.path}`,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 10).map((article: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}${subCategory.path}/${article.slug}`,
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
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center justify-center gap-2 text-sm text-charcoal/60">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href={parentCategory.path} className="hover:text-gold transition-colors">
                  {parentCategory.title}
                </Link>
              </li>
              <li>/</li>
              <li className="text-charcoal">{subCategory.title}</li>
            </ol>
          </nav>
          
          <h1 className="font-cormorant text-4xl md:text-5xl font-light text-charcoal mb-4">
            {subCategory.title}
          </h1>
          <p className="text-charcoal/70 text-lg max-w-2xl mx-auto">
            {subCategory.description}
          </p>
        </div>
      </section>
      
      {/* Sibling Categories Navigation */}
      <section className="border-b border-gray-200 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="flex flex-wrap justify-center gap-4" aria-label="Related categories">
            {siblingCategories.map((sibling) => (
              <Link
                key={sibling.slug}
                href={sibling.path}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  sibling.slug === params.subcategory
                    ? 'bg-black text-white'
                    : 'text-charcoal/70 hover:text-charcoal hover:bg-cream'
                }`}
              >
                {sibling.title}
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
        categorySlug={`${params.category}/${params.subcategory}`}
      />
    </main>
  )
}