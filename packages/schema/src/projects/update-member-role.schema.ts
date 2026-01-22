import { z } from 'zod';
import { MemberRoleEnum, WorkAreaEnum } from '../common/enums';

export const UpdateProjectMemberRoleSchema = z.object({
  role: MemberRoleEnum,
  workArea: WorkAreaEnum.optional(),
  notes: z
    .string()
    .transform(val => val === '' ? undefined : val)
    .optional(),
});

export type UpdateProjectMemberRoleRequest = z.infer<typeof UpdateProjectMemberRoleSchema>;
