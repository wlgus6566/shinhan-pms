import useSWR from 'swr';
import { fetcher } from './fetcher';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task';

export async function createTask(projectId: string, data: CreateTaskRequest): Promise<Task> {
  return fetcher<Task>(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    body: data,
  });
}

export async function getTasks(projectId: string): Promise<Task[]> {
  return fetcher<Task[]>(`/api/projects/${projectId}/tasks`);
}

export async function getTask(taskId: string): Promise<Task> {
  return fetcher<Task>(`/api/tasks/${taskId}`);
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
 * SWR hook for fetching tasks by project ID
 * @param projectId - Project ID (null to skip fetching)
 */
export function useTasks(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Task[]>(
    projectId ? `/api/projects/${projectId}/tasks` : null
  );

  return {
    tasks: data,
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
