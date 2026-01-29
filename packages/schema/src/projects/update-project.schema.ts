import { z } from 'zod';
import { ProjectTypeEnum, ProjectStatusEnum } from '../common/enums';
import { TaskTypeUpdateInputSchema } from './task-type-input.schema';

export const UpdateProjectSchema = z.object({
  name: z
    .string()
    .min(2, '프로젝트명은 2-100자 사이여야 합니다')
    .max(100, '프로젝트명은 2-100자 사이여야 합니다')
    .optional(),
  client: z
    .string()
    .max(100, '클라이언트는 최대 100자까지 입력 가능합니다')
    .optional(),
  projectType: ProjectTypeEnum.optional(),
  description: z
    .string()
    .max(1000, '설명은 최대 1000자까지 입력 가능합니다')
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: ProjectStatusEnum.optional(),
  taskTypes: z.array(TaskTypeUpdateInputSchema).optional(),
});

export type UpdateProjectRequest = z.infer<typeof UpdateProjectSchema>;
