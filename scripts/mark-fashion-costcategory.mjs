/**
 * Set costCategory = "fashion" on store products that clearly belong in the
 * newsletter's fashion rotation. This ONLY sets the categorization — it never
 * touches priceLastVerified or any calculation field, because those are
 * editorial decisions and a real price verification the editor must do by hand.
 *
 * Targets products that:
 *   - have a price,
 *   - have at least one affiliate link with a url,
 *   - are in a fashion category (bags/shoes/clothing/jewelry/accessories),
 *   - do not already have costCategory set.
 *
 * Usage:
 *   node scripts/mark-fashion-costcategory.mjs           # dry-run (no writes)
 *   node scripts/mark-fashion-costcategory.mjs --apply   # writes costCategory
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

const FASHION_CATS = ['bags', 'shoes', 'clothing', 'jewelry', 'accessories']

const query = `*[
  _type == "product"
  && defined(price)
  && count(affiliateLinks[defined(url)]) > 0
  && category->slug.current in $cats
  && !defined(costCategory)
]{ _id, _rev, name, price, "category": category->slug.current } | order(price desc)`

const docs = await client.fetch(query, {cats: FASHION_CATS})

console.log(`Mode: ${APPLY ? 'APPLY (writing)' : 'DRY-RUN (no writes)'}`)
console.log(`Products to mark costCategory="fashion": ${docs.length}\n`)
for (const d of docs) {
  console.log(`- ${d._id} | ${d.category} | $${d.price} | ${d.name}`)
}

let updated = 0
let failed = 0
if (APPLY) {
  for (const d of docs) {
    try {
      await client.patch(d._id).ifRevisionId(d._rev).set({costCategory: 'fashion'}).commit()
      updated++
    } catch (err) {
      failed++
      console.error(`  ! FAILED ${d._id}: ${err.message}`)
    }
  }
}

console.log('')
console.log(
  APPLY
    ? `Done. Marked ${updated} product(s).${failed ? ` ${failed} failed.` : ''}`
    : `Would mark ${docs.length} product(s). Re-run with --apply to write.`,
)
