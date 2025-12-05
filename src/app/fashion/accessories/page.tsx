import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Luxury Accessories: Investment Pieces Worth Buying in 2026 | InvestedLuxury',
  description: 'Expert guide to luxury accessories worth investing in. From designer sunglasses to silk scarves, discover accessories that elevate every outfit.',
};

const articles = [
  {
    id: '1',
    title: 'Chanel Sunglasses Price Guide 2026',
    excerpt: 'Complete pricing breakdown for Chanel sunglasses—styles, costs, and where to buy.',
    slug: 'chanel-sunglasses-price-guide',
    date: 'December 2, 2025',
    readTime: '9 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Are Designer Sunglasses Worth It?',
    excerpt: 'The truth about luxury eyewear—quality differences, markup, and what\'s actually worth buying.',
    slug: 'are-designer-sunglasses-worth-it',
    date: 'November 28, 2025',
    readTime: '10 min read',
  },
  {
    id: '3',
    title: 'Best Designer Belts 2026',
    excerpt: 'From subtle to statement—our guide to designer belts worth the investment.',
    slug: 'best-designer-belts-2026',
    date: 'November 25, 2025',
    readTime: '8 min read',
  },
  {
    id: '4',
    title: 'Hermès Scarf: Is It Worth the Investment?',
    excerpt: 'The iconic silk carré examined—quality, versatility, and resale value.',
    slug: 'hermes-scarf-worth-it',
    date: 'November 20, 2025',
    readTime: '10 min read',
  },
  {
    id: '5',
    title: 'Best Designer Wallets 2026',
    excerpt: 'Quality leather goods that get better with age—our top picks.',
    slug: 'best-designer-wallets-2026',
    date: 'November 15, 2025',
    readTime: '9 min read',
  },
  {
    id: '6',
    title: 'Celine vs Saint Laurent Sunglasses',
    excerpt: 'Comparing two luxury eyewear leaders—style, quality, and value.',
    slug: 'celine-vs-saint-laurent-sunglasses',
    date: 'November 10, 2025',
    readTime: '8 min read',
  },
];

export default function AccessoriesPage() {
  return (
    <CategoryPage
      title="Luxury Accessories"
      subtitle="Investment Pieces Worth Buying in 2026"
      description="The right accessories transform an outfit and often outlast the clothes themselves. We evaluate quality, craftsmanship, and versatility to help you invest in accessories that deliver value for years to come."
      breadcrumb={{
        parent: 'Fashion',
        parentHref: '/fashion',
        current: 'Accessories',
      }}
      articles={articles}
      categorySlug="fashion/accessories"
    />
  );
}
