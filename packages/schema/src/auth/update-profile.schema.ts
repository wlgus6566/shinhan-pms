import { z } from 'zod';
import { DepartmentEnum } from '../common/enums';

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 최대 50자까지 입력 가능합니다')
    .optional(),
  department: DepartmentEnum.optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
