// =============================================================
// InvestedLuxury.com: consent (Google Consent Mode v2)
// =============================================================
//
// Who sees the cookie banner: visitors in the EEA, the UK and Switzerland.
// Country comes from the `il_cc` cookie that src/middleware.ts sets from the
// Vercel geo header. If that cookie is missing, a Europe/* time zone counts as
// "needs consent" (errs on the side of asking).
//
// Mode: advanced. gtag.js always loads; until a visitor in those regions
// accepts, Google Analytics runs with analytics_storage = denied (no cookies,
// cookieless pings only). Advertising signals are denied everywhere because
// the site runs no ads.

/** EU 27 + Iceland, Liechtenstein, Norway (EEA) + UK + Switzerland. */
export const CONSENT_REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
  'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
] as const;

export const CONSENT_STORAGE_KEY = 'il_consent';
export const COUNTRY_COOKIE = 'il_cc';
/** Ask again after 12 months. */
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
export const OPEN_CONSENT_EVENT = 'il:open-consent';

export type ConsentValue = 'granted' | 'denied';
export type StoredConsent = { v: ConsentValue; t: number };

export function countryFromCookie(cookie: string): string | null {
  const m = cookie.match(/(?:^|;\s*)il_cc=([A-Za-z]{2})(?:;|$)/);
  return m ? m[1].toUpperCase() : null;
}

/** Does this visitor need to be asked before analytics cookies are set? */
export function needsConsent(country: string | null, timeZone: string | null): boolean {
  if (country) return (CONSENT_REGIONS as readonly string[]).includes(country.toUpperCase());
  return !!timeZone && /^Europe\//.test(timeZone);
}

/** A stored choice is valid if well formed and younger than 12 months. */
export function parseStoredConsent(raw: string | null, now: number = Date.now()): StoredConsent | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as StoredConsent;
    if ((o.v === 'granted' || o.v === 'denied') && typeof o.t === 'number' && now - o.t < CONSENT_MAX_AGE_MS) {
      return o;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Inline script for <head>. Must run before gtag('config').
 * Kept as plain ES5 so it can run before any bundle loads.
 */
export const consentBootstrapScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
(function(){
  var R = ${JSON.stringify(CONSENT_REGIONS)};
  var m = document.cookie.match(/(?:^|;\\s*)${COUNTRY_COOKIE}=([A-Za-z]{2})(?:;|$)/);
  var cc = m ? m[1].toUpperCase() : null;
  var tz = null;
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch (e) {}
  var needs = cc ? R.indexOf(cc) !== -1 : (!!tz && /^Europe\\//.test(tz));
  window.__ilConsentRequired = needs;
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: needs ? 'denied' : 'granted',
    wait_for_update: 500
  });
  // Safety net: Google's own IP-based region check for the same countries.
  gtag('consent', 'default', { analytics_storage: 'denied', region: R });
  try {
    var s = JSON.parse(localStorage.getItem('${CONSENT_STORAGE_KEY}') || 'null');
    if (s && (s.v === 'granted' || s.v === 'denied') && Date.now() - s.t < ${CONSENT_MAX_AGE_MS}) {
      window.__ilConsent = s.v;
      gtag('consent', 'update', { analytics_storage: s.v });
    }
  } catch (e) {}
  gtag('set', 'ads_data_redaction', true);
})();
gtag('js', new Date());
gtag('config', 'G-1KKR1BB7GW');
`;
