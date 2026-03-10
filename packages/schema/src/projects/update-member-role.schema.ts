import { z } from 'zod';
import { MemberRoleEnum, WorkAreaEnum, GradeEnum } from '../common/enums';

export const UpdateProjectMemberRoleSchema = z.object({
  role: MemberRoleEnum,
  workArea: WorkAreaEnum.optional(),
  grade: GradeEnum.optional(),
  joinDate: z.string().optional(),
  leaveDate: z.string().optional(),
  notes: z
    .string()
    .transform(val => val === '' ? undefined : val)
    .optional(),
});

export type UpdateProjectMemberRoleRequest = z.infer<typeof UpdateProjectMemberRoleSchema>;
