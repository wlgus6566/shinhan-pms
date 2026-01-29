import { z } from 'zod';
import { ProjectTypeEnum } from '../common/enums';
import { TaskTypeInputSchema } from './task-type-input.schema';

export const CreateProjectSchema = z
  .object({
    name: z
      .string()
      .min(2, '프로젝트명은 2-100자 사이여야 합니다')
      .max(100, '프로젝트명은 2-100자 사이여야 합니다'),
    client: z
      .string()
      .max(100, '클라이언트는 최대 100자까지 입력 가능합니다')
      .optional(),
    projectType: ProjectTypeEnum,
    description: z
      .string()
      .max(1000, '설명은 최대 1000자까지 입력 가능합니다')
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    taskTypes: z.array(TaskTypeInputSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: '종료일은 시작일 이후여야 합니다',
      path: ['endDate'],
    }
  );

export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;
