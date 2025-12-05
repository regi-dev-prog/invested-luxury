import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Investment Clothing: Designer Pieces Worth Buying in 2026 | InvestedLuxury',
  description: 'Expert guide to investment-worthy designer clothing. From Loro Piana cashmere to quality outerwear, discover pieces that last.',
};

const articles = [
  {
    id: '1',
    title: 'Loro Piana Sweater: Is It Worth $2,000?',
    excerpt: 'An honest analysis of Loro Piana\'s famous cashmere—quality, care, and whether it justifies the price.',
    slug: 'loro-piana-sweater-worth-it',
    date: 'December 2, 2025',
    readTime: '11 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Best Luxury Cashmere Sweaters 2026',
    excerpt: 'Comparing the best cashmere at every price point—from affordable luxury to ultimate splurge.',
    slug: 'best-luxury-cashmere-sweaters',
    date: 'November 28, 2025',
    readTime: '12 min read',
  },
  {
    id: '3',
    title: 'Quiet Luxury Clothing Brands to Know',
    excerpt: 'Designer labels that prioritize quality and craftsmanship over logos.',
    slug: 'quiet-luxury-clothing-brands',
    date: 'November 25, 2025',
    readTime: '10 min read',
  },
  {
    id: '4',
    title: 'Best Designer Coat Brands 2026',
    excerpt: 'Investment outerwear from brands that specialize in coats worth keeping for decades.',
    slug: 'best-designer-coat-brands',
    date: 'November 20, 2025',
    readTime: '11 min read',
  },
  {
    id: '5',
    title: 'Totême: Brand Guide & Best Pieces',
    excerpt: 'A deep dive into the Scandinavian label loved by quiet luxury enthusiasts.',
    slug: 'toteme-brand-guide',
    date: 'November 15, 2025',
    readTime: '10 min read',
  },
  {
    id: '6',
    title: 'Max Mara 101801 Coat: The Ultimate Review',
    excerpt: 'Is Max Mara\'s iconic coat worth the investment? We break it down.',
    slug: 'max-mara-101801-coat-review',
    date: 'November 10, 2025',
    readTime: '9 min read',
  },
];

export default function ClothingPage() {
  return (
    <CategoryPage
      title="Investment Clothing"
      subtitle="Designer Pieces Worth Buying in 2026"
      description="Quality clothing is an investment in how you present yourself to the world. We focus on construction, materials, and timeless design to identify pieces that justify their price tag through years of elegant wear."
      breadcrumb={{
        parent: 'Fashion',
        parentHref: '/fashion',
        current: 'Clothing',
      }}
      articles={articles}
      categorySlug="fashion/clothing"
    />
  );
}
