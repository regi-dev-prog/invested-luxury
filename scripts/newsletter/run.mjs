/**
 * Weekly newsletter engine for InvestedLuxury (an editorial site).
 *
 * One issue = one article, a short note about it, and a link. Three parts:
 *   1. Select the article (deterministic, no model)
 *   2. Write the copy (Claude API, claude-sonnet-4-6)
 *   3. Send it (Kit API v4 broadcast)
 *
 * QA gates run before anything ships; any failure halts the run.
 *
 * Usage:
 *   node scripts/newsletter/run.mjs --dry-run   # print the issue, touch nothing
 *   node scripts/newsletter/run.mjs             # create a DRAFT broadcast in Kit
 *   NEWSLETTER_AUTOSEND=true node scripts/newsletter/run.mjs   # actually send
 *
 * Env: KIT_API_KEY, ANTHROPIC_API_KEY, SANITY_API_TOKEN,
 *      NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 *      NEXT_PUBLIC_SITE_URL (optional), NEWSLETTER_AUTOSEND (optional)
 */
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import Anthropic from '@anthropic-ai/sdk'

const DRY_RUN = process.argv.includes('--dry-run')
const AUTOSEND = process.env.NEWSLETTER_AUTOSEND === 'true'
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://investedluxury.com').replace(/\/$/, '')
const MODEL = 'claude-sonnet-4-6'
const KIT_API = 'https://api.kit.com/v4'

function die(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
if (!projectId || !process.env.SANITY_API_TOKEN) die('Missing Sanity env (source .env.local first).')
if (!process.env.ANTHROPIC_API_KEY) die('Missing ANTHROPIC_API_KEY (needed to write the copy).')
if (!DRY_RUN && !process.env.KIT_API_KEY) die('Missing KIT_API_KEY (needed to reach Kit).')

const sanity = createClient({ projectId, dataset, token: process.env.SANITY_API_TOKEN, apiVersion: '2021-10-21', useCdn: false })
const imageBuilder = imageUrlBuilder(sanity)
const anthropic = new Anthropic() // reads ANTHROPIC_API_KEY from env

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

// ============================================================
// 1. SELECT THE ARTICLE (deterministic)
// ============================================================
async function selectArticle(now) {
  // Published, not yet sent in a newsletter.
  const articles = await sanity.fetch(
    `*[_type == "article" && status == "published" && !defined(lastSentInNewsletter)]{
      _id, title, "slug": slug.current, subtitle, excerpt, publishedAt, body, mainImage
    }`,
  )

  const withTime = articles
    .filter((a) => a.slug) // must have a slug to link to
    .map((a) => {
      const t = a.publishedAt ? new Date(a.publishedAt).getTime() : NaN
      return { ...a, _published: Number.isFinite(t) ? t : null }
    })

  const byId = (a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0)

  // Tier 1: published within the last 7 days, newest first (most timely).
  const recent = withTime
    .filter((a) => a._published !== null && now - a._published <= WEEK_MS)
    .sort((a, b) => b._published - a._published || byId(a, b))

  // Tier 2: everything else (never sent), oldest first; undated go last.
  const rest = withTime
    .filter((a) => !(a._published !== null && now - a._published <= WEEK_MS))
    .sort((a, b) => {
      if (a._published === null && b._published === null) return byId(a, b)
      if (a._published === null) return 1
      if (b._published === null) return -1
      return a._published - b._published || byId(a, b)
    })

  const ranked = [...recent, ...rest]
  return { article: ranked[0] || null, poolSize: ranked.length }
}

/** Flatten the first few Portable Text paragraphs into plain text. */
function bodyToText(body, maxChars = 1500) {
  if (!Array.isArray(body)) return ''
  const paras = []
  for (const block of body) {
    if (block && block._type === 'block' && Array.isArray(block.children)) {
      const text = block.children
        .filter((c) => c && c._type === 'span' && typeof c.text === 'string')
        .map((c) => c.text)
        .join('')
        .trim()
      if (text) paras.push(text)
    }
    if (paras.join('\n\n').length >= maxChars) break
  }
  return paras.join('\n\n').slice(0, maxChars)
}

// ============================================================
// 2. WRITE THE COPY (Claude API)
// ============================================================
const SYSTEM_PROMPT = `You write a short promo for one article in a weekly email newsletter for InvestedLuxury, an editorial site about luxury goods and whether they hold their value.

Write only from the material you are given about the article. Do not invent facts, figures, prices, or claims that are not in the material. If there is not enough to say, say less.

Style:
- Plain, direct prose. Write like a person, not like marketing or AI.
- Do not use dashes as separators (no em dash, no en dash). Use full stops or commas.
- No rule-of-three lists. No power words (unlock, elevate, curated, must-have, game-changer, and the like).
- Say what the article covers and why it is worth a reader's time. Do not oversell.

Return ONLY a JSON object, no other text, with exactly these keys:
{
  "subject": "email subject line, 60 characters or fewer",
  "preview": "one short preview line shown before the email is opened",
  "paragraphs": ["first paragraph", "second paragraph"]
}
The two paragraphs are the body of the note. Keep each to a few sentences.`

async function writeCopy(article) {
  const material = [
    `Title: ${article.title}`,
    article.subtitle ? `Subtitle: ${article.subtitle}` : '',
    article.excerpt ? `Excerpt: ${article.excerpt}` : '',
    '',
    'Opening of the article:',
    bodyToText(article.body) || '(no body text available)',
  ]
    .filter(Boolean)
    .join('\n')

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: material }],
  })

  const raw = resp.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()

  let copy
  try {
    copy = JSON.parse(raw)
  } catch {
    die(`Model did not return valid JSON:\n${raw}`)
  }
  if (!copy.subject || !copy.preview || !Array.isArray(copy.paragraphs) || copy.paragraphs.length < 2) {
    die(`Model JSON missing required fields:\n${JSON.stringify(copy, null, 2)}`)
  }
  copy.paragraphs = copy.paragraphs.slice(0, 2)
  return copy
}

// ============================================================
// 3. BUILD + QA + SEND
// ============================================================
function articleUrl(article) {
  // /article/<slug> is a stable entry point that resolves to the canonical path.
  return `${SITE_URL}/article/${article.slug}`
}

/** Hero image for the issue, or null if the article has none. */
function heroImage(article) {
  const img = article.mainImage
  if (!img || !img.asset || !img.asset._ref) return null
  const url = imageBuilder.image(img).width(600).quality(80).format('webp').url()
  return { url, alt: (img.alt || article.title || '').trim() }
}

function buildHtml(article, copy, url, hero) {
  const paras = copy.paragraphs
    .map(
      (p) =>
        `<p style="color:#4a4a4a; font-size:17px; line-height:1.6; margin:0 0 20px;">${escapeHtml(p)}</p>`,
    )
    .join('\n')
  // Optional hero, linked to the article like the button. Skipped if absent.
  const heroBlock = hero
    ? `<p style="margin:0 0 24px;"><a href="${url}"><img src="${hero.url}" alt="${escapeHtml(hero.alt)}" width="600" style="display:block; width:100%; max-width:600px; height:auto; border:0;" /></a></p>\n      `
    : ''
  // Brand logo as styled text, matching the site's wordmark (I and L in gold).
  // Text renders reliably in every email client, no hosted image needed.
  const logoBlock = `<div style="text-align:center; margin:0 0 28px;"><a href="${SITE_URL}" style="text-decoration:none; font-family: Georgia, serif; font-size:26px; letter-spacing:0.5px; color:#1a1a1a;"><span style="color:#C9A962;">I</span>nvested<span style="color:#C9A962;">L</span>uxury</a></div>`
  return `
    <div style="font-family: Georgia, serif; max-width:600px; margin:0 auto; padding:40px 20px;">
      ${logoBlock}
      ${heroBlock}<h1 style="color:#1a1a1a; font-size:24px; font-weight:normal; margin:0 0 24px;">${escapeHtml(article.title)}</h1>
      ${paras}
      <p style="margin:28px 0;">
        <a href="${url}" style="display:inline-block; background:#1a1a1a; color:#ffffff; text-decoration:none; padding:14px 28px; font-size:16px;">Read the article</a>
      </p>
      <hr style="border:none; border-top:1px solid #e0e0e0; margin:30px 0;" />
      <p style="color:#888; font-size:12px; line-height:1.6;">
        You are receiving this because you subscribed at investedluxury.com.<br/>
        <a href="{{ unsubscribe_url }}" style="color:#888;">Unsubscribe</a>
      </p>
    </div>`.trim()
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const DASH_RE = /[—–]/ // em dash, en dash

const REAL_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
// Waits before each retry. A 429 is transient (e.g. an edge rate limit), so we
// back off and try again; only if every attempt fails does the gate stop.
const LINK_RETRY_WAITS_MS = [2000, 5000, 10000]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function checkArticleLink(url) {
  // Present the shared secret so our own rate limiter lets the check through
  // (see middleware.ts). Only sent if the token is configured.
  const headers = { 'User-Agent': REAL_UA, Accept: 'text/html,application/xhtml+xml' }
  if (process.env.NEWSLETTER_BYPASS_TOKEN) headers['x-newsletter-check'] = process.env.NEWSLETTER_BYPASS_TOKEN

  let status = 'unknown'
  const attempts = LINK_RETRY_WAITS_MS.length + 1 // one initial + retries
  for (let i = 0; i < attempts; i++) {
    if (i > 0) {
      const wait = LINK_RETRY_WAITS_MS[i - 1]
      console.log(`    link ${status}, retrying in ${wait / 1000}s (attempt ${i + 1}/${attempts})...`)
      await sleep(wait)
    }
    try {
      const res = await fetch(url, { redirect: 'follow', headers })
      status = `HTTP ${res.status}`
      // Vercel's edge bot mitigation sits in front of our middleware; a plain
      // fetch can't solve its JS challenge. Surface this clearly — the fix is a
      // Vercel Firewall bypass rule for the x-newsletter-check header, not code.
      if (res.headers.get('x-vercel-mitigated') === 'challenge') {
        status = `HTTP ${res.status} (blocked by Vercel edge challenge — add a Vercel Firewall bypass for the x-newsletter-check header)`
      }
      if (res.ok) return { ok: true, status, tries: i + 1 }
    } catch (err) {
      status = `error: ${err.message}`
    }
  }
  return { ok: false, status, tries: attempts }
}

async function runQaGates(article, copy, url, html, hero) {
  const checks = []

  // Subject present and within 60 characters.
  const subjLen = [...copy.subject].length
  checks.push({
    name: 'Subject is present and 60 characters or fewer',
    ok: copy.subject.trim().length > 0 && subjLen <= 60,
    detail: `subject is ${subjLen} chars`,
  })

  // No separator dashes anywhere in the copy.
  const textBlob = [copy.subject, copy.preview, ...copy.paragraphs].join(' ')
  checks.push({
    name: 'Copy contains no separator dashes (em/en)',
    ok: !DASH_RE.test(textBlob),
    detail: DASH_RE.test(textBlob) ? 'found a dash in the copy' : 'clean',
  })

  // Footer has an unsubscribe link.
  checks.push({
    name: 'Email has an unsubscribe footer',
    ok: /unsubscribe/i.test(html),
    detail: 'looks for "unsubscribe" in the HTML',
  })

  // Article link returns 200 (follows redirects; retries transient failures).
  const link = await checkArticleLink(url)
  checks.push({
    name: 'Article link returns 200',
    ok: link.ok,
    detail: `${link.status} after ${link.tries} attempt(s) for ${url}`,
  })

  // Hero image is optional, but if present it must load (200). Sanity's CDN is
  // not behind our rate limiter, so a plain fetch is enough (light retry).
  if (hero) {
    let imgStatus = 'unknown'
    let imgOk = false
    for (let i = 0; i < 2; i++) {
      if (i > 0) await sleep(2000)
      try {
        const r = await fetch(hero.url, { headers: { 'User-Agent': REAL_UA } })
        imgStatus = `HTTP ${r.status}`
        if (r.ok) {
          imgOk = true
          break
        }
      } catch (err) {
        imgStatus = `error: ${err.message}`
      }
    }
    checks.push({ name: 'Hero image returns 200', ok: imgOk, detail: `${imgStatus} for ${hero.url}` })
  }

  console.log('\nQA gates:')
  let failed = false
  for (const c of checks) {
    console.log(`  ${c.ok ? '✓' : '✗'} ${c.name} — ${c.detail}`)
    if (!c.ok) failed = true
  }
  if (failed) die('A QA gate failed. Nothing was sent.')
}

async function createBroadcast(subject, previewText, html, description) {
  const body = {
    subject,
    content: html,
    description,
    preview_text: previewText,
    public: false,
    send_at: AUTOSEND ? new Date().toISOString() : null, // null = draft; timestamp = send
  }
  const res = await fetch(`${KIT_API}/broadcasts`, {
    method: 'POST',
    headers: { 'X-Kit-Api-Key': process.env.KIT_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) die(`Kit broadcast failed (HTTP ${res.status}): ${JSON.stringify(data)}`)
  return data.broadcast
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  const now = Date.now()
  console.log(`InvestedLuxury newsletter — ${DRY_RUN ? 'DRY RUN' : AUTOSEND ? 'SEND' : 'DRAFT'} mode`)

  const { article, poolSize } = await selectArticle(now)
  if (!article) {
    console.log('\nNo eligible article (all published articles have already been sent). Nothing to do — not sending an empty issue.')
    process.exit(0)
  }
  console.log(`\nSelected article (${poolSize} in pool): "${article.title}"`)
  console.log(`  published: ${article.publishedAt || 'n/a'} | id: ${article._id}`)

  const copy = await writeCopy(article)
  const url = articleUrl(article)
  const hero = heroImage(article)
  const html = buildHtml(article, copy, url, hero)

  console.log('\n----- ISSUE -----')
  console.log(`Subject : ${copy.subject}`)
  console.log(`Preview : ${copy.preview}`)
  console.log(`Hero    : ${hero ? hero.url : '(none — article has no image, skipped)'}`)
  console.log(`Link    : ${url}`)
  console.log('')
  copy.paragraphs.forEach((p) => console.log(p + '\n'))
  console.log('-----------------')

  await runQaGates(article, copy, url, html, hero)

  if (DRY_RUN) {
    console.log('\nDRY RUN: QA passed. No Kit broadcast created, no Sanity write. This is the issue that would go out.')
    return
  }

  const broadcast = await createBroadcast(copy.subject, copy.preview, html, `Weekly: ${article.title}`)
  console.log(`\nKit broadcast created: id ${broadcast.id}, status "${broadcast.status}".`)
  if (broadcast.public_url) console.log(`  public URL: ${broadcast.public_url}`)
  console.log(`  edit in Kit: https://app.kit.com/broadcasts/${broadcast.id}`)

  if (AUTOSEND) {
    const today = new Date().toISOString().slice(0, 10)
    await sanity.patch(article._id).set({ lastSentInNewsletter: today }).commit()
    console.log(`  marked lastSentInNewsletter = ${today} on ${article._id}`)
    console.log('\nSent.')
  } else {
    console.log('\nDraft only (NEWSLETTER_AUTOSEND not set). Review it in Kit, then send from there or re-run with NEWSLETTER_AUTOSEND=true.')
  }
}

main().catch((err) => die(err.stack || err.message))
