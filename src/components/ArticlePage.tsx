'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/sanity/lib/image'
import { useScrollDepth } from '@/hooks/useScrollDepth'
import { trackAffiliateClick } from '@/lib/analytics'
import {
  AffiliateButton,
  QuickBuyCard,
  StickyBuyBar,
  AuthorBox,
  TableOfContents,
  ProductSpecsBox,
} from '@/components/article'

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

interface Author {
  name: string
  slug?: string
  image?: any
  bio?: string
  credentials?: string
}

interface Product {
  name: string
  price: string
  image?: any
  specs?: Spec[]
  retailers?: Retailer[]
  resaleRetailers?: Retailer[]
}

interface TOCItem {
  id: string
  text: string
  isBuySection?: boolean
}

interface ArticlePageProps {
  article: {
    title: string
    slug?: string
    excerpt?: string
    body?: any
    publishedAt?: string
    readTime?: string
    mainImage?: any
    author?: Author
    product?: Product
    tableOfContents?: TOCItem[]
  }
  breadcrumb: {
    parent: string
    parentHref: string
    category: string
    categoryHref: string
    current: string
  }
}

// Custom PortableText components for rich content
const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(800).url()}
            alt={value.alt || ''}
            width={800}
            height={500}
            className="w-full"
          />
          {value.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    affiliateLink: ({ value }: any) => (
      <AffiliateButton
        href={value.url}
        retailer={value.retailer}
        variant="inline"
      >
        {value.text}
      </AffiliateButton>
    ),
    table: ({ value }: any) => {
      if (!value?.rows?.length) return null
      const headerRows = value.rows.filter((r: any) => r.isHeader)
      const bodyRows = value.rows.filter((r: any) => !r.isHeader)

      return (
        <figure className="my-8 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            {headerRows.length > 0 && (
              <thead>
                {headerRows.map((row: any, i: number) => (
                  <tr key={row._key || `h${i}`} className="border-b-2 border-[#C9A227]">
                    {row.cells?.map((cell: any, j: number) => (
                      <th key={j} className="px-4 py-3 font-semibold text-black bg-[#FAF9F6]">
                        {typeof cell === 'string' ? cell : cell?.text || ''}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
            )}
            {bodyRows.length > 0 && (
              <tbody>
                {bodyRows.map((row: any, i: number) => (
                  <tr key={row._key || `b${i}`} className="border-b border-gray-200">
                    {row.cells?.map((cell: any, j: number) => (
                      <td key={j} className="px-4 py-3 text-gray-700">
                        {typeof cell === 'string' ? cell : cell?.text || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {value.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  marks: {
    link: ({ children, value }: any) => {
      const isAffiliate = value?.href?.includes('?ref=') || value?.isAffiliate
      if (isAffiliate) {
        return (
          <a
            href={value.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="text-black underline underline-offset-4 decoration-[#C9A227] hover:text-[#C9A227] transition-colors"
            onClick={() => trackAffiliateClick({
              retailer: value.href ? new URL(value.href).hostname.replace('www.', '') : 'unknown',
              position: 'inline-text',
            })}
          >
            {children}
          </a>
        )
      }
      return (
        <a
          href={value.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline hover:text-[#C9A227] transition-colors"
        >
          {children}
        </a>
      )
    },
  },
  block: {
    h2: ({ children, value }: any) => (
      <h2 id={value._key} className="font-serif text-2xl md:text-3xl mt-12 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children, value }: any) => (
      <h3 id={value._key} className="font-serif text-xl md:text-2xl mt-8 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[#C9A227] pl-6 my-8 italic text-gray-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700">{children}</ol>
    ),
  },
}

export default function ArticlePage({ article, breadcrumb }: ArticlePageProps) {
  const { product, author, tableOfContents } = article

  // Get primary retailer for sticky bar
  const primaryRetailer = product?.retailers?.[0]
  const articleSlug = article.slug || ''
  const articleCategory = breadcrumb.category || ''

  // Track scroll depth
  useScrollDepth({
    articleTitle: article.title,
    articleSlug,
    category: articleCategory,
  })

  return (
    <main>
      {/* Breadcrumb */}
      <nav className="bg-white py-3 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <ol className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link href={breadcrumb.parentHref} className="text-gray-500 hover:text-black transition-colors">
                {breadcrumb.parent}
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link href={breadcrumb.categoryHref} className="text-gray-500 hover:text-black transition-colors">
                {breadcrumb.category}
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-black font-medium truncate max-w-[200px]">
              {breadcrumb.current}
            </li>
          </ol>
        </div>
      </nav>

      {/* Article Header */}
      <header className="bg-[#FAF9F6] py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-black mb-4 leading-tight">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-6">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            {article.publishedAt && (
              <time>{new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</time>
            )}
            {article.readTime && (
              <>
                <span>•</span>
                <span>{article.readTime}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {article.mainImage && (
        <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
          <Image
            src={urlFor(article.mainImage).width(1200).height(675).url()}
            alt={article.mainImage.alt || article.title}
            width={1200}
            height={675}
            className="w-full aspect-[16/9] object-cover shadow-lg"
            priority
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        
        {/* Quick Buy Card (if product exists) */}
        {product && product.retailers && product.retailers.length > 0 && (
          <QuickBuyCard
            productName={product.name}
            price={product.price}
            productImage={product.image ? urlFor(product.image).width(400).url() : undefined}
            specs={product.specs}
            retailers={product.retailers}
            category={articleCategory}
            articleSlug={articleSlug}
          />
        )}

        {/* Table of Contents */}
        {tableOfContents && tableOfContents.length > 0 && (
          <TableOfContents items={tableOfContents} />
        )}

        {/* Article Body */}
        <article id="full-review" className="prose prose-lg max-w-none">
          {article.body ? (
            <PortableText 
              value={article.body} 
              components={portableTextComponents}
            />
          ) : (
            <p className="text-gray-500">Content coming soon...</p>
          )}
        </article>

        {/* Product Specs Box (Where to Buy section) */}
        {product && product.retailers && product.retailers.length > 0 && (
          <ProductSpecsBox
            productName={product.name}
            specs={product.specs || []}
            retailers={product.retailers}
            resaleRetailers={product.resaleRetailers}
            category={articleCategory}
            articleSlug={articleSlug}
            lastUpdated={article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : undefined}
          />
        )}

        {/* Author Box */}
        {author && (
          <AuthorBox
            name={author.name}
            slug={author.slug}
            image={author.image ? urlFor(author.image).width(144).height(144).url() : undefined}
            bio={author.bio}
            credentials={author.credentials}
          />
        )}
      </div>

      {/* Sticky Buy Bar (if product exists) */}
      {product && primaryRetailer && (
        <StickyBuyBar
          productName={product.name}
          price={product.price}
          primaryLink={{
            url: primaryRetailer.url,
            retailer: primaryRetailer.name,
          }}
          category={articleCategory}
          articleSlug={articleSlug}
        />
      )}
    </main>
  )
}