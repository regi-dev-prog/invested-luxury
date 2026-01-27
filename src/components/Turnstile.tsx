'use client';
import { useEffect, useRef, useId } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
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
    turnstileCallbacks?: Array<() => void>;
  }
}

export default function Turnstile({ onVerify, onError, onExpire, theme = 'light' }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const uniqueId = useId();
  
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);
  
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;
      
      const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      if (!siteKey) {
        console.error('Turnstile site key not found');
        return;
      }

      try {
        containerRef.current.innerHTML = '';
        
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onVerifyRef.current(token),
          'error-callback': () => onErrorRef.current?.(),
          'expired-callback': () => onExpireRef.current?.(),
          theme,
        });
      } catch (error) {
        console.error('Turnstile render error:', error);
      }
    };

    // If Turnstile is already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Initialize callbacks array if needed
    if (!window.turnstileCallbacks) {
      window.turnstileCallbacks = [];
    }
    
    // Add our callback to the queue
    window.turnstileCallbacks.push(renderWidget);

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="turnstile"]');
    if (!existingScript) {
      // Create global callback that runs all queued callbacks
      (window as Window & { onloadTurnstileCallback?: () => void }).onloadTurnstileCallback = () => {
        window.turnstileCallbacks?.forEach(cb => cb());
        window.turnstileCallbacks = [];
      };

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      widgetIdRef.current = null;
    };
  }, [theme, uniqueId]);

  return <div ref={containerRef} />;
}
