import { z } from 'zod';
import { ScheduleTypeEnum, TeamScopeEnum, HalfDayTypeEnum } from '../common/enums';

export const UpdateScheduleSchema = z.object({
  projectId: z.string().optional(),
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이하여야 합니다')
    .optional(),
  description: z.string().optional(),
  scheduleType: ScheduleTypeEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z
    .string()
    .max(200, '장소는 200자 이하여야 합니다')
    .optional(),
  isAllDay: z.boolean().optional(),
  color: z.string().optional(),
  participantIds: z.array(z.string()).optional(),
  teamScope: TeamScopeEnum.nullable().optional(),
  halfDayType: HalfDayTypeEnum.nullable().optional(),
  usageDate: z.string().optional(),
});

export type UpdateScheduleRequest = z.infer<typeof UpdateScheduleSchema>;
