import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Luxury Travel: Flying, Cruising & Destinations for 2026 | InvestedLuxury',
  description: 'Expert guide to luxury travel in 2026. Compare business vs first class, discover the best airport lounges, and find luxury destinations worth visiting.',
};

const articles = [
  {
    id: '1',
    title: 'Business Class vs First Class: Is the Upgrade Worth It?',
    excerpt: 'Breaking down the real differences between business and first class—and when each makes sense.',
    slug: 'business-class-vs-first-class',
    date: 'December 2, 2025',
    readTime: '12 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Luxury Cruise Lines Ranked 2026',
    excerpt: 'From ultra-luxury to expedition cruises—how the top cruise lines compare.',
    slug: 'luxury-cruise-lines-ranked',
    date: 'November 30, 2025',
    readTime: '14 min read',
  },
  {
    id: '3',
    title: 'Emirates Business vs First Class',
    excerpt: 'Is Emirates first class worth double the price? A detailed comparison.',
    slug: 'emirates-business-vs-first-class',
    date: 'November 28, 2025',
    readTime: '10 min read',
  },
  {
    id: '4',
    title: 'Best Airport Lounges in the World',
    excerpt: 'The airport lounges worth arriving early for—and how to get access.',
    slug: 'best-airport-lounges-world',
    date: 'November 25, 2025',
    readTime: '11 min read',
  },
  {
    id: '5',
    title: 'Best Credit Card for Airport Lounges 2026',
    excerpt: 'Which cards offer the best lounge access? Our comprehensive comparison.',
    slug: 'best-credit-card-airport-lounges',
    date: 'November 20, 2025',
    readTime: '10 min read',
  },
  {
    id: '6',
    title: 'Luxury Travel Destinations for 2026',
    excerpt: 'Where discerning travelers are heading next year—and why.',
    slug: 'luxury-travel-destinations-2026',
    date: 'November 15, 2025',
    readTime: '13 min read',
  },
];

export default function TravelPage() {
  return (
    <CategoryPage
      title="Luxury Travel"
      subtitle="Flying, Cruising & Destinations for 2026"
      description="Travel should be part of the experience, not just a means to an end. We compare cabins, cruise lines, and destinations to help you invest your travel budget where it matters most—and avoid the upgrades that aren't worth it."
      breadcrumb={{
        parent: 'Lifestyle',
        parentHref: '/lifestyle',
        current: 'Travel',
      }}
      articles={articles}
      categorySlug="lifestyle/travel"
    />
  );
}
