import { z } from 'zod';
import { TaskDifficultyEnum, TaskStatusEnum } from '../common/enums';

export const UpdateTaskSchema = z.object({
  taskName: z
    .string()
    .min(2, '작업명은 2-100자 사이여야 합니다')
    .max(100, '작업명은 2-100자 사이여야 합니다')
    .optional(),
  description: z
    .string()
    .max(1000, '작업내용은 최대 1000자까지 입력 가능합니다')
    .optional(),
  difficulty: TaskDifficultyEnum.optional(),
  clientName: z
    .string()
    .max(100, '담당 RM은 최대 100자까지 입력 가능합니다')
    .optional(),
  planningAssigneeIds: z.array(z.number().int().positive()).optional(),
  designAssigneeIds: z.array(z.number().int().positive()).optional(),
  frontendAssigneeIds: z.array(z.number().int().positive()).optional(),
  backendAssigneeIds: z.array(z.number().int().positive()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z
    .string()
    .transform(val => val === '' ? undefined : val)
    .optional(),
  status: TaskStatusEnum.optional(),
});

export type UpdateTaskRequest = z.infer<typeof UpdateTaskSchema>;
