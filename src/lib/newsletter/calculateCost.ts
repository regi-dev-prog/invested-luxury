/**
 * Cost layer for the weekly newsletter engine.
 *
 * Pure function: takes a Sanity `product` document and returns the numbers for
 * the issue. No network, no I/O, no mutation. The only ambient input is "now"
 * (for the price-freshness check), which is injectable so the function stays
 * deterministic and testable.
 */

export type CostCategory = 'fashion' | 'wellness'

/** The subset of the Sanity product document this layer reads. */
export interface NewsletterProductInput {
  costCategory?: CostCategory | null
  price?: number | null
  /** ISO date string 'YYYY-MM-DD' from the Sanity `date` field. */
  priceLastVerified?: string | null
  // Fashion inputs
  expectedLifespanYears?: number | null
  expectedWearsPerYear?: number | null
  expectedResaleValue?: number | null
  annualCareCost?: number | null
  // Wellness inputs
  expectedServiceLifeYears?: number | null
  sessionsPerWeek?: number | null
  annualRunningCost?: number | null
  comparableCostPerVisit?: number | null
}

export interface FashionMetrics {
  totalAcquisitionCost: number
  totalCareCost: number
  netCostAfterResale: number
  totalWears: number
  costPerWear: number
  valueRetainedPercent: number
  costPerYear: number
}

export interface WellnessMetrics {
  netCostAfterResale: number
  totalSessions: number
  costPerSession: number
  costPerYear: number
  breakEvenSessions: number
  lifetimeSavingVsPerVisit: number
}

export interface EligibleFashionResult {
  isEligible: true
  category: 'fashion'
  reasons: []
  /** True when priceLastVerified is absent — the engine must verify the price
   *  live before this product ships. A missing date does not disqualify. */
  needsPriceVerification: boolean
  metrics: FashionMetrics
}

export interface EligibleWellnessResult {
  isEligible: true
  category: 'wellness'
  reasons: []
  /** See EligibleFashionResult.needsPriceVerification. */
  needsPriceVerification: boolean
  metrics: WellnessMetrics
}

export interface IneligibleResult {
  isEligible: false
  category: CostCategory | null
  reasons: string[]
}

export type CostCalcResult = EligibleFashionResult | EligibleWellnessResult | IneligibleResult

export interface CostCalcOptions {
  /** Reference "today" for the price-freshness check. Defaults to the real now. */
  now?: Date
  /** Max age in days for priceLastVerified before the product is ineligible. */
  maxPriceAgeDays?: number
}

const DEFAULT_MAX_PRICE_AGE_DAYS = 60
const MS_PER_DAY = 24 * 60 * 60 * 1000
const WEEKS_PER_YEAR = 52

/** Type guard: a real, finite number (excludes null, undefined, NaN, Infinity). */
function isNum(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Narrows a value the caller has already validated as a finite number. The throw
 * is unreachable in normal flow (eligibility is checked before any metric is
 * computed); it exists only so the types stay honest without `any` or `!`.
 */
function required(value: number | null | undefined, name: string): number {
  if (!isNum(value)) {
    throw new Error(`calculateCost: '${name}' expected a finite number after validation`)
  }
  return value
}

export function calculateCost(
  product: NewsletterProductInput,
  options: CostCalcOptions = {},
): CostCalcResult {
  const now = options.now ?? new Date()
  const maxAge = options.maxPriceAgeDays ?? DEFAULT_MAX_PRICE_AGE_DAYS

  const category: CostCategory | null =
    product.costCategory === 'fashion' || product.costCategory === 'wellness'
      ? product.costCategory
      : null

  const reasons: string[] = []

  // --- Common eligibility ---
  if (category === null) {
    reasons.push('Missing or invalid costCategory (expected "fashion" or "wellness")')
  }

  if (!isNum(product.price)) {
    reasons.push('Missing price')
  } else if (product.price <= 0) {
    reasons.push('Price must be greater than zero')
  }

  // A missing priceLastVerified does NOT disqualify: the engine verifies the
  // price at runtime for the one product it selects. It only flags the need.
  // A date that exists but is stale (older than maxAge) still disqualifies.
  let needsPriceVerification = false
  if (product.priceLastVerified == null || product.priceLastVerified === '') {
    needsPriceVerification = true
  } else {
    const verified = new Date(product.priceLastVerified)
    if (Number.isNaN(verified.getTime())) {
      reasons.push('Invalid priceLastVerified date')
    } else {
      const ageDays = Math.floor((now.getTime() - verified.getTime()) / MS_PER_DAY)
      if (ageDays > maxAge) {
        reasons.push(`Price last verified ${ageDays} days ago (max ${maxAge})`)
      }
    }
  }

  // --- Category-specific required fields (denominators must be > 0) ---
  if (category === 'fashion') {
    if (!isNum(product.expectedLifespanYears)) reasons.push('Missing expectedLifespanYears')
    else if (product.expectedLifespanYears <= 0) reasons.push('expectedLifespanYears must be greater than zero')

    if (!isNum(product.expectedWearsPerYear)) reasons.push('Missing expectedWearsPerYear')
    else if (product.expectedWearsPerYear <= 0) reasons.push('expectedWearsPerYear must be greater than zero')

    if (!isNum(product.expectedResaleValue)) reasons.push('Missing expectedResaleValue')
    if (!isNum(product.annualCareCost)) reasons.push('Missing annualCareCost')
  } else if (category === 'wellness') {
    if (!isNum(product.expectedServiceLifeYears)) reasons.push('Missing expectedServiceLifeYears')
    else if (product.expectedServiceLifeYears <= 0) reasons.push('expectedServiceLifeYears must be greater than zero')

    if (!isNum(product.sessionsPerWeek)) reasons.push('Missing sessionsPerWeek')
    else if (product.sessionsPerWeek <= 0) reasons.push('sessionsPerWeek must be greater than zero')

    if (!isNum(product.annualRunningCost)) reasons.push('Missing annualRunningCost')

    if (!isNum(product.comparableCostPerVisit)) reasons.push('Missing comparableCostPerVisit')
    else if (product.comparableCostPerVisit <= 0) reasons.push('comparableCostPerVisit must be greater than zero')
    // expectedResaleValue is optional for wellness (defaults to 0).
  }

  if (reasons.length > 0 || category === null) {
    return { isEligible: false, category, reasons }
  }

  // --- Compute. Every denominator is guaranteed > 0 by the checks above,
  //     so no division here can produce NaN or Infinity. ---
  const price = required(product.price, 'price')

  if (category === 'fashion') {
    const lifespanYears = required(product.expectedLifespanYears, 'expectedLifespanYears')
    const wearsPerYear = required(product.expectedWearsPerYear, 'expectedWearsPerYear')
    const resaleValue = required(product.expectedResaleValue, 'expectedResaleValue')
    const annualCareCost = required(product.annualCareCost, 'annualCareCost')

    const totalAcquisitionCost = price
    const totalCareCost = annualCareCost * lifespanYears
    const netCostAfterResale = price + totalCareCost - resaleValue
    const totalWears = wearsPerYear * lifespanYears
    const costPerWear = netCostAfterResale / totalWears
    const valueRetainedPercent = (resaleValue / price) * 100
    const costPerYear = netCostAfterResale / lifespanYears

    return {
      isEligible: true,
      category: 'fashion',
      reasons: [],
      needsPriceVerification,
      metrics: {
        totalAcquisitionCost,
        totalCareCost,
        netCostAfterResale,
        totalWears,
        costPerWear,
        valueRetainedPercent,
        costPerYear,
      },
    }
  }

  // category === 'wellness'
  const serviceLifeYears = required(product.expectedServiceLifeYears, 'expectedServiceLifeYears')
  const sessionsPerWeek = required(product.sessionsPerWeek, 'sessionsPerWeek')
  const annualRunningCost = required(product.annualRunningCost, 'annualRunningCost')
  const comparableCostPerVisit = required(product.comparableCostPerVisit, 'comparableCostPerVisit')
  const resaleValue = isNum(product.expectedResaleValue) ? product.expectedResaleValue : 0

  const totalRunningCost = annualRunningCost * serviceLifeYears
  const netCostAfterResale = price + totalRunningCost - resaleValue
  const totalSessions = sessionsPerWeek * WEEKS_PER_YEAR * serviceLifeYears
  const costPerSession = netCostAfterResale / totalSessions
  const costPerYear = netCostAfterResale / serviceLifeYears
  const breakEvenSessions = netCostAfterResale / comparableCostPerVisit
  const lifetimeSavingVsPerVisit = comparableCostPerVisit * totalSessions - netCostAfterResale

  return {
    isEligible: true,
    category: 'wellness',
    reasons: [],
    needsPriceVerification,
    metrics: {
      netCostAfterResale,
      totalSessions,
      costPerSession,
      costPerYear,
      breakEvenSessions,
      lifetimeSavingVsPerVisit,
    },
  }
}
