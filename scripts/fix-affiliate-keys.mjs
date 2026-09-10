/**
 * One-time maintenance: add a unique `_key` to affiliateLinks array items that
 * are missing one. Items entered via the API client without keys trigger the
 * Studio "Missing keys" warning.
 *
 * SAFE BY DESIGN:
 *   - Only adds `_key` to items that lack it. Never changes an existing value
 *     or an existing `_key`, never touches any other field.
 *   - `_key` is unique within each document's affiliateLinks array.
 *   - Uses ifRevisionId so a concurrent edit can't be clobbered.
 *
 * Usage:
 *   node scripts/fix-affiliate-keys.mjs           # dry-run, writes nothing
 *   node scripts/fix-affiliate-keys.mjs --apply   # performs the writes
 *
 * Env required (source .env.local first):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN
 */
import {createClient} from '@sanity/client'
import crypto from 'node:crypto'

const APPLY = process.argv.includes('--apply')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || !token) {
  console.error('Missing env. Run: set -a; source .env.local; set +a')
  process.exit(1)
}

const client = createClient({projectId, dataset, token, apiVersion: '2021-10-21', useCdn: false})

function makeKey(used) {
  let k
  do {
    k = crypto.randomBytes(6).toString('hex')
  } while (used.has(k))
  used.add(k)
  return k
}

const query = `*[_type == "product" && count(affiliateLinks[!defined(_key)]) > 0]{_id, _rev, name, affiliateLinks}`
const docs = await client.fetch(query)

console.log(`Mode: ${APPLY ? 'APPLY (writing changes)' : 'DRY-RUN (no writes)'}`)
console.log(`Documents with affiliateLinks items missing _key: ${docs.length}\n`)

let updated = 0
let failed = 0
let itemsFixed = 0

for (const doc of docs) {
  const links = Array.isArray(doc.affiliateLinks) ? doc.affiliateLinks : []
  const used = new Set(links.filter((i) => i && i._key).map((i) => i._key))
  const missingIdx = []

  const newLinks = links.map((item, idx) => {
    if (item && typeof item === 'object' && !item._key) {
      missingIdx.push(idx)
      return {...item, _key: makeKey(used)}
    }
    return item
  })

  if (missingIdx.length === 0) continue
  itemsFixed += missingIdx.length

  console.log(
    `- ${doc._id} | "${doc.name || 'Untitled'}" | array size ${links.length} | ` +
      `adding _key to item index(es): [${missingIdx.join(', ')}]`
  )

  if (APPLY) {
    try {
      await client
        .patch(doc._id)
        .ifRevisionId(doc._rev)
        .set({affiliateLinks: newLinks})
        .commit({autoGenerateArrayKeys: false})
      updated++
    } catch (err) {
      failed++
      console.error(`  ! FAILED ${doc._id}: ${err.message}`)
    }
  }
}

console.log('')
if (APPLY) {
  console.log(`Done. Updated ${updated} document(s), ${itemsFixed} item(s) fixed.` + (failed ? ` ${failed} failed.` : ''))
} else {
  console.log(`Would update ${docs.length} document(s), ${itemsFixed} item(s). Re-run with --apply to write.`)
}
