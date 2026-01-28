import { z } from 'zod';
import { WorkAreaEnum } from '../common/enums';

// 개인 생산성 통계
export const ProductivityStatsSchema = z.object({
  totalWorkHours: z.number(),
  completedTasks: z.number(),
  averageProgress: z.number(),
  issueCount: z.number(),
});

// 작업 시간 트렌드 아이템
export const WorkHoursTrendItemSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  workHours: z.number(),
});

// 분야별 분포 아이템
export const WorkAreaDistributionItemSchema = z.object({
  workArea: z.string(),
  hours: z.number(),
  percentage: z.number(),
});

// 팀원별 워크로드 아이템
export const MemberWorkloadItemSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  workHours: z.number(),
  taskCount: z.number(),
  averageProgress: z.number(),
});

// 프로젝트 진행률 아이템
export const ProjectProgressItemSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  averageProgress: z.number(),
  completedTasks: z.number(),
  inProgressTasks: z.number(),
  waitingTasks: z.number(),
});

// 응답 타입들
export const MyProductivityResponseSchema = z.object({
  stats: ProductivityStatsSchema,
  workHoursTrend: z.array(WorkHoursTrendItemSchema),
});

export const TeamProductivityResponseSchema = z.object({
  totalWorkHours: z.number(),
  memberWorkload: z.array(MemberWorkloadItemSchema),
});

export const WorkAreaDistributionResponseSchema = z.object({
  distribution: z.array(WorkAreaDistributionItemSchema),
});

// 파트별 멤버 통계 (업무 건수)
export const PartMemberStatsSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  taskCount: z.number(),
});

// 파트별 업무 건수
export const PartTaskCountSchema = z.object({
  workArea: WorkAreaEnum,
  members: z.array(PartMemberStatsSchema),
  totalCount: z.number(),
  averageCount: z.number(),
});

// 파트별 멤버 근무시간
export const PartMemberWorkHoursSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  avgHours: z.number(),
});

// 파트별 일일 평균 근무 시간
export const PartWorkHoursSchema = z.object({
  workArea: WorkAreaEnum,
  members: z.array(PartMemberWorkHoursSchema),
  partAvgHours: z.number(),
});

// 응답 타입
export const PartTaskCountResponseSchema = z.object({
  parts: z.array(PartTaskCountSchema),
});

export const PartWorkHoursResponseSchema = z.object({
  parts: z.array(PartWorkHoursSchema),
});

// TypeScript 타입 추출
export type ProductivityStats = z.infer<typeof ProductivityStatsSchema>;
export type WorkHoursTrendItem = z.infer<typeof WorkHoursTrendItemSchema>;
export type WorkAreaDistributionItem = z.infer<typeof WorkAreaDistributionItemSchema>;
export type MemberWorkloadItem = z.infer<typeof MemberWorkloadItemSchema>;
export type ProjectProgressItem = z.infer<typeof ProjectProgressItemSchema>;
export type MyProductivityResponse = z.infer<typeof MyProductivityResponseSchema>;
export type TeamProductivityResponse = z.infer<typeof TeamProductivityResponseSchema>;
export type WorkAreaDistributionResponse = z.infer<typeof WorkAreaDistributionResponseSchema>;
export type PartMemberStats = z.infer<typeof PartMemberStatsSchema>;
export type PartTaskCount = z.infer<typeof PartTaskCountSchema>;
export type PartMemberWorkHours = z.infer<typeof PartMemberWorkHoursSchema>;
export type PartWorkHours = z.infer<typeof PartWorkHoursSchema>;
export type PartTaskCountResponse = z.infer<typeof PartTaskCountResponseSchema>;
export type PartWorkHoursResponse = z.infer<typeof PartWorkHoursResponseSchema>;
