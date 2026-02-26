import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
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
  },
};

const PRODUCTS_QUERY = `
  *[_type == "product" && status == "published"] | order(displayOrder asc, _createdAt desc) {
    _id,
    name,
    "slug": slug.current,
    price,
    currency,
    originalPrice,
    "brand": brand->{name, "slug": slug.current, tier},
    "category": category->{name, "slug": slug.current, "parentSlug": parentCategory->slug.current},
    "image": images[0],
    "primaryLink": affiliateLinks[isPrimary == true && inStock == true][0]{
      url,
      "retailerName": coalesce(retailerName, retailer)
    },
    "fallbackLink": affiliateLinks[inStock == true][0]{
      url,
      "retailerName": coalesce(retailerName, retailer)
    },
    investmentScore,
    featured,
    tags
  }
`;

export const revalidate = 3600; // revalidate every hour

export default async function ShopPage() {
  const products = await client.fetch(PRODUCTS_QUERY);

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
        <ProductGrid products={products ?? []} />
      </section>
    </main>
  );
}
