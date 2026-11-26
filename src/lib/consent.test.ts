import { describe, expect, it } from 'vitest';
import vm from 'node:vm';
import {
  CONSENT_MAX_AGE_MS,
  consentBootstrapScript,
  countryFromCookie,
  needsConsent,
  parseStoredConsent,
} from './consent';

describe('needsConsent', () => {
  it('asks EEA, UK and Swiss visitors', () => {
    for (const c of ['ES', 'DE', 'GB', 'CH', 'NO', 'it']) expect(needsConsent(c, null)).toBe(true);
  });
  it('does not ask US, Israel or Canada', () => {
    for (const c of ['US', 'IL', 'CA']) expect(needsConsent(c, 'Europe/Madrid')).toBe(false);
  });
  it('falls back to a Europe/* time zone when the country is unknown', () => {
    expect(needsConsent(null, 'Europe/Madrid')).toBe(true);
    expect(needsConsent(null, 'America/New_York')).toBe(false);
    expect(needsConsent(null, null)).toBe(false);
  });
});

describe('cookie and storage parsing', () => {
  it('reads the country cookie', () => {
    expect(countryFromCookie('a=1; il_cc=ES; b=2')).toBe('ES');
    expect(countryFromCookie('il_cc=gb')).toBe('GB');
    expect(countryFromCookie('xil_cc=ES')).toBeNull();
  });
  it('expires a stored choice after 12 months', () => {
    const now = 1_800_000_000_000;
    expect(parseStoredConsent(JSON.stringify({ v: 'granted', t: now - 1000 }), now)?.v).toBe('granted');
    expect(parseStoredConsent(JSON.stringify({ v: 'granted', t: now - CONSENT_MAX_AGE_MS - 1 }), now)).toBeNull();
    expect(parseStoredConsent('{bad', now)).toBeNull();
    expect(parseStoredConsent(JSON.stringify({ v: 'maybe', t: now }), now)).toBeNull();
  });
});

function runBootstrap(cookie: string, stored: string | null, tz = 'America/New_York') {
  const window: Record<string, unknown> = {};
  const ctx = {
    window,
    document: { cookie },
    localStorage: { getItem: () => stored },
    Intl: { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: tz }) }) },
    Date,
    JSON,
  } as Record<string, unknown>;
  ctx.dataLayer = undefined;
  vm.createContext(ctx);
  // Inside the script `window` and globals are the same object in a browser.
  vm.runInContext('var window = this;' + consentBootstrapScript, ctx);
  const dl = (ctx.dataLayer as IArguments[]).map((a) => Array.from(a));
  return { dl, required: ctx.__ilConsentRequired };
}

describe('bootstrap script', () => {
  it('denies analytics by default for a Spanish visitor and sets consent before config', () => {
    const { dl, required } = runBootstrap('il_cc=ES', null);
    expect(required).toBe(true);
    const first = dl[0];
    expect(first[0]).toBe('consent');
    expect(first[1]).toBe('default');
    expect(first[2]).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied' });
    const iConfig = dl.findIndex((a) => a[0] === 'config');
    const iDefault = dl.findIndex((a) => a[0] === 'consent' && a[1] === 'default');
    expect(iDefault).toBeLessThan(iConfig);
  });

  it('grants analytics by default for a US visitor, ads stay denied', () => {
    const { dl, required } = runBootstrap('il_cc=US', null);
    expect(required).toBe(false);
    expect(dl[0][2]).toMatchObject({ analytics_storage: 'granted', ad_storage: 'denied' });
  });

  it('restores an earlier accept before config', () => {
    const { dl } = runBootstrap('il_cc=DE', JSON.stringify({ v: 'granted', t: Date.now() }));
    const iUpdate = dl.findIndex((a) => a[0] === 'consent' && a[1] === 'update');
    const iConfig = dl.findIndex((a) => a[0] === 'config');
    expect(dl[iUpdate][2]).toEqual({ analytics_storage: 'granted' });
    expect(iUpdate).toBeLessThan(iConfig);
  });
});
