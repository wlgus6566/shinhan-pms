import { z } from 'zod';
import { MemberRoleEnum, WorkAreaEnum } from '../common/enums';

export const AddProjectMemberSchema = z.object({
  memberId: z.number().int().positive('멤버 ID는 양수여야 합니다'),
  role: MemberRoleEnum,
  workArea: WorkAreaEnum,
  notes: z
    .string()
    .transform(val => val === '' ? undefined : val)
    .optional(),
});

export type AddProjectMemberRequest = z.infer<typeof AddProjectMemberSchema>;
