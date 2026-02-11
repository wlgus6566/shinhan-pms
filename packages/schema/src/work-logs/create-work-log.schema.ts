import { z } from 'zod';

export const CreateWorkLogSchema = z.object({
  workDate: z.string(),
  content: z
    .string()
    .min(1, '작업 내용을 입력해주세요')
    .max(2000, '작업 내용은 최대 2000자까지 입력 가능합니다'),
  workHours: z
    .number({ required_error: '작업 시간을 입력해주세요' })
    .min(0.5, '작업 시간은 최소 0.5시간입니다')
    .max(24, '작업 시간은 최대 24시간입니다'),
  progress: z
    .number({ required_error: '진행률을 선택해주세요' })
    .min(0, '진행률은 최소 0%입니다')
    .max(100, '진행률은 최대 100%입니다'),
  issues: z
    .string()
    .max(1000, '이슈 내용은 최대 1000자까지 입력 가능합니다')
    .transform(val => val === '' ? undefined : val)
    .optional(),
});

export type CreateWorkLogRequest = z.infer<typeof CreateWorkLogSchema>;
