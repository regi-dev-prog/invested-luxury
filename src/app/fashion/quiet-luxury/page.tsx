import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Quiet Luxury Brands: The Art of Understated Elegance 2026 | InvestedLuxury',
  description: 'Discover the best quiet luxury brands for 2026. From The Row to Brunello Cucinelli, explore stealth wealth fashion that whispers quality over logos.',
};

const articles = [
  {
    id: '1',
    title: 'Quiet Luxury Brands: The Complete Guide',
    excerpt: 'Everything you need to know about the quiet luxury movement—the brands, the philosophy, and why it matters.',
    slug: 'quiet-luxury-brands-guide',
    date: 'December 2, 2025',
    readTime: '15 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Old Money Aesthetic Brands to Know',
    excerpt: 'The brands that define understated elegance and timeless style—from heritage houses to modern labels.',
    slug: 'old-money-aesthetic-brands',
    date: 'November 28, 2025',
    readTime: '12 min read',
  },
  {
    id: '3',
    title: 'Stealth Wealth Brands: The Ultimate List',
    excerpt: 'Designer labels favored by those who prefer quality over logos—and how to identify them.',
    slug: 'stealth-wealth-brands',
    date: 'November 25, 2025',
    readTime: '10 min read',
  },
  {
    id: '4',
    title: 'The Row: Brand Guide & Best Pieces to Buy',
    excerpt: 'A deep dive into the Olsen twins\' luxury label—what makes it special and where to start.',
    slug: 'the-row-brand-guide',
    date: 'November 20, 2025',
    readTime: '14 min read',
  },
  {
    id: '5',
    title: 'Brunello Cucinelli: Is It Worth the Price?',
    excerpt: 'An honest look at the Italian cashmere king—quality, value, and what\'s actually worth buying.',
    slug: 'brunello-cucinelli-worth-it',
    date: 'November 15, 2025',
    readTime: '11 min read',
  },
  {
    id: '6',
    title: 'Quiet Luxury Bags: 15 Understated Options',
    excerpt: 'Designer bags that let quality speak for itself—no logos required.',
    slug: 'quiet-luxury-bags',
    date: 'November 10, 2025',
    readTime: '10 min read',
  },
];

export default function QuietLuxuryPage() {
  return (
    <CategoryPage
      title="Quiet Luxury"
      subtitle="The Art of Understated Elegance"
      description="Quiet luxury isn't about what you wear—it's about how it's made. We explore brands that prioritize exceptional craftsmanship, premium materials, and timeless design over logos and trends. For those who know, these pieces speak volumes in whispers."
      breadcrumb={{
        parent: 'Fashion',
        parentHref: '/fashion',
        current: 'Quiet Luxury',
      }}
      articles={articles}
      categorySlug="fashion/quiet-luxury"
    />
  );
}
