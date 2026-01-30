import { z } from 'zod';

/**
 * 대시보드 통합 통계 스키마
 * - 프로젝트 통계
 * - 내 업무 통계
 * - 이번 주 작업 시간
 * - 오늘의 통계 (업무 마감, 일정)
 */
export const DashboardStatsSchema = z.object({
  projects: z.object({
    total: z.number().int().nonnegative(),
    active: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
    suspended: z.number().int().nonnegative(),
  }),
  myTasks: z.object({
    total: z.number().int().nonnegative(),
    waiting: z.number().int().nonnegative(),
    inProgress: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
    high: z.number().int().nonnegative(),
  }),
  thisWeekWorkHours: z.number().nonnegative(),
  today: z.object({
    tasksDue: z.number().int().nonnegative(),
    schedules: z.number().int().nonnegative(),
  }),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
