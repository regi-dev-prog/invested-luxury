import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Luxury Beginner Guides: Start Your Collection Right | InvestedLuxury',
  description: 'New to luxury? Our beginner guides help you make smart first purchases in designer bags, watches, jewelry, and more.',
};

const articles = [
  {
    id: '1',
    title: 'How to Start a Luxury Wardrobe',
    excerpt: 'A strategic approach to building a capsule wardrobe of investment pieces.',
    slug: 'how-to-start-luxury-wardrobe',
    date: 'December 2, 2025',
    readTime: '15 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Your First Designer Bag: Complete Guide',
    excerpt: 'Everything you need to know before buying your first luxury handbag.',
    slug: 'first-designer-bag-guide',
    date: 'December 1, 2025',
    readTime: '12 min read',
  },
  {
    id: '3',
    title: 'Your First Luxury Watch: Where to Start',
    excerpt: 'Navigating the world of fine timepieces as a newcomer.',
    slug: 'first-luxury-watch-guide',
    date: 'November 28, 2025',
    readTime: '14 min read',
  },
  {
    id: '4',
    title: 'Luxury Shopping 101: Avoiding Common Mistakes',
    excerpt: 'What we wish we knew before our first luxury purchases.',
    slug: 'luxury-shopping-mistakes',
    date: 'November 25, 2025',
    readTime: '10 min read',
  },
  {
    id: '5',
    title: 'Understanding Luxury Quality: A Beginner\'s Guide',
    excerpt: 'How to spot real quality and avoid overpaying for marketing.',
    slug: 'understanding-luxury-quality',
    date: 'November 20, 2025',
    readTime: '11 min read',
  },
];

export default function BeginnersGuidesPage() {
  return (
    <CategoryPage
      title="Beginner Guides"
      subtitle="Start Your Luxury Journey Right"
      description="Everyone starts somewhere. Our beginner guides cut through the intimidation and marketing to help you make confident, informed first purchases that you'll never regret."
      breadcrumb={{
        parent: 'Guides',
        parentHref: '/guides',
        current: 'Beginner Guides',
      }}
      articles={articles}
      categorySlug="guides/beginners"
    />
  );
}
