import { z } from 'zod';
import { UserPositionSchema, UserRoleSchema, passwordRule } from './enums.js';

const nameSchema = z
  .string()
  .min(2, '이름은 최소 2자 이상이어야 합니다')
  .max(50, '이름은 최대 50자까지 입력할 수 있습니다');

const emailSchema = z.string().email('올바른 이메일 형식이 아닙니다');

export const UserCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordRule,
  profileImage: z.string().optional(),
  department: z.string().min(1, '본부를 선택하세요'),
  position: UserPositionSchema,
  role: UserRoleSchema,
});

export type UserCreateInput = z.infer<typeof UserCreateSchema>;

export const UserCreateFormSchema = UserCreateSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

export type UserCreateFormInput = z.infer<typeof UserCreateFormSchema>;

export const UserUpdateSchema = z.object({
  department: z.string().min(1, '본부를 입력하세요').optional(),
  position: UserPositionSchema.optional(),
  role: UserRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;

export const UserUpdateFormSchema = z.object({
  department: z.string().min(1, '본부를 입력하세요'),
  role: UserRoleSchema,
  isActive: z.boolean(),
});

export type UserUpdateFormInput = z.infer<typeof UserUpdateFormSchema>;
