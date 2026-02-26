'use client';

import { ExternalLink, ShoppingBag } from 'lucide-react';
import { trackAffiliateClick } from '@/lib/analytics';

interface AffiliateButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'inline';
  retailer?: string;
  productName?: string;
  brand?: string;
  price?: string;
  category?: string;
  articleSlug?: string;
  position?: string;
  className?: string;
}

export default function AffiliateButton({
  href,
  children,
  variant = 'primary',
  retailer,
  productName,
  brand,
  price,
  category,
  articleSlug,
  position,
  className = '',
}: AffiliateButtonProps) {
  const baseClasses = 'inline-flex items-center gap-2 transition-all duration-300';
  
  const variantClasses = {
    primary: 'px-8 py-4 bg-black text-white hover:bg-[#C9A227] font-medium tracking-wide',
    secondary: 'px-6 py-3 bg-white border-2 border-black text-black hover:bg-black hover:text-white font-medium tracking-wide',
    inline: 'text-black underline underline-offset-4 decoration-[#C9A227] hover:text-[#C9A227] font-medium',
  };

  const handleClick = () => {
    trackAffiliateClick({
      productName,
      brand,
      price,
      retailer: retailer || 'unknown',
      category,
      articleSlug,
      position: position || variant,
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      data-retailer={retailer}
      onClick={handleClick}
    >
      {children}
      {variant === 'inline' ? (
        <ExternalLink size={14} className="inline" />
      ) : (
        <ShoppingBag size={18} />
      )}
    </a>
  );
}
