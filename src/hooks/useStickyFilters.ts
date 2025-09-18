import { useEffect, useRef, useState } from "react";

interface UseStickyFiltersReturn {
  isSticky: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  sentinelRef: React.RefObject<HTMLDivElement>;
}

export const useStickyFilters = (): UseStickyFiltersReturn => {
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Create intersection observer to detect when the sentinel leaves the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel is not intersecting, the filters should be sticky
        setIsSticky(!entry.isIntersecting);
      },
      {
        // Use the navbar height + spacing as the root margin to trigger when the sentinel
        // would be covered by the sticky navbar (64px navbar + 16px spacing = 80px)
        rootMargin: "-80px 0px 0px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    isSticky,
    containerRef,
    sentinelRef,
  };
};