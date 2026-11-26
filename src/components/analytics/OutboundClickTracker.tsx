'use client';

/**
 * OutboundClickTracker
 * InvestedLuxury.com - automatic tracking for affiliate and outbound links in prose.
 *
 * Save to: src/components/analytics/OutboundClickTracker.tsx
 * Mount once in src/app/layout.tsx, inside <body>.
 *
 * Complements the existing src/lib/analytics.ts trackAffiliateClick(), which covers
 * the product widgets (AffiliateButton, QuickBuyCard, StickyBuyBar, ProductSpecsBox,
 * ProductCard). This catches everything those do not: links written inside article
 * paragraphs.
 *
 * It deliberately reuses the SAME event name and parameter names as analytics.ts
 * (affiliate_link_click / retailer / article_slug / click_position) so both sources
 * land in one report and the existing history stays continuous.
 *
 * Double counting: any anchor carrying data-retailer or data-il-tracked is skipped,
 * because a widget component already fires the event for it on click.
 *
 * SubIDs: every affiliate anchor (widgets included) gets the IL SubID for its
 * network written into its href on pointerdown/click. Rules live in
 * src/lib/affiliateLinks.ts.
 */

import { useEffect } from 'react';
import { placementOf, resolveLink, slugFromPath, withSubIds } from '@/lib/affiliateLinks';

export { resolveLink };

function send(name: string, params: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };
  if (typeof w.gtag === 'function') {
    w.gtag('event', name, params);
  } else if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event: name, ...params });
  }
}

/**
 * Writes the IL SubID into an affiliate link just before the browser follows it,
 * so every network report can be joined back to page + placement. Runs for every
 * affiliate anchor, including widget links that fire their own GA4 event.
 */
function tagSubIds(anchor: HTMLAnchorElement) {
  const path = window.location.pathname;
  // Client-side navigation can keep an anchor alive across pages: re-tag from the
  // original href whenever the page changed since the last tag.
  if (anchor.dataset.ilSubid === path) return;
  const original = anchor.dataset.ilHref || anchor.href;
  const tagged = withSubIds(original, slugFromPath(path), placementOf(anchor));
  if (tagged) {
    anchor.dataset.ilHref = original;
    anchor.href = tagged;
    anchor.dataset.ilSubid = path;
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function OutboundClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.type === 'auxclick' && event.button !== 1) return;

      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      // SubIDs go on every affiliate link, before navigation reads the href.
      tagSubIds(anchor);

      // Already tracked by a widget component's own onClick handler.
      if (anchor.closest('[data-retailer], [data-il-tracked]')) return;

      const href = anchor.getAttribute('href') || '';
      if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (!/^https?:$/.test(url.protocol)) return;

      const resolved = resolveLink(url, anchor);
      if (!resolved) return;

      send(resolved.event, {
        retailer: resolved.retailer,
        network: resolved.network,
        destination_domain: resolved.destination_domain,
        article_slug: slugFromPath(window.location.pathname),
        click_position: placementOf(anchor),
        link_url: url.href.slice(0, 500),
        link_text: (anchor.textContent || '').trim().slice(0, 100),
        page_path: window.location.pathname,
      });
    };

    // Middle-click and "open in new tab" read the href before any click event.
    const onPointerDown = (event: PointerEvent) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (anchor) tagSubIds(anchor);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('auxclick', onClick as EventListener, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('auxclick', onClick as EventListener, true);
    };
  }, []);

  return null;
}
