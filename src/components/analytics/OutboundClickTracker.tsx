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
 */

import { useEffect } from 'react';

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

/** Awin merchant IDs (awinmid) -> retailer name. */
const AWIN_MERCHANTS: Record<string, string> = {
  '101701': 'clearlight',
  // Sailo: copy your first Sailo link from Awin, read its awinmid, add it here.
  // '00000': 'sailo',
};

/** CJ redirect domains. CJ hides the merchant, so those links need data-il-retailer. */
const CJ_HOSTS = new Set([
  'anrdoezrs.net',
  'dpbolvw.net',
  'jdoqocy.com',
  'kqzyfj.com',
  'tkqlhce.com',
  'ftjcfx.com',
  'lduhtrp.net',
  'tqlkg.com',
  'awltovhc.com',
  'yceml.net',
  'emjcd.com',
]);

/** Merchant domains linked directly. */
const DIRECT_MERCHANTS: Record<string, string> = {
  'sailo.com': 'sailo',
  'mytheresa.com': 'mytheresa',
  'clearlightsaunas.com': 'clearlight',
  'cettire.com': 'cettire',
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type Resolved = {
  event: 'affiliate_link_click' | 'outbound_click';
  network: string;
  retailer: string;
  destination_domain: string;
};

const bareHost = (h: string) => h.replace(/^www\./i, '').toLowerCase();

function hostOf(rawUrl: string): string {
  try {
    return bareHost(new URL(rawUrl).hostname);
  } catch {
    return '';
  }
}

export function resolveLink(url: URL, el: HTMLAnchorElement): Resolved | null {
  const host = bareHost(url.hostname);
  if (!host || host === bareHost(window.location.hostname)) return null;

  const manualRetailer = el.dataset.ilRetailer || el.dataset.retailer;
  const manualNetwork = el.dataset.ilNetwork;

  if (host === 'awin1.com') {
    const mid = url.searchParams.get('awinmid') || '';
    const dest = url.searchParams.get('ued') || url.searchParams.get('p') || '';
    return {
      event: 'affiliate_link_click',
      network: 'awin',
      retailer: manualRetailer || AWIN_MERCHANTS[mid] || (mid ? `awin_mid_${mid}` : 'awin_unknown'),
      destination_domain: hostOf(decodeURIComponent(dest)) || 'awin1.com',
    };
  }

  if (CJ_HOSTS.has(host)) {
    return {
      event: 'affiliate_link_click',
      network: 'cj',
      retailer: manualRetailer || 'cj_unknown',
      destination_domain: host,
    };
  }

  const direct = DIRECT_MERCHANTS[host];
  if (direct) {
    return {
      event: 'affiliate_link_click',
      network: manualNetwork || 'direct',
      retailer: manualRetailer || direct,
      destination_domain: host,
    };
  }

  return {
    event: 'outbound_click',
    network: manualNetwork || 'none',
    retailer: manualRetailer || 'none',
    destination_domain: host,
  };
}

function send(name: string, params: Record<string, unknown>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };
  if (typeof w.gtag === 'function') {
    w.gtag('event', name, params);
  } else if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event: name, ...params });
  }
}

function slugFromPath(): string {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || 'home';
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
        article_slug: slugFromPath(),
        click_position: anchor.dataset.ilPlacement || (anchor.querySelector('img') ? 'inline-image' : 'inline-body'),
        link_url: url.href.slice(0, 500),
        link_text: (anchor.textContent || '').trim().slice(0, 100),
        page_path: window.location.pathname,
      });
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('auxclick', onClick as EventListener, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('auxclick', onClick as EventListener, true);
    };
  }, []);

  return null;
}
