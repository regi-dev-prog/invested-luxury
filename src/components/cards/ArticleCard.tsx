import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/types';
import { urlFor } from '@/sanity/client';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const categorySlug = article.categories?.[0]?.slug?.current || 'uncategorized';
  const categoryTitle = article.categories?.[0]?.title || 'Article';
  const articleUrl = `/${categorySlug}/${article.slug.current}`;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (variant === 'featured') {
    return (
      <article className="group">
        <Link href={articleUrl} className="block">
          <div className="relative aspect-[16/10] overflow-hidden mb-6">
            {article.mainImage ? (
              <Image
                src={urlFor(article.mainImage).width(1200).height(750).url()}
                alt={article.mainImage.alt || article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="w-full h-full bg-cream" />
            )}
          </div>
          <div className="space-y-3">
            <span className="category-badge">{categoryTitle}</span>
            <h2 className="font-serif text-headline text-black group-hover:text-charcoal transition-colors text-balance">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-body-lg text-charcoal line-clamp-2">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-caption text-charcoal-light">
              {article.author?.name && <span>{article.author.name}</span>}
              <span>·</span>
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              {article.readTime && (
                <>
                  <span>·</span>
                  <span>{article.readTime} min read</span>
                </>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group flex gap-4">
        <Link href={articleUrl} className="shrink-0">
          <div className="relative w-24 h-24 overflow-hidden">
            {article.mainImage ? (
              <Image
                src={urlFor(article.mainImage).width(200).height(200).url()}
                alt={article.mainImage.alt || article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-cream" />
            )}
          </div>
        </Link>
        <div className="flex flex-col justify-center">
          <span className="category-badge mb-1">{categoryTitle}</span>
          <Link href={articleUrl}>
            <h3 className="font-serif text-lg text-black group-hover:text-charcoal transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>
          <time 
            dateTime={article.publishedAt}
            className="text-caption text-charcoal-light mt-1"
          >
            {formatDate(article.publishedAt)}
          </time>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article className="group">
      <Link href={articleUrl} className="block">
        <div className="relative aspect-[4/5] overflow-hidden mb-4">
          {article.mainImage ? (
            <Image
              src={urlFor(article.mainImage).width(600).height(750).url()}
              alt={article.mainImage.alt || article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-cream" />
          )}
        </div>
        <div className="space-y-2">
          <span className="category-badge">{categoryTitle}</span>
          <h3 className="font-serif text-title text-black group-hover:text-charcoal transition-colors line-clamp-2 text-balance">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-body text-charcoal line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-2 text-caption text-charcoal-light pt-1">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            {article.readTime && (
              <>
                <span>·</span>
                <span>{article.readTime} min read</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
