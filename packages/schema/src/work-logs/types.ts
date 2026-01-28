/**
 * Work Logs - Response 타입 정의
 */

import { z } from 'zod';
import type { TaskBasicInfo, ProjectBasicInfo } from '../common/types';
import {
  TaskBasicInfoSchema,
  ProjectBasicInfoSchema,
  AuditFieldsSchema,
} from '../common/types';

// ============================================
// Work Log User (중첩 객체)
// ============================================

export interface WorkLogUser {
  id: string;
  name: string;
  email: string;
}

export const WorkLogUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

// ============================================
// Work Log Task (중첩 객체)
// ============================================

export interface WorkLogTask extends TaskBasicInfo {}

export const WorkLogTaskSchema = TaskBasicInfoSchema;

// ============================================
// Work Log Response
// ============================================

export interface WorkLog {
  id: string;
  taskId: string;
  userId: string;
  workDate: string;
  content: string;
  workHours?: number | null;
  progress?: number | null;
  issues?: string | null;
  task?: WorkLogTask;
  user?: WorkLogUser;
  createdAt: string;
  updatedAt?: string;
}

export const WorkLogSchema = z
  .object({
    id: z.string(),
    taskId: z.string(),
    userId: z.string(),
    workDate: z.string(),
    content: z.string(),
    workHours: z.number().nullable().optional(),
    progress: z.number().nullable().optional(),
    issues: z.string().nullable().optional(),
    task: WorkLogTaskSchema.optional(),
    user: WorkLogUserSchema.optional(),
  })
  .merge(AuditFieldsSchema);

// ============================================
// My Task Response (업무일지 등록용)
// ============================================

export interface MyTask {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  difficulty: string;
  status: string;
  startDate?: string;
  endDate?: string;
  project?: ProjectBasicInfo;
}

export const MyTaskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  taskName: z.string(),
  description: z.string().optional(),
  difficulty: z.string(),
  status: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  project: ProjectBasicInfoSchema.optional(),
});
