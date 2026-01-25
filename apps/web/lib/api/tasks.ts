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

// ============================================================================
// SWR Hooks
// ============================================================================

/**
 * SWR hook for fetching tasks by project ID with pagination
 * @param projectId - Project ID (null to skip fetching)
 * @param params - Pagination params
 */
export function useTasks(projectId: string | null, params: PaginationParams = {}) {
  const query = new URLSearchParams();
  appendPaginationParams(query, params);

  const url = projectId
    ? `/api/projects/${projectId}/tasks${buildQueryString(query)}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedData<Task>>(url);

  return {
    tasks: data?.list,
    pagination: extractPagination(data),
    isLoading,
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
