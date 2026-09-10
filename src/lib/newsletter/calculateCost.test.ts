import { describe, it, expect } from 'vitest'
import { calculateCost, type NewsletterProductInput } from './calculateCost'

// Fixed reference date so the 60-day price-freshness check is deterministic.
const NOW = new Date('2026-09-09T12:00:00Z')

/** Build an ISO 'YYYY-MM-DD' date a given number of days before NOW. */
function daysBeforeNow(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

describe('calculateCost — fashion', () => {
  // The Bottega Veneta Andiamo sample document.
  const bottega: NewsletterProductInput = {
    costCategory: 'fashion',
    price: 4500,
    priceLastVerified: daysBeforeNow(5),
    expectedLifespanYears: 15,
    expectedWearsPerYear: 60,
    expectedResaleValue: 2700,
    annualCareCost: 40,
  }

  it('computes the correct cost-per-wear metrics', () => {
    const result = calculateCost(bottega, { now: NOW })
    expect(result.isEligible).toBe(true)
    if (!result.isEligible || result.category !== 'fashion') throw new Error('expected eligible fashion')

    const m = result.metrics
    expect(m.totalAcquisitionCost).toBe(4500)
    expect(m.totalCareCost).toBe(600) // 40 * 15
    expect(m.netCostAfterResale).toBe(2400) // 4500 + 600 - 2700
    expect(m.totalWears).toBe(900) // 60 * 15
    expect(m.costPerWear).toBeCloseTo(2.6666667, 6) // 2400 / 900
    expect(m.valueRetainedPercent).toBe(60) // 2700 / 4500 * 100
    expect(m.costPerYear).toBe(160) // 2400 / 15
  })
})

describe('calculateCost — wellness', () => {
  // A home sauna example.
  const sauna: NewsletterProductInput = {
    costCategory: 'wellness',
    price: 6000,
    priceLastVerified: daysBeforeNow(10),
    expectedServiceLifeYears: 10,
    sessionsPerWeek: 3,
    annualRunningCost: 200,
    comparableCostPerVisit: 50,
    expectedResaleValue: 0,
  }

  it('computes the correct cost-per-session metrics', () => {
    const result = calculateCost(sauna, { now: NOW })
    expect(result.isEligible).toBe(true)
    if (!result.isEligible || result.category !== 'wellness') throw new Error('expected eligible wellness')

    const m = result.metrics
    expect(m.netCostAfterResale).toBe(8000) // 6000 + 200*10 - 0
    expect(m.totalSessions).toBe(1560) // 3 * 52 * 10
    expect(m.costPerSession).toBeCloseTo(5.1282051, 6) // 8000 / 1560
    expect(m.costPerYear).toBe(800) // 8000 / 10
    expect(m.breakEvenSessions).toBe(160) // 8000 / 50
    expect(m.lifetimeSavingVsPerVisit).toBe(70000) // 50*1560 - 8000
  })

  it('subtracts a positive resale value from the net cost', () => {
    // A red light panel that retains some resale value.
    const redLightPanel: NewsletterProductInput = {
      costCategory: 'wellness',
      price: 2000,
      priceLastVerified: daysBeforeNow(7),
      expectedServiceLifeYears: 8,
      sessionsPerWeek: 5,
      annualRunningCost: 30,
      comparableCostPerVisit: 25,
      expectedResaleValue: 400,
    }

    const result = calculateCost(redLightPanel, { now: NOW })
    expect(result.isEligible).toBe(true)
    if (!result.isEligible || result.category !== 'wellness') throw new Error('expected eligible wellness')

    const m = result.metrics
    expect(m.netCostAfterResale).toBe(1840) // 2000 + 30*8 - 400
    expect(m.totalSessions).toBe(2080) // 5 * 52 * 8
    expect(m.costPerSession).toBeCloseTo(0.8846154, 6) // 1840 / 2080
    expect(m.costPerYear).toBe(230) // 1840 / 8
    expect(m.breakEvenSessions).toBe(73.6) // 1840 / 25
    expect(m.lifetimeSavingVsPerVisit).toBe(50160) // 25*2080 - 1840
  })
})

describe('calculateCost — eligibility', () => {
  it('is ineligible when costCategory is missing', () => {
    const result = calculateCost(
      {
        price: 4500,
        priceLastVerified: daysBeforeNow(5),
        expectedLifespanYears: 15,
        expectedWearsPerYear: 60,
        expectedResaleValue: 2700,
        annualCareCost: 40,
      },
      { now: NOW },
    )
    expect(result.isEligible).toBe(false)
    expect(result.category).toBeNull()
    expect(result.reasons.some((r) => r.toLowerCase().includes('costcategory'))).toBe(true)
  })

  it('is ineligible when priceLastVerified is 90 days old', () => {
    const result = calculateCost(
      {
        costCategory: 'fashion',
        price: 4500,
        priceLastVerified: daysBeforeNow(90),
        expectedLifespanYears: 15,
        expectedWearsPerYear: 60,
        expectedResaleValue: 2700,
        annualCareCost: 40,
      },
      { now: NOW },
    )
    expect(result.isEligible).toBe(false)
    expect(result.reasons.some((r) => r.includes('Price last verified'))).toBe(true)
  })

  it('is ineligible (not thrown, no Infinity) when expectedWearsPerYear is zero', () => {
    let result!: ReturnType<typeof calculateCost>
    expect(() => {
      result = calculateCost(
        {
          costCategory: 'fashion',
          price: 4500,
          priceLastVerified: daysBeforeNow(5),
          expectedLifespanYears: 15,
          expectedWearsPerYear: 0,
          expectedResaleValue: 2700,
          annualCareCost: 40,
        },
        { now: NOW },
      )
    }).not.toThrow()

    expect(result.isEligible).toBe(false)
    expect(result.reasons.some((r) => r.includes('expectedWearsPerYear'))).toBe(true)
    // No metrics object at all on an ineligible result → no Infinity/NaN leaked.
    expect('metrics' in result).toBe(false)
  })
})
