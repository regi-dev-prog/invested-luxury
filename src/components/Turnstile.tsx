'use client';

import { useEffect, useRef, useCallback } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export default function Turnstile({ onVerify, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isRenderedRef = useRef(false);
  
  // Use refs for callbacks to avoid re-render loops
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);
  
  // Update refs when props change
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  }, [onVerify, onError, onExpire]);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || isRenderedRef.current) return;
    
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.error('Turnstile site key not found');
      return;
    }

    try {
      // Clear any existing content
      containerRef.current.innerHTML = '';
      
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerifyRef.current(token);
        },
        'error-callback': () => {
          onErrorRef.current?.();
        },
        'expired-callback': () => {
          onExpireRef.current?.();
        },
        theme: 'light',
      });
      
      isRenderedRef.current = true;
    } catch (error) {
      console.error('Turnstile render error:', error);
    }
  }, []);

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="turnstile"]');
    
    if (window.turnstile) {
      // Turnstile already loaded
      renderWidget();
      return;
    }

    if (existingScript) {
      // Script exists but not loaded yet, wait for it
      window.onloadTurnstileCallback = renderWidget;
      return;
    }

    // Load the script
    window.onloadTurnstileCallback = renderWidget;
    
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      isRenderedRef.current = false;
      widgetIdRef.current = null;
    };
  }, [renderWidget]);

  return <div ref={containerRef} className="turnstile-container" />;
}