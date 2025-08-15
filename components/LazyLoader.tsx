"use client";

import React, { Suspense, ComponentType, ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

interface LazyLoaderProps {
  component: ComponentType<any>;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  props?: any;
}

export function LazyLoader({
  component: Component,
  fallback = <DefaultFallback />,
  errorFallback = <DefaultErrorFallback />,
  props = {},
}: LazyLoaderProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

function DefaultFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
    </div>
  );
}

function DefaultErrorFallback() {
  return (
    <div className="flex items-center justify-center p-8 text-red-600">
      <div className="text-center">
        <div className="text-xl font-semibold mb-2">Something went wrong</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Failed to load component. Please refresh the page.
        </div>
      </div>
    </div>
  );
}
