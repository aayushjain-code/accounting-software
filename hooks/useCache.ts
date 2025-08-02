import { useState, useEffect, useCallback, useMemo } from "react";
import { cache, performanceMonitor } from "@/utils/performance";

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
  enabled?: boolean; // Whether caching is enabled
}

export interface UseCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
  isCached: boolean;
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): UseCacheResult<T> {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Check cache first
  const checkCache = useCallback(() => {
    if (!enabled) return null;

    const cachedData = cache.get(key);
    if (cachedData) {
      performanceMonitor.recordCacheHit(true);
      setIsCached(true);
      return cachedData;
    }

    performanceMonitor.recordCacheHit(false);
    setIsCached(false);
    return null;
  }, [key, enabled]);

  // Fetch data and cache it
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);

      if (enabled) {
        cache.set(key, result, ttl);
        setIsCached(false); // Fresh data, not from cache
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [fetcher, key, ttl, enabled]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Clear cache function
  const clearCache = useCallback(() => {
    cache.memory.delete(key);
    setIsCached(false);
  }, [key]);

  // Initialize data
  useEffect(() => {
    const cachedData = checkCache();
    if (cachedData) {
      setData(cachedData);
    } else {
      fetchData();
    }
  }, [checkCache, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
    isCached,
  };
}

// Hook for caching expensive computations
export function useMemoizedCache<T>(
  key: string,
  computeFn: () => T,
  dependencies: any[],
  options: CacheOptions = {}
): T {
  const { ttl = 10 * 60 * 1000, enabled = true } = options;

  return useMemo(() => {
    if (!enabled) {
      return computeFn();
    }

    const cachedResult = cache.get(key);
    if (cachedResult) {
      performanceMonitor.recordCacheHit(true);
      return cachedResult;
    }

    performanceMonitor.recordCacheHit(false);
    const result = computeFn();
    cache.set(key, result, ttl);
    return result;
  }, dependencies);
}

// Hook for caching API responses
export function useApiCache<T>(
  url: string,
  options: CacheOptions = {}
): UseCacheResult<T> {
  const fetcher = useCallback(async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }, [url]);

  return useCache(url, fetcher, options);
}

// Hook for caching with automatic invalidation
export function useCacheWithInvalidation<T>(
  key: string,
  fetcher: () => Promise<T>,
  invalidateKeys: string[] = [],
  options: CacheOptions = {}
): UseCacheResult<T> {
  const cacheResult = useCache(key, fetcher, options);

  const invalidateCache = useCallback(() => {
    // Clear the main cache
    cache.memory.delete(key);

    // Clear related caches
    invalidateKeys.forEach((invalidateKey) => {
      cache.memory.delete(invalidateKey);
    });

    cacheResult.clearCache();
  }, [key, invalidateKeys, cacheResult]);

  return {
    ...cacheResult,
    clearCache: invalidateCache,
  };
}

// Hook for optimistic caching
export function useOptimisticCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): UseCacheResult<T> & {
  setOptimisticData: (data: T) => void;
  commitOptimisticData: () => void;
  rollbackOptimisticData: () => void;
} {
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [originalData, setOriginalData] = useState<T | null>(null);

  const cacheResult = useCache(key, fetcher, options);

  const setOptimistic = useCallback(
    (data: T) => {
      setOriginalData(cacheResult.data);
      setOptimisticData(data);
    },
    [cacheResult.data]
  );

  const commitOptimistic = useCallback(() => {
    if (optimisticData) {
      cache.set(key, optimisticData, options.ttl);
      setOptimisticData(null);
      setOriginalData(null);
    }
  }, [optimisticData, key, options.ttl]);

  const rollbackOptimistic = useCallback(() => {
    if (originalData) {
      setOptimisticData(null);
      setOriginalData(null);
    }
  }, [originalData]);

  return {
    ...cacheResult,
    setOptimisticData: setOptimistic,
    commitOptimisticData: commitOptimistic,
    rollbackOptimisticData: rollbackOptimistic,
  };
}

// Hook for cache statistics
export function useCacheStats() {
  const [stats, setStats] = useState(cache.getStats());

  const refreshStats = useCallback(() => {
    setStats(cache.getStats());
  }, []);

  const clearAllCache = useCallback(() => {
    cache.clear();
    refreshStats();
  }, [refreshStats]);

  const clearExpiredCache = useCallback(() => {
    cache.clearExpired();
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    refreshStats,
    clearAllCache,
    clearExpiredCache,
    performanceReport: performanceMonitor.getReport(),
  };
}
