"use client";

import React, { useState, useEffect } from "react";
import { performanceMonitor } from "@/utils/performance";
import { Card } from "./Card";
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

interface PerformanceMetrics {
  renderTimes: Record<string, number[]>;
  interactionTimes: Record<string, number[]>;
  dataLoadTimes: Record<string, number[]>;
  operationTimes: Record<string, number[]>;
  dataProcessingTimes: Record<string, number[]>;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTimes: {},
    interactionTimes: {},
    dataLoadTimes: {},
    operationTimes: {},
    dataProcessingTimes: {},
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval((): void => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getAverageTime = (times: number[]): number => {
    if (times.length === 0) {
      return 0;
    }
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  };

  const getPerformanceStatus = (avgTime: number, threshold: number): string => {
    if (avgTime < threshold * 0.5) {
      return "excellent";
    }
    if (avgTime < threshold) {
      return "good";
    }
    if (avgTime < threshold * 1.5) {
      return "fair";
    }
    return "poor";
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-100";
      case "good":
        return "text-blue-600 bg-blue-100";
      case "fair":
        return "text-yellow-600 bg-yellow-100";
      case "poor":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case "excellent":
        return <CheckCircleIcon className="h-5 w-5" />;
      case "good":
        return <CheckCircleIcon className="h-5 w-5" />;
      case "fair":
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case "poor":
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <QuestionMarkCircleIcon className="h-5 w-5" />;
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-50"
        title="Performance Dashboard"
      >
        <ChartBarIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Performance Dashboard
            </h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Render Performance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Render Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(metrics.renderTimes).map(([component, times]) => {
                const avgTime = getAverageTime(times);
                const status = getPerformanceStatus(avgTime, 16);
                return (
                  <Card key={component} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {component}
                        </p>
                        <p className={`text-sm ${getStatusColor(status)}`}>
                          {avgTime.toFixed(2)}ms avg
                        </p>
                      </div>
                      {getStatusIcon(status)}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Interaction Performance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Interaction Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(metrics.interactionTimes).map(
                ([interaction, times]) => {
                  const avgTime = getAverageTime(times);
                  const status = getPerformanceStatus(avgTime, 100);
                  return (
                    <Card key={interaction} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {interaction}
                          </p>
                          <p className={`text-sm ${getStatusColor(status)}`}>
                            {avgTime.toFixed(2)}ms avg
                          </p>
                        </div>
                        {getStatusIcon(status)}
                      </div>
                    </Card>
                  );
                }
              )}
            </div>
          </div>

          {/* Data Processing Performance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Data Processing Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(metrics.dataProcessingTimes).map(
                ([processor, times]) => {
                  const avgTime = getAverageTime(times);
                  const status = getPerformanceStatus(avgTime, 50);
                  return (
                    <Card key={processor} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {processor}
                          </p>
                          <p className={`text-sm ${getStatusColor(status)}`}>
                            {avgTime.toFixed(2)}ms avg
                          </p>
                        </div>
                        {getStatusIcon(status)}
                      </div>
                    </Card>
                  );
                }
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Total Components
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Object.keys(metrics.renderTimes).length}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Avg Render Time
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {(() => {
                    const allTimes = Object.values(metrics.renderTimes).flat();
                    const total = allTimes.reduce((sum, time) => sum + time, 0);
                    const count = Math.max(allTimes.length, 1);
                    return (total / count).toFixed(2);
                  })()}
                  ms
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Slow Renders</p>
                <p className="font-semibold text-red-600">
                  {
                    Object.values(metrics.renderTimes)
                      .flat()
                      .filter(time => time > 16).length
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Performance Score
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.max(
                    0,
                    100 -
                      Math.floor(
                        Object.values(metrics.renderTimes)
                          .flat()
                          .filter(time => time > 16).length * 10
                      )
                  )}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
