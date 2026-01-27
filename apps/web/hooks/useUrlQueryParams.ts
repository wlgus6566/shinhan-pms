'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type QueryParamValue = string | number | boolean | string[] | null | undefined;
export type QueryParams = Record<string, QueryParamValue>;

interface UseUrlQueryParamsOptions {
  /**
   * Default values for query parameters
   * Parameters with default values won't be added to URL when they match the default
   */
  defaults?: QueryParams;

  /**
   * Whether to replace history instead of pushing new entries
   * @default true
   */
  replace?: boolean;
}

/**
 * Custom hook for managing URL query parameters with type safety
 *
 * @example
 * ```tsx
 * const { params, setParam, setParams } = useUrlQueryParams({
 *   defaults: { status: 'ALL', pageNum: 1 }
 * });
 *
 * // Read params
 * const currentStatus = params.status; // 'ALL' if not in URL
 * const currentPage = params.pageNum; // 1 if not in URL
 *
 * // Update single param
 * setParam('status', 'IN_PROGRESS');
 *
 * // Update multiple params
 * setParams({ status: 'COMPLETED', pageNum: 2 });
 * ```
 */
export function useUrlQueryParams(options: UseUrlQueryParamsOptions = {}) {
  const { defaults = {}, replace = true } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Parse URL params and merge with defaults
   */
  const params = useMemo(() => {
    const result: QueryParams = { ...defaults };

    // Group values by key to handle arrays
    const paramMap = new Map<string, string[]>();
    searchParams.forEach((value, key) => {
      if (!paramMap.has(key)) {
        paramMap.set(key, []);
      }
      paramMap.get(key)!.push(value);
    });

    // Process each param
    paramMap.forEach((values, key) => {
      if (values.length === 1) {
        // Single value
        const value = values[0];
        if (!isNaN(Number(value)) && value !== '') {
          result[key] = Number(value);
        } else {
          result[key] = value;
        }
      } else {
        // Multiple values (array)
        result[key] = values;
      }
    });

    return result;
  }, [searchParams, defaults]);

  /**
   * Update URL with new query parameters
   */
  const updateUrl = useCallback(
    (newParams: QueryParams) => {
      const urlParams = new URLSearchParams();

      Object.entries(newParams).forEach(([key, value]) => {
        // Skip null/undefined values
        if (value === null || value === undefined) {
          return;
        }

        // Handle arrays
        if (Array.isArray(value)) {
          // Skip empty arrays
          if (value.length === 0) {
            return;
          }
          // Add each value separately for array params
          value.forEach((v) => urlParams.append(key, String(v)));
          return;
        }

        // Skip default values to keep URL clean
        if (defaults[key] !== undefined && defaults[key] === value) {
          return;
        }

        urlParams.set(key, String(value));
      });

      const queryString = urlParams.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      if (replace) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }
    },
    [pathname, router, replace, defaults]
  );

  /**
   * Set a single query parameter
   */
  const setParam = useCallback(
    (key: string, value: QueryParamValue) => {
      const newParams = { ...params, [key]: value };
      updateUrl(newParams);
    },
    [params, updateUrl]
  );

  /**
   * Set multiple query parameters at once
   */
  const setParams = useCallback(
    (newParams: QueryParams) => {
      const mergedParams = { ...params, ...newParams };
      updateUrl(mergedParams);
    },
    [params, updateUrl]
  );

  /**
   * Clear all query parameters (reset to defaults)
   */
  const clearParams = useCallback(() => {
    updateUrl(defaults);
  }, [defaults, updateUrl]);

  /**
   * Remove specific query parameters
   */
  const removeParams = useCallback(
    (...keys: string[]) => {
      const newParams = { ...params };
      keys.forEach((key) => {
        delete newParams[key];
      });
      updateUrl(newParams);
    },
    [params, updateUrl]
  );

  return {
    params,
    setParam,
    setParams,
    clearParams,
    removeParams,
  };
}
