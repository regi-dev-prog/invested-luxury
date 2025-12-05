import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Designer Shoes: Investment Footwear Worth Buying in 2026 | InvestedLuxury',
  description: 'Expert guide to designer shoes that combine style with lasting value. From designer sneakers to classic loafers, find footwear worth the investment.',
};

const articles = [
  {
    id: '1',
    title: 'Designer Sneakers on Sale: Best Deals Right Now',
    excerpt: 'Where to find authentic designer sneakers at the best prices—updated regularly with current sales.',
    slug: 'designer-sneakers-on-sale',
    date: 'December 2, 2025',
    readTime: '8 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Best Designer Loafers for Women 2026',
    excerpt: 'Classic loafers from The Row, Gucci, and more—which ones are worth the splurge.',
    slug: 'best-designer-loafers-women-2026',
    date: 'November 30, 2025',
    readTime: '10 min read',
  },
  {
    id: '3',
    title: 'White Designer Sneakers: The Complete Guide',
    excerpt: 'From Common Projects to Golden Goose, we compare the best white designer sneakers at every price point.',
    slug: 'white-designer-sneakers-guide',
    date: 'November 25, 2025',
    readTime: '12 min read',
  },
  {
    id: '4',
    title: 'Best Designer Sneakers 2026',
    excerpt: 'Our curated selection of designer sneakers that balance style, comfort, and investment value.',
    slug: 'best-designer-sneakers-2026',
    date: 'November 20, 2025',
    readTime: '10 min read',
  },
  {
    id: '5',
    title: 'Designer Sneakers for Women: Complete Buying Guide',
    excerpt: 'Everything you need to know about buying designer sneakers—sizing, care, and where to shop.',
    slug: 'designer-sneakers-women-guide',
    date: 'November 15, 2025',
    readTime: '11 min read',
  },
];

export default function ShoesPage() {
  return (
    <CategoryPage
      title="Designer Shoes"
      subtitle="Investment Footwear Worth Buying in 2026"
      description="The right designer shoes elevate every outfit and can last for years with proper care. We evaluate construction quality, comfort, and timeless design to help you invest in footwear that's worth every penny."
      breadcrumb={{
        parent: 'Fashion',
        parentHref: '/fashion',
        current: 'Shoes',
      }}
      articles={articles}
      categorySlug="fashion/shoes"
    />
  );
}
