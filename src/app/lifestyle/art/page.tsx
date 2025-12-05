import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Art & Photography: Collecting, Cameras & Creative Investment 2026 | InvestedLuxury',
  description: 'Expert guides to art collecting and travel photography. Compare Leica vs Fujifilm, learn how to start an art collection, and discover cameras worth buying.',
};

const articles = [
  {
    id: '1',
    title: 'Best Cameras for Travel 2026',
    excerpt: 'From compact to mirrorless—the best travel cameras for quality-conscious photographers.',
    slug: 'best-cameras-for-travel-2026',
    date: 'December 2, 2025',
    readTime: '12 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Leica vs Fujifilm: Which Camera System?',
    excerpt: 'A photographer\'s comparison of two beloved systems—quality, experience, and value.',
    slug: 'leica-vs-fujifilm',
    date: 'November 28, 2025',
    readTime: '14 min read',
  },
  {
    id: '3',
    title: 'Best Compact Cameras for Travel Photography',
    excerpt: 'High-quality cameras that fit in your pocket—perfect for travel.',
    slug: 'best-compact-cameras-travel',
    date: 'November 25, 2025',
    readTime: '10 min read',
  },
  {
    id: '4',
    title: 'Is Art a Good Investment?',
    excerpt: 'The truth about art as an investment—what works, what doesn\'t, and realistic expectations.',
    slug: 'is-art-good-investment',
    date: 'November 20, 2025',
    readTime: '13 min read',
  },
  {
    id: '5',
    title: 'How to Start Collecting Art',
    excerpt: 'A beginner\'s guide to building an art collection—where to start and what to avoid.',
    slug: 'how-to-start-collecting-art',
    date: 'November 15, 2025',
    readTime: '11 min read',
  },
  {
    id: '6',
    title: 'Art Collecting for Beginners',
    excerpt: 'Everything you need to know before buying your first piece—galleries, auctions, and more.',
    slug: 'art-collecting-beginners',
    date: 'November 10, 2025',
    readTime: '10 min read',
  },
];

export default function ArtPage() {
  return (
    <CategoryPage
      title="Art & Photography"
      subtitle="Collecting, Cameras & Creative Investment"
      description="Creativity enriches life, whether you're capturing moments with a quality camera or collecting pieces that move you. We explore the intersection of art and investment, helping you make informed decisions about creative pursuits."
      breadcrumb={{
        parent: 'Lifestyle',
        parentHref: '/lifestyle',
        current: 'Art & Photography',
      }}
      articles={articles}
      categorySlug="lifestyle/art"
    />
  );
}
