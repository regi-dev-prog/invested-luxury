import Image from 'next/image';
import type { Product } from '@/types';
import { urlFor } from '@/sanity/client';
import { ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  // Format price
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (variant === 'compact') {
    return (
      <div className="group flex items-center gap-4 p-4 bg-cream hover:bg-cream/70 transition-colors">
        {product.image && (
          <div className="relative w-16 h-16 shrink-0 overflow-hidden bg-white">
            <Image
              src={urlFor(product.image).width(128).height(128).url()}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-caption text-charcoal-light uppercase tracking-wider">
            {product.brand}
          </p>
          <h4 className="font-serif text-base text-black truncate">
            {product.name}
          </h4>
          {product.price && (
            <p className="text-sm font-medium text-gold">
              {formatPrice(product.price, product.currency)}
            </p>
          )}
        </div>
        {product.affiliateLink && (
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="shrink-0 p-2 text-charcoal hover:text-gold transition-colors"
            aria-label={`Shop ${product.name}`}
          >
            <ExternalLink size={18} />
          </a>
        )}
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="group bg-white border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative aspect-square md:w-1/2 overflow-hidden bg-cream">
            {product.image && (
              <Image
                src={urlFor(product.image).width(600).height(600).url()}
                alt={product.name}
                fill
                className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>

          {/* Content */}
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <p className="text-caption text-charcoal-light uppercase tracking-widest mb-2">
              {product.brand}
            </p>
            <h3 className="font-serif text-headline text-black mb-4">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-body text-charcoal mb-6">
                {product.description}
              </p>
            )}
            {product.price && (
              <p className="text-title font-serif text-gold mb-6">
                {formatPrice(product.price, product.currency)}
              </p>
            )}
            {product.affiliateLink && (
              <a
                href={product.affiliateLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-primary inline-flex items-center gap-2 self-start"
              >
                Shop Now
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="group card overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-cream">
        {product.image && (
          <Image
            src={urlFor(product.image).width(400).height(400).url()}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-caption text-charcoal-light uppercase tracking-wider mb-1">
          {product.brand}
        </p>
        <h4 className="font-serif text-lg text-black mb-2 line-clamp-2">
          {product.name}
        </h4>
        <div className="flex items-center justify-between">
          {product.price && (
            <p className="font-medium text-gold">
              {formatPrice(product.price, product.currency)}
            </p>
          )}
          {product.affiliateLink && (
            <a
              href={product.affiliateLink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="text-sm font-medium uppercase tracking-wider text-charcoal hover:text-gold transition-colors flex items-center gap-1"
            >
              Shop
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
