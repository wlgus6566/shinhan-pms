import useSWR from 'swr';

// ============================================================================
// Types
// ============================================================================

export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
    suspended: number;
  };
  myTasks: {
    total: number;
    waiting: number;
    inProgress: number;
    completed: number;
    high: number;
  };
  thisWeekWorkHours: number;
}

export interface RecentActivity {
  type: 'worklog' | 'task';
  id: string;
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface UpcomingSchedule {
  id: string;
  projectId?: string;
  title: string | null;
  description: string | null;
  scheduleType: string;
  startDate: string;
  endDate: string;
  location: string | null;
  isAllDay: boolean;
  color: string | null;
  teamScope: string | null;
  project?: {
    id: string;
    name: string;
  };
  participants: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
  }>;
  createdBy: string;
  creatorName: string;
  createdAt: string;
}

// ============================================================================
// SWR Hooks
// ============================================================================

/**
 * SWR hook for fetching dashboard statistics
 */
export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    '/api/dashboard/stats'
  );

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching recent activities
 */
export function useRecentActivities() {
  const { data, error, isLoading, mutate } = useSWR<RecentActivity[]>(
    '/api/dashboard/activities'
  );

  return {
    activities: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching upcoming schedules
 */
export function useUpcomingSchedules() {
  const { data, error, isLoading, mutate } = useSWR<UpcomingSchedule[]>(
    '/api/dashboard/schedules'
  );

  return {
    schedules: data,
    isLoading,
    error,
    mutate,
  };
}
