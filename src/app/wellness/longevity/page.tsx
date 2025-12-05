import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Longevity: Science-Backed Treatments & Supplements 2026 | InvestedLuxury',
  description: 'Expert guide to longevity treatments and supplements. From NAD+ IV therapy costs to the best longevity supplements, discover evidence-based anti-aging protocols.',
};

const articles = [
  {
    id: '1',
    title: 'NAD+ IV Therapy: Complete Guide',
    excerpt: 'Everything you need to know about NAD+ therapy—benefits, costs, and what to expect.',
    slug: 'nad-iv-therapy-guide',
    date: 'December 2, 2025',
    readTime: '14 min read',
    featured: true,
  },
  {
    id: '2',
    title: 'How Much Does NAD IV Therapy Cost?',
    excerpt: 'Complete pricing breakdown for NAD+ IV therapy—by location, clinic type, and protocol.',
    slug: 'nad-iv-therapy-cost',
    date: 'November 30, 2025',
    readTime: '10 min read',
  },
  {
    id: '3',
    title: 'What Is NAD+ Therapy and Does It Work?',
    excerpt: 'The science behind NAD+ therapy—what research shows and what\'s still unknown.',
    slug: 'what-is-nad-therapy',
    date: 'November 28, 2025',
    readTime: '12 min read',
  },
  {
    id: '4',
    title: 'Best Longevity Supplements 2026',
    excerpt: 'Evidence-based supplements for healthy aging—what works and what\'s marketing.',
    slug: 'best-longevity-supplements',
    date: 'November 25, 2025',
    readTime: '13 min read',
  },
  {
    id: '5',
    title: 'Best Longevity Clinics in the World',
    excerpt: 'Where the world\'s top longevity clinics are—and what they offer.',
    slug: 'best-longevity-clinics',
    date: 'November 20, 2025',
    readTime: '11 min read',
  },
  {
    id: '6',
    title: 'Anti-Aging Treatments That Actually Work',
    excerpt: 'Cutting through the hype—which anti-aging treatments have real evidence behind them.',
    slug: 'anti-aging-treatments-work',
    date: 'November 15, 2025',
    readTime: '12 min read',
  },
];

export default function LongevityPage() {
  return (
    <CategoryPage
      title="Longevity"
      subtitle="Science-Backed Treatments & Supplements for 2026"
      description="Longevity isn't just about living longer—it's about living better. We cut through the hype to examine what science actually supports, from cutting-edge treatments to supplements with real evidence behind them."
      breadcrumb={{
        parent: 'Wellness',
        parentHref: '/wellness',
        current: 'Longevity',
      }}
      articles={articles}
      categorySlug="wellness/longevity"
    />
  );
}
