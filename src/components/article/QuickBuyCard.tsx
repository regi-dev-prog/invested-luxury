'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingBag, ChevronDown, ExternalLink } from 'lucide-react'

interface Retailer {
  name: string
  url: string
  price?: number
  isResale?: boolean
}

interface Spec {
  label: string
  value: string
}

interface QuickBuyCardProps {
  productName: string
  price: string
  productImage?: string
  specs?: Spec[]
  retailers?: Retailer[]
}

export default function QuickBuyCard({
  productName,
  price,
  productImage,
  specs = [],
  retailers = [],
}: QuickBuyCardProps) {
  const [showAllRetailers, setShowAllRetailers] = useState(false)

  // Safety check - don't render full card if no retailers
  if (!retailers || retailers.length === 0) {
    return (
      <div className="bg-[#FAF9F6] border border-gray-200 p-6 md:p-8 mb-10">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Quick Buy</p>
        <h3 className="font-serif text-2xl text-black mb-2">{productName}</h3>
        <p className="text-xl text-[#C9A227] font-medium mb-4">{price}</p>
        <p className="text-sm text-gray-500">Retailers coming soon</p>
      </div>
    )
  }

  const primaryRetailer = retailers.find(r => !r.isResale) || retailers[0]
  const otherRetailers = retailers.filter(r => r !== primaryRetailer)

  return (
    <div className="bg-[#FAF9F6] border border-gray-200 p-6 md:p-8 mb-10">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Image (optional) */}
        {productImage && (
          <div className="md:w-1/3 flex-shrink-0">
            <div className="aspect-square relative bg-white">
              <Image
                src={productImage}
                alt={productName}
                fill
                className="object-contain p-4"
              />
            </div>
          </div>
        )}

        {/* Product Info */}
        <div className={productImage ? 'md:w-2/3' : 'w-full'}>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Quick Buy</p>
          <h3 className="font-serif text-2xl text-black mb-2">{productName}</h3>
          <p className="text-xl text-[#C9A227] font-medium mb-4">{price}</p>

          {/* Quick Specs */}
          {specs && specs.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 mb-6">
              {specs.map((spec, index) => (
                <span key={index}>
                  <span className="text-gray-400">{spec.label}:</span> {spec.value}
                </span>
              ))}
            </div>
          )}

          {/* Primary CTA */}
          {primaryRetailer && (
            <a
              href={primaryRetailer.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-medium tracking-wide hover:bg-[#C9A227] transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop at {primaryRetailer.name}
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* More Retailers Dropdown */}
          {otherRetailers.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowAllRetailers(!showAllRetailers)}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-black text-black font-medium tracking-wide hover:bg-black hover:text-white transition-colors"
              >
                More Retailers
                <ChevronDown className={`w-4 h-4 transition-transform ${showAllRetailers ? 'rotate-180' : ''}`} />
              </button>

              {showAllRetailers && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {otherRetailers.map((retailer, index) => (
                    <a
                      key={index}
                      href={retailer.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                        retailer.isResale
                          ? 'bg-white border border-gray-300 hover:border-[#C9A227] text-gray-700'
                          : 'bg-gray-100 hover:bg-gray-200 text-black'
                      }`}
                    >
                      <span>
                        {retailer.name}
                        {retailer.isResale && (
                          <span className="text-xs text-gray-500 ml-1">(Resale)</span>
                        )}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skip to Review Link */}
          <a
            href="#full-review"
            className="block mt-6 text-sm text-gray-500 hover:text-[#C9A227] transition-colors"
          >
            ↓ Skip to full review
          </a>
        </div>
      </div>
    </div>
  )
}