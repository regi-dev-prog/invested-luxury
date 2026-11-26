/**
 * Daily article date check (read only). Fails if any published article:
 *   - has no publishedAt
 *   - has publishedAt in the future
 *   - has updatedAt earlier than publishedAt
 * Also lists unpublished drafts whose date fields differ from the live
 * version (a warning, since sweep drafts legitimately wait for review).
 *
 *   SANITY_TOKEN=... node scripts/check-article-dates.mjs
 *
 * Without a token it still runs, but cannot see drafts.
 * Run by .github/workflows/article-date-check.yml.
 */
import fs from 'node:fs'
import {createClient} from '@sanity/client'
import {findDateProblems} from '../src/lib/articleDates.mjs'

const token = process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '4b3ap7pf',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
  perspective: 'raw',
})

const QUERY = `*[_type == "article"]{_id, title, status, publishedAt, updatedAt}`

const docs = await client.fetch(QUERY)
const {errors, warnings} = findDateProblems(docs)
const titles = new Map(docs.map((d) => [d._id.replace(/^drafts\./, ''), d.title]))

const lines = [`# Article date check`, ``, `Checked ${docs.length} article documents${token ? '' : ' (no token: drafts not visible)'}.`, ``]
lines.push(errors.length ? `## Errors (${errors.length})` : `No errors.`)
for (const e of errors) lines.push(`- \`${e.id}\` (${titles.get(e.id) || 'untitled'}): ${e.problem}`)
if (warnings.length) {
  lines.push(``, `## Unpublished draft date changes (${warnings.length})`)
  for (const w of warnings) lines.push(`- \`${w.id}\` (${titles.get(w.id) || 'untitled'}): ${w.problem}`)
}
const report = lines.join('\n')
console.log(report)
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n')

for (const e of errors) console.log(`::error title=Article date::${e.id}: ${e.problem}`)
for (const w of warnings) console.log(`::warning title=Draft date::${w.id}: ${w.problem}`)

process.exit(errors.length ? 1 : 0)
