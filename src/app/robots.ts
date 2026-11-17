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
        // Link-index scrapers with no referral value. AhrefsBot is allowed so
        // that Ahrefs Site Audit and the internal-link graph work for this site.
        userAgent: ['SemrushBot', 'MJ12bot'],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
