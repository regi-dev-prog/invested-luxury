import { describe, it, expect } from 'vitest';
import { validateSubscriberEmail } from './validateEmail';

// Real bot signups that got through Turnstile — these MUST be rejected.
// NOTE: "anadgix2" is intentionally NOT here. It is structurally identical to a
// real "name + birth year" address (susan1962), so catching it would reject
// real readers en masse. See the "known limitation" test below.
const BOT_ADDRESSES = [
  'markjones2u@rambler.ru',
  'jdm64ajk10@outlook.com',
  'faltblatt_stufen.5o@icloud.com',
  'dorra-_-@hotmail.com',
];

// Real subscribers — these MUST pass. The heuristic exists to protect these.
const REAL_ADDRESSES = [
  'julie@juliewhitefitness.com',
  'jdick@horwathhtl.com',
  'vintagerepairsbylinda@gmail.com',
  'j-kcrawford@sbcglobal.net',
  'jacquelinelorraine@gmail.com',
];

// Realistic addresses for people born before ~1990: first name + birth year,
// last name + number, initials + digits. These MUST all pass — they were the
// calibration set that exposed an over-aggressive trailing-digit rule.
const BORN_BEFORE_1990 = [
  'susan1962@gmail.com',
  'davidbrown1975@yahoo.com',
  'karenmiller58@aol.com',
  'michael1968@hotmail.com',
  'jthompson72@gmail.com',
  'lindawilson1970@outlook.com',
  'robertjohnson44@gmail.com',
  'patricia1959@comcast.net',
  'deborah1965@yahoo.com',
  'jmt1965@gmail.com',
  'rjb72@aol.com',
  'kls1980@gmail.com',
  'markwilliams89@gmail.com',
  'nancy1957@hotmail.com',
  'stevendavis66@gmail.com',
  'barbara1960@gmail.com',
  'cynthiajones63@yahoo.com',
  'paulmartin1972@gmail.com',
  'susan.smith1962@gmail.com',
  'r.j.crawford58@sbcglobal.net',
];

describe('validateSubscriberEmail', () => {
  describe('rejects known bot-like signups', () => {
    for (const email of BOT_ADDRESSES) {
      it(`rejects ${email}`, () => {
        expect(validateSubscriberEmail(email).valid).toBe(false);
      });
    }
  });

  describe('allows real subscribers', () => {
    for (const email of REAL_ADDRESSES) {
      it(`allows ${email}`, () => {
        const result = validateSubscriberEmail(email);
        expect(result.valid).toBe(true);
        expect(result.reason).toBeUndefined();
      });
    }
  });

  describe('allows realistic "born before 1990" addresses (name+year, initials+digits)', () => {
    for (const email of BORN_BEFORE_1990) {
      it(`allows ${email}`, () => {
        expect(validateSubscriberEmail(email).valid).toBe(true);
      });
    }
  });

  describe('format layer', () => {
    it('rejects malformed addresses with reason "format"', () => {
      for (const bad of ['not-an-email', 'foo@bar', 'a b@c.com', '@gmail.com', 'x@']) {
        const result = validateSubscriberEmail(bad);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('format');
      }
    });

    it('handles non-string / empty input without throwing', () => {
      expect(validateSubscriberEmail(undefined).valid).toBe(false);
      expect(validateSubscriberEmail(null).valid).toBe(false);
      expect(validateSubscriberEmail('').valid).toBe(false);
    });
  });

  describe('disposable layer', () => {
    it('rejects disposable domains with reason "disposable"', () => {
      const result = validateSubscriberEmail('someone@mailinator.com');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('disposable');
    });
  });

  describe('known limitation: random local ending in a single digit', () => {
    it('lets "anadgix2" through — indistinguishable from a real name+year', () => {
      // Documents an accepted trade-off: blocking this pattern would reject
      // real "susan1962"-style addresses. Turnstile + disposable list + the
      // owner-notification safety net cover this case instead.
      expect(validateSubscriberEmail('anadgix2@yahoo.com').valid).toBe(true);
    });
  });

  describe('rejection detail is available for logging', () => {
    it('provides a detail string and signals on suspicious-local rejects', () => {
      const result = validateSubscriberEmail('dorra-_-@hotmail.com');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('suspicious-local');
      expect(result.detail).toBeTruthy();
      expect(result.signals && result.signals.length).toBeGreaterThan(0);
    });
  });
});
