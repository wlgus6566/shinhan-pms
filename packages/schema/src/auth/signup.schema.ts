import { z } from 'zod';
import { DepartmentEnum } from '../common/enums';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/;

export const SignupSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(passwordRegex, '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다'),
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 최대 50자까지 입력 가능합니다'),
  department: DepartmentEnum,
});

export type SignupRequest = z.infer<typeof SignupSchema>;
