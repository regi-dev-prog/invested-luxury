import { Metadata } from 'next';
import CategoryPage from '@/components/CategoryPage';

export const metadata: Metadata = {
  title: 'Biohacking: Cold Plunge, Red Light Therapy & Optimization Tools 2026 | InvestedLuxury',
  description: 'Science-backed biohacking guide. From cold plunge benefits to biohacking supplements, discover protocols for peak performance and longevity.',
};

const articles = [
  {
    id: '1',
    title: 'Cold Plunge Benefits: Complete Guide',
    excerpt: 'What science actually says about cold plunging—benefits, protocols, and who should avoid it.',
    slug: 'cold-plunge-benefits-guide',
    date: 'December 2, 2025',
    readTime: '14 min read',
    featured: true,
  },
  {
    id: '2',
    title: '2-Minute Cold Plunge: Is It Enough?',
    excerpt: 'How long do you really need to cold plunge? The science of optimal duration.',
    slug: '2-minute-cold-plunge-benefits',
    date: 'November 30, 2025',
    readTime: '9 min read',
  },
  {
    id: '3',
    title: 'Sauna and Cold Plunge: The Ultimate Combo',
    excerpt: 'The benefits of contrast therapy—how to combine heat and cold for maximum effect.',
    slug: 'sauna-cold-plunge-benefits',
    date: 'November 28, 2025',
    readTime: '11 min read',
  },
  {
    id: '4',
    title: 'Biohacking Supplements: What Actually Works',
    excerpt: 'Cutting through the marketing—which biohacking supplements have real evidence.',
    slug: 'biohacking-supplements-guide',
    date: 'November 25, 2025',
    readTime: '13 min read',
  },
  {
    id: '5',
    title: 'Best Biohacking Supplements 2026',
    excerpt: 'Our curated list of supplements that deliver measurable results.',
    slug: 'best-biohacking-supplements',
    date: 'November 20, 2025',
    readTime: '12 min read',
  },
  {
    id: '6',
    title: 'Red Light Therapy: Benefits & Evidence',
    excerpt: 'What does red light therapy actually do? The science behind the trend.',
    slug: 'red-light-therapy-benefits',
    date: 'November 15, 2025',
    readTime: '11 min read',
  },
];

export default function BiohackingPage() {
  return (
    <CategoryPage
      title="Biohacking"
      subtitle="Cold Plunge, Red Light Therapy & Optimization Tools"
      description="Biohacking is about using science to optimize your body and mind. We separate evidence-based protocols from expensive gimmicks, helping you invest in tools and practices that actually deliver results."
      breadcrumb={{
        parent: 'Wellness',
        parentHref: '/wellness',
        current: 'Biohacking',
      }}
      articles={articles}
      categorySlug="wellness/biohacking"
    />
  );
}
