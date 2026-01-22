import { z } from 'zod';

export const CreateWorkLogSchema = z.object({
  workDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '작업 날짜는 YYYY-MM-DD 형식이어야 합니다'),
  content: z
    .string()
    .max(2000, '작업 내용은 최대 2000자까지 입력 가능합니다'),
  workHours: z
    .number()
    .min(0.5, '작업 시간은 최소 0.5시간입니다')
    .max(24, '작업 시간은 최대 24시간입니다')
    .optional(),
  progress: z
    .number()
    .min(0, '진행률은 최소 0%입니다')
    .max(100, '진행률은 최대 100%입니다')
    .optional(),
  issues: z
    .string()
    .max(1000, '이슈 내용은 최대 1000자까지 입력 가능합니다')
    .transform(val => val === '' ? undefined : val)
    .optional(),
});

export type CreateWorkLogRequest = z.infer<typeof CreateWorkLogSchema>;
