import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {NextRequest} from 'next/server'
import {encodeSignatureHeader, SIGNATURE_HEADER_NAME} from '@sanity/webhook'

const {revalidatePath, revalidateTag} = vi.hoisted(() => ({revalidatePath: vi.fn(), revalidateTag: vi.fn()}))
vi.mock('next/cache', () => ({revalidatePath, revalidateTag}))

import {GET, POST} from './route'

const WEBHOOK_SECRET = 'test-webhook-secret'
const QUERY_SECRET = 'test-query-secret'
const BASE = 'https://investedluxury.com/api/revalidate'

async function signed(body: string, secret = WEBHOOK_SECRET) {
  const sig = await encodeSignatureHeader(body, Date.now(), secret)
  return new NextRequest(BASE, {method: 'POST', body, headers: {[SIGNATURE_HEADER_NAME]: sig}})
}

beforeEach(() => {
  process.env.REVALIDATE_SECRET = QUERY_SECRET
  process.env.SANITY_REVALIDATE_SECRET = WEBHOOK_SECRET
  revalidatePath.mockClear()
  revalidateTag.mockClear()
})
afterEach(() => {
  delete process.env.REVALIDATE_SECRET
  delete process.env.SANITY_REVALIDATE_SECRET
})

describe('/api/revalidate auth', () => {
  it('accepts a signed Sanity article webhook and refreshes the whole site', async () => {
    const res = await POST(await signed(JSON.stringify({_type: 'article', _id: 'article-x', slug: {current: 'x'}})))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.revalidated.fullRefresh).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml')
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('rejects a signature made with the wrong secret', async () => {
    const res = await POST(await signed(JSON.stringify({_type: 'article'}), 'wrong'))
    expect(res.status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('rejects a tampered body', async () => {
    const sig = await encodeSignatureHeader('{"_type":"article"}', Date.now(), WEBHOOK_SECRET)
    const req = new NextRequest(BASE, {method: 'POST', body: '{"_type":"product"}', headers: {[SIGNATURE_HEADER_NAME]: sig}})
    expect((await POST(req)).status).toBe(401)
  })

  it('still accepts the existing ?secret= query param', async () => {
    const res = await GET(new NextRequest(`${BASE}?secret=${QUERY_SECRET}&tag=articles`))
    expect(res.status).toBe(200)
  })

  it('rejects requests with neither', async () => {
    expect((await GET(new NextRequest(`${BASE}?tag=articles`))).status).toBe(401)
  })
})
