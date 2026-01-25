import useSWR from 'swr';
import { fetcher } from './fetcher';
import type { PaginatedData } from '@repo/schema';
import type {
  WorkLog,
  CreateWorkLogRequest,
  UpdateWorkLogRequest,
  MyTask,
} from '@/types/work-log';
import {
  extractPagination,
  appendPaginationParams,
  buildQueryString,
  type PaginationParams,
} from './pagination';

// ============================================================================
// Legacy GET Functions (for components not yet migrated to SWR)
// TODO: Remove these after migrating all components to use SWR hooks
// ============================================================================

export async function getProjectWorkLogs(
  projectId: string,
  startDate?: string,
  endDate?: string,
): Promise<WorkLog[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString();
  return fetcher<WorkLog[]>(
    `/api/projects/${projectId}/work-logs${query ? `?${query}` : ''}`,
  );
}

// ============================================================================
// Mutation Functions (POST/PATCH/DELETE)
// ============================================================================

/**
 * 업무일지 작성
 */
export async function createWorkLog(
  taskId: string,
  data: CreateWorkLogRequest,
): Promise<WorkLog> {
  return fetcher<WorkLog>(`/api/tasks/${taskId}/work-logs`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 업무일지 수정
 */
export async function updateWorkLog(
  id: string,
  data: UpdateWorkLogRequest,
): Promise<WorkLog> {
  return fetcher<WorkLog>(`/api/work-logs/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * 업무일지 삭제
 */
export async function deleteWorkLog(id: string): Promise<void> {
  return fetcher<void>(`/api/work-logs/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// SWR Hooks
// ============================================================================

/**
 * SWR hook for fetching my work logs with pagination
 * @param startDate - Start date (required)
 * @param endDate - End date (required)
 * @param params - Pagination params
 */
export function useMyWorkLogs(
  startDate: string,
  endDate: string,
  params: PaginationParams = {},
) {
  const query = new URLSearchParams();
  if (startDate) query.append('startDate', startDate);
  if (endDate) query.append('endDate', endDate);
  appendPaginationParams(query, params);

  const url = startDate && endDate ? `/api/work-logs/my${buildQueryString(query)}` : null;
  const { data, error, isLoading, mutate } = useSWR<PaginatedData<WorkLog>>(url);

  return {
    workLogs: data?.list,
    pagination: extractPagination(data),
    isLoading,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching my tasks
 */
export function useMyTasks() {
  const { data, error, isLoading, mutate } = useSWR<MyTask[]>(
    '/api/work-logs/my-tasks',
  );

  return {
    tasks: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching work logs by task ID with pagination
 * @param taskId - Task ID (null to skip fetching)
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @param params - Pagination params
 */
export function useTaskWorkLogs(
  taskId: string | null,
  startDate?: string,
  endDate?: string,
  params: PaginationParams = {},
) {
  let url: string | null = null;
  if (taskId) {
    const query = new URLSearchParams();
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    appendPaginationParams(query, params);
    url = `/api/tasks/${taskId}/work-logs${buildQueryString(query)}`;
  }

  const { data, error, isLoading, mutate } = useSWR<PaginatedData<WorkLog>>(url);

  return {
    workLogs: data?.list,
    pagination: extractPagination(data),
    isLoading,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching project work logs
 * @param projectId - Project ID (null to skip fetching)
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 */
export function useProjectWorkLogs(
  projectId: string | null,
  startDate?: string,
  endDate?: string,
) {
  let url: string | null = null;
  if (projectId) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    url = `/api/projects/${projectId}/work-logs${query ? `?${query}` : ''}`;
  }

  const { data, error, isLoading, mutate } = useSWR<WorkLog[]>(url);

  return {
    workLogs: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching a single work log by ID
 * @param id - Work log ID (null to skip fetching)
 */
export function useWorkLog(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<WorkLog>(
    id ? `/api/work-logs/${id}` : null,
  );

  return {
    workLog: data,
    isLoading,
    error,
    mutate,
  };
}
