import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Investment Jewelry: Pieces That Hold Value in 2026 | InvestedLuxury',
  description: 'Expert guide to jewelry worth investing in. From Cartier to Van Cleef, discover which pieces hold their value and are worth the investment.',
};

const articles = [
  {
    id: '1',
    title: 'Is Jewelry a Good Investment?',
    excerpt: 'The truth about jewelry as an investment—which pieces appreciate, which don\'t, and what to consider.',
    slug: 'is-jewelry-good-investment',
    date: 'December 2, 2025',
    readTime: '12 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Is Gold Jewelry a Good Investment?',
    excerpt: 'Gold jewelry as an investment strategy—purity, brands, and the real numbers.',
    slug: 'is-gold-jewelry-good-investment',
    date: 'November 28, 2025',
    readTime: '10 min read',
  },
  {
    id: '3',
    title: 'Cartier Love Bracelet: Worth the Investment?',
    excerpt: 'An honest analysis of Cartier\'s iconic bracelet—resale value, quality, and buying tips.',
    slug: 'cartier-love-bracelet-worth-it',
    date: 'November 25, 2025',
    readTime: '11 min read',
  },
  {
    id: '4',
    title: 'Van Cleef Alhambra: Is It Worth It?',
    excerpt: 'Everything you need to know about Van Cleef\'s most popular collection—value, versions, and verdict.',
    slug: 'van-cleef-alhambra-worth-it',
    date: 'November 20, 2025',
    readTime: '10 min read',
  },
  {
    id: '5',
    title: 'Best Investment Jewelry Brands 2026',
    excerpt: 'The jewelry brands with the best resale value and lasting appeal.',
    slug: 'best-investment-jewelry-brands',
    date: 'November 15, 2025',
    readTime: '13 min read',
  },
  {
    id: '6',
    title: 'Tiffany vs Cartier: Brand Comparison',
    excerpt: 'Two iconic jewelry houses compared—heritage, quality, and which is right for you.',
    slug: 'tiffany-vs-cartier',
    date: 'November 10, 2025',
    readTime: '12 min read',
  },
];

export default function JewelryPage() {
  return (
    <CategoryPage
      title="Investment Jewelry"
      subtitle="Pieces That Hold Value in 2026"
      description="Fine jewelry transcends fashion—the right pieces become treasured heirlooms that appreciate over time. We examine craftsmanship, materials, and market demand to help you invest in jewelry that's worth far more than its weight in gold."
      breadcrumb={{
        parent: 'Fashion',
        parentHref: '/fashion',
        current: 'Jewelry',
      }}
      articles={articles}
      categorySlug="fashion/jewelry"
    />
  );
}
