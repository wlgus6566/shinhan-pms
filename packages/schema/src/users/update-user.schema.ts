import { z } from 'zod';
import {
  DepartmentEnum,
  PositionEnum,
  UserRoleEnum,
  GradeEnum,
} from '../common/enums';

export const UpdateUserSchema = z.object({
  department: DepartmentEnum.optional(),
  position: PositionEnum.optional(),
  role: UserRoleEnum.optional(),
  grade: GradeEnum.optional(),
  isActive: z.boolean().optional(),
});
