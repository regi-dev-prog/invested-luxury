import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client, urlFor } from '@/sanity/client'
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

// Query to get article by slug - with FULL product data
const articleQuery = `*[_type == "article" && slug.current == $slug && status == "published"][0]{
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
  "categories": categories[]->{name, slug},
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
    "images": images[]{
      asset,
      alt,
      caption
    },
    specifications[]{
      label,
      value
    },
    affiliateLinks[]{
      retailer,
      retailerName,
      url,
      price,
      isResale,
      isPrimary,
      inStock
    }
  },
  "featuredProducts": featuredProducts[]->{
    _id,
    name,
    slug,
    price,
    currency,
    "brand": brand->{name},
    "image": images[0]
  },
  "relatedArticles": relatedArticles[]->{title, slug, mainImage, excerpt, publishedAt}
}`

// Query to get all article slugs for static generation
const slugsQuery = `*[_type == "article" && status == "published"].slug.current`

// Types
interface ProductSpec {
  label: string
  value: string
}

interface AffiliateLink {
  retailer: string
  retailerName?: string
  url: string
  price?: number
  isResale?: boolean
  isPrimary?: boolean
  inStock?: boolean
}

interface Product {
  _id: string
  name: string
  slug?: { current: string }
  price: number
  currency?: string
  description?: string
  brand?: { name: string; slug?: { current: string } }
  images?: any[]
  specifications?: ProductSpec[]
  affiliateLinks?: AffiliateLink[]
}

interface Article {
  _id: string
  title: string
  subtitle?: string
  slug: { current: string }
  excerpt?: string
  body: any[]
  mainImage?: any
  publishedAt?: string
  updatedAt?: string
  articleType: string
  author?: {
    name: string
    slug?: { current: string }
    image?: any
    bio?: string
    credentials?: string
  }
  categories?: { name: string; slug: { current: string } }[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    focusKeyword?: string
    noIndex?: boolean
  }
  schemaMarkup?: string
  productRating?: number
  primaryProduct?: Product
  featuredProducts?: any[]
  relatedArticles?: any[]
}

// Generate static params for all articles
export async function generateStaticParams() {
  const slugs: string[] = await client.fetch(slugsQuery)
  return slugs.map((slug) => ({ slug }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article: Article = await client.fetch(articleQuery, { slug: params.slug })
  
  if (!article) {
    return { title: 'Article Not Found' }
  }

  const title = article.seo?.metaTitle || article.title + ' | InvestedLuxury'
  const description = article.seo?.metaDescription || article.excerpt || ''
  const imageUrl = article.mainImage ? urlFor(article.mainImage).width(1200).height(630).url() : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    robots: article.seo?.noIndex ? { index: false } : undefined,
  }
}

// Format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Calculate read time
function calculateReadTime(body: any[]): number {
  if (!body) return 5
  const text = body
    .filter((block: any) => block._type === 'block')
    .map((block: any) => block.children?.map((child: any) => child.text).join(' '))
    .join(' ')
  const words = text.split(/\s+/).length
  return Math.ceil(words / 200)
}

// Extract headings for TOC
function extractHeadings(body: any[]): { id: string; text: string; isBuySection?: boolean }[] {
  if (!body) return []
  
  const headings: { id: string; text: string; isBuySection?: boolean }[] = []
  
  body.forEach((block: any, index: number) => {
    if (block._type === 'block' && block.style === 'h2') {
      const text = block.children?.map((child: any) => child.text).join('') || ''
      const id = `section-${index}`
      const isBuySection = text.toLowerCase().includes('buy') || 
                          text.toLowerCase().includes('where to') ||
                          text.toLowerCase().includes('shop')
      headings.push({ id, text, isBuySection })
    }
  })
  
  return headings
}

// Format price with currency symbol
function formatPrice(price: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  }
  const symbol = symbols[currency] || '$'
  return `${symbol}${price.toLocaleString()}`
}

// Get display name for retailer
function getRetailerDisplayName(retailer: string, customName?: string): string {
  if (customName) return customName
  
  const names: Record<string, string> = {
    'direct': 'Brand Direct',
    'net-a-porter': 'Net-a-Porter',
    'mytheresa': 'Mytheresa',
    'ssense': 'SSENSE',
    'farfetch': 'Farfetch',
    'matchesfashion': 'MatchesFashion',
    'bergdorf': 'Bergdorf Goodman',
    'neiman': 'Neiman Marcus',
    'saks': 'Saks Fifth Avenue',
    'nordstrom': 'Nordstrom',
    'realreal': 'The RealReal',
    'vestiaire': 'Vestiaire Collective',
    'rebag': 'Rebag',
    '1stdibs': '1stDibs',
  }
  return names[retailer] || retailer.charAt(0).toUpperCase() + retailer.slice(1)
}

// Transform product data for components
function transformProductData(product: Product | undefined) {
  if (!product) return null

  const affiliateLinks = product.affiliateLinks || []
  
  // Separate regular retailers from resale
  const retailers = affiliateLinks
    .filter(link => !link.isResale && link.inStock !== false)
    .map(link => ({
      name: getRetailerDisplayName(link.retailer, link.retailerName),
      url: link.url,
      price: link.price,
      isPrimary: link.isPrimary,
    }))

  const resaleRetailers = affiliateLinks
    .filter(link => link.isResale && link.inStock !== false)
    .map(link => ({
      name: getRetailerDisplayName(link.retailer, link.retailerName),
      url: link.url,
      isResale: true,
    }))

  // Find primary retailer or use first one
  const primaryRetailer = retailers.find(r => r.isPrimary) || retailers[0]

  return {
    name: product.name,
    price: formatPrice(product.price, product.currency),
    image: product.images?.[0] ? urlFor(product.images[0]).width(400).height(400).url() : undefined,
    specs: product.specifications || [],
    retailers,
    resaleRetailers,
    primaryLink: primaryRetailer ? {
      url: primaryRetailer.url,
      retailer: primaryRetailer.name,
    } : undefined,
  }
}

// Portable Text components for rendering rich content
const createPortableTextComponents = (headingIndex: { current: number }) => ({
  types: {
    image: ({ value }: { value: any }) => (
      <figure className="my-12">
        <Image
          src={urlFor(value).width(900).url()}
          alt={value.alt || ''}
          width={900}
          height={600}
          className="w-full"
        />
        {value.caption && (
          <figcaption className="text-center text-sm text-gray-500 mt-3 italic">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    callToAction: ({ value }: { value: any }) => {
      const isPrimary = value.style === 'primary'
      return (
        <div className="my-10 text-center">
          <a
            href={value.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`inline-flex items-center gap-2 px-8 py-4 font-medium tracking-wide transition-all duration-300 ${
              isPrimary
                ? 'bg-black text-white hover:bg-[#C9A227]'
                : 'border-2 border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            {value.text}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )
    },
    faqItem: ({ value }: { value: any }) => (
      <div className="my-8 border-l-2 border-[#C9A227] pl-6">
        <h4 className="font-serif text-xl text-black mb-3">{value.question}</h4>
        <p className="text-gray-600 leading-relaxed">{value.answer}</p>
      </div>
    ),
    productEmbed: ({ value }: { value: any }) => (
      <div className="my-10 p-6 bg-[#FAF9F6] border border-gray-200">
        <p className="text-sm text-gray-500">Product details</p>
      </div>
    ),
  },
  block: {
    h2: ({ children, value }: { children: React.ReactNode; value: any }) => {
      const index = headingIndex.current++
      return (
        <h2 
          id={`section-${index}`}
          className="font-serif text-2xl md:text-3xl lg:text-4xl text-black mt-14 mb-5 scroll-mt-24"
        >
          {children}
        </h2>
      )
    },
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="font-serif text-xl md:text-2xl text-black mt-10 mb-4">{children}</h3>
    ),
    h4: ({ children }: { children: React.ReactNode }) => (
      <h4 className="font-serif text-lg md:text-xl text-black mt-8 mb-3">{children}</h4>
    ),
    normal: ({ children }: { children: React.ReactNode }) => (
      <p className="text-lg text-gray-700 leading-[1.85] mb-6">{children}</p>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="my-10 pl-6 border-l-2 border-[#C9A227] italic text-xl text-gray-600">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value: any }) => {
      const isExternal = value?.href?.startsWith('http')
      return (
        <a
          href={value?.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-black underline decoration-[#C9A227] decoration-2 underline-offset-2 hover:text-[#C9A227] transition-colors"
        >
          {children}
        </a>
      )
    },
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-semibold text-black">{children}</strong>
    ),
    em: ({ children }: { children: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
  },
  list: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <ul className="my-6 space-y-3 text-gray-700">{children}</ul>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <ol className="my-6 space-y-3 text-gray-700 list-decimal pl-6">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <li className="flex gap-3 text-lg leading-relaxed">
        <span className="text-[#C9A227] mt-1.5">•</span>
        <span>{children}</span>
      </li>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <li className="text-lg leading-relaxed">{children}</li>
    ),
  },
})

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article: Article = await client.fetch(articleQuery, { slug: params.slug })

  if (!article) {
    notFound()
  }

  const readTime = calculateReadTime(article.body)
  const headings = extractHeadings(article.body)
  const headingIndex = { current: 0 }
  const portableTextComponents = createPortableTextComponents(headingIndex)

  const isReview = article.articleType === 'review'
  
  // Transform product data from Sanity - NO MORE HARDCODED DATA!
  const productData = transformProductData(article.primaryProduct)

  // JSON-LD Schema
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': article.schemaMarkup === 'review' ? 'Review' : 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'InvestedLuxury',
      url: 'https://investedluxury.com',
    },
  }

  if (article.mainImage) {
    jsonLd.image = urlFor(article.mainImage).width(1200).url()
  }

  if (article.author) {
    jsonLd.author = {
      '@type': 'Person',
      name: article.author.name,
    }
  }

  // Enhanced review schema with itemReviewed
  if (article.schemaMarkup === 'review' && article.primaryProduct) {
    jsonLd.itemReviewed = {
      '@type': 'Product',
      name: article.primaryProduct.name,
      brand: {
        '@type': 'Brand',
        name: article.primaryProduct.brand?.name,
      },
    }
    if (article.productRating) {
      jsonLd.reviewRating = {
        '@type': 'Rating',
        ratingValue: article.productRating,
        bestRating: 5,
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky Buy Bar - shows on scroll for reviews */}
      {isReview && productData && productData.primaryLink && (
        <StickyBuyBar
          productName={productData.name}
          price={productData.price}
          primaryLink={productData.primaryLink}
        />
      )}

      <article className="bg-white">
        {/* Hero Section - Vogue Style */}
        <header className="pt-6 pb-6 md:pt-10 md:pb-8">
          <div className="max-w-4xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 mb-8">
              <Link href="/" className="hover:text-[#C9A227] transition-colors">Home</Link>
              <span>/</span>
              {article.categories && article.categories[0] && (
                <>
                  <Link 
                    href={`/${article.categories[0].slug.current}`}
                    className="hover:text-[#C9A227] transition-colors"
                  >
                    {article.categories[0].name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-gray-600 truncate max-w-[200px]">{article.title}</span>
            </nav>

            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-block px-4 py-1.5 text-xs font-medium bg-black text-white uppercase tracking-widest">
                {article.articleType}
              </span>
            </div>

            {/* Title - Large, Dramatic */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-black leading-[1.1] mb-5 text-balance">
              {article.title}
            </h1>

            {/* Subtitle */}
            {article.subtitle && (
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 italic mb-6 max-w-3xl">
                {article.subtitle}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              {article.author && (
                <span className="font-medium text-black">By {article.author.name}</span>
              )}
              {article.publishedAt && (
                <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              )}
              <span>{readTime} min read</span>
              {article.updatedAt && article.updatedAt !== article.publishedAt && (
                <span className="text-[#C9A227]">Updated {formatDate(article.updatedAt)}</span>
              )}
            </div>
          </div>
        </header>

        {/* Main Image - Full Width */}
        {article.mainImage && (
          <figure className="relative">
            <div className="aspect-[16/9] md:aspect-[21/9] relative">
              <Image
                src={urlFor(article.mainImage).width(1600).height(700).url()}
                alt={article.mainImage.alt || article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {article.mainImage.caption && (
              <figcaption className="max-w-4xl mx-auto px-4 py-3 text-sm text-gray-500 italic">
                {article.mainImage.caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Article Content */}
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
          {/* Quick Buy Card - For Reviews */}
          {isReview && productData && productData.retailers.length > 0 && (
            <QuickBuyCard
              productName={productData.name}
              price={productData.price}
              productImage={productData.image}
              specs={productData.specs.slice(0, 3)} // Show max 3 specs in quick view
              retailers={[...productData.retailers, ...productData.resaleRetailers]}
            />
          )}

          {/* Table of Contents */}
          {headings.length > 2 && (
            <TableOfContents items={headings} />
          )}

          {/* Body Content */}
          <div id="full-review" className="article-content">
            <PortableText value={article.body} components={portableTextComponents} />
          </div>

          {/* Affiliate Disclosure - Subtle */}
          <p className="text-sm text-gray-500 italic mb-8">
            Disclosure: This article may contain affiliate links. If you purchase through these links, 
            InvestedLuxury may earn a commission at no additional cost to you. We only recommend products we genuinely believe in.
          </p>

          {/* Product Specs Box - For Reviews */}
          {isReview && productData && productData.retailers.length > 0 && (
            <ProductSpecsBox
              productName={productData.name}
              specs={productData.specs}
              retailers={productData.retailers}
              resaleRetailers={productData.resaleRetailers}
              lastUpdated={article.updatedAt ? formatDate(article.updatedAt) : undefined}
            />
          )}

          {/* Author Box */}
          {article.author && (
            <AuthorBox
              name={article.author.name}
              slug={article.author.slug?.current}
              image={article.author.image ? urlFor(article.author.image).width(144).height(144).url() : undefined}
              bio={article.author.bio}
              credentials={article.author.credentials}
            />
          )}
        </div>

        {/* Related Articles */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <section className="bg-[#FAF9F6] py-16">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-serif text-3xl text-black mb-10 text-center">You Might Also Like</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {article.relatedArticles.map((related: any) => (
                  <Link
                    key={related.slug.current}
                    href={`/article/${related.slug.current}`}
                    className="group bg-white"
                  >
                    {related.mainImage && (
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <Image
                          src={urlFor(related.mainImage).width(500).height(375).url()}
                          alt={related.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-serif text-xl text-black group-hover:text-[#C9A227] transition-colors leading-tight">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{related.excerpt}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  )
}
