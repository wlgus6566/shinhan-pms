import { z } from 'zod';

export const DepartmentSchema = z.enum([
  'PLANNING',
  'DESIGN',
  'FRONTEND',
  'DEVELOPMENT',
]);

export type Department = z.infer<typeof DepartmentSchema>;

export const UserRoleSchema = z.enum(['SUPER_ADMIN', 'PM', 'MEMBER']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserPositionSchema = z.enum([
  'DIVISION_HEAD',
  'GENERAL_MANAGER',
  'PRINCIPAL_LEADER',
  'SENIOR_LEADER',
  'LEADER',
  'TEAM_MEMBER',
]);

export type UserPosition = z.infer<typeof UserPositionSchema>;

export const ProjectRoleSchema = z.enum(['PM', 'PL', 'PA']);
export type ProjectRole = z.infer<typeof ProjectRoleSchema>;

export const ProjectStatusSchema = z.enum([
  'ACTIVE',
  'COMPLETED',
  'SUSPENDED',
]);

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const WorkAreaSchema = z.enum([
  'PROJECT_MANAGEMENT',
  'PLANNING',
  'DESIGN',
  'FRONTEND',
  'BACKEND',
]);

export type WorkArea = z.infer<typeof WorkAreaSchema>;

export const TaskDifficultySchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export type TaskDifficulty = z.infer<typeof TaskDifficultySchema>;

export const TaskStatusSchema = z.enum([
  'WAITING',
  'IN_PROGRESS',
  'WORK_COMPLETED',
  'OPEN_WAITING',
  'OPEN_RESPONDING',
  'OPEN_COMPLETED',
  'COMPLETED',
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const passwordRule = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/,
    '영문, 숫자, 특수문자를 포함해야 합니다',
  );
