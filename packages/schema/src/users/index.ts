import { z } from 'zod';
import { CreateUserSchema } from './create-user.schema';
import { UpdateUserSchema } from './update-user.schema';

// Request Types
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

// Export Schemas
export { CreateUserSchema, UpdateUserSchema };

// Re-export enums for convenience
export {
  DepartmentEnum,
  PositionEnum,
  UserRoleEnum,
  GradeEnum,
  type Department,
  type Position,
  type UserRole,
  type Grade,
} from '../common/enums';
