// =============================================================================
// DYNAMIC SITEMAP FOR INVESTEDLUXURY.COM
// =============================================================================
// Location: src/app/sitemap.ts
// Auto-updates when content is added/changed in Sanity
// Optimized for SEO with proper priority and changefreq settings
// =============================================================================

import { MetadataRoute } from 'next'
import { createClient } from '@sanity/client'

// =============================================================================
// REVALIDATION SETTING
// =============================================================================
// The sitemap will automatically regenerate every hour without needing a deploy
// Change this value based on how often you publish new content
// 3600 = 1 hour | 86400 = 1 day | 604800 = 1 week
export const revalidate = 3600

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '4b3ap7pf',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Set to false for fresh data on build
})

// Base URL for the site
const BASE_URL = 'https://investedluxury.com'

// =============================================================================
// CATEGORY STRUCTURE
// =============================================================================
// This should match your lib/categories.ts structure

const PARENT_CATEGORIES = [
  { slug: 'fashion', priority: 0.9 },
  { slug: 'lifestyle', priority: 0.9 },
  { slug: 'wellness', priority: 0.9 },
  { slug: 'guides', priority: 0.9 },
]

const SUB_CATEGORIES = [
  // Fashion
  { parent: 'fashion', slug: 'bags', priority: 0.8 },
  { parent: 'fashion', slug: 'shoes', priority: 0.8 },
  { parent: 'fashion', slug: 'watches', priority: 0.8 },
  { parent: 'fashion', slug: 'jewelry', priority: 0.8 },
  { parent: 'fashion', slug: 'clothing', priority: 0.8 },
  { parent: 'fashion', slug: 'accessories', priority: 0.8 },
  { parent: 'fashion', slug: 'quiet-luxury', priority: 0.8 },
  // Lifestyle
  { parent: 'lifestyle', slug: 'hotels', priority: 0.8 },
  { parent: 'lifestyle', slug: 'travel', priority: 0.8 },
  { parent: 'lifestyle', slug: 'art-photography', priority: 0.8 },
  // Wellness
  { parent: 'wellness', slug: 'longevity', priority: 0.8 },
  { parent: 'wellness', slug: 'retreats', priority: 0.8 },
  { parent: 'wellness', slug: 'biohacking', priority: 0.8 },
  // Guides
  { parent: 'guides', slug: 'gift-guides', priority: 0.8 },
  { parent: 'guides', slug: 'beginner-guides', priority: 0.8 },
  { parent: 'guides', slug: 'seasonal-guides', priority: 0.8 },
  { parent: 'guides', slug: 'investment-guides', priority: 0.8 },
]

// =============================================================================
// SANITY QUERIES
// =============================================================================

// Query for all published articles with their slugs and dates
const ARTICLES_QUERY = `*[_type == "article" && defined(slug.current)] {
  "slug": slug.current,
  "category": categories[0]->slug.current,
  "parentCategory": categories[0]->parentCategory,
  _updatedAt,
  _createdAt,
  publishedAt
}`

// Query for all products if you have a product schema
const PRODUCTS_QUERY = `*[_type == "product" && defined(slug.current)] {
  "slug": slug.current,
  "category": category->slug.current,
  _updatedAt
}`

// =============================================================================
// SITEMAP GENERATOR
// =============================================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Current date for static pages
  const currentDate = new Date().toISOString()

  // ==========================================================================
  // 1. STATIC PAGES - Highest priority pages
  // ==========================================================================
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/affiliate-disclosure`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // ==========================================================================
  // 2. PARENT CATEGORY PAGES (fashion, lifestyle, wellness, guides)
  // ==========================================================================
  const parentCategoryPages: MetadataRoute.Sitemap = PARENT_CATEGORIES.map(
    (category) => ({
      url: `${BASE_URL}/${category.slug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: category.priority,
    })
  )

  // ==========================================================================
  // 3. SUB-CATEGORY PAGES (fashion/bags, lifestyle/hotels, etc.)
  // ==========================================================================
  const subCategoryPages: MetadataRoute.Sitemap = SUB_CATEGORIES.map(
    (category) => ({
      url: `${BASE_URL}/${category.parent}/${category.slug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: category.priority,
    })
  )

  // ==========================================================================
  // 4. DYNAMIC ARTICLE PAGES - From Sanity CMS
  // ==========================================================================
  let articlePages: MetadataRoute.Sitemap = []

  try {
    const articles = await client.fetch(ARTICLES_QUERY)

    articlePages = articles.map((article: {
      slug: string
      category: string
      parentCategory: string
      _updatedAt: string
      publishedAt?: string
    }) => {
      // Build the full URL path: /fashion/bags/article-slug
      const parentSlug = article.parentCategory || 'fashion'
      const categorySlug = article.category || 'bags'
      
      return {
        url: `${BASE_URL}/${parentSlug}/${categorySlug}/${article.slug}`,
        lastModified: article._updatedAt || article.publishedAt || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error)
    // Continue without articles if Sanity is unavailable
  }

  // ==========================================================================
  // 5. OPTIONAL: PRODUCT PAGES - If you have product schema
  // ==========================================================================
  let productPages: MetadataRoute.Sitemap = []

  try {
    const products = await client.fetch(PRODUCTS_QUERY)

    if (products && products.length > 0) {
      productPages = products.map((product: {
        slug: string
        category: string
        _updatedAt: string
      }) => ({
        url: `${BASE_URL}/products/${product.slug}`,
        lastModified: product._updatedAt || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    // Products might not exist, that's fine
    console.log('No products found or products schema not configured')
  }

  // ==========================================================================
  // COMBINE ALL PAGES
  // ==========================================================================
  return [
    ...staticPages,
    ...parentCategoryPages,
    ...subCategoryPages,
    ...articlePages,
    ...productPages,
  ]
}
