import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
  newPassword: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(passwordRegex, '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다'),
});

export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
