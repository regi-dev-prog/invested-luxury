'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { trackAffiliateClick } from '@/lib/analytics';

interface StickyBuyBarProps {
  productName: string;
  price: string;
  primaryLink?: {
    url: string;
    retailer: string;
  };
  category?: string;
  articleSlug?: string;
  showAfterScroll?: number;
}

export default function StickyBuyBar({
  productName,
  price,
  primaryLink,
  category,
  articleSlug,
  showAfterScroll = 400,
}: StickyBuyBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed) return;
      
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollY / (docHeight - winHeight);
      
      // Show after scrolling past threshold, hide in last 10% of page
      setIsVisible(scrollY > showAfterScroll && scrollPercent < 0.9);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, isDismissed]);

  const handleShopClick = () => {
    if (primaryLink) {
      trackAffiliateClick({
        productName,
        price,
        retailer: primaryLink.retailer,
        category,
        articleSlug,
        position: 'sticky-bar',
      });
    }
  };

  // Safety check - don't render if no link or not visible
  if (!primaryLink || !primaryLink.url || !isVisible || isDismissed) return null;

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex-1 min-w-0 mr-3">
            <p className="text-sm font-medium text-black truncate">{productName}</p>
            <p className="text-sm text-[#C9A227]">{price}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={primaryLink.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium hover:bg-[#C9A227] transition-colors"
              onClick={handleShopClick}
            >
              <ShoppingBag size={16} />
              Shop
            </a>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 text-gray-400 hover:text-black transition-colors"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Floating Card */}
      <div className="hidden md:block fixed right-8 top-1/3 z-40 w-64 bg-[#FAF9F6] border border-gray-200 shadow-lg animate-fade-in">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-black transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
        <div className="p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Shop This</p>
          <h4 className="font-serif text-lg text-black mb-1 leading-tight">{productName}</h4>
          <p className="text-[#C9A227] font-medium mb-4">{price}</p>
          <a
            href={primaryLink.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-black text-white text-sm font-medium hover:bg-[#C9A227] transition-colors"
            onClick={handleShopClick}
          >
            <ShoppingBag size={16} />
            Shop at {primaryLink.retailer || 'Retailer'}
          </a>
        </div>
      </div>
    </>
  );
}
