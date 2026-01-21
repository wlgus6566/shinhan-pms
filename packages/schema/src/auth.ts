import { z } from 'zod';
import { DepartmentSchema, passwordRule } from './enums.js';

export { passwordRule };

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
  newPassword: passwordRule,
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const ChangePasswordFormSchema = ChangePasswordSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '새 비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

export type ChangePasswordFormInput = z.infer<
  typeof ChangePasswordFormSchema
>;

export const LoginSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const SignupSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  password: passwordRule,
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 최대 50자까지 입력 가능합니다'),
  department: DepartmentSchema,
});

export type SignupInput = z.infer<typeof SignupSchema>;

const ProfileBaseSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 최대 50자까지 입력 가능합니다'),
  department: DepartmentSchema,
});

export const UpdateProfileSchema = ProfileBaseSchema.partial();
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const UpdateProfileFormSchema = ProfileBaseSchema;
export type UpdateProfileFormInput = z.infer<
  typeof UpdateProfileFormSchema
>;
