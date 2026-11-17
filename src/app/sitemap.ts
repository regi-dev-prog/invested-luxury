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
  "lastModified": coalesce(updatedAt, publishedAt, _updatedAt),
  "category": categories[0]->{
    "slug": slug.current,
    "parentCategory": parentCategory
  }
}`

// =============================================================================
// SITEMAP GENERATOR
// =============================================================================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // lastModified must reflect real change dates. Emitting "now" on every URL at
  // every regeneration (the previous behaviour) teaches Google that the value
  // is meaningless, after which it is ignored sitewide. Static pages therefore
  // carry no lastModified; articles carry their own date; category pages carry
  // the newest date among their articles.

  // 1. STATIC PAGES
  const staticPages: MetadataRoute.Sitemap = STATIC_PAGES.map(page => ({
    url: `${BASE_URL}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // 2. ARTICLES FIRST (their dates feed the category pages)
  type SitemapArticle = {
    slug: string
    lastModified: string | null
    category: { slug: string; parentCategory: string } | null
  }
  let articles: SitemapArticle[] = []
  try {
    articles = await client.fetch(ARTICLES_QUERY)
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error)
  }

  // Newest article date per category path and per parent category
  const newestByPath = new Map<string, string>()
  const bump = (key: string, date: string | null) => {
    if (!date) return
    const prev = newestByPath.get(key)
    if (!prev || date > prev) newestByPath.set(key, date)
  }
  for (const a of articles) {
    if (!a.category?.slug || typeof a.category.parentCategory !== 'string') continue
    bump(`/${a.category.parentCategory}/${a.category.slug}`, a.lastModified)
    bump(`/${a.category.parentCategory}`, a.lastModified)
  }

  // 3. DYNAMIC CATEGORIES (from Sanity)
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

        const path = `/${cat.parentCategory}/${cat.slug}`
        return {
          url: `${BASE_URL}${path}`,
          ...(newestByPath.has(path) ? { lastModified: newestByPath.get(path) } : {}),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        }
      })
      .filter(Boolean) as MetadataRoute.Sitemap

    // Build parent category pages (derived from unique parentCategory values)
    const parentCategoryPages: MetadataRoute.Sitemap = Array.from(parentSlugs).map(slug => ({
      url: `${BASE_URL}/${slug}`,
      ...(newestByPath.has(`/${slug}`) ? { lastModified: newestByPath.get(`/${slug}`) } : {}),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

    categoryPages = [...parentCategoryPages, ...subCategoryPages]
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
  }

  // 4. ARTICLE PAGES
  let articlePages: MetadataRoute.Sitemap = []

  {
    const seenUrls = new Set<string>()

    articlePages = articles
      .map((article: SitemapArticle) => {
        if (!article.slug || !article.category?.slug || !article.category?.parentCategory || typeof article.category.parentCategory !== 'string') return null

        const url = `${BASE_URL}/${article.category.parentCategory}/${article.category.slug}/${article.slug}`

        if (seenUrls.has(url)) return null
        seenUrls.add(url)

        return {
          url,
          ...(article.lastModified ? { lastModified: article.lastModified } : {}),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }
      })
      .filter(Boolean) as MetadataRoute.Sitemap
  }

  return [...staticPages, ...categoryPages, ...articlePages]
}
