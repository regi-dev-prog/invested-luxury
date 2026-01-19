// =============================================================================
// ARTICLE PAGE - Full SEO Implementation
// =============================================================================
// Route: /fashion/bags/[slug], /lifestyle/hotels/[slug], etc.
// =============================================================================

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import {
  QuickBuyCard,
  StickyBuyBar,
  AuthorBox,
  TableOfContents,
  ProductSpecsBox,
} from '@/components/article'
import { getSubCategory, getParentCategory } from '@/lib/categories'
export const revalidate = 60;
const siteUrl = 'https://investedluxury.com'

// =============================================================================
// SANITY QUERY
// =============================================================================
const articleQuery = `*[_type == "article" && slug.current == $slug][0]{
  _id,
  title,
  subtitle,
  slug,
  excerpt,
  body,
  mainImage,
  publishedAt,
  updatedAt,
  articleType,
  "author": author->{name, slug, image, bio, credentials},
  "categories": categories[]->{title, slug, parentCategory},
  "seo": seo,
  schemaMarkup,
  productRating,
  "primaryProduct": primaryProduct->{
    _id,
    name,
    slug,
    price,
    currency,
    description,
    "brand": brand->{name, slug},
    "images": images,
    "specifications": specifications,
    "affiliateLinks": affiliateLinks
  },
  "featuredProducts": featuredProducts[]->{
    _id,
    name,
    slug,
    price,
    currency,
    "brand": brand->{name, slug},
    "image": images[0],
    "affiliateLink": affiliateLinks[0].url
  },
  "relatedArticles": relatedArticles[]->{
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    "category": categories[0]->{slug, parentCategory}
  }
}`

interface Props {
  params: {
    category: string
    subcategory: string
    slug: string
  }
}

// =============================================================================
// GENERATE METADATA FOR SEO
// =============================================================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await client.fetch(articleQuery, { slug: params.slug })
  
  if (!article) {
    return { title: 'Article Not Found' }
  }

  const canonicalUrl = `${siteUrl}/${params.category}/${params.subcategory}/${params.slug}`
  const ogImage = article.mainImage 
    ? urlFor(article.mainImage).width(1200).height(630).url()
    : `${siteUrl}/og-image.jpg`

  // Use SEO fields from Sanity if available, otherwise fallback to article fields
  const title = article.seo?.metaTitle || article.title
  const description = article.seo?.metaDescription || article.excerpt || ''

  return {
    title,
    description,
    authors: article.author ? [{ name: article.author.name }] : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'InvestedLuxury',
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: article.author ? [article.author.name] : undefined,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@investedluxury',
    },
      robots: params.subcategory === 'products' 
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatPrice(price: number, currency: string = 'USD') {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' }
  return `${symbols[currency] || '$'}${price.toLocaleString()}`
}

// Transform Sanity product data for components
function transformProductData(product: any) {
  if (!product) return null
  
  const retailers = product.affiliateLinks?.filter((link: any) => !link.isResale) || []
  const resaleRetailers = product.affiliateLinks?.filter((link: any) => link.isResale) || []
  
  return {
    name: product.name,
    brand: product.brand?.name,
    price: formatPrice(product.price, product.currency),
    image: product.images?.[0] ? urlFor(product.images[0]).width(400).height(400).url() : undefined,
    specs: product.specifications?.slice(0, 3).map((spec: any) => ({
      label: spec.label,
      value: spec.value,
    })) || [],
    allSpecs: product.specifications || [],
    retailers: retailers.map((link: any) => ({
      name: link.retailerName || link.retailer,
      url: link.url,
      price: link.price ? formatPrice(link.price, product.currency) : undefined,
      isResale: false,
    })),
    resaleRetailers: resaleRetailers.map((link: any) => ({
      name: link.retailerName || link.retailer,
      url: link.url,
      isResale: true,
    })),
    primaryLink: retailers[0]?.url || resaleRetailers[0]?.url,
  }
}

// PortableText custom components
const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null
      return (
        <figure className="my-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-cream">
            <Image
              src={urlFor(value).width(1200).url()}
              alt={value.alt || ''}
              fill
              className="object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = value?.href?.startsWith('/') ? undefined : 'noopener noreferrer'
      const target = value?.href?.startsWith('/') ? undefined : '_blank'
      return (
        <a 
          href={value?.href} 
          rel={rel} 
          target={target}
          className="text-[#C9A227] underline underline-offset-2 hover:text-black transition-colors"
        >
          {children}
        </a>
      )
    },
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="font-serif text-2xl md:text-3xl text-black mt-12 mb-4">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="font-serif text-xl md:text-2xl text-black mt-8 mb-3">{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p className="text-charcoal leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[#C9A227] pl-6 my-8 italic text-charcoal">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-charcoal">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-charcoal">{children}</ol>
    ),
  },
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================
export default async function ArticlePage({ params }: Props) {
  const article = await client.fetch(articleQuery, { slug: params.slug })
  
  if (!article) {
    notFound()
  }

  const parentCategory = getParentCategory(params.category)
  const subCategory = getSubCategory(params.subcategory)
  
  const isReview = article.articleType === 'review'
  const productData = transformProductData(article.primaryProduct)
  // Show affiliate buttons on ANY article type that has a product (not just reviews)
  const showAffiliateButtons = !!article.primaryProduct
  
  const canonicalUrl = `${siteUrl}/${params.category}/${params.subcategory}/${params.slug}`
  const ogImage = article.mainImage 
    ? urlFor(article.mainImage).width(1200).height(630).url()
    : `${siteUrl}/og-image.jpg`

  // =============================================================================
  // JSON-LD SCHEMAS
  // =============================================================================
  
  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: parentCategory?.title || params.category,
        item: `${siteUrl}/${params.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: subCategory?.title || params.subcategory,
        item: `${siteUrl}/${params.category}/${params.subcategory}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  }

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": isReview ? "Review" : "Article",
    headline: article.title,
    description: article.excerpt,
    image: ogImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: article.author ? {
      "@type": "Person",
      name: article.author.name,
      url: `${siteUrl}/author/${article.author.slug?.current || ''}`,
    } : {
      "@type": "Organization",
      name: "InvestedLuxury",
    },
    publisher: {
      "@type": "Organization",
      name: "InvestedLuxury",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    ...(isReview && article.primaryProduct && {
      itemReviewed: {
        "@type": "Product",
        name: article.primaryProduct.name,
        brand: {
          "@type": "Brand",
          name: article.primaryProduct.brand?.name,
        },
      },
      reviewRating: article.productRating ? {
        "@type": "Rating",
        ratingValue: article.productRating,
        bestRating: 5,
      } : undefined,
    }),
  }

  // Product Schema (if review with product)
  const productSchema = article.primaryProduct ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: article.primaryProduct.name,
    description: article.primaryProduct.description || article.excerpt,
    image: article.primaryProduct.images?.[0] 
      ? urlFor(article.primaryProduct.images[0]).width(800).url()
      : ogImage,
    brand: {
      "@type": "Brand",
      name: article.primaryProduct.brand?.name,
    },
    offers: article.primaryProduct.affiliateLinks?.length > 0 ? {
      "@type": "AggregateOffer",
      lowPrice: article.primaryProduct.price,
      priceCurrency: article.primaryProduct.currency || "USD",
      offerCount: article.primaryProduct.affiliateLinks.length,
      offers: article.primaryProduct.affiliateLinks.map((link: any) => ({
        "@type": "Offer",
        url: link.url,
        price: link.price || article.primaryProduct.price,
        priceCurrency: article.primaryProduct.currency || "USD",
        availability: link.inStock 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: link.retailerName || link.retailer,
        },
      })),
    } : undefined,
    ...(article.productRating && {
      review: {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: article.productRating,
          bestRating: 5,
        },
        author: {
          "@type": "Organization",
          name: "InvestedLuxury",
        },
      },
    }),
  } : null

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}

      <article className="min-h-screen">
        {/* Hero Section */}
        <header className="bg-white">
          <div className="max-w-4xl mx-auto px-4 pt-8 pb-6">
            {/* Breadcrumb */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-gray-500">
                <li>
                  <Link href="/" className="hover:text-[#C9A227] transition-colors">
                    HOME
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link 
                    href={`/${params.category}`} 
                    className="hover:text-[#C9A227] transition-colors uppercase"
                  >
                    {parentCategory?.title || params.category}
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link 
                    href={`/${params.category}/${params.subcategory}`}
                    className="hover:text-[#C9A227] transition-colors uppercase"
                  >
                    {subCategory?.title || params.subcategory}
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-700 truncate max-w-[200px]" title={article.title}>
                  {article.title.length > 30 ? `${article.title.substring(0, 30)}...` : article.title}
                </li>
              </ol>
            </nav>

            {/* Article Type Badge */}
            {isReview && (
              <span className="inline-block bg-black text-white text-xs font-medium px-3 py-1 uppercase tracking-wider mb-4">
                Review
              </span>
            )}

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-black mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Subtitle */}
            {article.subtitle && (
              <p className="font-serif text-xl md:text-2xl text-gray-600 italic mb-6">
                {article.subtitle}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
              {article.author && (
                <span>By {article.author.name}</span>
              )}
              {article.publishedAt && (
                <>
                  <span className="w-1 h-1 bg-gray-400 rounded-full" />
                  <time dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt)}
                  </time>
                </>
              )}
            </div>
          </div>

          {/* Main Image */}
          {article.mainImage && (
            <div className="w-full aspect-[16/9] md:aspect-[21/9] relative bg-cream">
              <Image
                src={urlFor(article.mainImage).width(1920).height(800).url()}
                alt={article.mainImage.alt || article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Quick Buy Card - Shows on any article with a product */}
          {showAffiliateButtons && productData && productData.retailers.length > 0 && (
            <QuickBuyCard
              productName={productData.name}
              price={productData.price}
              productImage={productData.image}
              specs={productData.specs}
              retailers={productData.retailers}
            />
          )}

          {/* Table of Contents */}
          {article.body && (
            <TableOfContents content={article.body} />
          )}

          {/* Article Body */}
          <div className="prose prose-lg max-w-none" id="full-review">
            <PortableText 
              value={article.body} 
              components={portableTextComponents}
            />
          </div>

          {/* Product Specs Box - Shows on any article with a product */}
          {showAffiliateButtons && productData && productData.retailers.length > 0 && (
            <ProductSpecsBox
              productName={productData.name}
              brand={productData.brand}
              price={productData.price}
              specs={productData.allSpecs}
              retailers={productData.retailers}
              resaleRetailers={productData.resaleRetailers}
            />
          )}

          {/* Affiliate Disclosure */}
          <p className="text-sm text-gray-500 italic mt-12 pt-8 border-t border-gray-200">
            Disclosure: This article may contain affiliate links. If you purchase through these links, 
            InvestedLuxury may earn a commission at no additional cost to you. We only recommend 
            products we genuinely believe in.
          </p>

          {/* Author Box */}
          {article.author && (
            <AuthorBox
              name={article.author.name}
              bio={article.author.bio}
              image={article.author.image ? urlFor(article.author.image).width(100).height(100).url() : undefined}
              credentials={article.author.credentials}
            />
          )}
        </div>

        {/* Related Articles */}
        {article.relatedArticles?.length > 0 && (
          <section className="bg-cream py-16">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-serif text-2xl md:text-3xl text-black mb-8 text-center">
                You Might Also Like
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {article.relatedArticles.map((related: any) => (
                  <Link 
                    key={related._id}
                    href={`/${related.category?.parentCategory || params.category}/${related.category?.slug?.current || params.subcategory}/${related.slug?.current || related.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden mb-4 bg-white">
                      {related.mainImage && (
                        <Image
                          src={urlFor(related.mainImage).width(400).height(300).url()}
                          alt={related.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <h3 className="font-serif text-lg text-black group-hover:text-[#C9A227] transition-colors">
                      {related.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Sticky Buy Bar for Mobile - Shows on any article with a product */}
        {showAffiliateButtons && productData && productData.retailers[0] && (
  <StickyBuyBar
    productName={productData.name}
    price={productData.price}
    primaryLink={{
      url: productData.retailers[0].url,
      retailer: productData.retailers[0].name,
    }}
  />
)}
      </article>
    </>
  )
}