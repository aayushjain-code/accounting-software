import { useState, useEffect, useRef, useCallback } from "react";
import { lazyLoading } from "@/utils/performance";

export interface LazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
  enabled?: boolean;
}

export interface UseLazyLoadingResult {
  isVisible: boolean;
  isLoaded: boolean;
  ref: React.RefObject<HTMLElement>;
  load: () => void;
  reset: () => void;
}

// Hook for lazy loading components
export function useLazyLoading(
  options: LazyLoadingOptions = {}
): UseLazyLoadingResult {
  const {
    threshold = 0.1,
    rootMargin = "50px",
    root = null,
    enabled = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const load = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const reset = useCallback(() => {
    setIsVisible(false);
    setIsLoaded(false);
  }, []);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = lazyLoading.createObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (!isLoaded) {
              load();
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    if (observer && ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [enabled, threshold, rootMargin, root, isLoaded, load]);

  return {
    isVisible,
    isLoaded,
    ref,
    load,
    reset,
  };
}

// Hook for lazy loading images
export function useLazyImage(src: string, options: LazyLoadingOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLImageElement>(null);

  const loadImage = useCallback(() => {
    if (ref.current) {
      lazyLoading.lazyLoadImage(ref.current, src);
    }
  }, [src]);

  useEffect(() => {
    if (ref.current) {
      const img = ref.current;

      const handleLoad = () => {
        setIsLoaded(true);
        setError(null);
      };

      const handleError = () => {
        setError(new Error("Failed to load image"));
      };

      img.addEventListener("load", handleLoad);
      img.addEventListener("error", handleError);

      return () => {
        img.removeEventListener("load", handleLoad);
        img.removeEventListener("error", handleError);
      };
    }
  }, []);

  return {
    ref,
    isLoaded,
    error,
    loadImage,
  };
}

// Hook for lazy loading data
export function useLazyData<T>(
  fetcher: () => Promise<T>,
  options: LazyLoadingOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isTriggered, setIsTriggered] = useState(false);

  const lazyLoadingResult = useLazyLoading(options);

  const loadData = useCallback(async () => {
    if (isTriggered) return;

    setLoading(true);
    setError(null);
    setIsTriggered(true);

    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [fetcher, isTriggered]);

  // Auto-load when visible
  useEffect(() => {
    if (lazyLoadingResult.isVisible && !isTriggered) {
      loadData();
    }
  }, [lazyLoadingResult.isVisible, isTriggered, loadData]);

  return {
    ...lazyLoadingResult,
    data,
    loading,
    error,
    loadData,
  };
}

// Hook for infinite scroll with lazy loading
export function useInfiniteLazyScroll<T>(
  fetcher: (page: number) => Promise<T[]>,
  options: LazyLoadingOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const lazyLoadingResult = useLazyLoading(options);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newData = await fetcher(page);

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...newData]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, loading, hasMore]);

  // Auto-load more when visible
  useEffect(() => {
    if (lazyLoadingResult.isVisible && hasMore && !loading) {
      loadMore();
    }
  }, [lazyLoadingResult.isVisible, hasMore, loading, loadMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    lazyLoadingResult.reset();
  }, [lazyLoadingResult]);

  return {
    ...lazyLoadingResult,
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
}

// Hook for virtual scrolling with lazy loading
export function useVirtualLazyScroll<T>(
  items: T[],
  itemHeight: number = 50,
  containerHeight: number = 400,
  options: LazyLoadingOptions = {}
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateVisibleRange = useCallback(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    setVisibleRange({
      start: Math.max(0, startIndex),
      end: endIndex,
    });
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  useEffect(() => {
    calculateVisibleRange();
  }, [calculateVisibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    scrollTop,
    visibleRange,
    handleScroll,
  };
}
