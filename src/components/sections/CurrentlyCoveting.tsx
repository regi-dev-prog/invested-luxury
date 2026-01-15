// components/CurrentlyCoveting.tsx
// "Currently Coveting" featured products section for homepage
// Desktop: Grid layout | Mobile: Horizontal scroll carousel

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/sanity/lib/image'

// Type definitions
interface FeaturedProduct {
  _id: string
  name: string
  brand: string
  price: number
  currency: string
  image?: {
    asset: {
      _ref: string
    }
    alt?: string
  }
  imageUrl?: string
  affiliateUrl: string
  retailer?: string
  category?: string
}

interface CurrentlyCovetingProps {
  products: FeaturedProduct[]
  title?: string
}

// Currency formatter
const formatPrice = (price: number, currency: string = 'USD'): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  }
  const symbol = symbols[currency] || '$'
  return `${symbol}${price.toLocaleString()}`
}

// Product Card Component
const ProductCard = ({ product }: { product: FeaturedProduct }) => {
  // Determine image source - Sanity uploaded or external URL
  const imageSource = product.image?.asset 
    ? urlForImage(product.image)?.width(400).height(400).url() 
    : product.imageUrl

  return (
    <div className="flex-shrink-0 w-[200px] md:w-auto group">
      {/* Product Image */}
      <Link 
        href={product.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block aspect-square relative bg-white overflow-hidden mb-4"
      >
        {imageSource ? (
          <Image
            src={imageSource}
            alt={product.image?.alt || `${product.brand} ${product.name}`}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 200px, (max-width: 1200px) 16vw, 180px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100">
            <span className="text-neutral-400 text-sm">No image</span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="text-center">
        {/* Brand + Name + Price */}
        <p className="font-montserrat text-xs uppercase tracking-wider text-neutral-800 leading-tight mb-2">
          {product.brand} {product.name} {formatPrice(product.price, product.currency)}
        </p>

        {/* Shop Now Button */}
        <Link
          href={product.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-block px-6 py-2 border border-black text-xs uppercase tracking-wider font-montserrat
                     hover:bg-black hover:text-white transition-colors duration-200"
        >
          Shop Now
        </Link>
      </div>
    </div>
  )
}

// Main Component
export default function CurrentlyCoveting({ 
  products, 
  title = "Currently Coveting" 
}: CurrentlyCovetingProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Title */}
        <div className="flex items-center gap-8 mb-10">
          <h2 className="font-cormorant text-3xl md:text-4xl font-semibold tracking-tight whitespace-nowrap">
            {title.split(' ').map((word, i) => (
              <span key={i} className={i === 0 ? 'block text-4xl md:text-5xl italic' : 'block'}>
                {word}
              </span>
            ))}
          </h2>
          
          {/* Decorative Line - Desktop only */}
          <div className="hidden md:block flex-1 h-px bg-neutral-200" />
        </div>

        {/* Products Container */}
        {/* Mobile: Horizontal Scroll | Desktop: Grid */}
        <div 
          className="flex md:grid gap-6 md:gap-8 overflow-x-auto md:overflow-visible 
                     scrollbar-hide snap-x snap-mandatory md:snap-none
                     -mx-4 px-4 md:mx-0 md:px-0 pb-4 md:pb-0"
          style={{
            gridTemplateColumns: `repeat(${Math.min(products.length, 6)}, minmax(0, 1fr))`
          }}
        >
          {products.map((product) => (
            <div key={product._id} className="snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex justify-center gap-1 mt-6 md:hidden">
          {products.map((_, index) => (
            <div 
              key={index} 
              className="w-1.5 h-1.5 rounded-full bg-neutral-300"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Alternative: Styled Title Version (matching the "MOST WANTED" design)
export function CurrentlyCovetingStacked({ 
  products, 
  title = "Currently Coveting" 
}: CurrentlyCovetingProps) {
  if (!products || products.length === 0) {
    return null
  }

  const [firstWord, secondWord] = title.split(' ')

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Flex container for title + products */}
        <div className="flex items-start gap-8 md:gap-12">
          {/* Stacked Title - Left side */}
          <div className="flex-shrink-0 hidden md:block">
            <h2 className="font-cormorant font-bold tracking-tighter leading-none">
              <span className="block text-5xl lg:text-6xl">{firstWord?.toUpperCase()}</span>
              <span className="block text-5xl lg:text-6xl italic">{secondWord?.toUpperCase()}</span>
            </h2>
          </div>

          {/* Mobile Title */}
          <h2 className="md:hidden font-cormorant text-2xl font-semibold mb-6">
            {title}
          </h2>

          {/* Products - Scrollable */}
          <div 
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory
                       -mx-4 px-4 md:mx-0 md:px-0 pb-4 flex-1"
          >
            {products.map((product) => (
              <div key={product._id} className="snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
