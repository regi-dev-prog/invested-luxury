import Image from 'next/image';
import Link from 'next/link';
import type { SanityImage } from '@/types';
import { urlFor } from '@/sanity/client';

interface HeroProps {
  title: string;
  subtitle?: string;
  image?: SanityImage;
  ctaText?: string;
  ctaLink?: string;
  variant?: 'full' | 'split' | 'minimal';
  overlay?: boolean;
}

export default function Hero({
  title,
  subtitle,
  image,
  ctaText,
  ctaLink,
  variant = 'full',
  overlay = true,
}: HeroProps) {
  if (variant === 'minimal') {
    return (
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-luxury text-center">
          <h1 className="font-serif text-display text-black mb-4 text-balance">
            {title}
          </h1>
          {subtitle && (
            <p className="text-body-lg text-charcoal max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          {ctaText && ctaLink && (
            <Link href={ctaLink} className="btn-primary mt-8 inline-block">
              {ctaText}
            </Link>
          )}
        </div>
      </section>
    );
  }

  if (variant === 'split') {
    return (
      <section className="min-h-[70vh] flex items-stretch">
        {/* Content Side */}
        <div className="w-full lg:w-1/2 flex items-center bg-cream">
          <div className="container-luxury py-16 lg:py-24 lg:pr-16">
            <h1 className="font-serif text-display-lg text-black mb-6 text-balance">
              {title}
            </h1>
            {subtitle && (
              <p className="text-body-lg text-charcoal mb-8 max-w-lg">
                {subtitle}
              </p>
            )}
            {ctaText && ctaLink && (
              <Link href={ctaLink} className="btn-primary inline-block">
                {ctaText}
              </Link>
            )}
          </div>
        </div>

        {/* Image Side */}
        <div className="hidden lg:block w-1/2 relative">
          {image ? (
            <Image
              src={urlFor(image).width(1200).height(900).url()}
              alt={image.alt || title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-charcoal" />
          )}
        </div>
      </section>
    );
  }

  // Full variant (default)
  return (
    <section className="relative min-h-[80vh] flex items-center">
      {/* Background Image */}
      {image && (
        <Image
          src={urlFor(image).width(1920).height(1080).url()}
          alt={image.alt || title}
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      {/* Content */}
      <div className="relative z-10 container-luxury py-24 text-center">
        <h1 className="font-serif text-display-lg text-white mb-6 text-balance max-w-4xl mx-auto">
          {title}
        </h1>
        {subtitle && (
          <p className="text-body-lg text-white/90 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {ctaText && ctaLink && (
          <Link href={ctaLink} className="btn-gold inline-block">
            {ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}
