import { z } from 'zod';

// Project Related Enums
export const ProjectTypeEnum = z.enum(['OPERATION', 'BUILD'], {
  errorMap: () => ({ message: '프로젝트 타입은 운영 또는 구축이어야 합니다' }),
});

export type ProjectType = z.infer<typeof ProjectTypeEnum>;

export const ProjectStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'SUSPENDED'], {
  errorMap: () => ({ message: '상태는 ACTIVE, COMPLETED, SUSPENDED 중 하나여야 합니다' }),
});

export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

// Task Related Enums
export const TaskDifficultyEnum = z.enum(['HIGH', 'MEDIUM', 'LOW'], {
  errorMap: () => ({ message: '중요도는 HIGH, MEDIUM, LOW 중 하나여야 합니다' }),
});

export type TaskDifficulty = z.infer<typeof TaskDifficultyEnum>;

export const TaskStatusEnum = z.enum([
  'WAITING',
  'IN_PROGRESS',
  'WORK_COMPLETED',
  'OPEN_WAITING',
  'OPEN_RESPONDING',
  'COMPLETED',
], {
  errorMap: () => ({ message: '상태는 WAITING, IN_PROGRESS, WORK_COMPLETED, OPEN_WAITING, OPEN_RESPONDING, COMPLETED 중 하나여야 합니다' }),
});

export type TaskStatus = z.infer<typeof TaskStatusEnum>;

// Member Related Enums
export const MemberRoleEnum = z.enum(['PM', 'PL', 'PA'], {
  errorMap: () => ({ message: '역할은 PM, PL, PA 중 하나여야 합니다' }),
});

export type MemberRole = z.infer<typeof MemberRoleEnum>;

export const WorkAreaEnum = z.enum([
  'PROJECT_MANAGEMENT',
  'PLANNING',
  'DESIGN',
  'FRONTEND',
  'BACKEND',
], {
  errorMap: () => ({ message: '담당 분야는 PROJECT_MANAGEMENT, PLANNING, DESIGN, FRONTEND, BACKEND 중 하나여야 합니다' }),
});

export type WorkArea = z.infer<typeof WorkAreaEnum>;

// User Related Enums
export const DepartmentEnum = z.enum([
  'PLANNING',
  'DESIGN',
  'FRONTEND',
  'DEVELOPMENT',
], {
  errorMap: () => ({ message: '올바른 파트를 선택해주세요' }),
});

export type Department = z.infer<typeof DepartmentEnum>;
