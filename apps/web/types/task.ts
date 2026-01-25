import type {
  TaskDifficulty,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@repo/schema';
import {
  TASK_STATUS_METADATA,
  TASK_DIFFICULTY_METADATA,
} from '@repo/schema';

// Re-export schema types
export type { TaskDifficulty, TaskStatus };

// 기존 컴포넌트 호환성을 위한 레거시 export
export const STATUS_LABELS = Object.fromEntries(
  Object.entries(TASK_STATUS_METADATA).map(([k, v]) => [k, v.label])
) as Record<TaskStatus, string>;

export const STATUS_COLORS = Object.fromEntries(
  Object.entries(TASK_STATUS_METADATA).map(([k, v]) => [k, v.color])
) as Record<TaskStatus, string>;

export const DIFFICULTY_LABELS = Object.fromEntries(
  Object.entries(TASK_DIFFICULTY_METADATA).map(([k, v]) => [k, v.label])
) as Record<TaskDifficulty, string>;

export const DIFFICULTY_COLORS = Object.fromEntries(
  Object.entries(TASK_DIFFICULTY_METADATA).map(([k, v]) => [k, v.color])
) as Record<TaskDifficulty, string>;

interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  difficulty: TaskDifficulty;
  clientName?: string;
  planningAssignees?: User[];
  designAssignees?: User[];
  frontendAssignees?: User[];
  backendAssignees?: User[];
  startDate?: string;
  endDate?: string;
  openDate?: string;
  notes?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

// Re-export request types from schema
export type { CreateTaskRequest, UpdateTaskRequest };
