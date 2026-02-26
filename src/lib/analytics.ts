// =============================================================
// InvestedLuxury.com — GA4 Event Tracking
// =============================================================

function sendEvent(eventName: string, params: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

// ── Affiliate Link Click ─────────────────────────────────────
export function trackAffiliateClick({
  productName,
  brand,
  price,
  retailer,
  category,
  articleSlug,
  position,
}: {
  productName?: string;
  brand?: string;
  price?: string | number;
  retailer: string;
  category?: string;
  articleSlug?: string;
  position?: string; // "quick-buy" | "sticky-bar" | "specs-box" | "inline" | "more-retailers"
}) {
  sendEvent('affiliate_link_click', {
    product_name: productName || '',
    brand: brand || '',
    price: typeof price === 'string' ? price : price || 0,
    retailer,
    category: category || '',
    article_slug: articleSlug || '',
    click_position: position || 'unknown',
  });
}

// ── Article Scroll Depth ─────────────────────────────────────
export function trackArticleScroll({
  articleTitle,
  articleSlug,
  category,
  scrollDepth,
  timeOnPage,
}: {
  articleTitle: string;
  articleSlug: string;
  category?: string;
  scrollDepth: number; // 25, 50, 75, 100
  timeOnPage: number;  // seconds
}) {
  sendEvent('article_scroll', {
    article_title: articleTitle,
    article_slug: articleSlug,
    category: category || '',
    scroll_depth: scrollDepth,
    time_on_page: timeOnPage,
  });
}

// ── Newsletter Signup ────────────────────────────────────────
export function trackNewsletterSignup(location: string) {
  sendEvent('newsletter_signup', {
    signup_location: location,
    page_url: typeof window !== 'undefined' ? window.location.pathname : '',
  });
}

// ── Social Share ─────────────────────────────────────────────
export function trackSocialShare({
  platform,
  contentTitle,
}: {
  platform: string;
  contentTitle: string;
}) {
  sendEvent('social_share', {
    platform,
    content_title: contentTitle,
    page_url: typeof window !== 'undefined' ? window.location.pathname : '',
  });
}

// ── Search Query ─────────────────────────────────────────────
export function trackSearchQuery(searchTerm: string, resultsCount: number) {
  sendEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

// ── Category View ────────────────────────────────────────────
export function trackCategoryView(categoryName: string) {
  sendEvent('category_view', {
    category_name: categoryName,
    page_url: typeof window !== 'undefined' ? window.location.pathname : '',
  });
}
