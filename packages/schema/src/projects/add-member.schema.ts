import { z } from 'zod';
import { MemberRoleEnum, WorkAreaEnum } from '../common/enums';

export const AddProjectMemberSchema = z.object({
  memberId: z.string().min(1, '멤버 ID는 필수입니다'),
  role: MemberRoleEnum,
  workArea: WorkAreaEnum,
  notes: z
    .string()
    .transform(val => val === '' ? undefined : val)
    .optional(),
});

export type AddProjectMemberRequest = z.infer<typeof AddProjectMemberSchema>;
