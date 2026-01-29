import { z } from 'zod';

export const CreateProjectTaskTypeSchema = z.object({
  name: z.string().min(2, '업무 구분명은 2-50자 사이여야 합니다').max(50),
});

export type CreateProjectTaskTypeRequest = z.infer<typeof CreateProjectTaskTypeSchema>;
