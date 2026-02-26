'use client';

import { useScrollDepth } from '@/hooks/useScrollDepth';

interface ArticleTrackerProps {
  articleTitle: string;
  articleSlug: string;
  category?: string;
}

export default function ArticleTracker({ articleTitle, articleSlug, category }: ArticleTrackerProps) {
  useScrollDepth({ articleTitle, articleSlug, category });
  return null; // Invisible component, only tracks
}
