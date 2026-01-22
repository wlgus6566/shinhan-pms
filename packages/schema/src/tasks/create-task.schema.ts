import { z } from 'zod';
import { TaskDifficultyEnum } from '../common/enums';

export const CreateTaskSchema = z.object({
  taskName: z
    .string()
    .min(2, '작업명은 2-100자 사이여야 합니다')
    .max(100, '작업명은 2-100자 사이여야 합니다'),
  description: z
    .string()
    .max(1000, '작업내용은 최대 1000자까지 입력 가능합니다')
    .optional(),
  difficulty: TaskDifficultyEnum,
  clientName: z
    .string()
    .max(100, '담당 RM은 최대 100자까지 입력 가능합니다')
    .optional(),
  planningAssigneeId: z.number().int().positive().optional(),
  designAssigneeId: z.number().int().positive().optional(),
  frontendAssigneeId: z.number().int().positive().optional(),
  backendAssigneeId: z.number().int().positive().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '시작일은 YYYY-MM-DD 형식이어야 합니다')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '종료일은 YYYY-MM-DD 형식이어야 합니다')
    .optional(),
  notes: z
    .string()
    .transform(val => val === '' ? undefined : val)
    .optional(),
});

export type CreateTaskRequest = z.infer<typeof CreateTaskSchema>;
