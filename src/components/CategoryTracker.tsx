'use client';

import { useEffect } from 'react';
import { trackCategoryView } from '@/lib/analytics';

interface CategoryTrackerProps {
  categoryName: string;
}

export default function CategoryTracker({ categoryName }: CategoryTrackerProps) {
  useEffect(() => {
    trackCategoryView(categoryName);
  }, [categoryName]);

  return null; // Invisible component, only tracks
}
