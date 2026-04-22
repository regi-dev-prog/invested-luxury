import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================
// BOT PROTECTION + CANONICAL URL ENFORCEMENT — InvestedLuxury.com
// ============================================================
// CHANGES (April 2026):
// 1. Added www → non-www redirect (before all other logic)
// 2. Added /*/undefined/* redirect to canonical path
// 3. Improved /article/[slug] redirect robustness
// 4. Extracted Sanity lookup into shared helper
// ============================================================

// Known bad bot user-agents
const BOT_UA_PATTERNS = [
  /headlesschrome/i,
  /phantomjs/i,
  /slimerjs/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /webdriver/i,
  /semrushbot/i,
  /dotbot/i,
  /mj12bot/i,
  /blexbot/i,
  /dataforseo/i,
  /bytespider/i,
  /petalbot/i,
  /sogou/i,
  /zoominfobot/i,
  /gptbot/i,
  /claudebot/i,
  /ccbot/i,
  /wget/i,
  /curl\//i,
  /python-requests/i,
  /httpx/i,
  /go-http-client/i,
  /java\//i,
  /libwww/i,
  /lwp-trivial/i,
  /scrapy/i,
  /node-fetch/i,
]

// Bots to ALLOW through
const ALLOWED_BOTS = [
  /googlebot/i,
  /bingbot/i,
  /google-inspectiontool/i,
  /google-safety/i,
  /apis-google/i,
  /mediapartners-google/i,
  /adsbot-google/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /pinterestbot/i,
  /slackbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /vercel/i,
  /ahrefs/i,
  /duckduckbot/i,
  /applebot/i,
  /yandex/i,
]

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 30

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  record.count++
  return record.count > RATE_LIMIT_MAX
}

function hasEmptyOrSuspiciousUA(ua: string | null): boolean {
  if (!ua || ua.trim() === '') return true
  if (ua.length < 10) return true
  if (ua === 'Mozilla/5.0') return true
  if (/^Mozilla\/5\.0 \(\)/.test(ua)) return true
  return false
}

const DATACENTER_PREFIXES = [
  '34.', '35.',
  '52.', '54.', '18.',
  '137.184', '138.197',
  '157.245', '159.65',
  '167.71', '167.172',
  '178.128', '178.62',
  '206.189',
  '64.225',
]

function isDataCenterIP(ip: string): boolean {
  return DATACENTER_PREFIXES.some(prefix => ip.startsWith(prefix))
}

// ============================================================
// SANITY LOOKUP — Resolve article's canonical path
// ============================================================

interface CanonicalResult {
  categorySlug: string | null
  parentCategory: string | null
}

async function lookupCanonicalPath(slug: string): Promise<CanonicalResult | null> {
  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

    const query = encodeURIComponent(
      `*[_type == "article" && slug.current == "${slug}" && status == "published"][0]{
        "categorySlug": categories[0]->slug.current,
        "parentCategory": categories[0]->parentCategory
      }`
    )

    const response = await fetch(
      `https://${projectId}.api.sanity.io/v2023-05-03/data/query/${dataset}?query=${query}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data.result || null
  } catch (error) {
    console.error('Middleware Sanity lookup error:', error)
    return null
  }
}

// ============================================================
// MIDDLEWARE
// ============================================================

export async function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl

  // ============================================================
  // 1. WWW → NON-WWW REDIRECT (before everything else)
  // ============================================================
  if (host.startsWith('www.')) {
    const newUrl = request.nextUrl.clone()
    newUrl.host = host.replace('www.', '')
    return NextResponse.redirect(newUrl, 301)
  }

  // Skip static assets and studio
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|woff2?)$/)
  ) {
    return NextResponse.next()
  }

  const ua = request.headers.get('user-agent')
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  // Allow known good bots — but still apply URL redirects
  const isAllowedBot = ua && ALLOWED_BOTS.some(pattern => pattern.test(ua))

  if (!isAllowedBot) {
    // Block known bad bots
    if (ua && BOT_UA_PATTERNS.some(pattern => pattern.test(ua))) {
      console.log(`[BLOCKED-UA] ${ip} | ${ua?.slice(0, 80)}`)
      return new NextResponse('Access Denied', { status: 403 })
    }

    // Block empty/suspicious user agents
    if (hasEmptyOrSuspiciousUA(ua)) {
      console.log(`[BLOCKED-EMPTY-UA] ${ip} | UA: "${ua}"`)
      return new NextResponse('Access Denied', { status: 403 })
    }

    // Rate limiting
    if (ip !== 'unknown' && isRateLimited(ip)) {
      console.log(`[RATE-LIMITED] ${ip}`)
      return new NextResponse('Too Many Requests', { status: 429 })
    }

    // Flag data center IPs
    if (ip !== 'unknown' && isDataCenterIP(ip)) {
      console.log(`[DATACENTER-IP] ${ip} | ${ua?.slice(0, 80)}`)
    }
  }

  // ============================================================
  // 2. URL REDIRECTS (apply to all traffic including bots)
  // ============================================================

  // --- /article/[slug] → canonical path ---
  if (pathname.startsWith('/article/')) {
    const slug = pathname.replace('/article/', '').replace(/\/$/, '')
    if (slug) {
      return await redirectToCanonical(request, slug)
    }
  }

  // --- /*/undefined/* → canonical path ---
  if (pathname.includes('/undefined/')) {
    // Extract the slug (last segment)
    const segments = pathname.split('/').filter(Boolean)
    const slug = segments[segments.length - 1]
    if (slug && slug !== 'undefined') {
      return await redirectToCanonical(request, slug)
    }
  }

  return NextResponse.next()
}

// ============================================================
// REDIRECT TO CANONICAL PATH
// ============================================================

async function redirectToCanonical(request: NextRequest, slug: string) {
  const result = await lookupCanonicalPath(slug)

  if (result?.parentCategory && result?.categorySlug) {
    // Only redirect if parentCategory is a valid string (not an object/reference)
    if (typeof result.parentCategory === 'string' && typeof result.categorySlug === 'string') {
      const newUrl = `/${result.parentCategory}/${result.categorySlug}/${slug}`
      return NextResponse.redirect(new URL(newUrl, request.url), 301)
    }
  }

  // If lookup fails, let the page handle it (will 404 naturally)
  return NextResponse.next()
}

// ============================================================
// MATCHER
// ============================================================

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
