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
  taskTypeId: z.number().int().positive('업무 구분을 선택해주세요'),
  planningAssigneeIds: z.array(z.number().int().positive()).optional(),
  designAssigneeIds: z.array(z.number().int().positive()).optional(),
  frontendAssigneeIds: z.array(z.number().int().positive()).optional(),
  backendAssigneeIds: z.array(z.number().int().positive()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  openDate: z.string().optional(),
  notes: z
    .string()
    .transform(val => val === '' ? undefined : val)
    .optional(),
})
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: '종료일은 시작일보다 이후여야 합니다',
      path: ['endDate'],
    }
  );

export type CreateTaskRequest = z.infer<typeof CreateTaskSchema>;
