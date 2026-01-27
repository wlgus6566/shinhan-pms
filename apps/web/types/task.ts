// ============================================
// Re-export Response types from @repo/schema
// ============================================

export type { Task } from '@repo/schema';

// ============================================
// Re-export Enums from @repo/schema
// ============================================

export type { TaskDifficulty, TaskStatus } from '@repo/schema';

// ============================================
// Re-export Request types from @repo/schema
// ============================================

export type { CreateTaskRequest, UpdateTaskRequest } from '@repo/schema';

// ============================================
// Re-export Metadata from @repo/schema
// ============================================

import {
  TASK_STATUS_METADATA,
  TASK_DIFFICULTY_METADATA,
} from '@repo/schema';
import type { TaskDifficulty, TaskStatus } from '@repo/schema';

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
