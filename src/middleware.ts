import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================
// BOT PROTECTION — InvestedLuxury.com
// ============================================================

// Known bad bot user-agents
const BOT_UA_PATTERNS = [
  // Headless browsers
  /headlesschrome/i,
  /phantomjs/i,
  /slimerjs/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /webdriver/i,

  // Spam/scraper bots
  /semrushbot/i,
  /dotbot/i,
  /mj12bot/i,
  /blexbot/i,
  /dataforseo/i,
  /bytespider/i,
  /petalbot/i,
  /sogou/i,
  /yandexbot/i,

  // Generic patterns
  /bot(?!tle)/i,
  /crawl/i,
  /spider/i,
  /scrape/i,
  /wget/i,
  /curl\//i,
  /python-requests/i,
  /httpx/i,
  /go-http-client/i,
  /java\//i,
  /libwww/i,
  /lwp-trivial/i,
]

// Bots to ALLOW through (search engines, social, your tools)
const ALLOWED_BOTS = [
  /googlebot/i,
  /bingbot/i,
  /google-inspectiontool/i,
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
  /ahrefsbot/i,        // You use Ahrefs — keep this allowed
]

// Rate limiting (in-memory, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000  // 1 minute
const RATE_LIMIT_MAX = 30                // 30 requests/min per IP

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

// Data center IP prefixes (bots commonly run from these)
const DATACENTER_PREFIXES = [
  '34.', '35.',                // Google Cloud
  '52.', '54.', '18.',        // AWS
  '137.184', '138.197',       // DigitalOcean
  '157.245', '159.65',        // DigitalOcean
  '167.71', '167.172',        // DigitalOcean
  '178.128', '178.62',        // DigitalOcean
  '206.189',                  // DigitalOcean
  '64.225',                   // DigitalOcean
]

function isDataCenterIP(ip: string): boolean {
  return DATACENTER_PREFIXES.some(prefix => ip.startsWith(prefix))
}

// ============================================================
// MIDDLEWARE
// ============================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

  // Allow known good bots
  if (ua && ALLOWED_BOTS.some(pattern => pattern.test(ua))) {
    if (pathname.startsWith('/article/')) {
      return handleArticleRedirect(request, pathname)
    }
    return NextResponse.next()
  }

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

  // Flag data center IPs (soft block — change to 403 if needed)
  if (ip !== 'unknown' && isDataCenterIP(ip)) {
    console.log(`[DATACENTER-IP] ${ip} | ${ua?.slice(0, 80)}`)
    // Uncomment next line for hard block:
    // return new NextResponse('Access Denied', { status: 403 })
  }

  // Handle /article/[slug] redirects (existing logic)
  if (pathname.startsWith('/article/')) {
    return handleArticleRedirect(request, pathname)
  }

  return NextResponse.next()
}

// ============================================================
// ARTICLE REDIRECT (preserved from original middleware)
// ============================================================

async function handleArticleRedirect(request: NextRequest, pathname: string) {
  const slug = pathname.replace('/article/', '')

  if (!slug) {
    return NextResponse.next()
  }

  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

    const query = encodeURIComponent(`*[_type == "article" && slug.current == "${slug}"][0]{
      "categorySlug": categories[0]->slug.current,
      "parentCategory": categories[0]->parentCategory
    }`)

    const response = await fetch(
      `https://${projectId}.api.sanity.io/v2023-05-03/data/query/${dataset}?query=${query}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      return NextResponse.next()
    }

    const data = await response.json()
    const article = data.result

    if (article?.parentCategory && article?.categorySlug) {
      const newUrl = `/${article.parentCategory}/${article.categorySlug}/${slug}`
      return NextResponse.redirect(new URL(newUrl, request.url), 301)
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware redirect error:', error)
    return NextResponse.next()
  }
}

// ============================================================
// MATCHER
// ============================================================

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
