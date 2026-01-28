import useSWR from 'swr';
import type {
  MyProductivityResponse,
  TeamProductivityResponse,
  WorkHoursTrendItem,
  WorkAreaDistributionResponse,
  MemberWorkloadItem,
  ProjectProgressItem,
  PartTaskCountResponse,
  PartWorkHoursResponse,
  ProductivityStats,
  TaskStatusCountResponse,
} from '@repo/schema';
import { buildQueryString } from './pagination';

interface AnalyticsParams {
  startDate: string;
  endDate: string;
  projectId?: string;
  userId?: string;
  groupBy?: 'day' | 'week' | 'month';
}

/**
 * 개인 생산성 조회 (월별)
 */
export function useMyProductivity(
  projectId: string | undefined,
  yearMonth: string,
) {
  let url = null;

  if (yearMonth && projectId) {
    // yearMonth를 startDate, endDate로 변환
    const [year, month] = yearMonth.split('-');
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    params.append('projectId', projectId);

    url = `/api/analytics/my-productivity${buildQueryString(params)}`;
  }

  const { data, error, isLoading, mutate } = useSWR<ProductivityStats>(url);

  return {
    productivity: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 팀 리포트 조회 (PM/SUPER_ADMIN)
 */
export function useTeamProductivity(
  startDate: string,
  endDate: string,
  projectId?: string,
) {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  if (projectId) params.append('projectId', projectId);

  const url =
    startDate && endDate
      ? `/api/analytics/team-productivity${buildQueryString(params)}`
      : null;

  const { data, error, isLoading, mutate } =
    useSWR<TeamProductivityResponse>(url);

  return {
    teamProductivity: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 작업 시간 트렌드
 */
export function useWorkHoursTrend(params: AnalyticsParams) {
  const query = new URLSearchParams();
  query.append('startDate', params.startDate);
  query.append('endDate', params.endDate);
  if (params.projectId) query.append('projectId', params.projectId);
  if (params.userId) query.append('userId', params.userId);
  if (params.groupBy) query.append('groupBy', params.groupBy);

  const url =
    params.startDate && params.endDate
      ? `/api/analytics/work-hours-trend${buildQueryString(query)}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<WorkHoursTrendItem[]>(url);

  return {
    trend: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * 분야별 작업 시간 분포 (월별)
 */
export function useWorkAreaDistribution(
  projectId: string | undefined,
  yearMonth: string,
) {
  let url = null;

  if (yearMonth && projectId) {
    // yearMonth를 startDate, endDate로 변환
    const [year, month] = yearMonth.split('-');
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    params.append('projectId', projectId);

    url = `/api/analytics/work-area-distribution${buildQueryString(params)}`;
  }

  const { data, error, isLoading, mutate } =
    useSWR<WorkAreaDistributionResponse>(url);

  return {
    distribution: data?.distribution || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * 팀원별 업무 부하
 */
export function useMemberWorkload(
  startDate: string,
  endDate: string,
  projectId?: string,
) {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  if (projectId) params.append('projectId', projectId);

  const url =
    startDate && endDate
      ? `/api/analytics/member-workload${buildQueryString(params)}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<MemberWorkloadItem[]>(url);

  return {
    workload: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * 프로젝트별 진행률
 */
export function useProjectProgress(projectId?: string) {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);

  const url = `/api/analytics/project-progress${buildQueryString(params)}`;

  const { data, error, isLoading, mutate } = useSWR<ProjectProgressItem[]>(url);

  return {
    progress: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * 이슈 발생 빈도
 */
export function useIssueFrequency(
  startDate: string,
  endDate: string,
  projectId?: string,
) {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  if (projectId) params.append('projectId', projectId);

  const url =
    startDate && endDate
      ? `/api/analytics/issue-frequency${buildQueryString(params)}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<WorkHoursTrendItem[]>(url);

  return {
    frequency: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * 파트별 담당 업무 건수
 */
export function usePartTaskCount(
  projectId: string | undefined,
  yearMonth: string,
) {
  let url = null;

  if (projectId && yearMonth) {
    const params = new URLSearchParams();
    params.append('projectId', projectId);
    params.append('yearMonth', yearMonth);

    url = `/api/analytics/part-task-count${buildQueryString(params)}`;
  }

  const { data, error, isLoading, mutate } = useSWR<PartTaskCountResponse>(url);

  return { data, isLoading, error, mutate };
}

/**
 * 파트별 일일 평균 근무 시간
 */
export function usePartWorkHours(
  projectId: string | undefined,
  yearMonth: string,
) {
  let url = null;

  if (projectId && yearMonth) {
    const params = new URLSearchParams();
    params.append('projectId', projectId);
    params.append('yearMonth', yearMonth);

    url = `/api/analytics/part-work-hours${buildQueryString(params)}`;
  }

  const { data, error, isLoading, mutate } = useSWR<PartWorkHoursResponse>(url);

  return { data, isLoading, error, mutate };
}

/**
 * 상태별 진행 건수
 */
export function useTaskStatusCount(
  projectId: string | undefined,
  yearMonth: string,
) {
  let url = null;

  if (projectId && yearMonth) {
    const params = new URLSearchParams();
    params.append('projectId', projectId);
    params.append('yearMonth', yearMonth);

    url = `/api/analytics/task-status-count${buildQueryString(params)}`;
  }

  const { data, error, isLoading, mutate } = useSWR<TaskStatusCountResponse>(url);

  return { data, isLoading, error, mutate };
}
