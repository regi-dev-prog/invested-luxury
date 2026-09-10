/**
 * Backfill the newsletter cost fields on fashion store products with category
 * DEFAULTS, so the engine has a candidate pool. Marks each filled product with
 * calcFieldsAreDefaults = true so it is clear the numbers were not reviewed.
 *
 * Deliberately does NOT set priceLastVerified: a verification that did not
 * happen would be a lie and would break the QA gate's meaning. The engine
 * verifies the price at runtime for the single product it selects.
 *
 * Targets products with: a price, a valid affiliate link, a fashion category,
 * and no costCategory yet. Existing calc values are preserved (setIfMissing).
 *
 * Usage:
 *   node scripts/backfill-fashion-calc.mjs           # dry-run (no writes)
 *   node scripts/backfill-fashion-calc.mjs --apply   # writes
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

// Per-category defaults for lifespan (years) and wears/year.
const DEFAULTS = {
  bags: {lifespan: 15, wears: 60},
  shoes: {lifespan: 8, wears: 30},
  jewelry: {lifespan: 30, wears: 100},
  clothing: {lifespan: 10, wears: 40},
  accessories: {lifespan: 12, wears: 50},
}
const CARE_RATE = 0.01 // annualCareCost = 1% of price

// expectedResaleValue as a fraction of price, by category.
const CATEGORY_RESALE = {
  jewelry: 0.7,
  bags: 0.45,
  shoes: 0.25,
  clothing: 0.2,
  accessories: 0.35,
}

// Brands that genuinely hold value get a higher resale rate, but only in the
// two categories where it applies: bags 75%, jewelry 85%.
const VALUE_BRANDS = ['hermes', 'chanel', 'rolex', 'cartier', 'patek', 'the row']

function normalize(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function resaleRate(category, brandName) {
  const brand = normalize(brandName)
  const isValueBrand = brand !== '' && VALUE_BRANDS.some((b) => brand.includes(b))
  if (isValueBrand && category === 'bags') return 0.75
  if (isValueBrand && category === 'jewelry') return 0.85
  return CATEGORY_RESALE[category] ?? 0.55
}

const query = `*[
  _type == "product"
  && defined(price)
  && count(affiliateLinks[defined(url)]) > 0
  && category->slug.current in $cats
  && !defined(costCategory)
]{ _id, _rev, name, price, "brand": brand->name, "category": category->slug.current } | order(price desc)`

const docs = await client.fetch(query, {cats: Object.keys(DEFAULTS)})

console.log(`Mode: ${APPLY ? 'APPLY (writing)' : 'DRY-RUN (no writes)'}`)
console.log(`Products to backfill: ${docs.length}\n`)
console.log('  CATEGORY     PRICE     LIFE WEARS CARE   RESALE (rate)   BRAND / NAME')

let updated = 0
let failed = 0
for (const d of docs) {
  const def = DEFAULTS[d.category]
  const care = Math.round(d.price * CARE_RATE)
  const rate = resaleRate(d.category, d.brand)
  const resale = Math.round(d.price * rate)
  const ratePct = `${Math.round(rate * 100)}%`
  console.log(
    `  ${String(d.category).padEnd(12)} $${String(d.price).padEnd(8)} ${String(def.lifespan).padEnd(4)} ${String(def.wears).padEnd(5)} $${String(care).padEnd(5)} $${String(resale).padEnd(6)} (${ratePct.padEnd(4)})  ${d.brand || '?'} — ${d.name}`,
  )

  if (APPLY) {
    try {
      await client
        .patch(d._id)
        .ifRevisionId(d._rev)
        .set({costCategory: 'fashion', calcFieldsAreDefaults: true})
        .setIfMissing({
          expectedLifespanYears: def.lifespan,
          expectedWearsPerYear: def.wears,
          annualCareCost: care,
          expectedResaleValue: resale,
        })
        .commit()
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
    ? `Done. Backfilled ${updated} product(s).${failed ? ` ${failed} failed.` : ''}`
    : `Would backfill ${docs.length} product(s). priceLastVerified is intentionally NOT set. Re-run with --apply to write.`,
)
