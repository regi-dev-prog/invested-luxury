// =============================================================
// InvestedLuxury.com: affiliate link resolution and SubIDs
// =============================================================
//
// One place that answers three questions about any outbound link:
//   1. Is it an affiliate link, and on which network?        -> resolveLink()
//   2. Which merchant does it really go to?                   -> resolveLink(), retailerFromUrl()
//   3. Which SubID tells the network the page and placement?  -> withSubIds()
//
// Used by OutboundClickTracker (all links, at click time) and by
// trackAffiliateClick() in analytics.ts (product widgets).
//
// SubID convention (one format for every network):
//   page      = "il-" + article slug   (e.g. il-best-cashmere-investment-guide)
//   placement = click position          (quick-buy-primary, sticky-bar, specs-box,
//                                         inline-body, inline-image, home-coveting, ...)
//   Networks with two slots get page and placement separately; networks with one
//   slot get "page_placement".
//     CJ          sid=page_placement               (max 64 chars)
//     Awin        clickref=page, clickref2=placement (max 50 chars each)
//     Impact      subId1=page, subId2=placement
//     Partnerize  /pubref:page_placement/
//     Villiers    aref=page_placement

/* ------------------------------------------------------------------ */
/* Merchant registry                                                   */
/* ------------------------------------------------------------------ */

type Merchant = { id: string; label: string };

/** Destination domain -> merchant. Used for CJ/Awin/Impact deep links and direct links. */
const MERCHANTS_BY_DOMAIN: Record<string, Merchant> = {
  'mytheresa.com': { id: 'mytheresa', label: 'Mytheresa' },
  'farfetch.com': { id: 'farfetch', label: 'Farfetch' },
  'net-a-porter.com': { id: 'net-a-porter', label: 'NET-A-PORTER' },
  'ssense.com': { id: 'ssense', label: 'SSENSE' },
  'saksfifthavenue.com': { id: 'saks', label: 'Saks Fifth Avenue' },
  'saks.com': { id: 'saks', label: 'Saks Fifth Avenue' },
  'bergdorfgoodman.com': { id: 'bergdorf-goodman', label: 'Bergdorf Goodman' },
  'nordstrom.com': { id: 'nordstrom', label: 'Nordstrom' },
  'therealreal.com': { id: 'therealreal', label: 'The RealReal' },
  'vestiairecollective.com': { id: 'vestiaire', label: 'Vestiaire Collective' },
  'cettire.com': { id: 'cettire', label: 'Cettire' },
  'booking.com': { id: 'booking', label: 'Booking.com' },
  'sailo.com': { id: 'sailo', label: 'Sailo' },
  'clearlightsaunas.com': { id: 'clearlight', label: 'Clearlight' },
  'infraredsauna.com': { id: 'clearlight', label: 'Clearlight' },
  'mindlabpro.com': { id: 'performancelab', label: 'Mind Lab Pro' },
  'performancelab.com': { id: 'performancelab', label: 'Performance Lab' },
  'allu-official.com': { id: 'allu', label: 'ALLU' },
  'villiers.ai': { id: 'villiers', label: 'Villiers' },
};

/** Domains that are themselves the affiliate link (no redirect host). */
const DIRECT_AFFILIATE_DOMAINS: Record<string, string> = {
  'villiers.ai': 'villiers',
  'sailo.com': 'direct',
  'mytheresa.com': 'direct',
  'clearlightsaunas.com': 'direct',
  'cettire.com': 'direct',
};

/** Awin merchant IDs (awinmid) -> merchant id. */
const AWIN_MERCHANTS: Record<string, string> = {
  '101701': 'clearlight',
  '92667': 'sailo',
};

/** CJ redirect domains. */
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

/** impact.com tracking hosts -> merchant id. */
const IMPACT_HOSTS: Record<string, string> = {
  'mindlabpro.pxf.io': 'performancelab',
  'performancelabltd.pxf.io': 'performancelab',
  'allu-official.pxf.io': 'allu',
};
const IMPACT_HOST_SUFFIX = '.pxf.io';

/** Partnerize click host. */
const PARTNERIZE_HOST = 'prf.hn';

/** Labels that are UI text, not merchant names. Never report these as a retailer. */
const GENERIC_LABELS = new Set(['', 'shop now', 'shop', 'buy now', 'retailer', 'unknown', 'view', 'link']);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const bareHost = (h: string) => h.replace(/^www\./i, '').toLowerCase();

/** Hostname of a URL string, without www. Empty string if it does not parse. */
export function hostOf(rawUrl: string | null | undefined): string {
  if (!rawUrl) return '';
  try {
    return bareHost(new URL(rawUrl).hostname);
  } catch {
    return '';
  }
}

/** Matches a host and its subdomains against the registry (en.mytheresa.com -> mytheresa.com). */
function merchantForHost(host: string): Merchant | null {
  if (!host) return null;
  const parts = host.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    const m = MERCHANTS_BY_DOMAIN[parts.slice(i).join('.')];
    if (m) return m;
  }
  return null;
}

/** Turns any retailer label into a stable lowercase id ("Tiffany & Co." -> "tiffany-co"). */
export function normalizeRetailer(name: string | null | undefined): string {
  const raw = (name || '').trim();
  if (GENERIC_LABELS.has(raw.toLowerCase())) return '';
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Decodes the final destination of a redirect link, when the link carries it. */
function destinationOf(url: URL): string {
  const host = bareHost(url.hostname);
  if (CJ_HOSTS.has(host)) return url.searchParams.get('url') || '';
  if (host === 'awin1.com') return url.searchParams.get('ued') || url.searchParams.get('p') || '';
  if (host === PARTNERIZE_HOST) {
    const m = url.pathname.match(/\/destination:([^/]+)/);
    return m ? safeDecode(m[1]) : '';
  }
  if (host.endsWith(IMPACT_HOST_SUFFIX)) return url.searchParams.get('u') || '';
  return '';
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/* ------------------------------------------------------------------ */
/* Link resolution                                                     */
/* ------------------------------------------------------------------ */

export type Resolved = {
  event: 'affiliate_link_click' | 'outbound_click';
  network: string;
  retailer: string;
  destination_domain: string;
};

type Hints = { ilRetailer?: string; retailer?: string; ilNetwork?: string };

/**
 * Classifies a link. `hints` is usually an anchor's dataset; a manual
 * data-il-retailer wins over everything except a generic UI label.
 * Returns null for same-site links.
 */
export function resolveLink(
  url: URL,
  el?: { dataset?: Hints } | null,
  siteHost: string = typeof window !== 'undefined' ? window.location.hostname : 'investedluxury.com',
): Resolved | null {
  const host = bareHost(url.hostname);
  if (!host || host === bareHost(siteHost)) return null;

  const manualRetailer = normalizeRetailer(el?.dataset?.ilRetailer || el?.dataset?.retailer);
  const manualNetwork = el?.dataset?.ilNetwork;
  const dest = destinationOf(url);
  const destHost = hostOf(dest);
  const destMerchant = merchantForHost(destHost)?.id;

  if (host === 'awin1.com') {
    const mid = url.searchParams.get('awinmid') || '';
    return {
      event: 'affiliate_link_click',
      network: 'awin',
      retailer: manualRetailer || AWIN_MERCHANTS[mid] || destMerchant || (mid ? `awin_mid_${mid}` : 'awin_unknown'),
      destination_domain: destHost || 'awin1.com',
    };
  }

  if (CJ_HOSTS.has(host)) {
    // CJ redirect hosts hide the merchant; the deep-link target in `url` reveals it.
    return {
      event: 'affiliate_link_click',
      network: 'cj',
      retailer: manualRetailer || destMerchant || (destHost ? destHost : 'cj_unknown'),
      destination_domain: destHost || host,
    };
  }

  if (IMPACT_HOSTS[host] || host.endsWith(IMPACT_HOST_SUFFIX)) {
    return {
      event: 'affiliate_link_click',
      network: 'impact',
      retailer: manualRetailer || IMPACT_HOSTS[host] || destMerchant || 'impact_unknown',
      destination_domain: destHost || host,
    };
  }

  if (host === PARTNERIZE_HOST) {
    return {
      event: 'affiliate_link_click',
      network: 'partnerize',
      retailer: manualRetailer || destMerchant || (destHost ? destHost : 'partnerize_unknown'),
      destination_domain: destHost || host,
    };
  }

  const directNetwork = DIRECT_AFFILIATE_DOMAINS[host];
  if (directNetwork) {
    return {
      event: 'affiliate_link_click',
      network: manualNetwork || directNetwork,
      retailer: manualRetailer || merchantForHost(host)?.id || host,
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

/** Merchant id for a raw URL string, or '' if it cannot be told. */
export function retailerFromUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return '';
  try {
    const r = resolveLink(new URL(rawUrl), null, 'investedluxury.com');
    if (!r || r.event !== 'affiliate_link_click') return '';
    return /_unknown$/.test(r.retailer) ? '' : r.retailer;
  } catch {
    return '';
  }
}

/** Human label for a merchant, for "Shop at X" buttons. '' if unknown. */
export function retailerLabelFromUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return '';
  try {
    const url = new URL(rawUrl);
    const m = merchantForHost(hostOf(destinationOf(url))) || merchantForHost(bareHost(url.hostname));
    if (m) return m.label;
    const mid = url.searchParams.get('awinmid');
    const awinId = mid ? AWIN_MERCHANTS[mid] : '';
    const byId = Object.values(MERCHANTS_BY_DOMAIN).find((x) => x.id === (awinId || IMPACT_HOSTS[bareHost(url.hostname)]));
    return byId?.label || '';
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ */
/* SubIDs                                                              */
/* ------------------------------------------------------------------ */

const clip = (s: string, n: number) => s.slice(0, n);

/** "best-cashmere-investment-guide" -> "il-best-cashmere-investment-guide" */
export function pageRef(slug: string): string {
  const clean = normalizeRetailer(slug) || 'home';
  return `il-${clean}`;
}

/**
 * Returns the link with the IL SubID for its network, or null when the link
 * is not an affiliate link we tag. Existing values are handled per network:
 *   CJ sid: always replaced (old values mixed product and page slugs).
 *   Awin / Impact: page slot always set; an existing placement slot is kept,
 *     because some links carry a hand-set paragraph reference (body-p3).
 *   Villiers aref, Partnerize pubref: kept if already set by hand.
 */
export function withSubIds(rawUrl: string, slug: string, placement: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = bareHost(url.hostname);
  const page = pageRef(slug);
  const place = normalizeRetailer(placement) || 'inline-body';
  const single = `${page}_${place}`;

  if (CJ_HOSTS.has(host)) {
    url.searchParams.set('sid', clip(single, 64));
    return url.toString();
  }
  if (host === 'awin1.com') {
    url.searchParams.set('clickref', clip(page, 50));
    if (!url.searchParams.get('clickref2')) url.searchParams.set('clickref2', clip(place, 50));
    return url.toString();
  }
  if (IMPACT_HOSTS[host] || host.endsWith(IMPACT_HOST_SUFFIX)) {
    url.searchParams.set('subId1', page);
    if (!url.searchParams.get('subId2')) url.searchParams.set('subId2', place);
    return url.toString();
  }
  if (host === PARTNERIZE_HOST) {
    if (/\/pubref:/.test(url.pathname)) return url.toString();
    url.pathname = url.pathname.replace(/(\/camref:[^/]+)/, `$1/pubref:${encodeURIComponent(clip(single, 64))}`);
    return url.toString();
  }
  if (host === 'villiers.ai') {
    if (!url.searchParams.get('id')) return null; // not an affiliate link, leave it alone
    if (!url.searchParams.get('aref')) url.searchParams.set('aref', clip(single, 64));
    return url.toString();
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Placement                                                           */
/* ------------------------------------------------------------------ */

/**
 * Placement of an anchor: data-il-placement on the anchor or an ancestor,
 * otherwise inline-image / inline-body for links written in prose.
 */
export function placementOf(anchor: HTMLAnchorElement): string {
  const tagged = anchor.closest('[data-il-placement]') as HTMLElement | null;
  if (tagged?.dataset.ilPlacement) return tagged.dataset.ilPlacement;
  return anchor.querySelector('img') ? 'inline-image' : 'inline-body';
}

/** Last path segment, or "home" on the homepage. */
export function slugFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || 'home';
}
