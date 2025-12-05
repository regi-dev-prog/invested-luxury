'use client';

import { useState, useEffect } from 'react';

export default function ComingSoon() {
  const [isVisible, setIsVisible] = useState(true);

  // Check if we should hide the overlay (for development)
  useEffect(() => {
    const hideOverlay = localStorage.getItem('hideComingSoon');
    if (hideOverlay === 'true') {
      setIsVisible(false);
    }
  }, []);

  // Secret: Press 'Escape' 3 times to hide overlay (for you to preview)
  useEffect(() => {
    let pressCount = 0;
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        pressCount++;
        clearTimeout(timeout);
        
        if (pressCount === 3) {
          setIsVisible(false);
          localStorage.setItem('hideComingSoon', 'true');
          pressCount = 0;
        }
        
        timeout = setTimeout(() => {
          pressCount = 0;
        }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-stone-50 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="font-serif text-5xl md:text-7xl text-black mb-6">
          InvestedLuxury
        </h1>
        <p className="text-xl md:text-2xl text-stone-600 mb-8">
          Curated luxury fashion & lifestyle
        </p>
        <div className="w-24 h-px bg-stone-300 mx-auto mb-8"></div>
        <p className="text-lg text-stone-500 mb-12">
          Coming Soon
        </p>
        <p className="text-sm text-stone-400">
          Contact us at{' '}
          <a 
            href="mailto:hello@investedluxury.com" 
            className="underline hover:text-black transition-colors"
          >
            hello@investedluxury.com
          </a>
        </p>
      </div>
    </div>
  );
}