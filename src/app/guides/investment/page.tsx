import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Luxury Investment Guides: Build Value Over Time | InvestedLuxury',
  description: 'Strategic guides to luxury as investment. Learn which pieces appreciate, how to buy smart, and how to build a collection that holds value.',
};

const articles = [
  {
    id: '1',
    title: 'The Investment Piece Framework',
    excerpt: 'Our methodology for identifying luxury items that hold or gain value over time.',
    slug: 'investment-piece-framework',
    date: 'December 2, 2025',
    readTime: '15 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Best Luxury Investments for 2026',
    excerpt: 'Categories and specific pieces with the strongest investment potential this year.',
    slug: 'best-luxury-investments-2026',
    date: 'December 1, 2025',
    readTime: '14 min read',
  },
  {
    id: '3',
    title: 'Luxury Resale: How to Sell Your Pieces',
    excerpt: 'Where and how to sell luxury items for maximum return.',
    slug: 'luxury-resale-guide',
    date: 'November 28, 2025',
    readTime: '12 min read',
  },
  {
    id: '4',
    title: 'Cost Per Wear: The Math of Luxury',
    excerpt: 'How to calculate the true value of investment pieces.',
    slug: 'cost-per-wear-guide',
    date: 'November 25, 2025',
    readTime: '10 min read',
  },
  {
    id: '5',
    title: 'Building a Luxury Collection: Strategy Guide',
    excerpt: 'A long-term approach to acquiring pieces that work together and hold value.',
    slug: 'building-luxury-collection',
    date: 'November 20, 2025',
    readTime: '13 min read',
  },
  {
    id: '6',
    title: 'Authentication Guide: Spotting Fakes',
    excerpt: 'How to verify authenticity and protect your investment.',
    slug: 'luxury-authentication-guide',
    date: 'November 15, 2025',
    readTime: '11 min read',
  },
];

export default function InvestmentGuidesPage() {
  return (
    <CategoryPage
      title="Investment Guides"
      subtitle="Build Value Over Time"
      description="True luxury holds its value. Our investment guides help you think strategically about your purchases—identifying pieces that appreciate, timing your buys, and building a collection that works for you financially and aesthetically."
      breadcrumb={{
        parent: 'Guides',
        parentHref: '/guides',
        current: 'Investment Guides',
      }}
      articles={articles}
      categorySlug="guides/investment"
    />
  );
}
