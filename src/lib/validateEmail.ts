import { isDisposableEmail } from 'disposable-email-domains-js';

/**
 * Subscriber email validation for the newsletter signup.
 *
 * Runs AFTER Cloudflare Turnstile and BEFORE the Kit sync. Goal: keep obvious
 * bot signups out of the list (they hurt sender reputation and cost money),
 * while being conservative — we would rather let one bot through than reject a
 * real reader. Every rejection is surfaced (logged + owner email) so the
 * heuristic can be calibrated over time.
 *
 * Three layers, cheapest first:
 *   1. Basic RFC-ish format.
 *   2. Disposable domain blocklist (maintained via disposable-email-domains-js).
 *   3. "Suspicious local-part" heuristic — a weighted score over structural
 *      signals (digits, special chars). We deliberately avoid letter-statistic
 *      heuristics (vowel ratio, consonant runs): real terse names like
 *      "jdick" and "j-kcrawford" look statistically "random" and would be
 *      false-positived.
 */

export type EmailRejectReason = 'format' | 'disposable' | 'suspicious-local';

export interface EmailValidationResult {
  valid: boolean;
  /** Present only when valid === false. */
  reason?: EmailRejectReason;
  /** Human-readable explanation for logs / owner email. NEVER shown to the user. */
  detail?: string;
  /** Which heuristic signals fired (suspicious-local only). */
  signals?: string[];
}

/**
 * Weights for the suspicious-local-part score. An address is rejected when the
 * total reaches SUSPICION_THRESHOLD. These are intentionally exposed as
 * constants — tune them as real [newsletter][reject] data comes in.
 *
 * Deliberately NOT used: "ends with a digit". Real addresses for people born
 * before ~1990 are overwhelmingly name+year with no separator (susan1962,
 * jmt1965, rjb72) — a trailing-digit rule rejected 18/20 of them in testing.
 * A random bot local like "anadgix2" is structurally identical to "susan1962",
 * so we accept that such bots pass the heuristic (Turnstile + disposable list +
 * the owner-notification safety net still apply) rather than block real readers.
 * The reliable discriminator is a digit *followed by a letter* — real name+year
 * addresses keep digits in one trailing block; bots interleave them.
 */
const WEIGHTS = {
  /** S1: two or more special chars in a row, e.g. "dorra-_-". */
  consecutiveSpecials: 2,
  /** S2: 5+ digits total. (>=5 so a 4-digit "name+year" isn't caught here.) */
  manyDigits: 2,
  /** S3: a digit immediately followed by a letter, e.g. "64a" in "jdm64ajk10", "2u", "5o". */
  interspersedDigit: 2,
  /** S4: underscore present. */
  underscore: 1,
} as const;

const SUSPICION_THRESHOLD = 2;
const MANY_DIGITS_MIN = 5;

/** Basic format: exactly one local + dotted domain, no whitespace. */
const BASIC_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSubscriberEmail(rawEmail: unknown): EmailValidationResult {
  const email = String(rawEmail ?? '').trim().toLowerCase();

  // Layer 1 — basic RFC-ish format.
  if (!email || email.length > 254 || !BASIC_EMAIL_RE.test(email)) {
    return { valid: false, reason: 'format', detail: 'failed basic RFC format check' };
  }

  const atIdx = email.lastIndexOf('@');
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);

  // Layer 2 — disposable / throwaway domain.
  if (isDisposableEmail(email)) {
    return { valid: false, reason: 'disposable', detail: `disposable domain: ${domain}` };
  }

  // Layer 3 — suspicious local-part heuristic (conservative weighted score).
  const signals: string[] = [];
  let score = 0;

  const digitCount = (local.match(/[0-9]/g) || []).length;

  if (/[^a-z0-9]{2,}/.test(local)) {
    score += WEIGHTS.consecutiveSpecials;
    signals.push('consecutive-specials');
  }
  if (digitCount >= MANY_DIGITS_MIN) {
    score += WEIGHTS.manyDigits;
    signals.push('many-digits');
  }
  // A digit immediately followed by a letter. Real name+year addresses keep
  // their digits in one trailing block, so this fires on bots (64a, 2u, 5o)
  // but not on "susan1962" / "jmt1965".
  if (/[0-9][a-z]/.test(local)) {
    score += WEIGHTS.interspersedDigit;
    signals.push('interspersed-digit');
  }
  if (/_/.test(local)) {
    score += WEIGHTS.underscore;
    signals.push('underscore');
  }

  if (score >= SUSPICION_THRESHOLD) {
    return {
      valid: false,
      reason: 'suspicious-local',
      detail: `suspicious local-part (score ${score}): ${signals.join(', ')}`,
      signals,
    };
  }

  return { valid: true };
}
