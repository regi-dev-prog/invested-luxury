import { describe, it, expect } from 'vitest'
import { selectWeeklyProduct, getISOWeek, categoryForWeek, type SelectableProduct } from './selectProduct'
import type { CostCategory } from './calculateCost'

function daysBefore(ref: Date, days: number): string {
  return new Date(ref.getTime() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

/** Build an eligible product in the given category, fresh price by default. */
function eligible(
  category: CostCategory,
  now: Date,
  overrides: Partial<SelectableProduct> = {},
): SelectableProduct {
  const common = {
    priceLastVerified: daysBefore(now, 5),
    price: 3000,
  }
  const byCategory =
    category === 'fashion'
      ? {
          costCategory: 'fashion' as const,
          expectedLifespanYears: 10,
          expectedWearsPerYear: 50,
          expectedResaleValue: 1000,
          annualCareCost: 30,
        }
      : {
          costCategory: 'wellness' as const,
          expectedServiceLifeYears: 8,
          sessionsPerWeek: 4,
          annualRunningCost: 100,
          comparableCostPerVisit: 40,
        }
  return {_id: 'p-default', ...common, ...byCategory, ...overrides}
}

describe('week rotation', () => {
  it('alternates category between consecutive weeks', () => {
    const w1 = selectWeeklyProduct([], new Date('2026-06-15'))
    const w2 = selectWeeklyProduct([], new Date('2026-06-22')) // +7 days
    expect(w2.isoWeek).toBe(w1.isoWeek + 1)
    expect(w1.category).not.toBe(w2.category)
  })

  it('maps even weeks to fashion and odd weeks to wellness', () => {
    expect(categoryForWeek(2)).toBe('fashion')
    expect(categoryForWeek(3)).toBe('wellness')
    const r = selectWeeklyProduct([], new Date('2026-06-15'))
    expect(r.category).toBe(getISOWeek(new Date('2026-06-15')) % 2 === 0 ? 'fashion' : 'wellness')
  })
})

describe('recently-featured exclusion', () => {
  it('excludes a product featured 30 days ago but allows 120 days ago', () => {
    const issueDate = new Date('2026-06-15')
    const now = issueDate
    const category = selectWeeklyProduct([], issueDate, {now}).category

    const featured30 = selectWeeklyProduct(
      [eligible(category, now, {_id: 'p-30', lastFeaturedDate: daysBefore(now, 30)})],
      issueDate,
      {now},
    )
    expect(featured30.selected).toBe(false)
    if (!featured30.selected) {
      expect(featured30.reason).toContain('featured within the last')
    }

    const featured120 = selectWeeklyProduct(
      [eligible(category, now, {_id: 'p-120', lastFeaturedDate: daysBefore(now, 120)})],
      issueDate,
      {now},
    )
    expect(featured120.selected).toBe(true)
    if (featured120.selected) expect(featured120.product._id).toBe('p-120')
  })
})

describe('eligibility filtering', () => {
  it('does not select an ineligible product (stale price)', () => {
    const issueDate = new Date('2026-06-15')
    const now = issueDate
    const category = selectWeeklyProduct([], issueDate, {now}).category

    const stale = eligible(category, now, {_id: 'p-stale', priceLastVerified: daysBefore(now, 200)})
    const result = selectWeeklyProduct([stale], issueDate, {now})

    expect(result.selected).toBe(false)
    expect(result.pool.eligibleInCategory).toBe(0)
  })
})

describe('ranking', () => {
  it('prefers never-featured, then higher price, then _id ascending', () => {
    const issueDate = new Date('2026-06-15')
    const now = issueDate
    const category = selectWeeklyProduct([], issueDate, {now}).category

    const products = [
      eligible(category, now, {_id: 'b-featured-cheap', price: 2000, lastFeaturedDate: daysBefore(now, 200)}),
      eligible(category, now, {_id: 'z-new-cheap', price: 2000}),
      eligible(category, now, {_id: 'a-new-expensive', price: 9000}),
      eligible(category, now, {_id: 'm-new-expensive', price: 9000}),
    ]
    const result = selectWeeklyProduct(products, issueDate, {now})
    expect(result.selected).toBe(true)
    // never-featured + highest price + lowest _id among ties.
    if (result.selected) expect(result.product._id).toBe('a-new-expensive')
  })
})

describe('determinism', () => {
  it('returns the same result for the same input twice', () => {
    const issueDate = new Date('2026-06-15')
    const now = issueDate
    const category = selectWeeklyProduct([], issueDate, {now}).category
    const products = [
      eligible(category, now, {_id: 'p-1', price: 5000}),
      eligible(category, now, {_id: 'p-2', price: 5000}),
      eligible(category, now, {_id: 'p-3', price: 7000}),
    ]
    const a = selectWeeklyProduct(products, issueDate, {now})
    const b = selectWeeklyProduct(products, issueDate, {now})
    expect(a).toEqual(b)
  })
})

describe('empty pool', () => {
  it('returns an explicit failure result without throwing on an empty list', () => {
    let result!: ReturnType<typeof selectWeeklyProduct>
    expect(() => {
      result = selectWeeklyProduct([], new Date('2026-06-15'))
    }).not.toThrow()
    expect(result.selected).toBe(false)
    if (!result.selected) {
      expect(result.reason).toBeTruthy()
      expect(result.pool.eligibleInCategory).toBe(0)
    }
  })
})
