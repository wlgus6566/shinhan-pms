import { z } from 'zod';

// Project Related Enums
export const ProjectTypeEnum = z.enum(['OPERATION', 'BUILD', 'ADVANCEMENT'], {
  errorMap: () => ({
    message: '프로젝트 타입은 운영, 구축, 고도화 중 하나여야 합니다',
  }),
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
  [
    'PLANNING_STRATEGY',
    'PLANNING_1',
    'DEVELOPMENT_1',
    'DIGITAL_1',
    'BUSINESS_1',
    'PLANNING_2',
    'DEVELOPMENT_2',
    'DIGITAL_2',
    'SERVICE_OPERATION',
    'PLATFORM_OPERATION',
    'PLATFORM_STRATEGY',
    'MARKETING_STRATEGY',
    'XC',
  ],
  {
    errorMap: () => ({ message: '올바른 본부를 선택해주세요' }),
  },
);

export type Department = z.infer<typeof DepartmentEnum>;

export const DEPARTMENT_LABELS: Record<Department, string> = {
  PLANNING_STRATEGY: '경영전략본부',
  PLANNING_1: '기획본부1',
  DEVELOPMENT_1: '개발본부1',
  DIGITAL_1: '디지털본부1',
  BUSINESS_1: '사업본부1',
  PLANNING_2: '기획본부2',
  DEVELOPMENT_2: '개발본부2',
  DIGITAL_2: '디지털본부2',
  SERVICE_OPERATION: '서비스운영본부',
  PLATFORM_OPERATION: '플랫폼운영본부',
  PLATFORM_STRATEGY: '플랫폼전략실',
  MARKETING_STRATEGY: '마케팅전략실',
  XC: 'XC본부',
};

export const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENT_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const GradeEnum = z.enum(
  ['EXPERT', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER'],
  {
    errorMap: () => ({
      message:
        '등급은 EXPERT, ADVANCED, INTERMEDIATE, BEGINNER 중 하나여야 합니다',
    }),
  },
);

export type Grade = z.infer<typeof GradeEnum>;

export const GRADE_LABELS: Record<Grade, string> = {
  EXPERT: '특급',
  ADVANCED: '고급',
  INTERMEDIATE: '중급',
  BEGINNER: '초급',
};

export const GRADE_OPTIONS = Object.entries(GRADE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const UserRoleEnum = z.enum(['SUPER_ADMIN', 'PM', 'MEMBER'], {
  errorMap: () => ({
    message: '역할은 SUPER_ADMIN, PM, MEMBER 중 하나여야 합니다',
  }),
});

export type UserRole = z.infer<typeof UserRoleEnum>;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: '슈퍼 관리자',
  PM: '프로젝트 관리자',
  MEMBER: '일반',
};

export const USER_ROLE_OPTIONS = Object.entries(USER_ROLE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

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

export const POSITION_LABELS: Record<Position, string> = {
  DIVISION_HEAD: '부문장',
  GENERAL_MANAGER: '본부장',
  PRINCIPAL_LEADER: '책임리더',
  SENIOR_LEADER: '선임리더',
  LEADER: '리더',
  TEAM_MEMBER: '팀원',
};

export const POSITION_OPTIONS = Object.entries(POSITION_LABELS).map(
  ([value, label]) => ({ value, label }),
);

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

export const RecurrenceTypeEnum = z.enum(
  ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
  {
    errorMap: () => ({
      message: '반복 유형은 DAILY, WEEKLY, MONTHLY, YEARLY 중 하나여야 합니다',
    }),
  },
);

export type RecurrenceType = z.infer<typeof RecurrenceTypeEnum>;

// Recurrence Type UI Metadata
export const RECURRENCE_TYPE_LABELS = {
  DAILY: '매일',
  WEEKLY: '매주',
  MONTHLY: '매월',
  YEARLY: '매년',
} as const satisfies Record<RecurrenceType, string>;

// Helper for FormSelect components
export const RECURRENCE_TYPE_OPTIONS = Object.entries(
  RECURRENCE_TYPE_LABELS,
).map(([value, label]) => ({ value, label }));
