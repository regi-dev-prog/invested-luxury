import {describe, expect, it} from 'vitest'
import {findDateProblems, latestDate, needsPublishDate, toUtcIso} from './articleDates.mjs'

describe('needsPublishDate', () => {
  it('stamps a published article with no date', () => {
    expect(needsPublishDate({status: 'published'})).toBe(true)
    expect(needsPublishDate({status: 'published', publishedAt: null})).toBe(true)
  })
  it('never overwrites an existing date', () => {
    expect(needsPublishDate({status: 'published', publishedAt: '2026-11-22T12:32:00.000+02:00'})).toBe(false)
  })
  it('ignores articles that are not marked published', () => {
    expect(needsPublishDate({status: 'ready'})).toBe(false)
    expect(needsPublishDate(undefined)).toBe(false)
  })
})

describe('latestDate', () => {
  it('compares instants, not strings, across offsets', () => {
    // 12:32+02:00 is 10:32Z, earlier than 11:00Z, though it sorts later as text
    expect(latestDate('2026-11-25T12:32:00.000+02:00', '2026-11-25T11:00:00Z')).toBe('2026-11-25T11:00:00Z')
  })
  it('handles missing values', () => {
    expect(latestDate(undefined, '2026-01-01T00:00:00Z')).toBe('2026-01-01T00:00:00Z')
    expect(latestDate('2026-01-01T00:00:00Z', undefined)).toBe('2026-01-01T00:00:00Z')
    expect(latestDate(undefined, undefined)).toBeUndefined()
  })
})

describe('toUtcIso', () => {
  it('normalizes offsets and microseconds to UTC Z', () => {
    expect(toUtcIso('2026-11-25T12:32:00.000+02:00')).toBe('2026-11-25T10:32:00.000Z')
    expect(toUtcIso('2026-01-27T15:39:06.779642+00:00')).toBe('2026-01-27T15:39:06.779Z')
    expect(toUtcIso(undefined)).toBeUndefined()
  })
})

describe('findDateProblems', () => {
  const now = new Date('2026-11-26T12:00:00Z')

  it('flags published articles with no, future or inverted dates', () => {
    const {errors} = findDateProblems(
      [
        {_id: 'a', status: 'published', publishedAt: null},
        {_id: 'b', status: 'published', publishedAt: '2026-12-01T00:00:00Z'},
        {_id: 'c', status: 'published', publishedAt: '2026-11-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z'},
        {_id: 'd', status: 'published', publishedAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-20T00:00:00Z'},
        {_id: 'e', status: 'draft'},
      ],
      now,
    )
    expect(errors.map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })

  it('warns when an unpublished draft carries different dates', () => {
    const {errors, warnings} = findDateProblems(
      [
        {_id: 'x', status: 'published', publishedAt: null},
        {_id: 'drafts.x', status: 'published', publishedAt: '2026-11-23T09:00:00Z'},
      ],
      now,
    )
    expect(errors).toHaveLength(1)
    expect(warnings).toEqual([
      {id: 'x', problem: 'unpublished draft changes publishedAt: live none, draft 2026-11-23T09:00:00Z'},
    ])
  })
})
