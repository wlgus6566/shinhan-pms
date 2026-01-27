import { z } from 'zod';

// Project Related Enums
export const ProjectTypeEnum = z.enum(['OPERATION', 'BUILD'], {
  errorMap: () => ({ message: '프로젝트 타입은 운영 또는 구축이어야 합니다' }),
});

export type ProjectType = z.infer<typeof ProjectTypeEnum>;

export const ProjectStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'SUSPENDED'], {
  errorMap: () => ({
    message: '상태는 ACTIVE, COMPLETED, SUSPENDED 중 하나여야 합니다',
  }),
});

export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

// Task Related Enums
export const TaskDifficultyEnum = z.enum(['HIGH', 'MEDIUM', 'LOW'], {
  errorMap: () => ({
    message: '난이도는 HIGH, MEDIUM, LOW 중 하나여야 합니다',
  }),
});

export type TaskDifficulty = z.infer<typeof TaskDifficultyEnum>;

export const TaskStatusEnum = z.enum(
  [
    'WAITING',
    'IN_PROGRESS',
    'WORK_COMPLETED',
    'TESTING',
    'OPEN_WAITING',
    'OPEN_RESPONDING',
    'COMPLETED',
    'SUSPENDED',
  ],
  {
    errorMap: () => ({
      message:
        '상태는 WAITING, IN_PROGRESS, WORK_COMPLETED, TESTING, OPEN_WAITING, OPEN_RESPONDING, COMPLETED, SUSPENDED 중 하나여야 합니다',
    }),
  },
);

export type TaskStatus = z.infer<typeof TaskStatusEnum>;

// Task Status UI Metadata
export const TASK_STATUS_METADATA = {
  WAITING: {
    label: '작업 대기',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  IN_PROGRESS: {
    label: '작업 중',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  WORK_COMPLETED: {
    label: '작업 완료',
    color: 'bg-green-100 text-green-700 border-green-300',
  },
  TESTING: {
    label: '테스트',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  OPEN_WAITING: {
    label: '오픈 대기',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  OPEN_RESPONDING: {
    label: '오픈 대응',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  COMPLETED: {
    label: '완료',
    color: 'bg-green-50 text-green-700 border-green-300',
  },
  SUSPENDED: {
    label: '업무 중단',
    color: 'bg-red-100 text-red-700 border-red-300',
  },
} as const satisfies Record<TaskStatus, { label: string; color: string }>;

// Helper for FormSelect components
export const TASK_STATUS_OPTIONS = Object.entries(TASK_STATUS_METADATA).map(
  ([value, { label }]) => ({ value, label }),
);

// Task Difficulty UI Metadata
export const TASK_DIFFICULTY_METADATA = {
  HIGH: { label: '상', color: 'bg-rose-50 text-rose-700 border-rose-300' },
  MEDIUM: { label: '중', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  LOW: { label: '하', color: 'bg-green-100 text-green-700 border-green-300' },
} as const satisfies Record<TaskDifficulty, { label: string; color: string }>;

// Helper for FormSelect components
export const TASK_DIFFICULTY_OPTIONS = Object.entries(
  TASK_DIFFICULTY_METADATA,
).map(([value, { label }]) => ({ value, label }));

// Member Related Enums
export const MemberRoleEnum = z.enum(['PM', 'PL', 'PA'], {
  errorMap: () => ({ message: '역할은 PM, PL, PA 중 하나여야 합니다' }),
});

export type MemberRole = z.infer<typeof MemberRoleEnum>;

export const WorkAreaEnum = z.enum(
  ['PROJECT_MANAGEMENT', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'],
  {
    errorMap: () => ({
      message:
        '담당 분야는 PROJECT_MANAGEMENT, PLANNING, DESIGN, FRONTEND, BACKEND 중 하나여야 합니다',
    }),
  },
);

export type WorkArea = z.infer<typeof WorkAreaEnum>;

// User Related Enums
export const DepartmentEnum = z.enum(
  ['PLANNING', 'DESIGN', 'FRONTEND', 'DEVELOPMENT'],
  {
    errorMap: () => ({ message: '올바른 파트를 선택해주세요' }),
  },
);

export type Department = z.infer<typeof DepartmentEnum>;

export const GradeEnum = z.enum(
  ['EXPERT', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER'],
  {
    errorMap: () => ({ message: '등급은 EXPERT, ADVANCED, INTERMEDIATE, BEGINNER 중 하나여야 합니다' }),
  },
);

export type Grade = z.infer<typeof GradeEnum>;

export const UserRoleEnum = z.enum(['PM', 'PL', 'PA', 'MEMBER'], {
  errorMap: () => ({
    message: '역할은 PM, PL, PA, MEMBER 중 하나여야 합니다',
  }),
});

export type UserRole = z.infer<typeof UserRoleEnum>;

export const PositionEnum = z.enum(
  [
    'DIVISION_HEAD',
    'GENERAL_MANAGER',
    'PRINCIPAL_LEADER',
    'SENIOR_LEADER',
    'LEADER',
    'TEAM_MEMBER',
  ],
  {
    errorMap: () => ({
      message:
        '직책은 DIVISION_HEAD, GENERAL_MANAGER, PRINCIPAL_LEADER, SENIOR_LEADER, LEADER, TEAM_MEMBER 중 하나여야 합니다',
    }),
  },
);

export type Position = z.infer<typeof PositionEnum>;

// Schedule Related Enums
export const ScheduleTypeEnum = z.enum(
  ['MEETING', 'SCRUM', 'VACATION', 'HALF_DAY', 'OTHER'],
  {
    errorMap: () => ({
      message:
        '일정 유형은 MEETING, SCRUM, VACATION, HALF_DAY, OTHER 중 하나여야 합니다',
    }),
  },
);

export type ScheduleType = z.infer<typeof ScheduleTypeEnum>;

export const TeamScopeEnum = z.enum(
  ['ALL', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND'],
  {
    errorMap: () => ({
      message:
        '팀 범위는 ALL, PLANNING, DESIGN, FRONTEND, BACKEND 중 하나여야 합니다',
    }),
  },
);

export type TeamScope = z.infer<typeof TeamScopeEnum>;

export const HalfDayTypeEnum = z.enum(['AM', 'PM'], {
  errorMap: () => ({
    message: '반차 유형은 오전(AM) 또는 오후(PM)여야 합니다',
  }),
});

export type HalfDayType = z.infer<typeof HalfDayTypeEnum>;

export const ParticipantStatusEnum = z.enum(
  ['PENDING', 'ACCEPTED', 'DECLINED'],
  {
    errorMap: () => ({
      message: '참가 상태는 PENDING, ACCEPTED, DECLINED 중 하나여야 합니다',
    }),
  },
);

export type ParticipantStatus = z.infer<typeof ParticipantStatusEnum>;
