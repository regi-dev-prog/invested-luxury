import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Investment Watches: Timepieces That Hold Value in 2026 | InvestedLuxury',
  description: 'Expert guide to watches worth investing in. Compare Omega vs Rolex, discover entry-level luxury watches, and learn which timepieces hold their value.',
};

const articles = [
  {
    id: '1',
    title: 'Omega vs Rolex: Which Watch to Buy?',
    excerpt: 'A comprehensive comparison of two legendary watchmakers—quality, value, and which is right for you.',
    slug: 'omega-vs-rolex',
    date: 'December 2, 2025',
    readTime: '14 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Best Entry Level Luxury Watch 2026',
    excerpt: 'Starting your watch collection? These are the best first luxury watches at every price point.',
    slug: 'best-entry-level-luxury-watch',
    date: 'November 28, 2025',
    readTime: '12 min read',
  },
  {
    id: '3',
    title: 'Cartier Tank vs Santos: Which to Buy?',
    excerpt: 'Two iconic Cartier watches compared—heritage, design, and investment potential.',
    slug: 'cartier-tank-vs-santos',
    date: 'November 25, 2025',
    readTime: '10 min read',
  },
  {
    id: '4',
    title: 'Is Rolex a Good Investment?',
    excerpt: 'Analyzing Rolex as an investment—which models appreciate, market trends, and realistic expectations.',
    slug: 'is-rolex-good-investment',
    date: 'November 20, 2025',
    readTime: '11 min read',
  },
  {
    id: '5',
    title: 'Tudor vs Omega: Value Comparison',
    excerpt: 'Comparing Rolex\'s sister brand to Omega—quality, price, and which offers better value.',
    slug: 'tudor-vs-omega',
    date: 'November 15, 2025',
    readTime: '10 min read',
  },
  {
    id: '6',
    title: 'Best Watches Under $5,000 in 2026',
    excerpt: 'Serious timepieces that punch above their weight—our top picks for the discerning buyer.',
    slug: 'best-watches-under-5000',
    date: 'November 10, 2025',
    readTime: '12 min read',
  },
];

export default function WatchesPage() {
  return (
    <CategoryPage
      title="Investment Watches"
      subtitle="Timepieces That Hold Value in 2026"
      description="A quality watch is more than a timepiece—it's a statement of taste, a potential heirloom, and sometimes, a solid investment. We analyze movements, materials, and market values to help you choose watches that stand the test of time in every sense."
      breadcrumb={{
        parent: 'Fashion',
        parentHref: '/fashion',
        current: 'Watches',
      }}
      articles={articles}
      categorySlug="fashion/watches"
    />
  );
}
