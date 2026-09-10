/**
 * Mark newsletter fashion candidates whose affiliate link does NOT land on a
 * single product page (designer / category / home / editorial) with
 * linkTargetIsProductPage = false, so the selector skips them.
 *
 * Only sets the flag to false on the bad ones. Product-page links are left
 * unset (the selector treats only an explicit false as a reason to skip).
 *
 *   node scripts/mark-link-quality.mjs           # dry-run (no writes)
 *   node scripts/mark-link-quality.mjs --apply   # writes
 */
import {createClient} from '@sanity/client'

const APPLY = process.argv.includes('--apply')
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2021-10-21',
  useCdn: false,
})

function decodeMerchant(raw) {
  try {
    const u = new URL(raw)
    const embedded = u.searchParams.get('url') || u.searchParams.get('murl') || u.searchParams.get('ued')
    if (embedded) return decodeURIComponent(embedded)
  } catch {
    /* not parseable */
  }
  return raw
}

function classify(rawUrl) {
  let u
  try {
    u = new URL(rawUrl)
  } catch {
    return 'other'
  }
  const path = u.pathname.replace(/\/$/, '')
  if (path === '') return 'home'
  const lower = path.toLowerCase()
  const segs = path.split('/').filter(Boolean)
  const last = segs[segs.length - 1] || ''
  // Editorial must be checked before the product-slug rule (articles have long slugs too).
  if (/\/(article|articles|blog|editorial|magazine|stories|guide)(\/|$)/.test(lower)) return 'editorial'
  if (/\/(designer|designers|brand|brands)(\/|$)/.test(lower)) return 'designer'
  if (/-p\d{3,}|\/p\/|prod|\.html$|_\d{5,}|\d{6,}/.test(lower) || (last.includes('-') && last.length > 18)) {
    return 'product'
  }
  if (segs.length <= 3) return 'category'
  return 'other'
}

const rows = await client.fetch(
  `*[_type=="product" && defined(price) && count(affiliateLinks[defined(url)])>0
      && category->slug.current in ["bags","shoes","clothing","jewelry","accessories"]]{
    _id, _rev, name, price,
    "aff": coalesce(affiliateLinks[defined(url)][isPrimary==true][0].url, affiliateLinks[defined(url)][0].url)
  } | order(price desc)`,
)

const classified = rows.map((r) => ({...r, kind: classify(decodeMerchant(r.aff)), merchant: decodeMerchant(r.aff)}))
const bad = classified.filter((r) => r.kind !== 'product')
const good = classified.filter((r) => r.kind === 'product')

console.log(`Mode: ${APPLY ? 'APPLY (writing)' : 'DRY-RUN (no writes)'}`)
console.log(`Total fashion candidates: ${classified.length} | product-page (left unset): ${good.length} | to mark false: ${bad.length}\n`)
console.log('  KIND        NAME')
for (const r of bad) {
  console.log(`  ${String(r.kind).padEnd(10)}  ${r.name}`)
  console.log(`              ${r.merchant}`)
}

let updated = 0
let failed = 0
if (APPLY) {
  for (const r of bad) {
    try {
      await client.patch(r._id).ifRevisionId(r._rev).set({linkTargetIsProductPage: false}).commit()
      updated++
    } catch (err) {
      failed++
      console.error(`  ! FAILED ${r._id}: ${err.message}`)
    }
  }
}

console.log('')
console.log(
  APPLY
    ? `Done. Marked ${updated} product(s) linkTargetIsProductPage=false.${failed ? ` ${failed} failed.` : ''}`
    : `Would mark ${bad.length} product(s) linkTargetIsProductPage=false. Re-run with --apply to write.`,
)
