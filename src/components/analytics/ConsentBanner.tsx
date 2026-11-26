'use client';

/**
 * ConsentBanner
 * Cookie choice for visitors in the EEA, UK and Switzerland (see src/lib/consent.ts).
 * Accept and Reject have equal weight, as EU regulators expect.
 * The footer "Cookie settings" link reopens it for anyone.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  CONSENT_STORAGE_KEY,
  OPEN_CONSENT_EVENT,
  parseStoredConsent,
  type ConsentValue,
} from '@/lib/consent';

type W = Window & {
  gtag?: (...a: unknown[]) => void;
  __ilConsentRequired?: boolean;
};

function readStored() {
  try {
    return parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const w = window as W;
    if (w.__ilConsentRequired && !readStored()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  const choose = (v: ConsentValue) => {
    const w = window as W;
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ v, t: Date.now() }));
    } catch {
      /* private mode: the choice applies to this page view only */
    }
    if (typeof w.gtag === 'function') w.gtag('consent', 'update', { analytics_storage: v });
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black text-white"
    >
      <div className="container-luxury flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-white/80 md:max-w-2xl">
          We use analytics cookies to see which articles readers find useful. No advertising cookies. You can change
          this any time from &ldquo;Cookie settings&rdquo; in the footer.{' '}
          <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-gold">
            Privacy Policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="min-w-[110px] border border-white px-5 py-2.5 text-sm font-medium tracking-wide hover:bg-white hover:text-black transition-colors"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="min-w-[110px] border border-white px-5 py-2.5 text-sm font-medium tracking-wide hover:bg-white hover:text-black transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
