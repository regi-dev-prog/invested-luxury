"use client";

import { useMemo, useState } from "react";
import { ShopFilters, FiltersState } from "@/components/shop/ShopFilters";
import { ProductCard, ProductCardData } from "@/components/shop/ProductCard";

interface ProductGridProps {
  products: ProductCardData[];
}

function matchesPriceRange(price: number, range: string): boolean {
  if (!range) return true;
  const [min, max] = range.split("-");
  if (max === "up") return price >= Number(min);
  return price >= Number(min) && price < Number(max);
}

export function ProductGrid({ products }: ProductGridProps) {
  const [filters, setFilters] = useState<FiltersState>({
    category: "",
    brand: "",
    priceRange: "",
    sort: "featured",
  });

  const filtered = useMemo(() => {
    let result = [...products];

    // Category filter
    if (filters.category) {
      result = result.filter(
        (p) =>
          p.category?.name?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Brand filter
    if (filters.brand) {
      result = result.filter((p) => p.brand?.name === filters.brand);
    }

    // Price range filter
    if (filters.priceRange) {
      result = result.filter((p) =>
        matchesPriceRange(p.price, filters.priceRange)
      );
    }

    // Sort
    switch (filters.sort) {
      case "price-asc":
        result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "newest":
        // Already ordered by _createdAt desc from query; featured items first
        // For newest, deprioritise featured ordering and keep natural query order
        break;
      case "featured":
      default:
        // Featured items bubble to top, rest keep query order
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }

    return result;
  }, [products, filters]);

  return (
    <>
      <ShopFilters
        filters={filters}
        onFilterChange={setFilters}
        products={products}
      />

      {/* Results count */}
      <p className="mb-6 font-sans text-xs uppercase tracking-widest text-gray-400">
        {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="font-serif text-lg text-gray-400">
            No pieces match your selection.
          </p>
          <button
            onClick={() =>
              setFilters({
                category: "",
                brand: "",
                priceRange: "",
                sort: "featured",
              })
            }
            className="mt-4 font-sans text-xs uppercase tracking-widest text-[#C9A227] underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
