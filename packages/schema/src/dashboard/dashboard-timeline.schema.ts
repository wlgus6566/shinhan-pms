import { z } from 'zod';

/**
 * 최근 활동 스키마
 */
export const RecentActivitySchema = z.object({
  type: z.enum(['worklog', 'task']),
  id: z.string(),
  title: z.string(),
  description: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
  }),
  project: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
  createdAt: z.coerce.date(),
});

export type RecentActivity = z.infer<typeof RecentActivitySchema>;

/**
 * 예정 일정 스키마
 */
export const UpcomingScheduleSchema = z.object({
  id: z.string(),
  projectId: z.string().optional(),
  title: z.string(),
  description: z.string().nullable(),
  scheduleType: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().nullable(),
  isAllDay: z.boolean(),
  color: z.string().nullable(),
  teamScope: z.string().nullable(),
  project: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
  participants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      status: z.string(),
    }),
  ),
  createdBy: z.string(),
  creatorName: z.string(),
  createdAt: z.string(),
});

export type UpcomingSchedule = z.infer<typeof UpcomingScheduleSchema>;

/**
 * 대시보드 타임라인 스키마 (최근 활동 + 예정 일정)
 */
export const DashboardTimelineSchema = z.object({
  recentActivities: z.array(RecentActivitySchema),
  upcomingSchedules: z.array(UpcomingScheduleSchema),
});

export type DashboardTimeline = z.infer<typeof DashboardTimelineSchema>;
