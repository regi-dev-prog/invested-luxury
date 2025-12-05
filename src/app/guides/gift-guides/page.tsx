import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Luxury Gift Guides 2026 | InvestedLuxury',
  description: 'Curated luxury gift guides for every occasion. Find the perfect investment-worthy gift for him, her, or anyone who appreciates quality.',
};

const articles = [
  {
    id: '1',
    title: 'Luxury Gifts for Her 2026',
    excerpt: 'Thoughtful, investment-worthy gifts she\'ll treasure—from designer bags to fine jewelry.',
    slug: 'luxury-gifts-for-her-2026',
    date: 'December 2, 2025',
    readTime: '12 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Luxury Gifts for Him 2026',
    excerpt: 'Exceptional gifts for discerning men—watches, accessories, and more.',
    slug: 'luxury-gifts-for-him-2026',
    date: 'December 1, 2025',
    readTime: '11 min read',
  },
  {
    id: '3',
    title: 'Best Luxury Gifts Under $500',
    excerpt: 'Investment-quality pieces that won\'t break the bank.',
    slug: 'luxury-gifts-under-500',
    date: 'November 28, 2025',
    readTime: '10 min read',
  },
  {
    id: '4',
    title: 'Luxury Wedding Gift Ideas',
    excerpt: 'Meaningful gifts for couples who appreciate quality and craftsmanship.',
    slug: 'luxury-wedding-gifts',
    date: 'November 25, 2025',
    readTime: '9 min read',
  },
  {
    id: '5',
    title: 'Best Luxury Housewarming Gifts',
    excerpt: 'Elegant home pieces that make a lasting impression.',
    slug: 'luxury-housewarming-gifts',
    date: 'November 20, 2025',
    readTime: '8 min read',
  },
];

export default function GiftGuidesPage() {
  return (
    <CategoryPage
      title="Luxury Gift Guides"
      subtitle="Thoughtful Gifts Worth Giving"
      description="Finding the perfect gift is an art. Our gift guides focus on investment-worthy pieces that combine exceptional quality with lasting appeal—gifts that will be treasured for years, not forgotten in months."
      breadcrumb={{
        parent: 'Guides',
        parentHref: '/guides',
        current: 'Gift Guides',
      }}
      articles={articles}
      categorySlug="guides/gift-guides"
    />
  );
}
