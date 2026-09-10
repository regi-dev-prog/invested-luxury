/**
 * Weekly anchor-product selector for the newsletter engine.
 *
 * Fully deterministic: the same (products, issueDate) always yields the same
 * result. No model, no Math.random, no network. The only ambient input is the
 * clock, which is injectable via options.now and otherwise defaults to the
 * issue date, so a run is reproducible from its inputs alone.
 */
import {
  calculateCost,
  type CostCategory,
  type NewsletterProductInput,
  type EligibleFashionResult,
  type EligibleWellnessResult,
} from './calculateCost'

/** A product document as fed to the selector. */
export interface SelectableProduct extends NewsletterProductInput {
  _id: string
  name?: string | null
  lastFeaturedDate?: string | null
}

type EligibleCalc = EligibleFashionResult | EligibleWellnessResult

export interface CandidatePool {
  /** Eligible products in this week's category (the raw depth of the pool). */
  eligibleInCategory: number
  /** Of those, how many were dropped for being featured within the window. */
  excludedRecentlyFeatured: number
  /** Eligible AND not recently featured — the products actually pickable. */
  selectable: number
}

export interface SelectionSuccess {
  selected: true
  isoWeek: number
  category: CostCategory
  product: SelectableProduct
  calc: EligibleCalc
  pool: CandidatePool
}

export interface SelectionFailure {
  selected: false
  isoWeek: number
  category: CostCategory
  reason: string
  pool: CandidatePool
}

export type SelectionResult = SelectionSuccess | SelectionFailure

export interface SelectProductOptions {
  /** Reference clock for freshness/recency checks. Defaults to issueDate. */
  now?: Date
  /** A product featured within this many days is excluded. Default 90. */
  featuredExclusionDays?: number
}

const DEFAULT_FEATURED_EXCLUSION_DAYS = 90
const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * ISO 8601 week number (1-53). Weeks start Monday; week 1 is the week
 * containing the year's first Thursday. Computed entirely in UTC so it never
 * depends on the runner's timezone.
 */
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  // Shift to the Thursday of the current ISO week (Mon=0..Sun=6).
  const dayNum = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const thursday = d.getTime()
  // Thursday of ISO week 1 is the first Thursday of the year.
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const yearStartDayNum = (yearStart.getUTCDay() + 6) % 7
  yearStart.setUTCDate(yearStart.getUTCDate() - yearStartDayNum + 3)
  return 1 + Math.round((thursday - yearStart.getTime()) / (7 * MS_PER_DAY))
}

/** Even ISO week → fashion, odd → wellness. */
export function categoryForWeek(isoWeek: number): CostCategory {
  return isoWeek % 2 === 0 ? 'fashion' : 'wellness'
}

function daysSince(iso: string, now: Date): number | null {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return Math.floor((now.getTime() - d.getTime()) / MS_PER_DAY)
}

export function selectWeeklyProduct(
  products: SelectableProduct[],
  issueDate: Date,
  options: SelectProductOptions = {},
): SelectionResult {
  const now = options.now ?? issueDate
  const exclusionDays = options.featuredExclusionDays ?? DEFAULT_FEATURED_EXCLUSION_DAYS

  const isoWeek = getISOWeek(issueDate)
  const category = categoryForWeek(isoWeek)

  // 1. Keep only products that are eligible AND in this week's category.
  const eligible: Array<{product: SelectableProduct; calc: EligibleCalc}> = []
  for (const product of products) {
    const calc = calculateCost(product, {now})
    if (calc.isEligible && calc.category === category) {
      eligible.push({product, calc})
    }
  }

  // 2. Drop anything featured within the exclusion window.
  const excludedRecentlyFeatured = eligible.filter(({product}) => {
    if (!product.lastFeaturedDate) return false
    const age = daysSince(product.lastFeaturedDate, now)
    return age !== null && age <= exclusionDays
  }).length

  const selectable = eligible.filter(({product}) => {
    if (!product.lastFeaturedDate) return true
    const age = daysSince(product.lastFeaturedDate, now)
    return age === null || age > exclusionDays
  })

  const pool: CandidatePool = {
    eligibleInCategory: eligible.length,
    excludedRecentlyFeatured,
    selectable: selectable.length,
  }

  if (selectable.length === 0) {
    const reason =
      eligible.length === 0
        ? `No eligible ${category} products for ISO week ${isoWeek}`
        : `All ${eligible.length} eligible ${category} product(s) were featured within the last ${exclusionDays} days`
    return {selected: false, isoWeek, category, reason, pool}
  }

  // 3. Rank: never-featured first, then higher price, then _id ascending.
  selectable.sort((a, b) => {
    const aFeatured = a.product.lastFeaturedDate ? 1 : 0
    const bFeatured = b.product.lastFeaturedDate ? 1 : 0
    if (aFeatured !== bFeatured) return aFeatured - bFeatured

    const priceA = a.product.price ?? 0
    const priceB = b.product.price ?? 0
    if (priceB !== priceA) return priceB - priceA

    if (a.product._id < b.product._id) return -1
    if (a.product._id > b.product._id) return 1
    return 0
  })

  const winner = selectable[0]
  return {
    selected: true,
    isoWeek,
    category,
    product: winner.product,
    calc: winner.calc,
    pool,
  }
}
