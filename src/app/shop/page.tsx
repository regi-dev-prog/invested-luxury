import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const metadata: Metadata = {
  title: "Shop Luxury Investment Pieces | InvestedLuxury",
  description:
    "A curated edit of luxury investment pieces — bags, shoes, jewelry, watches, and clothing chosen for lasting value and timeless design.",
  alternates: {
    canonical: "https://investedluxury.com/shop",
  },
  openGraph: {
    title: "Shop Luxury Investment Pieces | InvestedLuxury",
    description:
      "A curated edit of luxury investment pieces — bags, shoes, jewelry, watches, and clothing chosen for lasting value and timeless design.",
    url: "https://investedluxury.com/shop",
    siteName: "InvestedLuxury",
    type: "website",
    images: [{ url: "https://investedluxury.com/og-image.jpg", width: 1200, height: 630, alt: "InvestedLuxury" }],
  },
};

// Visibility rules (May 2026):
// - Show every product that has at least one affiliate link with a real URL
// - "Real URL" = defined, non-empty, and not the Mytheresa homepage placeholder
// - Allow optional `hidden` flag for manual exclusion
// - Image is optional — products without one still appear (frontend handles fallback)
// - inStock and status fields are no longer gating visibility
const PRODUCTS_QUERY = `
  *[_type == "product"
    && (!defined(hidden) || hidden == false)
    && count(affiliateLinks[
        defined(url)
        && url != ""
        && url != "https://www.mytheresa.com/"
        && url != "https://mytheresa.com/"
    ]) > 0
  ] | order(featured desc, displayOrder asc, _createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    currency,
    originalPrice,
    "brand": brand->{name, "slug": slug.current, tier},
    "category": category->{name, "slug": slug.current, "parentSlug": parentCategory->slug.current},
    "image": images[0],
    "primaryLink": affiliateLinks[isPrimary == true && defined(url) && url != ""][0]{
      url,
      "retailerName": coalesce(retailerName, retailer)
    },
    "fallbackLink": affiliateLinks[defined(url) && url != "" && url != "https://www.mytheresa.com/"][0]{
      url,
      "retailerName": coalesce(retailerName, retailer)
    },
    investmentScore,
    featured,
    tags
  }
`;

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let rawProducts = [];
  try {
    rawProducts = (await client.fetch(PRODUCTS_QUERY)) ?? [];
  } catch (e) {
    console.error("Failed to fetch products:", e);
  }

  // Resolve image URLs server-side so client components don't need urlFor
  const products = rawProducts.map((p: any) => ({
    _id: p._id,
    name: p.name ?? "",
    slug: p.slug ?? "",
    price: p.price ?? 0,
    currency: p.currency ?? "USD",
    originalPrice: p.originalPrice ?? null,
    brand: p.brand ?? null,
    category: p.category ?? null,
    imageUrl: p.image
      ? urlFor(p.image).width(600).height(750).quality(85).url()
      : null,
    imageAlt: p.image?.alt ?? `${p.brand?.name ?? ""} ${p.name ?? "Product"}`,
    primaryLink: p.primaryLink ?? null,
    fallbackLink: p.fallbackLink ?? null,
    investmentScore: p.investmentScore ?? null,
    featured: p.featured ?? false,
    tags: p.tags ?? [],
  }));

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-[#FAF9F6]">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C9A227] font-sans">
            Curated Collection
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
            The Edit
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-gray-500 sm:text-lg">
            Investment pieces chosen for lasting value, exceptional
            craftsmanship, and timeless design.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
