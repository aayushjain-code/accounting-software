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
