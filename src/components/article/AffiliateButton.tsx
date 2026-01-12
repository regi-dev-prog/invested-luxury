import { ExternalLink, ShoppingBag } from 'lucide-react';

interface AffiliateButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'inline';
  retailer?: string;
  className?: string;
}

export default function AffiliateButton({
  href,
  children,
  variant = 'primary',
  retailer,
  className = '',
}: AffiliateButtonProps) {
  const baseClasses = 'inline-flex items-center gap-2 transition-all duration-300';
  
  const variantClasses = {
    primary: 'px-8 py-4 bg-black text-white hover:bg-[#C9A227] font-medium tracking-wide',
    secondary: 'px-6 py-3 bg-white border-2 border-black text-black hover:bg-black hover:text-white font-medium tracking-wide',
    inline: 'text-black underline underline-offset-4 decoration-[#C9A227] hover:text-[#C9A227] font-medium',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      data-retailer={retailer}
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
