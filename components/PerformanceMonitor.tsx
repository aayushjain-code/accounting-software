"use client";

import React, { useState, useEffect } from "react";
import { performanceMonitor, cache } from "@/utils/performance";
import {
  ChartBarIcon,
  ClockIcon,
  CpuChipIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface PerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className = "",
  showDetails = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState(performanceMonitor.getReport());
  const [cacheStats, setCacheStats] = useState(cache.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(performanceMonitor.getReport());
      setCacheStats(cache.getStats());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleVisibility = () => setIsVisible(!isVisible);

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-50"
        title="Performance Monitor"
      >
        <ChartBarIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-80 max-h-96 overflow-y-auto z-50 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Performance Monitor
        </h3>
        <button
          onClick={toggleVisibility}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Render Performance */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Render Performance
            </span>
            <ClockIcon className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {stats.avgRenderTime}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stats.totalRenders} renders tracked
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Memory Usage
            </span>
            <CpuChipIcon className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.avgMemoryUsage}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Average usage
          </div>
        </div>

        {/* Cache Performance */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cache Hit Rate
            </span>
            <ArrowPathIcon className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.cacheHitRate}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stats.cacheHits} hits, {stats.cacheMisses} misses
          </div>
        </div>

        {showDetails && (
          <>
            {/* Cache Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cache Size
                </span>
                <TrashIcon className="h-4 w-4 text-gray-500" />
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {cacheStats.size} items
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {cacheStats.keys.length > 0
                  ? `${cacheStats.keys.slice(0, 3).join(", ")  }...`
                  : "No cached items"}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  cache.clear();
                  setCacheStats(cache.getStats());
                }}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Clear Cache
              </button>
              <button
                onClick={() => {
                  performanceMonitor.reset();
                  setStats(performanceMonitor.getReport());
                }}
                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Reset Stats
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Enable in development mode
    if (process.env.NODE_ENV === "development") {
      setIsEnabled(true);
    }
  }, []);

  return {
    isEnabled,
    toggle: () => setIsEnabled(!isEnabled),
  };
};
