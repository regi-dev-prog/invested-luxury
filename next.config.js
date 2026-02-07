/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
    ],
  },

  // =========================================================================
  // REDIRECTS - Fix all 404 errors found in Ahrefs audit (Feb 2026)
  // =========================================================================
  async redirects() {
    return [
      // =====================================================================
      // 1. PRODUCTS → Homepage (79 URLs - no product pages exist)
      //    robots.txt already blocks /products/ from indexing
      // =====================================================================
      {
        source: '/products/:slug*',
        destination: '/',
        permanent: true,
      },

      // =====================================================================
      // 2. SUBCATEGORIES WITHOUT PARENT (e.g. /bags → /fashion/bags)
      // =====================================================================
      // Fashion subcategories
      { source: '/bags', destination: '/fashion/bags', permanent: true },
      { source: '/shoes', destination: '/fashion/shoes', permanent: true },
      { source: '/watches', destination: '/fashion/watches', permanent: true },
      { source: '/jewelry', destination: '/fashion/jewelry', permanent: true },
      { source: '/quiet-luxury', destination: '/fashion/quiet-luxury', permanent: true },
      // Lifestyle subcategories
      { source: '/travel', destination: '/lifestyle/travel', permanent: true },
      // Wellness subcategories
      { source: '/biohacking', destination: '/wellness/biohacking', permanent: true },
      { source: '/longevity', destination: '/wellness/longevity', permanent: true },
      // Guides subcategories
      { source: '/beginner-guides', destination: '/guides/beginner-guides', permanent: true },
      { source: '/investment-guides', destination: '/guides/investment-guides', permanent: true },

      // =====================================================================
      // 3. DUPLICATE SLUG LOOPS (e.g. /bags/bags → /fashion/bags)
      // =====================================================================
      { source: '/bags/bags', destination: '/fashion/bags', permanent: true },
      { source: '/shoes/shoes', destination: '/fashion/shoes', permanent: true },
      { source: '/watches/watches', destination: '/fashion/watches', permanent: true },
      { source: '/jewelry/jewelry', destination: '/fashion/jewelry', permanent: true },
      { source: '/biohacking/biohacking', destination: '/wellness/biohacking', permanent: true },
      { source: '/investment-guides/investment-guides', destination: '/guides/investment-guides', permanent: true },
      { source: '/travel/travel', destination: '/lifestyle/travel', permanent: true },

      // =====================================================================
      // 4. WRONG PARENT CATEGORIES (subcategory under wrong parent)
      // =====================================================================
      // /guides/X → correct parent
      { source: '/guides/clothing', destination: '/fashion/clothing', permanent: true },
      { source: '/guides/shoes', destination: '/fashion/shoes', permanent: true },
      { source: '/guides/watches', destination: '/fashion/watches', permanent: true },
      { source: '/guides/jewelry', destination: '/fashion/jewelry', permanent: true },
      { source: '/guides/travel', destination: '/lifestyle/travel', permanent: true },
      { source: '/guides/beginners', destination: '/guides/beginner-guides', permanent: true },
      { source: '/guides/seasonal', destination: '/guides/seasonal-guides', permanent: true },
      { source: '/guides/investment', destination: '/guides/investment-guides', permanent: true },
      // /lifestyle/X → correct parent
      { source: '/lifestyle/art', destination: '/lifestyle/art-photography', permanent: true },
      { source: '/lifestyle/watches', destination: '/fashion/watches', permanent: true },
      { source: '/lifestyle/longevity', destination: '/wellness/longevity', permanent: true },
      { source: '/lifestyle/investment-guides', destination: '/guides/investment-guides', permanent: true },
      // /longevity/X → correct parent
      { source: '/longevity/biohacking', destination: '/wellness/biohacking', permanent: true },
      // /travel/X → correct parent
      { source: '/travel/watches', destination: '/fashion/watches', permanent: true },

      // =====================================================================
      // 5. ARTICLES AT WRONG PATHS (missing parent in URL)
      // =====================================================================
      // /bags/article-slug → /fashion/bags/article-slug
      { source: '/bags/best-investment-bags-2026', destination: '/fashion/bags/best-investment-bags-2026', permanent: true },
      { source: '/bags/the-row-margaux-review', destination: '/fashion/bags/the-row-margaux-review', permanent: true },
      { source: '/bags/row-margaux-review', destination: '/fashion/bags/the-row-margaux-review', permanent: true },
      // /jewelry/article-slug → /fashion/jewelry/article-slug
      { source: '/jewelry/is-jewelry-good-investment-resale-analysis', destination: '/fashion/jewelry/is-jewelry-good-investment-resale-analysis', permanent: true },
      // /biohacking/article-slug → /wellness/biohacking/article-slug
      { source: '/biohacking/cold-plunge-benefits-women', destination: '/wellness/biohacking/cold-plunge-benefits-women', permanent: true },
      // /travel/article-slug → /lifestyle/travel/article-slug
      { source: '/travel/business-class-vs-first-class', destination: '/lifestyle/travel/business-class-vs-first-class', permanent: true },
      { source: '/travel/four-seasons-vs-ritz-carlton', destination: '/lifestyle/travel/four-seasons-vs-ritz-carlton', permanent: true },
      { source: '/travel/luxury-cruise-lines-ranked-2026', destination: '/lifestyle/travel/luxury-cruise-lines-ranked-2026', permanent: true },

      // =====================================================================
      // 6. POSSIBLE SLUG MISMATCHES
      // =====================================================================
      // This article is at the correct path format but still 404
      // Likely the slug in Sanity is different - check and update if needed
      { source: '/fashion/bags/10-best-investment-bags-2026', destination: '/fashion/bags/best-investment-bags-2026', permanent: true },
    ]
  },
};

export default nextConfig;
