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
      { source: '/guides/bags', destination: '/fashion/bags', permanent: true },
      { source: '/guides/quiet-luxury', destination: '/fashion/quiet-luxury', permanent: true },
      // Article slugs nested under wrong /guides/* and /lifestyle/* parents
      { source: '/guides/clothing/:slug*', destination: '/fashion/clothing/:slug*', permanent: true },
      { source: '/guides/shoes/:slug*', destination: '/fashion/shoes/:slug*', permanent: true },
      { source: '/guides/watches/:slug*', destination: '/fashion/watches/:slug*', permanent: true },
      { source: '/guides/jewelry/:slug*', destination: '/fashion/jewelry/:slug*', permanent: true },
      { source: '/guides/travel/:slug*', destination: '/lifestyle/travel/:slug*', permanent: true },
      { source: '/guides/bags/:slug*', destination: '/fashion/bags/:slug*', permanent: true },
      { source: '/guides/quiet-luxury/:slug*', destination: '/fashion/quiet-luxury/:slug*', permanent: true },
      { source: '/lifestyle/longevity/:slug*', destination: '/wellness/longevity/:slug*', permanent: true },
      { source: '/lifestyle/investment-guides/:slug*', destination: '/guides/investment-guides/:slug*', permanent: true },
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
      // /beginner-guides/article-slug → /guides/beginner-guides/article-slug
      { source: '/beginner-guides/:slug*', destination: '/guides/beginner-guides/:slug*', permanent: true },

      // =====================================================================
      // 6. POSSIBLE SLUG MISMATCHES
      // =====================================================================
      { source: '/fashion/bags/10-best-investment-bags-2026', destination: '/fashion/bags/best-investment-bags-2026', permanent: true },

      // =====================================================================
      // 7. AHREFS AUDIT - MARCH 2026
      //    404 pages found: wrong parent, wrong slug, or missing category
      // =====================================================================

      // --- Cashmere article: linked with 3 different wrong URLs ---
      { source: '/fashion/best-cashmere-investment-guide', destination: '/fashion/clothing/best-cashmere-investment-guide', permanent: true },
      { source: '/fashion/cashmere-investment-guide', destination: '/fashion/clothing/best-cashmere-investment-guide', permanent: true },

      // --- Loro Piana sweater: linked with truncated slug ---
      { source: '/fashion/loro-piana-sweater-worth-it-price-per-wear', destination: '/fashion/clothing/loro-piana-sweater-worth-it-price-per-wear', permanent: true },
      { source: '/fashion/clothing/loro-piana-sweater-worth-it', destination: '/fashion/clothing/loro-piana-sweater-worth-it-price-per-wear', permanent: true },

      // --- NAD IV therapy: wrong parent + wrong slug ---
      { source: '/wellness/nad-iv-therapy-guide', destination: '/wellness/biohacking/nad-iv-therapy-guide', permanent: true },
      { source: '/wellness/biohacking/nad-iv-therapy', destination: '/wellness/biohacking/nad-iv-therapy-guide', permanent: true },

      // --- Red light therapy: linked with wrong/nonexistent slugs → category ---
      { source: '/wellness/biohacking/red-light-therapy-benefits', destination: '/wellness/biohacking', permanent: true },
      { source: '/wellness/red-light-therapy-stomach-benefits', destination: '/wellness/biohacking', permanent: true },

      // --- Paris hotels: wrong parent category ---
      { source: '/travel/best-boutique-hotels-paris', destination: '/lifestyle/travel/best-boutique-hotels-paris', permanent: true },

      // --- Outerwear: not a registered subcategory → clothing ---
      { source: '/fashion/outerwear', destination: '/fashion/clothing', permanent: true },

      // --- Investment bags: not a registered subcategory → bags ---
      { source: '/fashion/investment-bags', destination: '/fashion/bags', permanent: true },

    ]
  },
};

export default nextConfig;
