import { z } from 'zod';
import { TaskStatusEnum, TaskDifficultyEnum } from '../common/enums';

export const FindTasksQuerySchema = z.object({
  search: z.string().optional(),
  status: z.array(TaskStatusEnum).optional(),
  difficulty: z.array(TaskDifficultyEnum).optional(),
  pageNum: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
});

export type FindTasksQuery = z.infer<typeof FindTasksQuerySchema>;
