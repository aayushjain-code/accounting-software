import { useState, useMemo, useCallback } from "react";
import { paginate } from "@/utils/helpers";
import { pagination as paginationUtils } from "@/utils/performance";

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  startIndex: number;
  endIndex: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  enableVirtualScroll?: boolean;
  enableInfiniteScroll?: boolean;
  containerHeight?: number;
  itemHeight?: number;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    enableVirtualScroll = false,
    enableInfiniteScroll = false,
    containerHeight = 400,
    itemHeight = 50,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [infiniteScrollPage, setInfiniteScrollPage] = useState(1);

  // Standard pagination
  const standardPagination = useMemo(() => {
    return paginate(items, currentPage, pageSize);
  }, [items, currentPage, pageSize]);

  // Virtual scroll pagination
  const virtualScrollPagination = useMemo(() => {
    if (!enableVirtualScroll) return null;
    return paginationUtils.virtualScroll(
      items,
      pageSize,
      currentPage,
      containerHeight,
      itemHeight
    );
  }, [
    items,
    pageSize,
    currentPage,
    containerHeight,
    itemHeight,
    enableVirtualScroll,
  ]);

  // Infinite scroll pagination
  const infiniteScrollPagination = useMemo(() => {
    if (!enableInfiniteScroll) return null;
    return paginationUtils.infiniteScroll(items, pageSize, infiniteScrollPage);
  }, [items, pageSize, infiniteScrollPage, enableInfiniteScroll]);

  // Get current pagination state
  const paginationState = useMemo((): PaginationState => {
    if (enableVirtualScroll && virtualScrollPagination) {
      return {
        currentPage,
        pageSize,
        totalItems: items.length,
        totalPages: Math.ceil(items.length / pageSize),
        hasNext: virtualScrollPagination.hasMore,
        hasPrev: currentPage > 1,
        startIndex: virtualScrollPagination.startIndex,
        endIndex: virtualScrollPagination.endIndex,
      };
    }

    if (enableInfiniteScroll && infiniteScrollPagination) {
      return {
        currentPage: infiniteScrollPage,
        pageSize,
        totalItems: items.length,
        totalPages: Math.ceil(items.length / pageSize),
        hasNext: infiniteScrollPagination.hasMore,
        hasPrev: infiniteScrollPage > 1,
        startIndex: 0,
        endIndex: infiniteScrollPagination.items.length,
      };
    }

    return {
      currentPage,
      pageSize,
      totalItems: items.length,
      totalPages: standardPagination.totalPages,
      hasNext: standardPagination.hasNext,
      hasPrev: standardPagination.hasPrev,
      startIndex: (currentPage - 1) * pageSize,
      endIndex: Math.min(currentPage * pageSize, items.length),
    };
  }, [
    currentPage,
    pageSize,
    items.length,
    standardPagination,
    virtualScrollPagination,
    infiniteScrollPagination,
    enableVirtualScroll,
    enableInfiniteScroll,
    infiniteScrollPage,
  ]);

  // Get current items
  const currentItems = useMemo(() => {
    if (enableVirtualScroll && virtualScrollPagination) {
      return virtualScrollPagination.items;
    }

    if (enableInfiniteScroll && infiniteScrollPagination) {
      return infiniteScrollPagination.items;
    }

    return standardPagination.items;
  }, [
    standardPagination.items,
    virtualScrollPagination?.items,
    infiniteScrollPagination?.items,
    enableVirtualScroll,
    enableInfiniteScroll,
  ]);

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, paginationState.totalPages)));
    },
    [paginationState.totalPages]
  );

  const goToNextPage = useCallback(() => {
    if (paginationState.hasNext) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, paginationState.hasNext]);

  const goToPrevPage = useCallback(() => {
    if (paginationState.hasPrev) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, paginationState.hasPrev]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(paginationState.totalPages);
  }, [paginationState.totalPages]);

  // Page size functions
  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Infinite scroll functions
  const loadMore = useCallback(() => {
    if (enableInfiniteScroll && infiniteScrollPagination?.loadMore) {
      setInfiniteScrollPage((prev) => prev + 1);
    }
  }, [enableInfiniteScroll, infiniteScrollPagination?.loadMore]);

  const resetInfiniteScroll = useCallback(() => {
    setInfiniteScrollPage(1);
  }, []);

  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setInfiniteScrollPage(1);
  }, [initialPage, initialPageSize]);

  return {
    // State
    currentItems,
    paginationState,

    // Navigation
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,

    // Page size
    changePageSize,

    // Infinite scroll
    loadMore,
    resetInfiniteScroll,

    // Reset
    reset,

    // Virtual scroll data
    virtualScrollData: virtualScrollPagination,
    infiniteScrollData: infiniteScrollPagination,
  };
}
