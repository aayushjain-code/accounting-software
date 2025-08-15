import { useState, useMemo, useCallback } from "react";
import { debounce } from "@/utils/helpers";

export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  debounceMs: number = 300
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounced search term update
  const debouncedSetSearchTerm = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, debounceMs),
    [debounceMs]
  );

  // Update search term and trigger debounced update
  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term);
      debouncedSetSearchTerm(term);
    },
    [debouncedSetSearchTerm]
  );

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm) return items;

    const searchLower = debouncedSearchTerm.toLowerCase();
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [items, debouncedSearchTerm, searchFields]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    filteredItems,
    handleSearchChange,
    clearSearch,
    isSearching: searchTerm !== debouncedSearchTerm,
  };
}
