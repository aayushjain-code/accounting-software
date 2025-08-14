import { ComponentType, lazy } from 'react';

// Lazy load heavy components
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return lazy(importFunc);
};

// Preload components on hover/focus for better perceived performance
export const preloadComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return () => {
    importFunc();
  };
};

// Lazy load with custom chunk names for better caching
export const lazyLoadWithChunk = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  chunkName: string
) => {
  return lazy(() => {
    // Add webpack chunk name comment for better chunking
    return importFunc().then(module => {
      // @ts-ignore - webpack specific
      if (typeof window !== 'undefined') {
        // @ts-ignore - webpack specific
        window.__webpack_chunk_name__ = chunkName;
      }
      return module;
    });
  });
};

// Common lazy imports - using dynamic imports for code splitting
export const LazyInvoiceEditor = () => import('@/components/InvoiceEditor');
export const LazyInvoiceTemplate = () => import('@/components/InvoiceTemplate');
export const LazyExpensesTable = () => import('@/components/ExpensesTable');
export const LazyClientsTable = () => import('@/components/ClientsTable');
export const LazyProjectsTable = () => import('@/components/ProjectsTable');
export const LazyDailyLogsTable = () => import('@/components/DailyLogsTable');
export const LazyTimesheetsTable = () => import('@/components/TimesheetsTable');
export const LazyInvoicesTable = () => import('@/components/InvoicesTable');
