'use client';

import { useState, useCallback } from 'react';
import Turnstile from './Turnstile';
import { trackNewsletterSignup } from '@/lib/analytics';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Stable callbacks - won't cause re-renders
  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleError = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      return;
    }
    
    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setTurnstileToken(null);
        trackNewsletterSignup('inline');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center">
        <p className="text-charcoal font-medium">Welcome to the list! ✨</p>
        <p className="text-sm text-charcoal-light mt-1">Check your inbox for a welcome email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors text-sm bg-white"
          required
          disabled={status === 'loading'}
        />
        <button 
          type="submit"
          disabled={status === 'loading' || !turnstileToken}
          className="px-6 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Turnstile 
          onVerify={handleVerify}
          onExpire={handleExpire}
          onError={handleError}
        />
      </div>
      
      {status === 'error' && (
        <p className="text-red-500 text-sm mt-2 text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}