// =============================================================
// InvestedLuxury.com — GA4 Event Tracking
// =============================================================

import { hostOf, normalizeRetailer, resolveLink } from '@/lib/affiliateLinks';

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
  href,
}: {
  /** The link being followed. Used to identify the merchant and network from the URL. */
  href?: string;
  productName?: string;
  brand?: string;
  price?: string | number;
  retailer: string;
  category?: string;
  articleSlug?: string;
  position?: string; // "quick-buy" | "sticky-bar" | "specs-box" | "inline" | "more-retailers"
}) {
  // The URL is the source of truth for the merchant; the widget label is only a
  // fallback, and UI text such as "Shop Now" is never reported as a retailer.
  let resolved = null as ReturnType<typeof resolveLink>;
  if (href) {
    try {
      resolved = resolveLink(new URL(href, 'https://investedluxury.com'), null);
    } catch {
      resolved = null;
    }
  }
  const fromUrl = resolved && !/_unknown$|^none$/.test(resolved.retailer) ? resolved.retailer : '';

  sendEvent('affiliate_link_click', {
    product_name: productName || '',
    brand: brand || '',
    price: typeof price === 'string' ? price : price || 0,
    retailer: fromUrl || normalizeRetailer(retailer) || resolved?.retailer || 'unknown',
    network: resolved?.network || 'unknown',
    destination_domain: resolved?.destination_domain || hostOf(href),
    category: category || '',
    article_slug: articleSlug || (typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() || 'home' : ''),
    click_position: position || 'unknown',
    link_url: href ? href.slice(0, 500) : '',
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
