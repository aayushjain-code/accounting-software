import React from "react";

// Performance monitoring utilities
export const performance = {
  // Measure function execution time
  measure: (name: string, fn: () => any) => {
    const start = globalThis.performance?.now() || Date.now();
    const result = fn();
    const end = globalThis.performance?.now() || Date.now();
    console.log(`${name} took ${end - start}ms`);
    return result;
  },

  // Measure async function execution time
  measureAsync: async (name: string, fn: () => Promise<any>) => {
    const start = globalThis.performance?.now() || Date.now();
    const result = await fn();
    const end = globalThis.performance?.now() || Date.now();
    console.log(`${name} took ${end - start}ms`);
    return result;
  },

  // Create a performance marker
  mark: (name: string) => {
    if (typeof window !== "undefined" && window.performance) {
      window.performance.mark(name);
    }
  },

  // Measure between two marks
  measureBetween: (startMark: string, endMark: string, name: string) => {
    if (typeof window !== "undefined" && window.performance) {
      window.performance.mark(endMark);
      window.performance.measure(name, startMark, endMark);
      const measure = window.performance.getEntriesByName(name)[0];
      console.log(`${name} took ${measure.duration}ms`);
    }
  },

  // Debounce function with performance logging
  debounceWithLog: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    name: string
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const start = globalThis.performance?.now() || Date.now();
        func(...args);
        const end = globalThis.performance?.now() || Date.now();
        console.log(`${name} executed in ${end - start}ms`);
      }, wait);
    };
  },

  // Throttle function with performance logging
  throttleWithLog: <T extends (...args: any[]) => any>(
    func: T,
    limit: number,
    name: string
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        const start = globalThis.performance?.now() || Date.now();
        func(...args);
        const end = globalThis.performance?.now() || Date.now();
        console.log(`${name} executed in ${end - start}ms`);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// React performance utilities
export const reactPerformance = {
  // Log component render count
  logRender: (componentName: string) => {
    console.log(`${componentName} rendered`);
  },

  // Measure component render time
  measureRender: (componentName: string, renderFn: () => JSX.Element) => {
    const start = globalThis.performance?.now() || Date.now();
    const result = renderFn();
    const end = globalThis.performance?.now() || Date.now();
    console.log(`${componentName} render took ${end - start}ms`);
    return result;
  },

  // Create a render counter hook
  useRenderCount: (componentName: string) => {
    const renderCount = React.useRef(0);
    renderCount.current += 1;
    console.log(`${componentName} rendered ${renderCount.current} times`);
    return renderCount.current;
  },
};

// Memory usage utilities
export const memory = {
  // Log memory usage (if available)
  logUsage: () => {
    if (typeof window !== "undefined" && (window as any).performance?.memory) {
      const memory = (window as any).performance.memory;
      console.log("Memory Usage:", {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`,
      });
    }
  },

  // Check if memory usage is high
  isHighUsage: (threshold = 0.8) => {
    if (typeof window !== "undefined" && (window as any).performance?.memory) {
      const memory = (window as any).performance.memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit > threshold;
    }
    return false;
  },
};

// Bundle size utilities
export const bundle = {
  // Log bundle size (if available)
  logSize: () => {
    if (typeof window !== "undefined" && (window as any).__NEXT_DATA__) {
      console.log("Bundle loaded:", {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
    }
  },
};

// Advanced caching utilities
export const cache = {
  // Simple in-memory cache
  memory: new Map<string, { data: any; timestamp: number; ttl: number }>(),

  // Set cache item
  set: (key: string, data: any, ttl: number = 5 * 60 * 1000) => {
    cache.memory.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  },

  // Get cache item
  get: (key: string) => {
    const item = cache.memory.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      cache.memory.delete(key);
      return null;
    }

    return item.data;
  },

  // Clear expired cache items
  clearExpired: () => {
    const now = Date.now();
    Array.from(cache.memory.entries()).forEach(([key, item]) => {
      if (now - item.timestamp > item.ttl) {
        cache.memory.delete(key);
      }
    });
  },

  // Clear all cache
  clear: () => {
    cache.memory.clear();
  },

  // Get cache stats
  getStats: () => {
    return {
      size: cache.memory.size,
      keys: Array.from(cache.memory.keys()),
    };
  },
};

// Lazy loading utilities
export const lazyLoading = {
  // Intersection Observer for lazy loading
  createObserver: (
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ) => {
    if (typeof window === "undefined") return null;
    return new IntersectionObserver(callback, {
      root: null,
      rootMargin: "50px",
      threshold: 0.1,
      ...options,
    });
  },

  // Lazy load images
  lazyLoadImage: (imgElement: HTMLImageElement, src: string) => {
    const observer = lazyLoading.createObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = src;
          img.classList.remove("lazy");
          observer?.unobserve(img);
        }
      });
    });

    if (observer) {
      observer.observe(imgElement);
    }
  },

  // Lazy load components
  lazyLoadComponent: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ) => {
    return React.lazy(importFn);
  },
};

// Advanced pagination utilities
export const pagination = {
  // Virtual scrolling pagination
  virtualScroll: <T>(
    items: T[],
    pageSize: number,
    currentPage: number,
    containerHeight: number,
    itemHeight: number
  ) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, items.length);

    // Calculate visible items based on scroll position
    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;
    const scrollTop = (currentPage - 1) * pageSize * itemHeight;

    return {
      items: visibleItems,
      totalHeight,
      scrollTop,
      startIndex,
      endIndex,
      hasMore: endIndex < items.length,
    };
  },

  // Infinite scroll pagination
  infiniteScroll: <T>(
    items: T[],
    pageSize: number,
    currentPage: number,
    threshold: number = 0.8
  ) => {
    const startIndex = 0;
    const endIndex = currentPage * pageSize;
    const visibleItems = items.slice(startIndex, endIndex);

    return {
      items: visibleItems,
      hasMore: endIndex < items.length,
      loadMore: endIndex < items.length,
      threshold: endIndex / items.length >= threshold,
    };
  },

  // Cursor-based pagination
  cursorPagination: <T>(
    items: T[],
    cursor: string | null,
    pageSize: number,
    getCursor: (item: T) => string
  ) => {
    let startIndex = 0;

    if (cursor) {
      const cursorIndex = items.findIndex((item) => getCursor(item) === cursor);
      startIndex = cursorIndex + 1;
    }

    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);
    const nextCursor =
      paginatedItems.length > 0
        ? getCursor(paginatedItems[paginatedItems.length - 1])
        : null;

    return {
      items: paginatedItems,
      nextCursor,
      hasMore: endIndex < items.length,
    };
  },
};

// Data virtualization utilities
export const virtualization = {
  // Calculate visible range
  getVisibleRange: (
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    totalItems: number
  ) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      totalItems
    );

    return {
      startIndex: Math.max(0, startIndex),
      endIndex,
      visibleCount: endIndex - startIndex,
    };
  },

  // Calculate scroll position
  getScrollPosition: (
    index: number,
    itemHeight: number,
    containerHeight: number
  ) => {
    return index * itemHeight;
  },

  // Optimize rendering for large lists
  optimizeList: <T>(
    items: T[],
    renderItem: (item: T, index: number) => React.ReactNode,
    itemHeight: number = 50,
    containerHeight: number = 400
  ) => {
    const [scrollTop, setScrollTop] = React.useState(0);
    const { startIndex, endIndex } = virtualization.getVisibleRange(
      scrollTop,
      containerHeight,
      itemHeight,
      items.length
    );

    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;

    return {
      visibleItems,
      totalHeight,
      startIndex,
      endIndex,
      setScrollTop,
      renderItem: (item: T, index: number) =>
        renderItem(item, startIndex + index),
    };
  },
};

// Performance monitoring dashboard
export const performanceMonitor = {
  // Track performance metrics
  metrics: {
    renderTimes: {} as Record<string, number[]>,
    interactionTimes: {} as Record<string, number[]>,
    dataLoadTimes: {} as Record<string, number[]>,
    operationTimes: {} as Record<string, number[]>,
    dataProcessingTimes: {} as Record<string, number[]>,
    memoryUsage: [] as number[],
    cacheHits: 0,
    cacheMisses: 0,
  },

  // Record render time
  recordRenderTime: (componentName: string, renderTime: number) => {
    if (!performanceMonitor.metrics.renderTimes[componentName]) {
      performanceMonitor.metrics.renderTimes[componentName] = [];
    }
    performanceMonitor.metrics.renderTimes[componentName].push(renderTime);
    console.log(`${componentName} render time: ${renderTime}ms`);
  },

  // Track render performance
  trackRender: (componentName: string, renderTime: number) => {
    if (!performanceMonitor.metrics.renderTimes[componentName]) {
      performanceMonitor.metrics.renderTimes[componentName] = [];
    }
    performanceMonitor.metrics.renderTimes[componentName].push(renderTime);
  },

  // Track interaction performance
  trackInteraction: (componentName: string, interactionName: string, duration: number) => {
    const key = `${componentName}-${interactionName}`;
    if (!performanceMonitor.metrics.interactionTimes[key]) {
      performanceMonitor.metrics.interactionTimes[key] = [];
    }
    performanceMonitor.metrics.interactionTimes[key].push(duration);
  },

  // Track data load performance
  trackDataLoad: (componentName: string, dataSize: number, loadTime: number) => {
    const key = `${componentName}-dataLoad`;
    if (!performanceMonitor.metrics.dataLoadTimes[key]) {
      performanceMonitor.metrics.dataLoadTimes[key] = [];
    }
    performanceMonitor.metrics.dataLoadTimes[key].push(loadTime);
  },

  // Track operation performance
  trackOperation: (operationName: string, duration: number) => {
    if (!performanceMonitor.metrics.operationTimes[operationName]) {
      performanceMonitor.metrics.operationTimes[operationName] = [];
    }
    performanceMonitor.metrics.operationTimes[operationName].push(duration);
  },

  // Track data processing performance
  trackDataProcessing: (processorName: string, dataSize: number, processingTime: number) => {
    if (!performanceMonitor.metrics.dataProcessingTimes[processorName]) {
      performanceMonitor.metrics.dataProcessingTimes[processorName] = [];
    }
    performanceMonitor.metrics.dataProcessingTimes[processorName].push(processingTime);
  },

  // Get all metrics
  getMetrics: () => {
    return performanceMonitor.metrics;
  },

  // Record memory usage
  recordMemoryUsage: () => {
    if (typeof window !== "undefined" && (window as any).performance?.memory) {
      const memory = (window as any).performance.memory;
      const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      performanceMonitor.metrics.memoryUsage.push(usage);
    }
  },

  // Record cache hit/miss
  recordCacheHit: (hit: boolean) => {
    if (hit) {
      performanceMonitor.metrics.cacheHits++;
    } else {
      performanceMonitor.metrics.cacheMisses++;
    }
  },

  // Get performance report
  getReport: () => {
    const avgRenderTime =
      Object.values(performanceMonitor.metrics.renderTimes)
        .flat()
        .reduce((a, b) => a + b, 0) / 
        Math.max(Object.values(performanceMonitor.metrics.renderTimes).flat().length, 1);

    const avgMemoryUsage =
      performanceMonitor.metrics.memoryUsage.length > 0
        ? performanceMonitor.metrics.memoryUsage.reduce((a, b) => a + b, 0) /
          performanceMonitor.metrics.memoryUsage.length
        : 0;

    const cacheHitRate =
      performanceMonitor.metrics.cacheHits +
        performanceMonitor.metrics.cacheMisses >
      0
        ? (performanceMonitor.metrics.cacheHits /
            (performanceMonitor.metrics.cacheHits +
              performanceMonitor.metrics.cacheMisses)) *
          100
        : 0;

    return {
      avgRenderTime: `${avgRenderTime.toFixed(2)}ms`,
      avgMemoryUsage: `${(avgMemoryUsage * 100).toFixed(2)}%`,
      cacheHitRate: `${cacheHitRate.toFixed(2)}%`,
      totalRenders: Object.values(performanceMonitor.metrics.renderTimes).flat().length,
      cacheHits: performanceMonitor.metrics.cacheHits,
      cacheMisses: performanceMonitor.metrics.cacheMisses,
    };
  },

  // Reset metrics
  reset: () => {
    performanceMonitor.metrics = {
      renderTimes: {},
      interactionTimes: {},
      dataLoadTimes: {},
      operationTimes: {},
      dataProcessingTimes: {},
      memoryUsage: [],
      cacheHits: 0,
      cacheMisses: 0,
    };
  },
};
