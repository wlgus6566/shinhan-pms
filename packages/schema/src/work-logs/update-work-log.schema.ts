import { z } from 'zod';

export const UpdateWorkLogSchema = z.object({
  workDate: z.string().optional(),
  content: z
    .string()
    .max(2000, '작업 내용은 최대 2000자까지 입력 가능합니다')
    .optional(),
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

export type UpdateWorkLogRequest = z.infer<typeof UpdateWorkLogSchema>;
