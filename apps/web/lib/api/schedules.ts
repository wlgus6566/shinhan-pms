import { fetcher } from './fetcher';
import type {
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '@/types/schedule';

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
 * 프로젝트 일정 목록 조회
 */
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

/**
 * 내 일정 목록 조회
 */
export async function getMySchedules(
  startDate?: string,
  endDate?: string
): Promise<Schedule[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString();
  return fetcher<Schedule[]>(
    `/api/schedules/my${query ? `?${query}` : ''}`
  );
}

/**
 * 일정 상세 조회
 */
export async function getSchedule(id: string): Promise<Schedule> {
  return fetcher<Schedule>(`/api/schedules/${id}`);
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
