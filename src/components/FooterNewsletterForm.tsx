'use client';
import { useState, useCallback } from 'react';
import Turnstile from './Turnstile';

export default function FooterNewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleExpire = useCallback(() => setTurnstileToken(null), []);
  const handleError = useCallback(() => setTurnstileToken(null), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) return;
    
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
        <p className="text-gold font-medium">Welcome to the Inner Circle! ✨</p>
        <p className="text-sm text-white/70 mt-1">Check your inbox for a welcome email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-gold transition-colors"
          required
          disabled={status === 'loading'}
        />
        <button 
          type="submit"
          disabled={status === 'loading' || !turnstileToken}
          className="btn-gold whitespace-nowrap disabled:opacity-50"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      <div className="mt-4 flex justify-center">
        <Turnstile onVerify={handleVerify} onExpire={handleExpire} onError={handleError} theme="dark" />
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-sm mt-2 text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
