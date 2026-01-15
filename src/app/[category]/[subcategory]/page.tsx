// =============================================================================
// SUB-CATEGORY PAGE - VOGUE-INSPIRED DESIGN
// =============================================================================
// Route: /fashion/bags, /lifestyle/hotels, /wellness/longevity, etc.
// Design: Clean, minimal spacing, editorial underline navigation
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
  
  const canonicalUrl = `${siteUrl}/${params.category}/${params.subcategory}`
  
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
    },
    twitter: {
      card: 'summary_large_image',
      title: subCategory.metaTitle,
      description: subCategory.metaDescription,
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
  
  // Get all sibling sub-categories
  const siblingSubCategories = getSubCategoriesForParent(params.category)
  
  // Fetch articles for this sub-category
  const articles = await getArticlesBySubCategory(params.subcategory)

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: subCategory.title,
    description: subCategory.description,
    url: `${siteUrl}/${params.category}/${params.subcategory}`,
    isPartOf: {
      '@type': 'CollectionPage',
      name: parentCategory.title,
      url: `${siteUrl}/${params.category}`,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 10).map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/${params.category}/${params.subcategory}/${article.slug}`,
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
      
      {/* Breadcrumb - Single, on white background */}
      <nav className="pt-4 md:pt-6 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <ol className="flex justify-center items-center gap-2 text-xs text-charcoal/50">
            <li>
              <Link href="/" className="hover:text-charcoal transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/${params.category}`} className="hover:text-charcoal transition-colors capitalize">
                {parentCategory.title}
              </Link>
            </li>
            <li>/</li>
            <li className="text-charcoal font-medium">
              {subCategory.title}
            </li>
          </ol>
        </div>
      </nav>
      
      {/* Hero Section - White background, no cream */}
      <section className="bg-white pt-4 md:pt-8 pb-6 md:pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title - Elegant serif */}
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-3 md:mb-5">
            {subCategory.title}
          </h1>
          
          {/* Description - Tighter spacing */}
          <p className="text-charcoal/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {subCategory.description}
          </p>
        </div>
      </section>
      
      {/* Sub-Category Navigation - VOGUE STYLE */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide gap-x-6 py-4 px-4 md:flex-wrap md:justify-center md:overflow-visible">
            {/* Parent category link */}
            <Link
              href={`/${params.category}`}
              className="relative flex-shrink-0 px-1 py-2 text-xs font-medium tracking-widest uppercase text-charcoal/60 hover:text-charcoal transition-colors group"
            >
              View All
              {/* Hover underline */}
              <span className="absolute bottom-0 left-0 w-full h-px bg-gold transform scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
            
            {/* Sibling sub-category links */}
            {siblingSubCategories.map((sub) => {
              const isActive = sub.slug === params.subcategory
              return (
                <Link
                  key={sub.slug}
                  href={sub.path}
                  className={`relative flex-shrink-0 px-1 py-2 text-xs font-medium tracking-widest uppercase transition-colors group ${
                    isActive 
                      ? 'text-charcoal' 
                      : 'text-charcoal/60 hover:text-charcoal'
                  }`}
                >
                  {sub.title}
                  {/* Active/Hover underline */}
                  <span 
                    className={`absolute bottom-0 left-0 w-full h-px bg-gold transform origin-left transition-transform duration-200 ${
                      isActive 
                        ? 'scale-x-100' 
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`} 
                  />
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      
      {/* Articles Grid - NO breadcrumb prop to avoid duplicate */}
      <CategoryPage
        title=""
        description=""
        articles={articles}
        categorySlug={params.subcategory}
      />
    </main>
  )
}