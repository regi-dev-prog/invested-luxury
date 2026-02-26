"use client";

import { useMemo } from "react";

export type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

export interface FiltersState {
  category: string;
  brand: string;
  priceRange: string;
  sort: SortOption;
}

interface ShopFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
  products: Array<{
    brand?: { name: string } | null;
    category?: { name: string; parentSlug?: string } | null;
  }>;
}

const CATEGORIES = [
  "Bags",
  "Shoes",
  "Watches",
  "Jewelry",
  "Clothing",
  "Accessories",
];

const PRICE_RANGES = [
  { label: "Under $500", value: "0-500" },
  { label: "$500 – $1,000", value: "500-1000" },
  { label: "$1,000 – $3,000", value: "1000-3000" },
  { label: "$3,000+", value: "3000-up" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

export function ShopFilters({
  filters,
  onFilterChange,
  products,
}: ShopFiltersProps) {
  // Derive unique brand names from available products
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand?.name) brandSet.add(p.brand.name);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  const hasActiveFilters =
    filters.category || filters.brand || filters.priceRange;

  const update = (partial: Partial<FiltersState>) =>
    onFilterChange({ ...filters, ...partial });

  const clearAll = () =>
    onFilterChange({
      category: "",
      brand: "",
      priceRange: "",
      sort: "featured",
    });

  return (
    <div className="mb-10 space-y-4">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
          className="border border-gray-300 bg-white px-4 py-2 font-sans text-xs uppercase tracking-widest text-charcoal focus:border-[#C9A227] focus:outline-none focus:ring-0"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Brand */}
        <select
          value={filters.brand}
          onChange={(e) => update({ brand: e.target.value })}
          className="border border-gray-300 bg-white px-4 py-2 font-sans text-xs uppercase tracking-widest text-charcoal focus:border-[#C9A227] focus:outline-none focus:ring-0"
          aria-label="Filter by brand"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Price Range */}
        <select
          value={filters.priceRange}
          onChange={(e) => update({ priceRange: e.target.value })}
          className="border border-gray-300 bg-white px-4 py-2 font-sans text-xs uppercase tracking-widest text-charcoal focus:border-[#C9A227] focus:outline-none focus:ring-0"
          aria-label="Filter by price range"
        >
          <option value="">All Prices</option>
          {PRICE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as SortOption })}
          className="ml-auto border border-gray-300 bg-white px-4 py-2 font-sans text-xs uppercase tracking-widest text-charcoal focus:border-[#C9A227] focus:outline-none focus:ring-0"
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active filters & clear */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.category && (
            <FilterTag
              label={filters.category}
              onRemove={() => update({ category: "" })}
            />
          )}
          {filters.brand && (
            <FilterTag
              label={filters.brand}
              onRemove={() => update({ brand: "" })}
            />
          )}
          {filters.priceRange && (
            <FilterTag
              label={
                PRICE_RANGES.find((r) => r.value === filters.priceRange)
                  ?.label ?? filters.priceRange
              }
              onRemove={() => update({ priceRange: "" })}
            />
          )}
          <button
            onClick={clearAll}
            className="ml-2 font-sans text-xs uppercase tracking-widest text-gray-400 underline underline-offset-2 transition-colors hover:text-[#C9A227]"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-gray-200 bg-[#FAF9F6] px-3 py-1 font-sans text-xs uppercase tracking-widest text-charcoal">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 text-gray-400 transition-colors hover:text-charcoal"
        aria-label={`Remove ${label} filter`}
      >
        ×
      </button>
    </span>
  );
}
