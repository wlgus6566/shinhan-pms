import useSWR from 'swr';
import { fetcher } from './fetcher';
import type {
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '@/types/schedule';

// ============================================================================
// Legacy GET Functions (for components not yet migrated to SWR)
// TODO: Remove these after migrating all components to use SWR hooks
// ============================================================================

export async function getProjectSchedules(
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<Schedule[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString();
  return fetcher<Schedule[]>(
    `/api/projects/${projectId}/schedules${query ? `?${query}` : ''}`
  );
}

// ============================================================================
// Mutation Functions (POST/PATCH/DELETE)
// ============================================================================

/**
 * 프로젝트 일정 생성
 */
export async function createProjectSchedule(
  projectId: string,
  data: CreateScheduleRequest
): Promise<Schedule> {
  return fetcher<Schedule>(`/api/projects/${projectId}/schedules`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 개인 일정 생성
 */
export async function createSchedule(
  data: CreateScheduleRequest
): Promise<Schedule> {
  return fetcher<Schedule>('/api/schedules', {
    method: 'POST',
    body: data,
  });
}

/**
 * 일정 수정
 */
export async function updateSchedule(
  id: string,
  data: UpdateScheduleRequest
): Promise<Schedule> {
  return fetcher<Schedule>(`/api/schedules/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * 일정 삭제
 */
export async function deleteSchedule(id: string): Promise<void> {
  return fetcher<void>(`/api/schedules/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 일정 참가 상태 업데이트
 */
export async function updateParticipationStatus(
  scheduleId: string,
  status: 'ACCEPTED' | 'DECLINED'
): Promise<void> {
  return fetcher<void>(`/api/schedules/${scheduleId}/participate`, {
    method: 'PATCH',
    body: { status },
  });
}

// ============================================================================
// SWR Hooks
// ============================================================================

/**
 * SWR hook for fetching project schedules
 * @param projectId - Project ID (null to skip fetching)
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 */
export function useProjectSchedules(
  projectId: string | null,
  startDate?: string,
  endDate?: string
) {
  let url: string | null = null;
  if (projectId) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    url = `/api/projects/${projectId}/schedules${query ? `?${query}` : ''}`;
  }

  const { data, error, isLoading, mutate } = useSWR<Schedule[]>(url);

  return {
    schedules: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching my schedules
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 */
export function useMySchedules(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString();
  const url = `/api/schedules/my${query ? `?${query}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<Schedule[]>(url);

  return {
    schedules: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching a single schedule by ID
 * @param id - Schedule ID (null to skip fetching)
 */
export function useSchedule(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Schedule>(
    id ? `/api/schedules/${id}` : null
  );

  return {
    schedule: data,
    isLoading,
    error,
    mutate,
  };
}
