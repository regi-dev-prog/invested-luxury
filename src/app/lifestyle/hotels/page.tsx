import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Luxury Hotels: Where to Stay in 2026 | InvestedLuxury',
  description: 'Expert guides to the best boutique and luxury hotels for 2026. Discover exceptional stays in Paris, London, Tokyo, and beyond.',
};

const articles = [
  {
    id: '1',
    title: 'Best Boutique Hotels in Paris 2026',
    excerpt: 'Curated guide to Paris\'s most exceptional boutique hotels—charm, location, and insider tips.',
    slug: 'best-boutique-hotels-paris',
    date: 'December 2, 2025',
    readTime: '12 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Best Boutique Hotels in London 2026',
    excerpt: 'Where to stay in London—from townhouse gems to design-forward properties.',
    slug: 'best-boutique-hotels-london',
    date: 'November 30, 2025',
    readTime: '11 min read',
  },
  {
    id: '3',
    title: 'Four Seasons vs Ritz Carlton: Which Is Better?',
    excerpt: 'A detailed comparison of two luxury hotel giants—service, style, and value.',
    slug: 'four-seasons-vs-ritz-carlton',
    date: 'November 28, 2025',
    readTime: '10 min read',
  },
  {
    id: '4',
    title: 'Best Boutique Hotels in Tokyo 2026',
    excerpt: 'Tokyo\'s most distinctive boutique stays—from minimalist design to traditional elegance.',
    slug: 'best-boutique-hotels-tokyo',
    date: 'November 25, 2025',
    readTime: '10 min read',
  },
  {
    id: '5',
    title: 'Best Boutique Hotels in Mexico City 2026',
    excerpt: 'The coolest places to stay in CDMX—art, architecture, and atmosphere.',
    slug: 'best-boutique-hotels-mexico-city',
    date: 'November 20, 2025',
    readTime: '9 min read',
  },
  {
    id: '6',
    title: 'Best Luxury Hotels in Tulum 2026',
    excerpt: 'Tulum\'s finest—jungle retreats, beachfront escapes, and design-driven stays.',
    slug: 'best-luxury-hotels-tulum',
    date: 'November 15, 2025',
    readTime: '10 min read',
  },
];

export default function HotelsPage() {
  return (
    <CategoryPage
      title="Luxury Hotels"
      subtitle="Where to Stay in 2026"
      description="We believe where you stay shapes your entire travel experience. Our hotel guides go beyond star ratings to find properties with genuine character, exceptional service, and that indefinable quality that turns a trip into a memory."
      breadcrumb={{
        parent: 'Lifestyle',
        parentHref: '/lifestyle',
        current: 'Hotels',
      }}
      articles={articles}
      categorySlug="lifestyle/hotels"
    />
  );
}
