"use client";

import Image from "next/image";
import { trackAffiliateClick } from "@/lib/analytics";

export interface ProductCardData {
  _id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  originalPrice?: number | null;
  brand?: { name: string; slug: string; tier?: string } | null;
  category?: {
    name: string;
    slug: string;
    parentSlug?: string;
  } | null;
  imageUrl?: string | null;
  imageAlt?: string;
  primaryLink?: { url: string; retailerName: string } | null;
  fallbackLink?: { url: string; retailerName: string } | null;
  investmentScore?: number | null;
  featured?: boolean;
  tags?: string[];
}

interface ProductCardProps {
  product: ProductCardData;
}

function formatPrice(price: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function ProductCard({ product }: ProductCardProps) {
  const affiliateLink = product.primaryLink ?? product.fallbackLink;
  const retailerName = affiliateLink?.retailerName ?? "Retailer";
  const isOnSale =
    product.originalPrice && product.originalPrice > product.price;

  const handleShopClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!affiliateLink?.url) return;

    trackAffiliateClick({
      productName: product.name,
      brand: product.brand?.name ?? "",
      price: product.price,
      retailer: retailerName,
      category: product.category?.name ?? "",
      position: "shop-page",
    });
  };

  return (
    <article className="group">
      {/* Image */}
      <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-[#FAF9F6]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center"
            style={{
              background:
                "linear-gradient(165deg, #FAF9F6 0%, #F0ECE4 40%, #E8E2D6 100%)",
            }}
          >
            <div className="h-10 w-px bg-[#C9A227] opacity-40" />
            <p className="mt-3.5 font-serif text-sm italic tracking-wide text-[#C9A227]">
              {product.brand?.name ?? ""}
            </p>
            <div className="mt-3.5 h-10 w-px bg-[#C9A227] opacity-40" />
            {/* Corner accents */}
            <div className="absolute left-4 top-4 h-5 w-5 border-l border-t border-[#C9A227] opacity-30" />
            <div className="absolute bottom-4 right-4 h-5 w-5 border-b border-r border-[#C9A227] opacity-30" />
          </div>
        )}

        {/* Investment score badge */}
        {product.investmentScore != null && product.investmentScore >= 8 && (
          <span className="absolute left-3 top-3 bg-charcoal px-2 py-0.5 font-sans text-[10px] uppercase tracking-widest text-white">
            Top Investment
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1">
        {product.brand?.name && (
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-400">
            {product.brand.name}
          </p>
        )}

        <h3 className="font-serif text-base leading-snug text-charcoal transition-colors group-hover:text-[#C9A227]">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="font-sans text-sm text-charcoal">
            {formatPrice(product.price, product.currency)}
          </span>
          {isOnSale && product.originalPrice && (
            <span className="font-sans text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
          )}
        </div>
      </div>

      {/* Shop link */}
      {affiliateLink?.url && (
        <a
          href={affiliateLink.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleShopClick}
          className="mt-3 inline-block border border-charcoal px-5 py-2 font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal transition-colors duration-200 hover:bg-charcoal hover:text-white"
        >
          Shop at {retailerName}
        </a>
      )}
    </article>
  );
}
