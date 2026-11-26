// =============================================================================
// /api/revalidate — On-demand cache invalidation
// =============================================================================
// Triggers Next.js revalidation of specific paths or tags. Used by:
//   1. Sanity webhook (POST with body) — auto-revalidate when content changes
//   2. Manual curl/fetch (POST or GET with secret query param) — admin tool
//
// Auth, either of:
//   - `secret` query param matching env REVALIDATE_SECRET (manual calls and
//     the GitHub workflows; unchanged)
//   - a valid Sanity webhook signature (header `sanity-webhook-signature`)
//     made with env SANITY_REVALIDATE_SECRET, the Secret set on the Sanity
//     webhook. A separate variable, so REVALIDATE_SECRET never has to change.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

export const dynamic = 'force-dynamic'

async function isAuthorized(req: NextRequest, rawBody: string, secret: string | null) {
  const querySecret = process.env.REVALIDATE_SECRET
  if (querySecret && secret === querySecret) return true

  // Trimmed: a value pasted into Vercel can carry a trailing newline (for
  // example from `openssl rand | pbcopy`), while Sanity strips it.
  const webhookSecret = process.env.SANITY_REVALIDATE_SECRET?.trim()
  const signature = req.headers.get(SIGNATURE_HEADER_NAME)
  if (webhookSecret && signature && rawBody) {
    try {
      return await isValidSignature(rawBody, signature, webhookSecret)
    } catch {
      return false
    }
  }
  return false
}

async function handle(req: NextRequest) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')

  if (!process.env.REVALIDATE_SECRET && !process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'neither REVALIDATE_SECRET nor SANITY_REVALIDATE_SECRET is set on server' },
      { status: 500 }
    )
  }

  // Read the body once, as text: signature checks need the exact bytes.
  const rawBody = req.method === 'POST' ? await req.text() : ''

  if (!(await isAuthorized(req, rawBody, secret))) {
    return NextResponse.json({ ok: false, error: 'invalid secret or signature' }, { status: 401 })
  }

  // Collect what to revalidate
  let paths: string[] = []
  let tags: string[] = []

  // From query string: ?path=/foo&path=/bar OR ?tag=articles
  paths = url.searchParams.getAll('path')
  tags = url.searchParams.getAll('tag')

  // From POST body (Sanity webhook style)
  if (rawBody) {
    try {
      const body = JSON.parse(rawBody)
      if (Array.isArray(body?.paths)) paths = paths.concat(body.paths)
      if (Array.isArray(body?.tags)) tags = tags.concat(body.tags)
      if (typeof body?.path === 'string') paths.push(body.path)
      if (typeof body?.tag === 'string') tags.push(body.tag)
      // Sanity webhook payload includes document slug; build path from it
      if (body?._type === 'article') {
        // We don't know category here without an extra query, so let it
        // bubble up via 'articles' tag instead
        tags.push('articles')
      }
      if (body?._type === 'product' && body?._id) {
        // Products are referenced by articles; revalidate the articles tag
        tags.push('articles')
      }
    } catch {
      // body parse failure isn't fatal — use query string only
    }
  }

  // No fetch in the app is tagged, so revalidateTag('articles') on its own
  // clears nothing. When article content changes (publish, date change,
  // product change), refresh every route instead: the article page, home and
  // category listings, and the sitemap, whose lastmod comes from article
  // dates. Otherwise the sitemap would lag by up to an hour.
  let fullRefresh = false
  if (tags.includes('articles')) {
    fullRefresh = true
    paths.push('/sitemap.xml')
  }

  // Deduplicate
  paths = Array.from(new Set(paths))
  tags = Array.from(new Set(tags))

  // Apply revalidations
  const results: Record<string, string> = {}
  for (const p of paths) {
    try {
      revalidatePath(p)
      results[`path:${p}`] = 'ok'
    } catch (e: any) {
      results[`path:${p}`] = `error: ${e?.message || e}`
    }
  }
  for (const t of tags) {
    try {
      revalidateTag(t)
      results[`tag:${t}`] = 'ok'
    } catch (e: any) {
      results[`tag:${t}`] = `error: ${e?.message || e}`
    }
  }
  if (fullRefresh) {
    try {
      revalidatePath('/', 'layout')
      results['layout:/'] = 'ok'
    } catch (e: any) {
      results['layout:/'] = `error: ${e?.message || e}`
    }
  }

  return NextResponse.json({
    ok: true,
    revalidated: { paths, tags, fullRefresh },
    results,
    timestamp: new Date().toISOString(),
  })
}

export async function GET(req: NextRequest) { return handle(req) }
export async function POST(req: NextRequest) { return handle(req) }
