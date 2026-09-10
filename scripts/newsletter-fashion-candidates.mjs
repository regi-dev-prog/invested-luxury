/**
 * Read-only: list the top fashion candidates for manual newsletter fill-in,
 * ranked by price descending. Writes a CSV and prints a table. Never writes to
 * Sanity.
 *
 *   node scripts/newsletter-fashion-candidates.mjs [limit]   # default 25
 */
import {createClient} from '@sanity/client'
import {writeFileSync, mkdirSync} from 'node:fs'

const LIMIT = Number(process.argv[2]) || 25
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
]{
  _id, name, price, currency,
  "brand": brand->name,
  "category": category->slug.current,
  "affUrl": affiliateLinks[defined(url)][isPrimary == true][0].url,
  "anyUrl": affiliateLinks[defined(url)][0].url
} | order(price desc)[0...$limit]`

const rows = await client.fetch(query, {cats: FASHION_CATS, limit: LIMIT})

/** Pull the real merchant URL out of a CJ/affiliate wrapper when embedded. */
function merchantLink(aff, any) {
  const raw = aff || any || ''
  try {
    const u = new URL(raw)
    const embedded = u.searchParams.get('url') || u.searchParams.get('murl') || u.searchParams.get('ued')
    if (embedded) return decodeURIComponent(embedded)
  } catch {
    /* not a parseable URL, fall through */
  }
  return raw
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const header = ['name', 'brand', 'price', 'currency', 'category', 'merchant_link']
const lines = [header.join(',')]
for (const r of rows) {
  lines.push(
    [r.name, r.brand, r.price, r.currency || 'USD', r.category, merchantLink(r.affUrl, r.anyUrl)]
      .map(csvCell)
      .join(','),
  )
}

mkdirSync('reports', {recursive: true})
const out = 'reports/newsletter-fashion-candidates.csv'
writeFileSync(out, lines.join('\n') + '\n')

// Console table
console.log(`\nTop ${rows.length} fashion candidates (by price desc). CSV: ${out}\n`)
console.log('  #  PRICE     CATEGORY     BRAND                 NAME')
rows.forEach((r, i) => {
  const num = String(i + 1).padStart(2)
  const price = `$${Number(r.price).toLocaleString()}`.padEnd(9)
  const cat = String(r.category || '').padEnd(12)
  const brand = String(r.brand || '').slice(0, 20).padEnd(21)
  console.log(`  ${num}  ${price} ${cat} ${brand} ${r.name}`)
})
console.log('')
