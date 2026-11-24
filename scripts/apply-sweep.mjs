/**
 * Apply a weekly sweep file (ops/sweeps/YYYY-MM-DD.json) to Sanity as DRAFTS.
 *
 * Nothing is ever published by this script. Each change lands in the
 * document's draft (drafts.<id>); Regi reviews and clicks Publish in Studio.
 *
 *   node scripts/apply-sweep.mjs --check ops/sweeps/2026-11-30.json   # read-only
 *   node scripts/apply-sweep.mjs --apply ops/sweeps/2026-11-30.json   # writes drafts
 *
 * Change types (see ops/sweeps/README.md for the full format):
 *   article_text   replace one exact string in an article's body (or a top-level
 *                  string field such as excerpt). The string must occur exactly once.
 *   product_price  set a product's price and priceLastVerified, and append to
 *                  priceHistory.
 *
 * An article that receives a change marked substantive gets updatedAt set to
 * the apply time, which also feeds the sitemap lastmod.
 */
import fs from 'node:fs'
import {createClient} from '@sanity/client'

import {fileURLToPath} from 'node:url'

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])
const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const files = args.filter((a) => !a.startsWith('--'))

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '4b3ap7pf',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
  perspective: 'raw',
})

const SYSTEM_FIELDS = ['_rev', '_createdAt', '_updatedAt']
const key = () => Math.random().toString(36).slice(2, 14)

// ---------------------------------------------------------------------------
// Pure helpers (exported for tests)
// ---------------------------------------------------------------------------

export function validateChange(c) {
  const errs = []
  if (!['article_text', 'product_price'].includes(c.type)) errs.push(`unknown type "${c.type}"`)
  if (!c.source || !/^https?:\/\//.test(c.source)) errs.push('source must be a URL')
  if (!c.capturedAt || !/^\d{4}-\d{2}-\d{2}$/.test(c.capturedAt)) errs.push('capturedAt must be YYYY-MM-DD')
  if (!c.reason) errs.push('reason is required')
  if (c.type === 'article_text') {
    if (!c.article) errs.push('article (slug) is required')
    if (!c.find || typeof c.find !== 'string') errs.push('find is required')
    if (typeof c.replace !== 'string') errs.push('replace is required')
    if (c.find === c.replace) errs.push('find and replace are identical')
    if (/—/.test(c.replace || '')) errs.push('replace contains an em dash')
  }
  if (c.type === 'product_price') {
    if (!c.product) errs.push('product (_id) is required')
    if (typeof c.price !== 'number' || !(c.price > 0)) errs.push('price must be a positive number')
  }
  return errs
}

// "Already applied" is only trusted when the replacement text is distinctive
// enough that finding it is not a coincidence (a short string like "x" or
// "$249" appears all over an article).
const MIN_ALREADY_LEN = 12
const looksApplied = (text, replace) => replace.length >= MIN_ALREADY_LEN && countIn(text, replace) === 1

function countIn(haystack, needle) {
  let n = 0
  let i = haystack.indexOf(needle)
  while (i !== -1) {
    n++
    i = haystack.indexOf(needle, i + needle.length)
  }
  return n
}

/**
 * Replace `find` with `replace` in a document. Returns {doc, status, detail}.
 * status: 'ok' | 'already' | 'missing' | 'ambiguous' | 'split'
 */
export function replaceInDoc(doc, field, find, replace) {
  const next = structuredClone(doc)

  if (field !== 'body') {
    const parts = field.split('.')
    let obj = next
    for (const p of parts.slice(0, -1)) obj = obj?.[p]
    const last = parts[parts.length - 1]
    const val = obj?.[last]
    if (typeof val !== 'string') return {doc, status: 'missing', detail: `field ${field} is not a string`}
    const n = countIn(val, find)
    if (n === 0) {
      return looksApplied(val, replace)
        ? {doc, status: 'already', detail: 'replacement text already present'}
        : {doc, status: 'missing', detail: 'text not found'}
    }
    if (n > 1) return {doc, status: 'ambiguous', detail: `found ${n} times`}
    obj[last] = val.replace(find, replace)
    return {doc: next, status: 'ok'}
  }

  const spans = []
  for (const block of next.body || []) {
    if (block?._type !== 'block') continue
    for (const child of block.children || []) {
      if (child?._type === 'span' && typeof child.text === 'string') spans.push(child)
    }
  }
  const total = spans.reduce((s, sp) => s + countIn(sp.text, find), 0)
  if (total === 0) {
    const fullText = spans.map((s) => s.text).join('')
    if (fullText.includes(find)) {
      return {doc, status: 'split', detail: 'text crosses formatting (bold/link); edit by hand'}
    }
    const already = looksApplied(spans.map((s) => s.text).join('\n'), replace)
    return already
      ? {doc, status: 'already', detail: 'replacement text already present'}
      : {doc, status: 'missing', detail: 'text not found'}
  }
  if (total > 1) return {doc, status: 'ambiguous', detail: `found ${total} times; make "find" longer`}
  const span = spans.find((s) => s.text.includes(find))
  span.text = span.text.replace(find, replace)
  return {doc: next, status: 'ok'}
}

export function applyPrice(doc, {price, capturedAt, source}) {
  const next = structuredClone(doc)
  if (next.price === price && next.priceLastVerified === capturedAt) {
    return {doc, status: 'already'}
  }
  const old = next.price
  next.price = price
  next.priceLastVerified = capturedAt
  next.priceHistory = [
    ...(next.priceHistory || []),
    {_key: key(), _type: 'object', price, date: capturedAt, note: `sweep: ${source}`},
  ]
  return {doc: next, status: 'ok', detail: old === price ? 're-verified, unchanged' : `${old} -> ${price}`}
}

// ---------------------------------------------------------------------------
// Sanity I/O
// ---------------------------------------------------------------------------

async function loadPair(filter, params) {
  const docs = await client.fetch(`*[${filter}]`, params)
  const published = docs.find((d) => !d._id.startsWith('drafts.'))
  const draft = docs.find((d) => d._id.startsWith('drafts.'))
  return {published, draft}
}

async function writeDraft({published, draft}, nextDoc) {
  const baseId = published?._id || draft._id.replace(/^drafts\./, '')
  const draftId = `drafts.${baseId}`
  const body = Object.fromEntries(Object.entries(nextDoc).filter(([k]) => !SYSTEM_FIELDS.includes(k)))
  body._id = draftId
  const tx = client.transaction()
  if (draft) {
    const {_id, _type, ...fields} = body
    tx.patch(draftId, (p) => p.ifRevisionId(draft._rev).set(fields))
  } else {
    tx.create(body)
  }
  await tx.commit({visibility: 'sync'})
  return draftId
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
if (!files.length) {
  console.error('Usage: node scripts/apply-sweep.mjs --check|--apply <sweep.json> [...]')
  process.exit(2)
}
const results = []
const now = new Date().toISOString()

for (const file of files) {
  const sweep = JSON.parse(fs.readFileSync(file, 'utf8'))
  const changes = sweep.changes || []

  // Group by target document so each draft is written once.
  const groups = new Map()
  for (const [i, c] of changes.entries()) {
    const errs = validateChange(c)
    if (errs.length) {
      results.push({file, i, c, status: 'invalid', detail: errs.join('; ')})
      continue
    }
    const target = c.type === 'article_text' ? `article:${c.article}` : `product:${c.product}`
    if (!groups.has(target)) groups.set(target, [])
    groups.get(target).push({i, c})
  }

  for (const [target, items] of groups) {
    const [kind, ref] = target.split(/:(.*)/s)
    const pair =
      kind === 'article'
        ? await loadPair(`_type == "article" && slug.current == $ref`, {ref})
        : await loadPair(`_id in [$ref, "drafts." + $ref]`, {ref})

    if (!pair.published && !pair.draft) {
      for (const {i, c} of items) results.push({file, i, c, status: 'missing', detail: `${kind} not found`})
      continue
    }

    // Work on the existing draft if there is one, so pending edits are kept.
    let doc = pair.draft || pair.published
    let changed = false
    let substantive = false

    for (const {i, c} of items) {
      const r =
        c.type === 'article_text'
          ? replaceInDoc(doc, c.field || 'body', c.find, c.replace)
          : applyPrice(doc, c)
      results.push({file, i, c, status: r.status, detail: r.detail || ''})
      if (r.status === 'ok') {
        doc = r.doc
        changed = true
        if (c.substantive) substantive = true
      }
    }

    if (changed && kind === 'article' && substantive) doc = {...doc, updatedAt: now}

    if (changed && APPLY) {
      try {
        const id = await writeDraft(pair, doc)
        results.push({file, target, status: 'written', detail: id})
      } catch (e) {
        results.push({file, target, status: 'write-failed', detail: e.message})
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const icon = {ok: 'OK', already: 'ALREADY', written: 'DRAFT', missing: 'NOT FOUND', ambiguous: 'AMBIGUOUS', split: 'SPLIT', invalid: 'INVALID', 'write-failed': 'FAILED'}
const lines = [
  `## Sweep ${APPLY ? 'apply' : 'check'}: ${files.join(', ')}`,
  '',
  APPLY
    ? 'Changes below were written to Sanity **drafts**. Nothing is published: review and publish in Studio.'
    : 'Read-only check against the current Sanity content. Merging this PR writes the OK rows to Sanity drafts.',
  '',
  '| # | Target | Change | Result | Detail |',
  '|---|---|---|---|---|',
]
for (const r of results) {
  if (r.target) {
    lines.push(`| | ${r.target} | | ${icon[r.status]} | ${r.detail} |`)
    continue
  }
  const tgt = r.c.article || r.c.product
  const what =
    r.c.type === 'article_text'
      ? `"${String(r.c.find).slice(0, 60)}" to "${String(r.c.replace).slice(0, 60)}"${r.c.substantive ? ' (substantive)' : ''}`
      : `price ${r.c.price}`
  lines.push(`| ${r.i + 1} | ${tgt} | ${what.replace(/\|/g, '/')} | ${icon[r.status]} | ${(r.detail || '').replace(/\|/g, '/')} |`)
}
const bad = results.filter((r) => ['missing', 'ambiguous', 'split', 'invalid', 'write-failed'].includes(r.status))
lines.push('', bad.length ? `**${bad.length} item(s) need attention.** Fix the sweep file or edit those by hand.` : 'All items OK.')

const report = lines.join('\n')
console.log(report)
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n')
fs.writeFileSync('sweep-report.md', report + '\n')

// A write failure is a real failure; content mismatches are reported, not fatal.
process.exit(results.some((r) => r.status === 'write-failed') ? 1 : 0)
}

if (isMain) await main()
