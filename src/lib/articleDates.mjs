// =============================================================================
// Article date rules, shared by Sanity Studio, the sitemap and the daily
// date check (scripts/check-article-dates.mjs).
//
//   publishedAt  set once, on first publish, never changed after.
//   updatedAt    set only for substantive updates (changed price, verdict or
//                finding), see the weekly sweep rules.
//
// Plain ESM JavaScript so the Node check script can import it without a build.
// =============================================================================

/** Milliseconds since epoch, or NaN for missing or unparseable values. */
export function toTime(value) {
  if (typeof value !== 'string' || !value) return NaN
  return Date.parse(value)
}

/** True when the Publish action should stamp publishedAt on this document. */
export function needsPublishDate(doc) {
  return !!doc && doc.status === 'published' && Number.isNaN(toTime(doc.publishedAt))
}

/**
 * The later of two ISO dates, compared as instants (not as strings, which
 * breaks when "+02:00" and "Z" values are mixed). Unparseable values lose.
 */
export function latestDate(a, b) {
  const ta = toTime(a)
  const tb = toTime(b)
  if (Number.isNaN(ta)) return Number.isNaN(tb) ? undefined : b
  if (Number.isNaN(tb)) return a
  return tb > ta ? b : a
}

/** Normalize any ISO date to UTC "...Z", or undefined if unparseable. */
export function toUtcIso(value) {
  const t = toTime(value)
  return Number.isNaN(t) ? undefined : new Date(t).toISOString()
}

/**
 * Find date problems in a list of article documents, as returned by a raw
 * (drafts included) query of {_id, title, status, publishedAt, updatedAt}.
 *
 * errors   published documents that break the rules (the check fails)
 * warnings drafts whose dates differ from the live version, which is normal
 *          while a sweep waits for review, but worth seeing
 */
export function findDateProblems(docs, now = new Date()) {
  const errors = []
  const warnings = []
  const nowMs = now.getTime()
  const published = new Map()
  const drafts = new Map()

  for (const d of docs) {
    if (d._id.startsWith('drafts.')) drafts.set(d._id.slice(7), d)
    else published.set(d._id, d)
  }

  for (const [id, d] of published) {
    if (d.status !== 'published') continue
    const pub = toTime(d.publishedAt)
    const upd = toTime(d.updatedAt)
    if (Number.isNaN(pub)) {
      errors.push({id, problem: 'published with no publishedAt'})
      continue
    }
    if (pub > nowMs) errors.push({id, problem: `publishedAt is in the future (${d.publishedAt})`})
    if (!Number.isNaN(upd) && upd < pub) {
      errors.push({id, problem: `updatedAt (${d.updatedAt}) is earlier than publishedAt (${d.publishedAt})`})
    }
  }

  for (const [id, draft] of drafts) {
    const live = published.get(id)
    if (!live) continue
    for (const field of ['publishedAt', 'updatedAt']) {
      if ((draft[field] || null) !== (live[field] || null)) {
        warnings.push({
          id,
          problem: `unpublished draft changes ${field}: live ${live[field] || 'none'}, draft ${draft[field] || 'none'}`,
        })
      }
    }
  }

  return {errors, warnings}
}
