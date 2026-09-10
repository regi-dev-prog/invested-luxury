import { describe, it, expect } from 'vitest'
import { verifyPrice } from './verifyPrice'

const URL = 'https://shop.example.com/products/andiamo'

/** A fetch stub: serves robots.txt then a page, all in-memory. No network. */
function makeFetch(
  pageHtml: string,
  opts: { robots?: string; pageStatus?: number; hangPage?: boolean } = {},
): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.endsWith('/robots.txt')) {
      return new Response(opts.robots ?? '', { status: 200 })
    }
    if (opts.hangPage) {
      return await new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
        )
      })
    }
    return new Response(pageHtml, {
      status: opts.pageStatus ?? 200,
      headers: { 'content-type': 'text/html' },
    })
  }) as typeof fetch
}

function jsonLdPage(price: number | string): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Andiamo',
    offers: { '@type': 'Offer', price, priceCurrency: 'USD' },
  }
  return `<html><head><script type="application/ld+json">${JSON.stringify(data)}</script></head><body></body></html>`
}

function ogPage(amount: number | string): string {
  return `<html><head><meta property="product:price:amount" content="${amount}"><meta property="product:price:currency" content="USD"></head><body></body></html>`
}

describe('verifyPrice', () => {
  it('verifies via JSON-LD when the price matches', async () => {
    const r = await verifyPrice({ sourceUrl: URL, price: 4500 }, { fetchImpl: makeFetch(jsonLdPage('4500.00')) })
    expect(r.status).toBe('verified')
    if (r.status !== 'failed') {
      expect(r.sourcePrice).toBe(4500)
      expect(r.method).toBe('json-ld')
    }
  })

  it('verifies via Open Graph when there is no JSON-LD', async () => {
    const r = await verifyPrice({ sourceUrl: URL, price: 4500 }, { fetchImpl: makeFetch(ogPage('4500')) })
    expect(r.status).toBe('verified')
    if (r.status !== 'failed') expect(r.method).toBe('og')
  })

  it('prefers JSON-LD over Open Graph', async () => {
    const html = jsonLdPage('4500').replace('</head>', '<meta property="product:price:amount" content="9999"></head>')
    const r = await verifyPrice({ sourceUrl: URL, price: 4500 }, { fetchImpl: makeFetch(html) })
    expect(r.status).toBe('verified')
    if (r.status !== 'failed') expect(r.method).toBe('json-ld')
  })

  it('treats a price within 1% as verified', async () => {
    const r = await verifyPrice({ sourceUrl: URL, price: 4500 }, { fetchImpl: makeFetch(jsonLdPage('4535')) }) // +0.78%
    expect(r.status).toBe('verified')
  })

  it('reports changed with the new value when the price differs', async () => {
    const r = await verifyPrice({ sourceUrl: URL, price: 4500 }, { fetchImpl: makeFetch(jsonLdPage('5200')) })
    expect(r.status).toBe('changed')
    if (r.status === 'changed') {
      expect(r.sourcePrice).toBe(5200)
      expect(r.expectedPrice).toBe(4500)
    }
  })

  it('fails explicitly when neither JSON-LD nor OG price is present', async () => {
    const html = '<html><head><title>Andiamo</title></head><body>Price on request</body></html>'
    const r = await verifyPrice({ sourceUrl: URL, price: 4500 }, { fetchImpl: makeFetch(html) })
    expect(r.status).toBe('failed')
    if (r.status === 'failed') expect(r.reason).toMatch(/No JSON-LD Product offer or Open Graph/i)
  })

  it('fails with Timeout when the page does not respond in time', async () => {
    const r = await verifyPrice(
      { sourceUrl: URL, price: 4500 },
      { fetchImpl: makeFetch('', { hangPage: true }), timeoutMs: 25 },
    )
    expect(r.status).toBe('failed')
    if (r.status === 'failed') expect(r.reason).toBe('Timeout')
  })

  it('fails (no bypass) when robots.txt disallows the path', async () => {
    const robots = 'User-agent: *\nDisallow: /products/'
    const r = await verifyPrice({ sourceUrl: URL, price: 4500 }, { fetchImpl: makeFetch(jsonLdPage('4500'), { robots }) })
    expect(r.status).toBe('failed')
    if (r.status === 'failed') expect(r.reason).toBe('Blocked by robots.txt')
  })

  it('fails when the product has no sourceUrl', async () => {
    const r = await verifyPrice({ sourceUrl: null, price: 4500 })
    expect(r.status).toBe('failed')
    if (r.status === 'failed') expect(r.reason).toMatch(/sourceUrl/i)
  })

  it('parses JSON-LD nested in an @graph array', async () => {
    const data = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'Shop' },
        { '@type': ['Product'], name: 'Andiamo', offers: { price: '4500' } },
      ],
    }
    const html = `<html><head><script type="application/ld+json">${JSON.stringify(data)}</script></head></html>`
    const r = await verifyPrice({ sourceUrl: URL, price: 4500 }, { fetchImpl: makeFetch(html) })
    expect(r.status).toBe('verified')
  })
})
