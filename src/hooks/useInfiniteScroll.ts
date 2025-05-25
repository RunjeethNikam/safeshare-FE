// src/hooks/useInfiniteScroll.ts
import { useRef, useCallback } from 'react';

export const useInfiniteScroll = (
  loadMore: () => void,
  loading: boolean
) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastMediaRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadMore, loading]
  );

  return { observer: lastMediaRef };
};