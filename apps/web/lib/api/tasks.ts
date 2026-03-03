import useSWR from 'swr';
import { fetcher } from './fetcher';
import type { PaginatedData } from '@repo/schema';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task';
import {
  extractPagination,
  appendPaginationParams,
  buildQueryString,
  type PaginationParams,
} from './pagination';

// ============================================================================
// Mutation Functions (POST/PATCH/DELETE)
// ============================================================================

export async function createTask(projectId: string, data: CreateTaskRequest): Promise<Task> {
  return fetcher<Task>(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    body: data,
  });
}

export async function updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
  return fetcher<Task>(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: data,
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  return fetcher<void>(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

/**
 * WBS 공정표 엑셀 다운로드
 */
export async function exportWbsExcel(
  projectId: string,
  startDate: string,
  endDate: string,
): Promise<void> {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  const url = `/proxy-api/projects/${projectId}/tasks/export-wbs?${params.toString()}`;
  const token = localStorage.getItem('accessToken');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('다운로드에 실패했습니다');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  const filename = `WBS_공정표_${startDate}_${endDate}.xlsx`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

// ============================================================================
// SWR Hooks
// ============================================================================

/**
 * SWR hook for fetching tasks by project ID with pagination and filters
 * @param projectId - Project ID (null to skip fetching)
 * @param params - Pagination and filter params
 */
export function useTasks(
  projectId: string | null,
  params: PaginationParams & {
    search?: string;
    status?: string[];
    difficulty?: string[];
  } = {}
) {
  const query = new URLSearchParams();
  appendPaginationParams(query, params);

  // Add search parameter
  if (params.search) {
    query.append('search', params.search);
  }

  // Add status parameters (multiple values)
  if (params.status && params.status.length > 0) {
    params.status.forEach((s) => query.append('status', s));
  }

  // Add difficulty parameters (multiple values)
  if (params.difficulty && params.difficulty.length > 0) {
    params.difficulty.forEach((d) => query.append('difficulty', d));
  }

  const url = projectId
    ? `/api/projects/${projectId}/tasks${buildQueryString(query)}`
    : null;

  const { data, error, isLoading, mutate, isValidating } = useSWR<PaginatedData<Task>>(url);

  return {
    tasks: data?.list,
    pagination: extractPagination(data),
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching all tasks for WBS chart (no pagination limit)
 * @param projectId - Project ID (null to skip fetching)
 */
export function useWbsTasks(projectId: string | null) {
  const query = new URLSearchParams();
  query.append('pageSize', '9999');

  const url = projectId
    ? `/api/projects/${projectId}/tasks${buildQueryString(query)}`
    : null;

  const { data, error, isLoading, mutate, isValidating } = useSWR<PaginatedData<Task>>(url);

  return {
    tasks: data?.list,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching a single task by ID
 * @param taskId - Task ID (null to skip fetching)
 */
export function useTask(taskId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Task>(
    taskId ? `/api/tasks/${taskId}` : null
  );

  return {
    task: data,
    isLoading,
    error,
    mutate,
  };
}
