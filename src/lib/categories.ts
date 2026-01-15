// =============================================================================
// InvestedLuxury - Central Category Configuration
// =============================================================================
// COMPLETE STRUCTURE: 4 Parent Categories + 17 Sub-Categories = 21 Total
// =============================================================================

export interface ParentCategory {
  slug: string
  title: string
  description: string
  metaTitle: string
  metaDescription: string
  path: string
  childSlugs: string[] // Sub-category slugs that belong to this parent
}

export interface SubCategory {
  slug: string
  title: string
  description: string
  metaTitle: string
  metaDescription: string
  parentSlug: 'fashion' | 'lifestyle' | 'wellness' | 'guides'
  path: string
}

// =============================================================================
// 4 PARENT CATEGORIES
// =============================================================================
export const PARENT_CATEGORIES: Record<string, ParentCategory> = {
  fashion: {
    slug: 'fashion',
    title: 'Fashion',
    description: 'Investment pieces that stand the test of time. From heritage bags to quiet luxury essentials - discover fashion worth investing in.',
    metaTitle: 'Investment Fashion | InvestedLuxury',
    metaDescription: 'Expert guides to luxury fashion investments. Designer bags, shoes, watches, jewelry, and timeless pieces that hold their value.',
    path: '/fashion',
    childSlugs: ['bags', 'shoes', 'quiet-luxury', 'watches', 'jewelry', 'clothing', 'accessories'],
  },
  
  lifestyle: {
    slug: 'lifestyle',
    title: 'Lifestyle',
    description: 'Elevated living experiences worth the investment. Luxury hotels, transformative travel, and the art of refined living.',
    metaTitle: 'Luxury Lifestyle | InvestedLuxury',
    metaDescription: 'Guides to luxury lifestyle investments. Hotels, travel experiences, art collecting, and photography.',
    path: '/lifestyle',
    childSlugs: ['hotels', 'travel', 'art-photography'],
  },
  
  wellness: {
    slug: 'wellness',
    title: 'Wellness',
    description: 'Invest in your most valuable asset your health. From longevity science to transformative retreats.',
    metaTitle: 'Luxury Wellness | InvestedLuxury',
    metaDescription: 'Premium wellness guides. Longevity treatments, luxury retreats, and biohacking for optimal health.',
    path: '/wellness',
    childSlugs: ['longevity', 'retreats', 'biohacking'],
  },
  
  guides: {
    slug: 'guides',
    title: 'Guides',
    description: 'Your roadmap to smart luxury investments. Gift guides, beginner essentials, and strategic buying advice.',
    metaTitle: 'Luxury Guides | InvestedLuxury',
    metaDescription: 'Comprehensive luxury buying guides. Gift ideas, beginner advice, seasonal picks, and investment strategies.',
    path: '/guides',
    childSlugs: ['gift-guides', 'beginner-guides', 'seasonal-guides', 'investment-guides'],
  },
}

// =============================================================================
// 17 SUB-CATEGORIES
// =============================================================================
export const SUB_CATEGORIES: Record<string, SubCategory> = {
  // =========================================================================
  // FASHION (7 sub-categories)
  // =========================================================================
  bags: {
    slug: 'bags',
    title: 'Investment Bags',
    description: 'The complete guide to designer bags worth investing in. From heritage houses like Hermès and Chanel to modern favorites like The Row - discover which bags hold their value, how to authenticate, and where to buy.',
    metaTitle: 'Investment Bags | InvestedLuxury',
    metaDescription: 'Discover the best designer bags that hold their value. Expert reviews, resale analysis, and buying guides for Hermès, Chanel, The Row, and more.',
    parentSlug: 'fashion',
    path: '/fashion/bags',
  },
  
  shoes: {
    slug: 'shoes',
    title: 'Investment Shoes',
    description: 'Designer shoes that combine timeless style with lasting value. From classic pumps to modern loafers expert reviews on craftsmanship, comfort, and investment potential.',
    metaTitle: 'Investment Shoes | InvestedLuxury',
    metaDescription: 'Expert guides to designer shoes worth investing in. Reviews of Manolo Blahnik, Roger Vivier, The Row, and more luxury footwear.',
    parentSlug: 'fashion',
    path: '/fashion/shoes',
  },
  
  'quiet-luxury': {
    slug: 'quiet-luxury',
    title: 'Quiet Luxury',
    description: 'The art of understated elegance. Discover brands and pieces that embody sophisticated style without logos - where quality speaks louder than branding.',
    metaTitle: 'Quiet Luxury Fashion | InvestedLuxury',
    metaDescription: 'Master the quiet luxury aesthetic. Expert guides to understated elegance, old money style, and logo-free designer pieces.',
    parentSlug: 'fashion',
    path: '/fashion/quiet-luxury',
  },
  
  watches: {
    slug: 'watches',
    title: 'Investment Watches',
    description: 'Timepieces that transcend trends. Expert analysis of luxury watches as investments, from Rolex and Patek Philippe to independent watchmakers.',
    metaTitle: 'Investment Watches | InvestedLuxury',
    metaDescription: 'Luxury watch investment guides. Expert reviews of Rolex, Patek Philippe, and collectible timepieces with resale value analysis.',
    parentSlug: 'fashion',
    path: '/fashion/watches',
  },
  
  jewelry: {
    slug: 'jewelry',
    title: 'Investment Jewelry',
    description: 'Fine jewelry that holds its value across generations. From Van Cleef & Arpels to Cartier, discover pieces worth investing in.',
    metaTitle: 'Investment Jewelry | InvestedLuxury',
    metaDescription: 'Expert guides to fine jewelry investments. Reviews of Cartier, Van Cleef, and luxury jewelry with lasting value.',
    parentSlug: 'fashion',
    path: '/fashion/jewelry',
  },
  
  clothing: {
    slug: 'clothing',
    title: 'Investment Clothing',
    description: 'Wardrobe foundations that stand the test of time. Expert guides to quality fabrics, timeless silhouettes, and pieces worth the investment.',
    metaTitle: 'Investment Clothing | InvestedLuxury',
    metaDescription: 'Build a timeless wardrobe with investment-worthy clothing. Expert guides to quality, fit, and pieces that last.',
    parentSlug: 'fashion',
    path: '/fashion/clothing',
  },
  
  accessories: {
    slug: 'accessories',
    title: 'Luxury Accessories',
    description: 'The finishing touches that elevate any look. From silk scarves to designer sunglasses accessories worth investing in.',
    metaTitle: 'Luxury Accessories | InvestedLuxury',
    metaDescription: 'Expert guides to luxury accessories. Reviews of designer scarves, sunglasses, belts, and investment-worthy finishing touches.',
    parentSlug: 'fashion',
    path: '/fashion/accessories',
  },

  // =========================================================================
  // LIFESTYLE (3 sub-categories)
  // =========================================================================
  hotels: {
    slug: 'hotels',
    title: 'Luxury Hotels',
    description: 'The world\'s finest hotels and resorts. In-depth reviews, insider tips, and guides to experiences worth the investment.',
    metaTitle: 'Luxury Hotel Reviews | InvestedLuxury',
    metaDescription: 'Honest reviews of the world\'s best luxury hotels. Four Seasons, Aman, and boutique hotels worth the splurge.',
    parentSlug: 'lifestyle',
    path: '/lifestyle/hotels',
  },
  
  travel: {
    slug: 'travel',
    title: 'Luxury Travel',
    description: 'Travel experiences that create lasting memories. From first-class flights to private tours guides to elevated travel.',
    metaTitle: 'Luxury Travel Guides | InvestedLuxury',
    metaDescription: 'Expert guides to luxury travel. First class reviews, destination guides, and travel experiences worth the investment.',
    parentSlug: 'lifestyle',
    path: '/lifestyle/travel',
  },
  
  'art-photography': {
    slug: 'art-photography',
    title: 'Art & Photography',
    description: 'Collecting art and capturing moments. From emerging artists to investment-grade cameras guides for the aesthetically minded.',
    metaTitle: 'Art & Photography | InvestedLuxury',
    metaDescription: 'Guides to art collecting and photography. Camera reviews, art investment tips, and visual storytelling.',
    parentSlug: 'lifestyle',
    path: '/lifestyle/art-photography',
  },

  // =========================================================================
  // WELLNESS (3 sub-categories)
  // =========================================================================
  longevity: {
    slug: 'longevity',
    title: 'Longevity',
    description: 'The science of living well, longer. From NAD+ therapy to cutting-edge treatments evidence-based guides to optimizing healthspan.',
    metaTitle: 'Longevity & Anti-Aging | InvestedLuxury',
    metaDescription: 'Science-backed longevity guides. NAD+ therapy, supplements, and treatments for optimizing healthspan.',
    parentSlug: 'wellness',
    path: '/wellness/longevity',
  },
  
  retreats: {
    slug: 'retreats',
    title: 'Wellness Retreats',
    description: 'Transformative wellness experiences worldwide. In-depth reviews of luxury spas, detox retreats, and healing destinations.',
    metaTitle: 'Luxury Wellness Retreats | InvestedLuxury',
    metaDescription: 'Reviews of the best wellness retreats worldwide. Luxury spas, detox programs, and transformative experiences.',
    parentSlug: 'wellness',
    path: '/wellness/retreats',
  },
  
  biohacking: {
    slug: 'biohacking',
    title: 'Biohacking',
    description: 'Optimize your biology with the latest in health technology. From red light therapy to cold plunges evidence-based guides to enhancement.',
    metaTitle: 'Biohacking Guides | InvestedLuxury',
    metaDescription: 'Expert biohacking guides. Red light therapy, cold plunges, and health optimization technology reviews.',
    parentSlug: 'wellness',
    path: '/wellness/biohacking',
  },

  // =========================================================================
  // GUIDES (4 sub-categories)
  // =========================================================================
  'gift-guides': {
    slug: 'gift-guides',
    title: 'Gift Guides',
    description: 'Thoughtful luxury gifts for every occasion. Curated selections that make lasting impressions.',
    metaTitle: 'Luxury Gift Guides | InvestedLuxury',
    metaDescription: 'Curated luxury gift guides for every occasion. Thoughtful presents that make lasting impressions.',
    parentSlug: 'guides',
    path: '/guides/gift-guides',
  },
  
  'beginner-guides': {
    slug: 'beginner-guides',
    title: 'Beginner Guides',
    description: 'New to luxury? Start here. Foundational guides to building a quality wardrobe and understanding investment pieces.',
    metaTitle: 'Luxury Beginner Guides | InvestedLuxury',
    metaDescription: 'New to luxury fashion? Start here with foundational guides to quality, value, and building a timeless wardrobe.',
    parentSlug: 'guides',
    path: '/guides/beginner-guides',
  },
  
  'seasonal-guides': {
    slug: 'seasonal-guides',
    title: 'Seasonal Guides',
    description: 'What to invest in each season. Timely guides to sales, new releases, and seasonal essentials.',
    metaTitle: 'Seasonal Style Guides | InvestedLuxury',
    metaDescription: 'Seasonal luxury guides. What to buy, when to shop, and timely investment opportunities.',
    parentSlug: 'guides',
    path: '/guides/seasonal-guides',
  },
  
  'investment-guides': {
    slug: 'investment-guides',
    title: 'Investment Guides',
    description: 'The definitive guides to luxury as investment. ROI analysis, resale values, and strategic buying advice.',
    metaTitle: 'Luxury Investment Guides | InvestedLuxury',
    metaDescription: 'Strategic guides to luxury investments. ROI analysis, resale values, and expert buying advice.',
    parentSlug: 'guides',
    path: '/guides/investment-guides',
  },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Get parent category by slug
export function getParentCategory(slug: string): ParentCategory | undefined {
  return PARENT_CATEGORIES[slug]
}

// Get sub-category by slug
export function getSubCategory(slug: string): SubCategory | undefined {
  return SUB_CATEGORIES[slug]
}

// Get all sub-categories for a parent
export function getSubCategoriesForParent(parentSlug: string): SubCategory[] {
  return Object.values(SUB_CATEGORIES).filter(sub => sub.parentSlug === parentSlug)
}

// Get all sub-category slugs for a parent (for GROQ queries)
export function getSubCategorySlugsForParent(parentSlug: string): string[] {
  return PARENT_CATEGORIES[parentSlug]?.childSlugs || []
}

// Check if slug is a parent category
export function isParentCategory(slug: string): boolean {
  return slug in PARENT_CATEGORIES
}

// Check if slug is a sub-category
export function isSubCategory(slug: string): boolean {
  return slug in SUB_CATEGORIES
}

// Get all slugs (for generateStaticParams)
export function getAllParentSlugs(): string[] {
  return Object.keys(PARENT_CATEGORIES)
}

export function getAllSubCategorySlugs(): string[] {
  return Object.keys(SUB_CATEGORIES)
}
