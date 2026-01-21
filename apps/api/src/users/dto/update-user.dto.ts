import {
  UserPositionSchema,
  UserRoleSchema,
  UserUpdateSchema,
  type UserPosition,
  type UserRole,
  type UserUpdateInput,
} from '@repo/schema';

export { UserPositionSchema, UserRoleSchema, UserUpdateSchema };
export type { UserPosition, UserRole };
export type UpdateUserDto = UserUpdateInput;
