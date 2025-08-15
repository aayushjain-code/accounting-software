import { useEffect, useRef, useCallback } from "react";
import { performanceMonitor } from "@/utils/performance";

interface UsePerformanceOptions {
  componentName: string;
  threshold?: number;
  enabled?: boolean;
}

export function usePerformance({
  componentName,
  threshold = 16, // 60fps threshold
  enabled = true,
}: UsePerformanceOptions) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  const startRender = useCallback(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
    renderCount.current++;
  }, [enabled]);

  const endRender = useCallback(() => {
    if (!enabled || renderStartTime.current === 0) return;

    const renderTime = performance.now() - renderStartTime.current;

    // Track render performance
    performanceMonitor.trackRender(componentName, renderTime);

    // Warn if render is slow
    if (renderTime > threshold) {
      console.warn(
        `🚨 Slow render detected in ${componentName}: ${renderTime.toFixed(
          2
        )}ms (threshold: ${threshold}ms)`
      );
    }

    renderStartTime.current = 0;
  }, [componentName, threshold, enabled]);

  const trackInteraction = useCallback(
    (interactionName: string, duration: number) => {
      if (!enabled) return;
      performanceMonitor.trackInteraction(
        componentName,
        interactionName,
        duration
      );
    },
    [componentName, enabled]
  );

  const trackDataLoad = useCallback(
    (loadTime: number) => {
      if (!enabled) return;
      performanceMonitor.trackDataLoad(componentName, loadTime);
    },
    [componentName, enabled]
  );

  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });

  return {
    startRender,
    endRender,
    trackInteraction,
    trackDataLoad,
    renderCount: renderCount.current,
  };
}

// Hook for measuring specific operations
export function useMeasureOperation(operationName: string) {
  const startTime = useRef<number>(0);

  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = useCallback(() => {
    if (startTime.current === 0) return;

    const duration = performance.now() - startTime.current;
    performanceMonitor.trackOperation(operationName, duration);

    if (duration > 100) {
      // 100ms threshold
      console.warn(
        `🐌 Slow operation detected: ${operationName} took ${duration.toFixed(
          2
        )}ms`
      );
    }

    startTime.current = 0;
    return duration;
  }, [operationName]);

  return { start, end };
}

// Hook for measuring data processing
export function useMeasureDataProcessing<T>(
  data: T[],
  processor: (data: T[]) => any,
  processorName: string
) {
  const processedData = useRef<any>(null);
  const processingTime = useRef<number>(0);

  useEffect(() => {
    if (data.length === 0) return;

    const startTime = performance.now();
    processedData.current = processor(data);
    processingTime.current = performance.now() - startTime;

    // Track processing performance
    performanceMonitor.trackDataProcessing(
      processorName,
      processingTime.current
    );

    // Warn if processing is slow
    if (processingTime.current > 50) {
      // 50ms threshold
      console.warn(
        `🐌 Slow data processing detected: ${processorName} took ${processingTime.current.toFixed(
          2
        )}ms for ${data.length} items`
      );
    }
  }, [data, processor, processorName]);

  return {
    processedData: processedData.current,
    processingTime: processingTime.current,
  };
}
