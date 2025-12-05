import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Wellness Retreats: Ayahuasca, Luxury Spas & Transformative Experiences | InvestedLuxury',
  description: 'Complete guide to transformative wellness retreats. Compare ayahuasca retreat costs, discover luxury spa retreats, and find the right experience for you.',
};

const articles = [
  {
    id: '1',
    title: 'How Much Does an Ayahuasca Retreat Cost?',
    excerpt: 'Complete pricing guide for ayahuasca retreats—by location, duration, and what\'s included.',
    slug: 'ayahuasca-retreat-cost',
    date: 'December 2, 2025',
    readTime: '12 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'Ayahuasca Retreats in the USA',
    excerpt: 'Legal options for ayahuasca experiences in America—what to know before you go.',
    slug: 'ayahuasca-retreat-usa',
    date: 'November 30, 2025',
    readTime: '14 min read',
  },
  {
    id: '3',
    title: 'Best Ayahuasca Retreats in Colorado',
    excerpt: 'Colorado\'s top options for plant medicine experiences—safety, legality, and reviews.',
    slug: 'ayahuasca-retreat-colorado',
    date: 'November 28, 2025',
    readTime: '10 min read',
  },
  {
    id: '4',
    title: 'Ayahuasca Retreats in Florida',
    excerpt: 'Where to find legitimate ayahuasca experiences in Florida—and what to avoid.',
    slug: 'ayahuasca-retreat-florida',
    date: 'November 25, 2025',
    readTime: '11 min read',
  },
  {
    id: '5',
    title: 'Best Ayahuasca Retreats in California',
    excerpt: 'California\'s options for plant medicine retreats—from legal to gray area.',
    slug: 'ayahuasca-retreat-california',
    date: 'November 20, 2025',
    readTime: '12 min read',
  },
  {
    id: '6',
    title: 'Luxury Wellness Retreats Worth the Investment',
    excerpt: 'Premium wellness retreats that deliver real results—not just Instagram moments.',
    slug: 'luxury-wellness-retreats',
    date: 'November 15, 2025',
    readTime: '13 min read',
  },
];

export default function RetreatsPage() {
  return (
    <CategoryPage
      title="Wellness Retreats"
      subtitle="Ayahuasca, Luxury Spas & Transformative Experiences"
      description="Transformative experiences can reshape how you see yourself and the world. We guide you through the landscape of wellness retreats—from luxury spa escapes to ceremonial plant medicine—with honest assessments of costs, safety, and what to expect."
      breadcrumb={{
        parent: 'Wellness',
        parentHref: '/wellness',
        current: 'Retreats',
      }}
      articles={articles}
      categorySlug="wellness/retreats"
    />
  );
}
