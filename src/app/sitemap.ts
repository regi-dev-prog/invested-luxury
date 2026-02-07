// =============================================================================
// DYNAMIC SITEMAP FOR INVESTEDLUXURY.COM
// =============================================================================
// Location: src/app/sitemap.ts
// Fixed: Feb 2026 - Only includes published articles, no product pages
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
// CATEGORY STRUCTURE
// =============================================================================

const PARENT_CATEGORIES = [
  { slug: 'fashion', priority: 0.9 },
  { slug: 'lifestyle', priority: 0.9 },
  { slug: 'wellness', priority: 0.9 },
  { slug: 'guides', priority: 0.9 },
]

const SUB_CATEGORIES = [
  { parent: 'fashion', slug: 'bags', priority: 0.8 },
  { parent: 'fashion', slug: 'shoes', priority: 0.8 },
  { parent: 'fashion', slug: 'watches', priority: 0.8 },
  { parent: 'fashion', slug: 'jewelry', priority: 0.8 },
  { parent: 'fashion', slug: 'clothing', priority: 0.8 },
  { parent: 'fashion', slug: 'accessories', priority: 0.8 },
  { parent: 'fashion', slug: 'quiet-luxury', priority: 0.8 },
  { parent: 'lifestyle', slug: 'hotels', priority: 0.8 },
  { parent: 'lifestyle', slug: 'travel', priority: 0.8 },
  { parent: 'lifestyle', slug: 'art-photography', priority: 0.8 },
  { parent: 'wellness', slug: 'longevity', priority: 0.8 },
  { parent: 'wellness', slug: 'retreats', priority: 0.8 },
  { parent: 'wellness', slug: 'biohacking', priority: 0.8 },
  { parent: 'guides', slug: 'gift-guides', priority: 0.8 },
  { parent: 'guides', slug: 'beginner-guides', priority: 0.8 },
  { parent: 'guides', slug: 'seasonal-guides', priority: 0.8 },
  { parent: 'guides', slug: 'investment-guides', priority: 0.8 },
]

// =============================================================================
// MAPPING: subcategory slug → parent slug (for fallback)
// =============================================================================
const SUB_TO_PARENT: Record<string, string> = {}
SUB_CATEGORIES.forEach(sc => { SUB_TO_PARENT[sc.slug] = sc.parent })

// =============================================================================
// SANITY QUERY - Only published articles with proper category resolution
// =============================================================================
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
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/affiliate-disclosure`, lastModified: currentDate, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // 2. PARENT CATEGORY PAGES
  const parentCategoryPages: MetadataRoute.Sitemap = PARENT_CATEGORIES.map(cat => ({
    url: `${BASE_URL}/${cat.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: cat.priority,
  }))

  // 3. SUB-CATEGORY PAGES
  const subCategoryPages: MetadataRoute.Sitemap = SUB_CATEGORIES.map(cat => ({
    url: `${BASE_URL}/${cat.parent}/${cat.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: cat.priority,
  }))

  // 4. DYNAMIC ARTICLE PAGES - Only published, with verified URLs
  let articlePages: MetadataRoute.Sitemap = []

  try {
    const articles = await client.fetch(ARTICLES_QUERY)

    // Track URLs to prevent duplicates
    const seenUrls = new Set<string>()

    articlePages = articles
      .map((article: {
        slug: string
        category: { slug: string; parentCategory: string } | null
      }) => {
        if (!article.slug || !article.category?.slug) return null

        const categorySlug = article.category.slug
        // Use parentCategory from Sanity, fallback to SUB_TO_PARENT mapping
        const parentSlug = article.category.parentCategory || SUB_TO_PARENT[categorySlug]

        if (!parentSlug) {
          console.warn(`Sitemap: No parent found for article "${article.slug}" in category "${categorySlug}"`)
          return null
        }

        const url = `${BASE_URL}/${parentSlug}/${categorySlug}/${article.slug}`

        // Prevent duplicate URLs
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

  // NO PRODUCT PAGES - removed (no route exists for /products/)

  return [
    ...staticPages,
    ...parentCategoryPages,
    ...subCategoryPages,
    ...articlePages,
  ]
}

