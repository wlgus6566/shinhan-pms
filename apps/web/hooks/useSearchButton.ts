'use client';

import { useEffect, useState, useCallback } from 'react';

export interface UseSearchButtonOptions {
  paramKey?: string; // Default: 'search'
  resetPageNum?: boolean; // Default: true
}

export interface UseSearchButtonReturn {
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearch: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Reusable hook for search button logic
 * - Manages local searchInput state (prevents API calls on every keystroke)
 * - Syncs with URL parameter via useEffect
 * - Provides handleSearch callback for button clicks
 * - Provides handleKeyDown for Enter key support
 * - Automatically resets to page 1 when searching
 */
export function useSearchButton(
  urlParams: Record<string, any>,
  setParams: (params: Record<string, any>) => void,
  options: UseSearchButtonOptions = {}
): UseSearchButtonReturn {
  const { paramKey = 'search', resetPageNum = true } = options;

  // Get search value from URL params
  const searchFromUrl = (urlParams[paramKey] as string) || '';

  // Local state for search input (doesn't trigger API calls)
  const [searchInput, setSearchInput] = useState(searchFromUrl);

  // Sync with URL when it changes (browser back/forward)
  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  // Handle search button click
  const handleSearch = useCallback(() => {
    const newParams: Record<string, any> = {
      [paramKey]: searchInput || undefined, // Remove param if empty
    };

    // Reset to page 1 when searching
    if (resetPageNum) {
      newParams.pageNum = 1;
    }

    setParams(newParams);
  }, [searchInput, paramKey, resetPageNum, setParams]);

  // Handle Enter key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return {
    searchInput,
    setSearchInput,
    handleSearch,
    handleKeyDown,
  };
}
