// =============================================================================
// InvestedLuxury - Central GROQ Queries
// =============================================================================
// Supports both:
// - Parent category pages (aggregate ALL sub-category articles)
// - Sub-category pages (only that specific category's articles)
// =============================================================================

import { client } from '@/sanity/lib/client'
import { getSubCategorySlugsForParent } from './categories'

// =============================================================================
// BASE ARTICLE FIELDS
// =============================================================================
const articleFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  metaDescription,
  publishedAt,
  featured,
  mainImage,
  "categories": categories[]->slug.current
`

// =============================================================================
// SUB-CATEGORY QUERIES (Single category)
// =============================================================================

/**
 * Get articles for a SINGLE sub-category
 * Example: /fashion/bags → only bags articles
 * 
 * Uses: categories[] array field (NOT singular category)
 */
export async function getArticlesBySubCategory(categorySlug: string) {
  const query = `*[_type == "article" && "${categorySlug}" in categories[]->slug.current] | order(publishedAt desc) {
    ${articleFields}
  }`
  
  return await client.fetch(query)
}

/**
 * Get featured articles for a sub-category
 */
export async function getFeaturedArticlesBySubCategory(categorySlug: string, limit: number = 3) {
  const query = `*[_type == "article" && "${categorySlug}" in categories[]->slug.current && featured == true] | order(publishedAt desc) [0...${limit}] {
    ${articleFields}
  }`
  
  return await client.fetch(query)
}

// =============================================================================
// PARENT CATEGORY QUERIES (Aggregates ALL sub-categories)
// =============================================================================

/**
 * Get articles for a PARENT category (all sub-categories combined)
 * Example: /fashion → bags + shoes + watches + jewelry + clothing + accessories + quiet-luxury
 */
export async function getArticlesByParentCategory(parentSlug: string) {
  // Get all sub-category slugs for this parent
  const subSlugs = getSubCategorySlugsForParent(parentSlug)
  
  if (subSlugs.length === 0) {
    return []
  }
  
  // Build the GROQ query with all sub-category slugs
  // This checks if ANY of the article's categories match ANY of the sub-category slugs
  const slugArray = subSlugs.map(s => `"${s}"`).join(', ')
  
  const query = `*[_type == "article" && count(categories[slug.current in [${slugArray}]]) > 0] | order(publishedAt desc) {
    ${articleFields}
  }`
  
  return await client.fetch(query)
}

/**
 * Alternative method using references (if categories are stored as references)
 */
export async function getArticlesByParentCategoryAlt(parentSlug: string) {
  const subSlugs = getSubCategorySlugsForParent(parentSlug)
  
  if (subSlugs.length === 0) {
    return []
  }
  
  // Build conditions for each sub-category
  const conditions = subSlugs.map(slug => `"${slug}" in categories[]->slug.current`).join(' || ')
  
  const query = `*[_type == "article" && (${conditions})] | order(publishedAt desc) {
    ${articleFields}
  }`
  
  return await client.fetch(query)
}

/**
 * Get featured articles for a parent category
 */
export async function getFeaturedArticlesByParentCategory(parentSlug: string, limit: number = 6) {
  const subSlugs = getSubCategorySlugsForParent(parentSlug)
  
  if (subSlugs.length === 0) {
    return []
  }
  
  const conditions = subSlugs.map(slug => `"${slug}" in categories[]->slug.current`).join(' || ')
  
  const query = `*[_type == "article" && (${conditions}) && featured == true] | order(publishedAt desc) [0...${limit}] {
    ${articleFields}
  }`
  
  return await client.fetch(query)
}

/**
 * Get article counts per sub-category for a parent category
 * Useful for showing "(12 articles)" badges
 */
export async function getArticleCountsByParentCategory(parentSlug: string) {
  const subSlugs = getSubCategorySlugsForParent(parentSlug)
  
  const counts: Record<string, number> = {}
  
  for (const slug of subSlugs) {
    const query = `count(*[_type == "article" && "${slug}" in categories[]->slug.current])`
    counts[slug] = await client.fetch(query)
  }
  
  return counts
}

// =============================================================================
// HOMEPAGE & GLOBAL QUERIES
// =============================================================================

/**
 * Get latest articles across ALL categories
 */
export async function getLatestArticles(limit: number = 10) {
  const query = `*[_type == "article"] | order(publishedAt desc) [0...${limit}] {
    ${articleFields}
  }`
  
  return await client.fetch(query)
}

/**
 * Get featured articles for homepage
 */
export async function getFeaturedArticles(limit: number = 6) {
  const query = `*[_type == "article" && featured == true] | order(publishedAt desc) [0...${limit}] {
    ${articleFields}
  }`
  
  return await client.fetch(query)
}

// =============================================================================
// SINGLE ARTICLE QUERIES
// =============================================================================

/**
 * Get single article by slug (full content)
 */
// =============================================================================
// Replace the existing getArticleBySlug function in src/lib/queries.ts with this:
// =============================================================================

/**
 * Get single article by slug (full content with product and author)
 */
export async function getArticleBySlug(slug: string) {
  const query = `*[_type == "article" && slug.current == "${slug}"][0] {
    title,
    "slug": slug.current,
    subtitle,
    excerpt,
    body,
    mainImage,
    publishedAt,
    updatedAt,
    articleType,
    productRating,
    
    // SEO fields
    "metaTitle": seo.metaTitle,
    "metaDescription": seo.metaDescription,
    
    // Author with full details
    author->{
      name,
      "slug": slug.current,
      image,
      bio,
      "credentials": role
    },
    
    // Primary product with all details for QuickBuyCard and ProductSpecsBox
    primaryProduct->{
      name,
      price,
      currency,
      description,
      "image": images[0],
      "specs": specifications[] {
        label,
        value
      },
      "retailers": affiliateLinks[inStock == true] | order(isPrimary desc) {
        "name": coalesce(retailerName, retailer),
        "url": url,
        "price": price,
        "isResale": isResale
      },
      "resaleRetailers": affiliateLinks[isResale == true && inStock == true] {
        "name": coalesce(retailerName, retailer),
        "url": url
      },
      investmentScore,
      resaleValue
    },
    
    // Categories for breadcrumb
    "categories": categories[]->{ 
      title,
      "slug": slug.current,
      parentCategory
    },
    
    // Related articles
    "relatedArticles": relatedArticles[]->{
      title,
      "slug": slug.current,
      excerpt,
      mainImage,
      "category": categories[0]->slug.current
    }
  }`
  
  return await client.fetch(query)
}

// =============================================================================
// SEARCH QUERIES
// =============================================================================

/**
 * Search articles by keyword
 */
export async function searchArticles(searchTerm: string, limit: number = 20) {
  const query = `*[_type == "article" && (
    title match "*${searchTerm}*" ||
    excerpt match "*${searchTerm}*" ||
    pt::text(body) match "*${searchTerm}*"
  )] | order(publishedAt desc) [0...${limit}] {
    ${articleFields}
  }`
  
  return await client.fetch(query)
}
