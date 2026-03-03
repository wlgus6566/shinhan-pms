import useSWR from 'swr';
import { fetcher } from './fetcher';
import type { UnitPriceResponse, SaveUnitPricesRequest, UnitPriceHistoryRow } from '@repo/schema';

/**
 * SWR hook for fetching project unit prices by yearMonth
 */
export function useProjectUnitPrices(
  projectId: string | null,
  yearMonth: string | null,
) {
  const url =
    projectId && yearMonth
      ? `/api/projects/${projectId}/unit-prices?yearMonth=${yearMonth}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<UnitPriceResponse[]>(url);

  return {
    unitPrices: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching unit price history (last 6 months)
 */
export function useUnitPriceHistory(projectId: string | null) {
  const url = projectId
    ? `/api/projects/${projectId}/unit-prices/history`
    : null;

  const { data, error, isLoading, mutate } = useSWR<UnitPriceHistoryRow[]>(url);

  return {
    history: data,
    isLoading,
    error,
    mutate: mutate,
  };
}

/**
 * Save (upsert) unit prices for a project
 */
export async function saveProjectUnitPrices(
  projectId: string,
  data: SaveUnitPricesRequest,
): Promise<UnitPriceResponse[]> {
  return fetcher<UnitPriceResponse[]>(
    `/api/projects/${projectId}/unit-prices`,
    {
      method: 'PUT',
      body: data,
    },
  );
}
