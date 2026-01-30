import useSWR from 'swr';
import type {
  DashboardStats,
  DashboardTimeline,
  RecentActivity,
  UpcomingSchedule,
} from '@repo/schema';

// Re-export types for backward compatibility
export type { DashboardStats, DashboardTimeline, RecentActivity, UpcomingSchedule };

// ============================================================================
// SWR Hooks
// ============================================================================

/**
 * SWR hook for fetching consolidated dashboard statistics
 * Includes: projects, tasks, work hours, and today's stats
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
 * SWR hook for fetching dashboard timeline
 * Includes: recent activities and upcoming schedules
 */
export function useDashboardTimeline() {
  const { data, error, isLoading, mutate } = useSWR<DashboardTimeline>(
    '/api/dashboard/timeline'
  );

  return {
    timeline: data,
    isLoading,
    error,
    mutate,
  };
}
