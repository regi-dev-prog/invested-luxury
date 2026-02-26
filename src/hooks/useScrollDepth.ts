'use client';

import { useEffect, useRef, useCallback } from 'react';
import { trackArticleScroll } from '@/lib/analytics';

interface UseScrollDepthOptions {
  articleTitle: string;
  articleSlug: string;
  category?: string;
}

export function useScrollDepth({ articleTitle, articleSlug, category }: UseScrollDepthOptions) {
  const milestonesReached = useRef<Set<number>>(new Set());
  const startTime = useRef<number>(Date.now());

  const getScrollPercent = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return 100;
    return Math.round((scrollTop / docHeight) * 100);
  }, []);

  useEffect(() => {
    const milestones = [25, 50, 75, 100];

    const handleScroll = () => {
      const percent = getScrollPercent();
      const timeOnPage = Math.round((Date.now() - startTime.current) / 1000);

      for (const milestone of milestones) {
        if (percent >= milestone && !milestonesReached.current.has(milestone)) {
          milestonesReached.current.add(milestone);
          trackArticleScroll({
            articleTitle,
            articleSlug,
            category,
            scrollDepth: milestone,
            timeOnPage,
          });
        }
      }
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [articleTitle, articleSlug, category, getScrollPercent]);
}
