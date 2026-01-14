// =============================================================================
// ROBOTS.TXT FOR INVESTEDLUXURY.COM
// =============================================================================
// Location: src/app/robots.ts
// Tells search engines how to crawl the site and where to find the sitemap
// =============================================================================

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://investedluxury.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // API routes
          '/studio/',        // Sanity Studio (if embedded)
          '/_next/',         // Next.js internal
          '/admin/',         // Admin pages
          '/*.json$',        // JSON files
          '/search?*',       // Search with params (avoid duplicate content)
        ],
      },
      {
        // Specific rules for Googlebot
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/studio/'],
      },
      {
        // Block bad bots that scrape content
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot'],
        disallow: '/', // Optional: Remove if you want these bots to crawl
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
