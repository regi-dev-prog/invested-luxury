import { beforeAll, describe, expect, it } from 'vitest';
import { resolveLink } from './OutboundClickTracker';

const anchor = (dataset: Record<string, string> = {}) =>
  ({ dataset }) as unknown as HTMLAnchorElement;

beforeAll(() => {
  // resolveLink only reads window.location.hostname.
  (globalThis as unknown as { window: unknown }).window = {
    location: { hostname: 'investedluxury.com' },
  };
});

describe('resolveLink: impact.com links', () => {
  it('labels a Mind Lab Pro deep link as an impact affiliate click', () => {
    const url = new URL(
      'https://mindlabpro.pxf.io/n4QLdA?u=https%3A%2F%2Fwww.mindlabpro.com%2Fproducts%2Fmind-lab-pro&subId1=il-mind-lab-pro-review',
    );
    expect(resolveLink(url, anchor())).toEqual({
      event: 'affiliate_link_click',
      network: 'impact',
      retailer: 'performancelab',
      destination_domain: 'mindlabpro.com',
    });
  });

  it('labels a Performance Lab store deep link as performancelab', () => {
    const url = new URL(
      'https://performancelabltd.pxf.io/bkoaZm?u=https%3A%2F%2Fwww.performancelab.com%2Fproducts%2Fomega-3',
    );
    expect(resolveLink(url, anchor())).toEqual({
      event: 'affiliate_link_click',
      network: 'impact',
      retailer: 'performancelab',
      destination_domain: 'performancelab.com',
    });
  });

  it('falls back to the tracking host when the link has no deep-link target', () => {
    const url = new URL('https://mindlabpro.pxf.io/n4QLdA');
    expect(resolveLink(url, anchor())?.destination_domain).toBe('mindlabpro.pxf.io');
  });

  it('still counts an unlisted impact subdomain as an affiliate click', () => {
    const url = new URL('https://somebrand.pxf.io/abc123');
    expect(resolveLink(url, anchor())).toMatchObject({
      event: 'affiliate_link_click',
      network: 'impact',
      retailer: 'impact_unknown',
    });
  });

  it('lets data-il-retailer override the host mapping', () => {
    const url = new URL('https://somebrand.pxf.io/abc123');
    expect(resolveLink(url, anchor({ ilRetailer: 'performancelab' }))?.retailer).toBe(
      'performancelab',
    );
  });
});

describe('resolveLink: existing networks are unchanged', () => {
  it('resolves an Awin link by merchant id', () => {
    const url = new URL('https://www.awin1.com/cread.php?awinmid=92667&awinaffid=1&ued=https%3A%2F%2Fwww.sailo.com%2F');
    expect(resolveLink(url, anchor())).toMatchObject({ network: 'awin', retailer: 'sailo' });
  });

  it('treats an unknown external host as a plain outbound click', () => {
    const url = new URL('https://pubmed.ncbi.nlm.nih.gov/37194920/');
    expect(resolveLink(url, anchor())).toMatchObject({ event: 'outbound_click', network: 'none' });
  });
});
