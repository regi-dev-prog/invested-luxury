import { describe, expect, it } from 'vitest';
import {
  normalizeRetailer,
  resolveLink,
  retailerFromUrl,
  retailerLabelFromUrl,
  slugFromPath,
  withSubIds,
} from './affiliateLinks';

const SITE = 'investedluxury.com';
const r = (u: string, dataset: Record<string, string> = {}) => resolveLink(new URL(u), { dataset }, SITE);

const CJ_MYT =
  'https://www.anrdoezrs.net/click-101713247-15513564?sid=il-cartier-santos&url=https%3A%2F%2Fwww.mytheresa.com%2Fus%2Fen%2Fwomen%2Fx-p01';

describe('retailer resolution', () => {
  it('reads the merchant from a CJ deep link instead of cj_unknown', () => {
    expect(r(CJ_MYT)).toEqual({
      event: 'affiliate_link_click',
      network: 'cj',
      retailer: 'mytheresa',
      destination_domain: 'mytheresa.com',
    });
  });

  it('keeps cj_unknown only when the CJ link has no deep-link target', () => {
    expect(r('https://www.anrdoezrs.net/click-101713247-15513564')?.retailer).toBe('cj_unknown');
  });

  it('labels villiers.ai as a Villiers affiliate click', () => {
    expect(r('https://www.villiers.ai/?id=5TVVOU&from=LTN&to=NCE')).toMatchObject({
      event: 'affiliate_link_click',
      network: 'villiers',
      retailer: 'villiers',
    });
  });

  it('labels Partnerize links and reads their destination', () => {
    const u = 'https://prf.hn/click/camref:1100lABC/destination:https%3A%2F%2Fwww.ssense.com%2Fen-us';
    expect(r(u)).toMatchObject({ network: 'partnerize', retailer: 'ssense', destination_domain: 'ssense.com' });
  });

  it('never reports UI text as a retailer', () => {
    expect(normalizeRetailer('Shop Now')).toBe('');
    expect(r('https://www.anrdoezrs.net/click-1-2', { retailer: 'Shop Now' })?.retailer).toBe('cj_unknown');
  });

  it('normalizes case and punctuation so one merchant is one row', () => {
    expect(normalizeRetailer('Mytheresa')).toBe(normalizeRetailer('mytheresa'));
    expect(normalizeRetailer('Tiffany & Co.')).toBe('tiffany-co');
    expect(normalizeRetailer('Polène')).toBe('polene');
  });

  it('gives a display label for buttons when Sanity has no retailer name', () => {
    expect(retailerLabelFromUrl(CJ_MYT)).toBe('Mytheresa');
    expect(retailerLabelFromUrl('https://www.awin1.com/cread.php?awinmid=101701&awinaffid=2829242')).toBe('Clearlight');
    expect(retailerFromUrl('https://pubmed.ncbi.nlm.nih.gov/1/')).toBe('');
  });
});

describe('SubIDs', () => {
  it('CJ: replaces sid with page_placement', () => {
    const out = new URL(withSubIds(CJ_MYT, 'best-cashmere-investment-guide', 'quick-buy-primary')!);
    expect(out.searchParams.get('sid')).toBe('il-best-cashmere-investment-guide_quick-buy-primary');
    expect(out.searchParams.get('url')).toContain('mytheresa.com');
  });

  it('CJ: stays within 64 characters', () => {
    const out = new URL(withSubIds(CJ_MYT, 'a'.repeat(80), 'inline-body')!);
    expect(out.searchParams.get('sid')!.length).toBeLessThanOrEqual(64);
  });

  it('Awin: clickref = page, clickref2 = placement', () => {
    const out = new URL(withSubIds('https://www.awin1.com/cread.php?awinmid=101701&awinaffid=2829242', 'red-light-tower', 'inline-body')!);
    expect(out.searchParams.get('clickref')).toBe('il-red-light-tower');
    expect(out.searchParams.get('clickref2')).toBe('inline-body');
  });

  it('Impact: sets subId1 and keeps a hand-set subId2', () => {
    const out = new URL(
      withSubIds('https://allu-official.pxf.io/enz4KO?u=x&subId1=chanel-bags-guide&subId2=body-p3', 'chanel-bags-guide', 'inline-body')!,
    );
    expect(out.searchParams.get('subId1')).toBe('il-chanel-bags-guide');
    expect(out.searchParams.get('subId2')).toBe('body-p3');
  });

  it('Villiers: adds aref only to affiliate links and keeps a hand-set one', () => {
    const a = new URL(withSubIds('https://www.villiers.ai/?id=5TVVOU', 'how-much-to-hire-a-private-jet', 'inline-body')!);
    expect(a.searchParams.get('aref')).toBe('il-how-much-to-hire-a-private-jet_inline-body');
    const b = new URL(withSubIds('https://www.villiers.ai/?id=5TVVOU&aref=il-emptyleg-us-p3', 'x', 'inline-body')!);
    expect(b.searchParams.get('aref')).toBe('il-emptyleg-us-p3');
    expect(withSubIds('https://villiers.ai/', 'x', 'inline-body')).toBeNull();
  });

  it('Partnerize: inserts a pubref segment after camref', () => {
    const out = withSubIds('https://prf.hn/click/camref:1100lABC/destination:https%3A%2F%2Fssense.com', 'the-row-sale', 'inline-body')!;
    expect(out).toContain('/camref:1100lABC/pubref:il-the-row-sale_inline-body/destination:');
  });

  it('leaves non-affiliate links alone', () => {
    expect(withSubIds('https://www.cartier.com/en-us/', 'x', 'inline-body')).toBeNull();
  });

  it('uses "home" for the homepage', () => {
    expect(slugFromPath('/')).toBe('home');
    expect(slugFromPath('/fashion/bags/ysl-tote')).toBe('ysl-tote');
  });
});
