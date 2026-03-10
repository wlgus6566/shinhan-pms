import { z } from 'zod';
import {
  DepartmentEnum,
  PositionEnum,
  UserRoleEnum,
} from '../common/enums';

export const UpdateUserSchema = z.object({
  profileImage: z.string().optional(),
  department: DepartmentEnum.optional(),
  position: PositionEnum.optional(),
  role: UserRoleEnum.optional(),
  isActive: z.boolean().optional(),
});
