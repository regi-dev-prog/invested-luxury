// =============================================================================
// FULLY DYNAMIC SITEMAP FOR INVESTEDLUXURY.COM
// =============================================================================
// Everything is pulled from Sanity CMS — no hardcoded categories or articles.
// Adding a new category or article in Sanity automatically updates the sitemap.
// =============================================================================

import { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'

export const revalidate = 3600

const BASE_URL = 'https://investedluxury.com'

// =============================================================================
// STATIC PAGES (these don't change — only section that's hardcoded)
// =============================================================================
const STATIC_PAGES = [
  { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
  { path: '/about', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/privacy-policy', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/affiliate-disclosure', changeFrequency: 'yearly' as const, priority: 0.3 },
]

// Categories to exclude from sitemap (redirected or no page exists)
const EXCLUDED_CATEGORY_SLUGS = new Set(['shopping', 'retailers', 'resources'])

// =============================================================================
// SANITY QUERIES
// =============================================================================
const CATEGORIES_QUERY = `*[_type == "category" && defined(slug.current)] {
  "slug": slug.current,
  "parentCategory": parentCategory
}`

const ARTICLES_QUERY = `*[_type == "article" && status == "published" && defined(slug.current)] {
  "slug": slug.current,
  "category": categories[0]->{
    "slug": slug.current,
    "parentCategory": parentCategory
  }
}`

// =============================================================================
// SITEMAP GENERATOR
// =============================================================================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString()

  // 1. STATIC PAGES
  const staticPages: MetadataRoute.Sitemap = STATIC_PAGES.map(page => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // 2. DYNAMIC CATEGORIES (from Sanity)
  let categoryPages: MetadataRoute.Sitemap = []

  try {
    const categories = await client.fetch(CATEGORIES_QUERY)
    const parentSlugs = new Set<string>()

    // Build sub-category pages + collect unique parent slugs
    const subCategoryPages: MetadataRoute.Sitemap = categories
      .map((cat: { slug: string; parentCategory: string }) => {
        if (!cat.slug || !cat.parentCategory || typeof cat.parentCategory !== 'string') return null

        // Skip categories that are redirected or have no page
        if (EXCLUDED_CATEGORY_SLUGS.has(cat.slug)) return null

        parentSlugs.add(cat.parentCategory)

        return {
          url: `${BASE_URL}/${cat.parentCategory}/${cat.slug}`,
          lastModified: currentDate,
          changeFrequency: 'daily' as const,
          priority: 0.8,
        }
      })
      .filter(Boolean) as MetadataRoute.Sitemap

    // Build parent category pages (derived from unique parentCategory values)
    const parentCategoryPages: MetadataRoute.Sitemap = Array.from(parentSlugs).map(slug => ({
      url: `${BASE_URL}/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

    categoryPages = [...parentCategoryPages, ...subCategoryPages]
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
  }

  // 3. DYNAMIC ARTICLES (from Sanity)
  let articlePages: MetadataRoute.Sitemap = []

  try {
    const articles = await client.fetch(ARTICLES_QUERY)
    const seenUrls = new Set<string>()

    articlePages = articles
      .map((article: {
        slug: string
        category: { slug: string; parentCategory: string } | null
      }) => {
        if (!article.slug || !article.category?.slug || !article.category?.parentCategory || typeof article.category.parentCategory !== 'string') return null

        const url = `${BASE_URL}/${article.category.parentCategory}/${article.category.slug}/${article.slug}`

        if (seenUrls.has(url)) return null
        seenUrls.add(url)

        return {
          url,
          lastModified: currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }
      })
      .filter(Boolean) as MetadataRoute.Sitemap
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error)
  }

  return [...staticPages, ...categoryPages, ...articlePages]
}
