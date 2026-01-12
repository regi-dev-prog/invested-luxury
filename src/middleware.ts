import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware redirects old /article/[slug] URLs to new /[parent]/[category]/[slug] URLs
// It fetches the article's category from Sanity and redirects accordingly

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Only handle /article/[slug] paths
  if (!pathname.startsWith('/article/')) {
    return NextResponse.next()
  }
  
  const slug = pathname.replace('/article/', '')
  
  if (!slug) {
    return NextResponse.next()
  }
  
  try {
    // Fetch article category info from Sanity
    // Note: Replace with your actual Sanity project ID and dataset
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
    
    const query = encodeURIComponent(`*[_type == "article" && slug.current == "${slug}"][0]{
      "categorySlug": categories[0]->slug.current,
      "parentCategory": categories[0]->parentCategory
    }`)
    
    const response = await fetch(
      `https://${projectId}.api.sanity.io/v2023-05-03/data/query/${dataset}?query=${query}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )
    
    if (!response.ok) {
      return NextResponse.next()
    }
    
    const data = await response.json()
    const article = data.result
    
    if (article?.parentCategory && article?.categorySlug) {
      // Build new URL
      const newUrl = `/${article.parentCategory}/${article.categorySlug}/${slug}`
      
      // 301 Permanent redirect
      return NextResponse.redirect(new URL(newUrl, request.url), 301)
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware redirect error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: '/article/:slug*',
}