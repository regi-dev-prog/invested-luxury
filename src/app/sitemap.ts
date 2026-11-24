// =============================================================================
// FULLY DYNAMIC SITEMAP FOR INVESTEDLUXURY.COM
// =============================================================================
// Everything is pulled from Sanity CMS — no hardcoded categories or articles.
// Adding a new category or article in Sanity automatically updates the sitemap.
// =============================================================================

import { MetadataRoute } from 'next'
import { createClient } from '@sanity/client'

export const revalidate = 3600

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '4b3ap7pf',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

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
  "lastmod": coalesce(updatedAt, publishedAt),
  "category": categories[0]->{
    "slug": slug.current,
    "parentCategory": parentCategory
  }
}`

// =============================================================================
// SITEMAP GENERATOR
// =============================================================================
// lastModified must reflect real content changes. A sitemap that reports
// "now" for every URL gets its lastmod ignored by Google, so refreshed
// articles would not be flagged. Articles use updatedAt (set manually in
// Sanity only for substantive updates) or publishedAt; category pages use
// their newest article; static pages omit lastmod.
type ArticleRow = {
  slug: string
  lastmod?: string
  category: { slug: string; parentCategory: string } | null
}

const latest = (a?: string, b?: string) => (!a ? b : !b ? a : a > b ? a : b)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. ARTICLES (fetched first: category and home dates derive from them)
  let articles: ArticleRow[] = []
  try {
    articles = await client.fetch(ARTICLES_QUERY)
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error)
  }

  const newestBySub = new Map<string, string | undefined>()
  const newestByParent = new Map<string, string | undefined>()
  let newestOverall: string | undefined

  const seenUrls = new Set<string>()
  const articlePages: MetadataRoute.Sitemap = []

  for (const article of articles) {
    const cat = article.category
    if (!article.slug || !cat?.slug || !cat?.parentCategory || typeof cat.parentCategory !== 'string') continue

    const url = `${BASE_URL}/${cat.parentCategory}/${cat.slug}/${article.slug}`
    if (seenUrls.has(url)) continue
    seenUrls.add(url)

    const subKey = `${cat.parentCategory}/${cat.slug}`
    newestBySub.set(subKey, latest(newestBySub.get(subKey), article.lastmod))
    newestByParent.set(cat.parentCategory, latest(newestByParent.get(cat.parentCategory), article.lastmod))
    newestOverall = latest(newestOverall, article.lastmod)

    articlePages.push({
      url,
      ...(article.lastmod ? { lastModified: article.lastmod } : {}),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })
  }

  // 2. STATIC PAGES (home tracks the newest article; others have no reliable date)
  const staticPages: MetadataRoute.Sitemap = STATIC_PAGES.map(page => ({
    url: `${BASE_URL}${page.path}`,
    ...(page.path === '' && newestOverall ? { lastModified: newestOverall } : {}),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // 3. CATEGORIES (from Sanity), dated by their newest article
  let categoryPages: MetadataRoute.Sitemap = []

  try {
    const categories = await client.fetch(CATEGORIES_QUERY)
    const parentSlugs = new Set<string>()

    const subCategoryPages: MetadataRoute.Sitemap = categories
      .map((cat: { slug: string; parentCategory: string }) => {
        if (!cat.slug || !cat.parentCategory || typeof cat.parentCategory !== 'string') return null

        // Skip categories that are redirected or have no page
        if (EXCLUDED_CATEGORY_SLUGS.has(cat.slug)) return null

        parentSlugs.add(cat.parentCategory)
        const lastmod = newestBySub.get(`${cat.parentCategory}/${cat.slug}`)

        return {
          url: `${BASE_URL}/${cat.parentCategory}/${cat.slug}`,
          ...(lastmod ? { lastModified: lastmod } : {}),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        }
      })
      .filter(Boolean) as MetadataRoute.Sitemap

    const parentCategoryPages: MetadataRoute.Sitemap = Array.from(parentSlugs).map(slug => {
      const lastmod = newestByParent.get(slug)
      return {
        url: `${BASE_URL}/${slug}`,
        ...(lastmod ? { lastModified: lastmod } : {}),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }
    })

    categoryPages = [...parentCategoryPages, ...subCategoryPages]
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
  }

  return [...staticPages, ...categoryPages, ...articlePages]
}
