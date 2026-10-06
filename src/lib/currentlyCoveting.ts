// lib/currentlyCoveting.ts
// Selection logic for the homepage "Currently Coveting" strip.
//
// Rules:
//  1. Rotates every week (Monday 00:00 UTC). No cron needed: the week is
//     computed at render time and the homepage already revalidates every 60s.
//  2. Every product shown has a real tracked affiliate link (CJ or AWIN
//     click domains). Plain retailer/brand URLs do not qualify, and the card
//     always links to the tracked URL.
//  3. Priority to the most expensive products: only the top POOL_SIZE
//     eligible products by USD-normalised price enter the rotation, and each
//     week's six are displayed most expensive first.
//  4. Always an image: the product must have a Sanity-hosted image asset
//     (cdn.sanity.io is the only host next/image is configured for).
//
// Rotation: the pool is shuffled once per cycle (seeded by the cycle number)
// and walked six at a time, so nothing repeats until the whole pool has been
// shown. Brand diversity: at most one product per brand in a given week
// (relaxed to two only if the pool can't fill the week otherwise).

import { client } from '@/sanity/lib/client'

// Tracked affiliate click domains (CJ Affiliate + AWIN).
const AFFILIATE_HOST_RE =
  /(^|\.)(anrdoezrs\.net|dpbolvw\.net|tkqlhce\.com|jdoqocy\.com|kqzyfj\.com|awin1\.com)$/i

// Ranking-only FX approximation. Displayed prices keep their own currency.
const TO_USD: Record<string, number> = { USD: 1, EUR: 1.08, GBP: 1.27 }

const PER_WEEK = 6
const POOL_SIZE = 30 // 5-week cycle at 6 per week
const MAX_PER_BRAND_IN_POOL = 3
const WEEK_MS = 7 * 24 * 60 * 60 * 1000
// 1970-01-05 was a Monday, so weeks start Monday 00:00 UTC.
const MONDAY_EPOCH = Date.UTC(1970, 0, 5)

export interface CovetingProduct {
  _id: string
  name: string
  price: number
  currency?: string
  slug?: string
  brand?: string | null
  image: any
  affiliateUrl: string
}

interface RawProduct extends Omit<CovetingProduct, 'affiliateUrl'> {
  links?: { url?: string; isPrimary?: boolean; inStock?: boolean }[]
}

const isTracked = (url?: string) => {
  if (!url) return false
  try {
    return AFFILIATE_HOST_RE.test(new URL(url).hostname)
  } catch {
    return false
  }
}

const usdPrice = (p: { price: number; currency?: string }) =>
  p.price * (TO_USD[p.currency || 'USD'] ?? 1)

// Small deterministic PRNG (mulberry32) so a given week always renders the
// same six products on every server and every revalidation.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr]
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Split a shuffled cycle into weekly groups, keeping brands unique per week.
function packWeeks(items: CovetingProduct[], perWeek: number): CovetingProduct[][] {
  const remaining = [...items]
  const weeks: CovetingProduct[][] = []
  while (remaining.length) {
    const week: CovetingProduct[] = []
    for (const maxPerBrand of [1, 2, Infinity]) {
      for (let i = 0; i < remaining.length && week.length < perWeek; ) {
        const brand = remaining[i].brand || remaining[i]._id
        const used = week.filter((p) => (p.brand || p._id) === brand).length
        if (used < maxPerBrand) week.push(...remaining.splice(i, 1))
        else i++
      }
      if (week.length >= perWeek) break
    }
    weeks.push(week)
  }
  return weeks
}

export function weekIndex(now = new Date()): number {
  return Math.floor((now.getTime() - MONDAY_EPOCH) / WEEK_MS)
}

export async function getCurrentlyCoveting(now = new Date()): Promise<CovetingProduct[]> {
  const raw: RawProduct[] =
    (await client.fetch(`*[_type == "product"
      && (!defined(hidden) || hidden == false)
      && price > 0
      && defined(images[0].asset)
      && count(affiliateLinks[defined(url)]) > 0
    ]{
      _id,
      name,
      price,
      currency,
      "slug": slug.current,
      "brand": brand->name,
      "image": images[0],
      "links": affiliateLinks[]{ url, isPrimary, inStock }
    }`)) ?? []

  // Keep only products with a tracked, in-stock affiliate link; use that URL.
  const eligible: CovetingProduct[] = []
  for (const p of raw) {
    const tracked = (p.links || []).filter((l) => isTracked(l.url) && l.inStock !== false)
    if (!tracked.length) continue
    const best = tracked.find((l) => l.isPrimary) || tracked[0]
    const { links, ...rest } = p
    eligible.push({ ...rest, affiliateUrl: best.url! })
  }

  // Premium pool: most expensive first (ties broken by _id for stability),
  // capped per brand so one expensive brand can't take over the rotation.
  eligible.sort((a, b) => usdPrice(b) - usdPrice(a) || a._id.localeCompare(b._id))
  const pool: CovetingProduct[] = []
  const brandCount: Record<string, number> = {}
  for (const p of eligible) {
    if (pool.length >= POOL_SIZE) break
    const brand = p.brand || p._id
    if ((brandCount[brand] ?? 0) >= MAX_PER_BRAND_IN_POOL) continue
    brandCount[brand] = (brandCount[brand] ?? 0) + 1
    pool.push(p)
  }
  if (!pool.length) return []

  const week = weekIndex(now)
  const weeksPerCycle = Math.max(1, Math.ceil(pool.length / PER_WEEK))
  const cycle = Math.floor(week / weeksPerCycle)
  const slot = week % weeksPerCycle

  const weeks = packWeeks(seededShuffle(pool, cycle + 1), PER_WEEK)
  let picks = weeks[slot] ?? weeks[0]

  // Last week of a cycle may be short; top it up from the rest of the pool.
  if (picks.length < PER_WEEK) {
    const ids = new Set(picks.map((p) => p._id))
    picks = [...picks, ...pool.filter((p) => !ids.has(p._id))].slice(0, PER_WEEK)
  }

  return [...picks].sort((a, b) => usdPrice(b) - usdPrice(a))
}
