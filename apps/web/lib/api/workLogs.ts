import useSWR from 'swr';
import { fetcher } from './fetcher';
import type { PaginatedData } from '@repo/schema';
import type {
  WorkLog,
  CreateWorkLogRequest,
  UpdateWorkLogRequest,
  MyTask,
} from '@/types/work-log';
import type { WeekInfo } from '@/lib/utils/week';
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

/**
 * 주간 업무일지 엑셀 다운로드
 */
export async function exportWeeklyReport(
  projectId: string,
  startDate: string,
  endDate: string,
  weekInfo: WeekInfo,
): Promise<void> {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  params.append('year', weekInfo.year.toString());
  params.append('month', weekInfo.month.toString());
  params.append('weekNumber', weekInfo.weekNumber.toString());

  const url = `/api/projects/${projectId}/work-logs/export?${params.toString()}`;
  const token = localStorage.getItem('accessToken');

  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('다운로드에 실패했습니다');
  }

  // Blob으로 변환
  const blob = await response.blob();

  console.log('Blob received:', blob.size, 'bytes, type:', blob.type);

  // 파일 다운로드 트리거
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  // 파일명: Weekly_Report_2026_01_Week2.xlsx
  const filename = `Weekly_Report_${weekInfo.year}_${String(weekInfo.month).padStart(2, '0')}_Week${weekInfo.weekNumber}.xlsx`;
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
 * SWR hook for fetching my work logs with pagination
 * @param startDate - Start date (required)
 * @param endDate - End date (required)
 * @param params - Pagination params (pageSize: 0 = fetch all)
 */
export function useMyWorkLogs(
  startDate: string,
  endDate: string,
  params: PaginationParams & { all?: boolean } = {},
) {
  const query = new URLSearchParams();
  if (startDate) query.append('startDate', startDate);
  if (endDate) query.append('endDate', endDate);

  // all: true이면 pageSize=0으로 전체 조회
  if (params.all) {
    query.append('pageSize', '0');
  } else {
    appendPaginationParams(query, params);
  }

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
