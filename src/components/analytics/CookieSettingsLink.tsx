'use client';

import { OPEN_CONSENT_EVENT } from '@/lib/consent';

/** Footer link that reopens the cookie banner. */
export default function CookieSettingsLink({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className={className}
    >
      Cookie settings
    </button>
  );
}
