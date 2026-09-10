/**
 * Runtime price verification for the newsletter engine. Runs on the ONE
 * selected product, once per issue, to confirm the price stored in Sanity still
 * matches the merchant before the issue ships.
 *
 * Data-pure: it fetches and reads, but never writes to Sanity. Persisting the
 * outcome (and priceLastVerified) is a separate engine step. `fetchImpl` is
 * injectable so this is fully testable without real network access.
 *
 * Extraction is structured-only — JSON-LD Product offers, then Open Graph
 * product:price:amount. It never guesses a price from visible text or scrapes
 * arbitrary HTML: a page without structured price data is an explicit failure.
 */

export interface PriceVerificationInput {
  /** Merchant product page — NOT the affiliate link. */
  sourceUrl?: string | null
  /** The price currently stored in Sanity, to compare against. */
  price?: number | null
}

export type PriceVerification =
  | {status: 'verified'; url: string; sourcePrice: number; expectedPrice: number; method: 'json-ld' | 'og'}
  | {status: 'changed'; url: string; sourcePrice: number; expectedPrice: number; method: 'json-ld' | 'og'}
  | {status: 'failed'; reason: string; url?: string}

export interface VerifyPriceOptions {
  fetchImpl?: typeof fetch
  timeoutMs?: number
  userAgent?: string
  /** Max relative deviation still counted as verified. Default 0.01 (1%). */
  tolerance?: number
  /** Fetch and honour robots.txt before the page. Default true. */
  respectRobots?: boolean
}

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_TOLERANCE = 0.01

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

/** Coerce a JSON-LD / OG price (number or string like "1,299.00") to a number. */
function toPrice(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.]/g, '')
    if (cleaned === '' || cleaned === '.') return null
    const n = Number.parseFloat(cleaned)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function priceFromOffers(offers: unknown): number | null {
  const list = Array.isArray(offers) ? offers : [offers]
  for (const entry of list) {
    const offer = asRecord(entry)
    if (!offer) continue
    const direct = toPrice(offer.price)
    if (direct !== null) return direct
    const spec = asRecord(offer.priceSpecification)
    if (spec) {
      const specPrice = toPrice(spec.price)
      if (specPrice !== null) return specPrice
    }
  }
  return null
}

function isProductType(type: unknown): boolean {
  if (type === 'Product') return true
  return Array.isArray(type) && type.includes('Product')
}

/** Depth-first search for a Product node's offer price within a JSON-LD tree. */
function findProductPrice(node: unknown): number | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findProductPrice(child)
      if (found !== null) return found
    }
    return null
  }
  const record = asRecord(node)
  if (!record) return null

  if (isProductType(record['@type'])) {
    const price = priceFromOffers(record.offers)
    if (price !== null) return price
  }
  for (const key of Object.keys(record)) {
    const found = findProductPrice(record[key])
    if (found !== null) return found
  }
  return null
}

function extractJsonLdPrice(html: string): number | null {
  const scripts = Array.from(
    html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  )
  for (const match of scripts) {
    let parsed: unknown
    try {
      parsed = JSON.parse(match[1].trim())
    } catch {
      continue
    }
    const price = findProductPrice(parsed)
    if (price !== null) return price
  }
  return null
}

function extractOgPrice(html: string): number | null {
  const metas = Array.from(html.matchAll(/<meta\b[^>]*>/gi))
  for (const match of metas) {
    const tag = match[0]
    const prop = /(?:property|name)=["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase()
    if (prop === 'product:price:amount' || prop === 'og:price:amount') {
      const content = /content=["']([^"']*)["']/i.exec(tag)?.[1]
      const price = toPrice(content)
      if (price !== null) return price
    }
  }
  return null
}

/** Minimal, conservative robots.txt check for the given path and UA. */
function isAllowedByRobots(robotsTxt: string, pathname: string, userAgent: string): boolean {
  const uaLower = userAgent.toLowerCase()
  const groups: Array<{agents: string[]; disallows: string[]}> = []
  let current: {agents: string[]; disallows: string[]} | null = null
  let previousWasAgent = false

  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim()
    if (!line) continue
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim().toLowerCase()
    const value = line.slice(idx + 1).trim()

    if (key === 'user-agent') {
      if (!previousWasAgent || !current) {
        current = {agents: [], disallows: []}
        groups.push(current)
      }
      current.agents.push(value.toLowerCase())
      previousWasAgent = true
    } else if (key === 'disallow' && current) {
      current.disallows.push(value)
      previousWasAgent = false
    } else {
      previousWasAgent = false
    }
  }

  const specific = groups.filter((g) => g.agents.some((a) => a !== '*' && uaLower.includes(a)))
  const wildcard = groups.filter((g) => g.agents.includes('*'))
  const applicable = specific.length ? specific : wildcard

  for (const group of applicable) {
    for (const rule of group.disallows) {
      if (rule !== '' && pathname.startsWith(rule)) return false
    }
  }
  return true
}

async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  url: string,
  userAgent: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetchImpl(url, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    })
  } finally {
    clearTimeout(timer)
  }
}

async function checkRobots(
  fetchImpl: typeof fetch,
  origin: string,
  pathname: string,
  userAgent: string,
  timeoutMs: number,
): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(fetchImpl, `${origin}/robots.txt`, userAgent, timeoutMs)
    if (!res.ok) return true // no robots.txt → allowed
    return isAllowedByRobots(await res.text(), pathname, userAgent)
  } catch {
    return true // robots.txt unreachable → allowed
  }
}

export async function verifyPrice(
  product: PriceVerificationInput,
  options: VerifyPriceOptions = {},
): Promise<PriceVerification> {
  const fetchImpl = options.fetchImpl ?? fetch
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT
  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE
  const respectRobots = options.respectRobots ?? true

  const url = product.sourceUrl
  if (!url) return {status: 'failed', reason: 'No sourceUrl on product'}

  const expectedPrice = product.price
  if (typeof expectedPrice !== 'number' || !Number.isFinite(expectedPrice) || expectedPrice <= 0) {
    return {status: 'failed', reason: 'Product has no price to verify against', url}
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return {status: 'failed', reason: 'Invalid sourceUrl', url}
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {status: 'failed', reason: 'Unsupported URL scheme', url}
  }

  if (respectRobots) {
    const allowed = await checkRobots(fetchImpl, parsed.origin, parsed.pathname, userAgent, timeoutMs)
    if (!allowed) return {status: 'failed', reason: 'Blocked by robots.txt', url}
  }

  let html: string
  try {
    const res = await fetchWithTimeout(fetchImpl, url, userAgent, timeoutMs)
    if (!res.ok) return {status: 'failed', reason: `Merchant returned HTTP ${res.status}`, url}
    html = await res.text()
  } catch (err) {
    const name = err instanceof Error ? err.name : ''
    if (name === 'AbortError') return {status: 'failed', reason: 'Timeout', url}
    const message = err instanceof Error ? err.message : 'unknown error'
    return {status: 'failed', reason: `Fetch error: ${message}`, url}
  }

  let sourcePrice = extractJsonLdPrice(html)
  let method: 'json-ld' | 'og' = 'json-ld'
  if (sourcePrice === null) {
    sourcePrice = extractOgPrice(html)
    method = 'og'
  }
  if (sourcePrice === null) {
    return {status: 'failed', reason: 'No JSON-LD Product offer or Open Graph price found', url}
  }

  const deviation = Math.abs(sourcePrice - expectedPrice) / expectedPrice
  if (deviation <= tolerance) {
    return {status: 'verified', url, sourcePrice, expectedPrice, method}
  }
  return {status: 'changed', url, sourcePrice, expectedPrice, method}
}
