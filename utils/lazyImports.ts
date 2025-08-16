import { ComponentType, lazy } from "react";

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
      if (typeof window !== "undefined") {
        // @ts-ignore - webpack specific
        window.__webpack_chunk_name__ = chunkName;
      }
      return module;
    });
  });
};

// Lazy imports for components that are not immediately needed
export const LazyClientViewModal = () => import("@/components/ClientViewModal");
export const LazyProfileUpdateModal = () => import("@/components/ProfileUpdateModal");
export const LazyChangelogModal = () => import("@/components/ChangelogModal");
export const LazyUpdateNotification = () => import("@/components/UpdateNotification");
export const LazyUpdateNotificationWrapper = () => import("@/components/UpdateNotificationWrapper");
export const LazyPerformanceDashboard = () => import("@/components/PerformanceDashboard");
export const LazyPerformanceMonitor = () => import("@/components/PerformanceMonitor");
export const LazyStorageManager = () => import("@/components/StorageManager");
export const LazyTestInput = () => import("@/components/TestInput");
export const LazyTimesheetGenerator = () => import("@/components/TimesheetGenerator");
export const LazyTooltip = () => import("@/components/Tooltip");
export const LazyViewToggle = () => import("@/components/ViewToggle");
export const LazyPagination = () => import("@/components/Pagination");
export const LazyErrorBoundary = () => import("@/components/ErrorBoundary");
export const LazyDatabaseLoader = () => import("@/components/DatabaseLoader");
export const LazyLazyLoader = () => import("@/components/LazyLoader");
export const LazyFileList = () => import("@/components/FileList");
export const LazyFileUpload = () => import("@/components/FileUpload");
export const LazyInvoiceEditor = () => import("@/components/InvoiceEditor");
export const LazyInvoiceTemplate = () => import("@/components/InvoiceTemplate");
export const LazyConfirmationDialog = () => import("@/components/ConfirmationDialog");
export const LazyModal = () => import("@/components/Modal");
export const LazyButton = () => import("@/components/Button");
export const LazyCard = () => import("@/components/Card");
export const LazyAuthOverlay = () => import("@/components/AuthOverlay");
export const LazyLogoutButton = () => import("@/components/LogoutButton");
export const LazyLayout = () => import("@/components/Layout");
export const LazyClientsTable = () => import("@/components/ClientsTable");
export const LazyProjectsTable = () => import("@/components/ProjectsTable");
export const LazyExpensesTable = () => import("@/components/ExpensesTable");
export const LazyDailyLogsTable = () => import("@/components/DailyLogsTable");
