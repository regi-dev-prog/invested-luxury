// =============================================================================
// ARTICLE FALLBACK REDIRECT
// =============================================================================
// This route ONLY redirects /article/[slug] → canonical category URL.
// No content is rendered here. The middleware handles the redirect for most
// traffic, but this page catches any cases where middleware doesn't fire
// (e.g., client-side navigation, ISR pre-rendering).
// =============================================================================

import { redirect, notFound } from 'next/navigation'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '4b3ap7pf',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const canonicalQuery = `*[_type == "article" && slug.current == $slug && status == "published"][0]{
  "categorySlug": categories[0]->slug.current,
  "parentCategory": categories[0]->parentCategory
}`

export default async function ArticleRedirectPage({ params }: { params: { slug: string } }) {
  try {
    const article = await client.fetch(canonicalQuery, { slug: params.slug })

    if (
      article?.parentCategory &&
      article?.categorySlug &&
      typeof article.parentCategory === 'string' &&
      typeof article.categorySlug === 'string'
    ) {
      redirect(`/${article.parentCategory}/${article.categorySlug}/${params.slug}`)
    }
  } catch (error) {
    console.error('Article redirect lookup failed:', error)
  }

  // If we can't determine the canonical path, 404
  notFound()
}

// Do NOT generate static params — we don't want these pages pre-rendered
// export async function generateStaticParams() { ... }  // REMOVED

// Metadata: noindex to prevent any indexing if somehow this page renders
export function generateMetadata() {
  return {
    robots: { index: false, follow: false },
  }
}
