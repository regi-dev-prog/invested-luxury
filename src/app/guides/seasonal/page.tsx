import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Seasonal Luxury Guides 2026 | InvestedLuxury',
  description: 'Seasonal guides to luxury fashion, travel, and lifestyle. What to buy, where to go, and how to make the most of each season.',
};

const articles = [
  {
    id: '1',
    title: 'Winter Luxury Essentials 2026',
    excerpt: 'Investment pieces for the cold season—coats, cashmere, and cold-weather accessories.',
    slug: 'winter-luxury-essentials-2026',
    date: 'December 2, 2025',
    readTime: '12 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Holiday Travel Guide 2026',
    excerpt: 'Where to go, where to stay, and how to travel in style this holiday season.',
    slug: 'holiday-travel-guide-2026',
    date: 'December 1, 2025',
    readTime: '14 min read',
  },
  {
    id: '3',
    title: 'Black Friday Luxury Deals Worth Buying',
    excerpt: 'The sales that matter—and the ones to skip.',
    slug: 'black-friday-luxury-deals',
    date: 'November 20, 2025',
    readTime: '10 min read',
  },
  {
    id: '4',
    title: 'Summer Luxury Wardrobe Essentials',
    excerpt: 'Elevated warm-weather pieces worth the investment.',
    slug: 'summer-luxury-essentials',
    date: 'May 15, 2025',
    readTime: '11 min read',
  },
  {
    id: '5',
    title: 'Resort Season: What to Pack',
    excerpt: 'Luxury travel wardrobe essentials for your next escape.',
    slug: 'resort-season-packing-guide',
    date: 'January 10, 2025',
    readTime: '9 min read',
  },
];

export default function SeasonalGuidesPage() {
  return (
    <CategoryPage
      title="Seasonal Guides"
      subtitle="Timely Advice for Every Season"
      description="Luxury isn't one-size-fits-all, and neither are the seasons. Our seasonal guides help you invest wisely for each time of year—from winter coats to summer getaways."
      breadcrumb={{
        parent: 'Guides',
        parentHref: '/guides',
        current: 'Seasonal Guides',
      }}
      articles={articles}
      categorySlug="guides/seasonal"
    />
  );
}
