import useSWR from 'swr';
import type { WorkLog, MyTask } from '@/types/work-log';

/**
 * 내 업무일지 목록 조회 hook
 */
export function useMyWorkLogs(startDate: string, endDate: string) {
  const url = startDate && endDate
    ? `/api/work-logs/my?startDate=${startDate}&endDate=${endDate}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<WorkLog[]>(url);

  return {
    workLogs: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 내가 담당하는 업무 목록 조회 hook
 */
export function useMyTasks() {
  const { data, error, isLoading, mutate } = useSWR<MyTask[]>('/api/work-logs/my-tasks');

  return {
    tasks: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 업무별 일지 목록 조회 hook
 */
export function useTaskWorkLogs(
  taskId: string | null,
  startDate?: string,
  endDate?: string
) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString();

  const url = taskId
    ? `/api/tasks/${taskId}/work-logs${query ? `?${query}` : ''}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<WorkLog[]>(url);

  return {
    workLogs: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 프로젝트 팀 일지 조회 hook
 */
export function useProjectWorkLogs(
  projectId: string | null,
  startDate?: string,
  endDate?: string
) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString();

  const url = projectId
    ? `/api/projects/${projectId}/work-logs${query ? `?${query}` : ''}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<WorkLog[]>(url);

  return {
    workLogs: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 단일 업무일지 조회 hook
 */
export function useWorkLog(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<WorkLog>(
    id ? `/api/work-logs/${id}` : null
  );

  return {
    workLog: data,
    isLoading,
    error,
    mutate,
  };
}
