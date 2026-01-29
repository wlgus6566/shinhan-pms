import { z } from 'zod';
import {
  DepartmentEnum,
  PositionEnum,
  UserRoleEnum,
  GradeEnum,
} from '../common/enums';

export const CreateUserSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  profileImage: z.string().optional(),
  department: DepartmentEnum,
  position: PositionEnum,
  role: UserRoleEnum,
  grade: GradeEnum,
});
