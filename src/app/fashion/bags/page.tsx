import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Investment Bags: Designer Handbags Worth Buying in 2026 | InvestedLuxury',
  description: 'Expert guide to investment-worthy designer bags for 2026. From The Row to Hermès, discover which handbags hold their value and are worth the investment.',
};

// Placeholder articles - will be replaced with Sanity data
const articles = [
  {
    id: '1',
    title: 'The Row Handbags: Complete Brand Guide',
    excerpt: 'Everything you need to know about The Row bags—from the iconic Margaux to where to buy at the best price.',
    slug: 'the-row-handbags-guide',
    date: 'December 2, 2025',
    readTime: '12 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Quiet Luxury Bags: 15 Understated Options',
    excerpt: 'The best under-the-radar designer bags that whisper quality instead of shouting logos.',
    slug: 'quiet-luxury-bags',
    date: 'December 1, 2025',
    readTime: '10 min read',
  },
  {
    id: '3',
    title: 'Best Designer Crossbody Bags 2026',
    excerpt: 'From everyday elegance to travel-ready options, these crossbody bags combine style with practicality.',
    slug: 'best-designer-crossbody-bags-2026',
    date: 'November 28, 2025',
    readTime: '8 min read',
  },
  {
    id: '4',
    title: 'The Row Margaux Bag Review: Worth $5,000?',
    excerpt: 'An honest analysis of The Row\'s most iconic bag—quality, value retention, and who should buy it.',
    slug: 'the-row-margaux-review',
    date: 'November 25, 2025',
    readTime: '10 min read',
  },
  {
    id: '5',
    title: 'Hermès Birkin vs Kelly: Which Is Right for You?',
    excerpt: 'A comprehensive comparison of two legendary bags to help you make the right investment.',
    slug: 'hermes-birkin-vs-kelly',
    date: 'November 20, 2025',
    readTime: '15 min read',
  },
  {
    id: '6',
    title: 'Best Entry-Level Designer Bags Under $2,000',
    excerpt: 'Quality designer bags that offer excellent value without compromising on craftsmanship.',
    slug: 'best-entry-level-designer-bags',
    date: 'November 15, 2025',
    readTime: '9 min read',
  },
];

export default function BagsPage() {
  return (
    <CategoryPage
      title="Investment Bags"
      subtitle="Designer Handbags Worth Buying in 2026"
      description="Not all designer bags are created equal. We analyze craftsmanship, resale value, and timeless design to identify the handbags that truly deserve the 'investment piece' label. Our guides help you buy smarter—whether it's your first luxury bag or your next addition."
      breadcrumb={{
        parent: 'Fashion',
        parentHref: '/fashion',
        current: 'Bags',
      }}
      articles={articles}
      categorySlug="fashion/bags"
    />
  );
}
