// =============================================================================
// /api/revalidate — On-demand cache invalidation
// =============================================================================
// Triggers Next.js revalidation of specific paths or tags. Used by:
//   1. Sanity webhook (POST with body) — auto-revalidate when content changes
//   2. Manual curl/fetch (POST or GET with secret query param) — admin tool
//
// Auth: requires `secret` query param matching env REVALIDATE_SECRET.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

async function handle(req: NextRequest) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')

  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'REVALIDATE_SECRET env var not set on server' },
      { status: 500 }
    )
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: 'invalid secret' }, { status: 401 })
  }

  // Collect what to revalidate
  let paths: string[] = []
  let tags: string[] = []

  // From query string: ?path=/foo&path=/bar OR ?tag=articles
  paths = url.searchParams.getAll('path')
  tags = url.searchParams.getAll('tag')

  // From POST body (Sanity webhook style)
  if (req.method === 'POST') {
    try {
      const body = await req.json()
      if (Array.isArray(body?.paths)) paths = paths.concat(body.paths)
      if (Array.isArray(body?.tags)) tags = tags.concat(body.tags)
      if (typeof body?.path === 'string') paths.push(body.path)
      if (typeof body?.tag === 'string') tags.push(body.tag)
      // Sanity webhook payload includes document slug; build path from it
      if (body?._type === 'article' && body?.slug?.current) {
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

  return NextResponse.json({
    ok: true,
    revalidated: { paths, tags },
    results,
    timestamp: new Date().toISOString(),
  })
}

export async function GET(req: NextRequest) { return handle(req) }
export async function POST(req: NextRequest) { return handle(req) }
