import { createZodDto } from 'nestjs-zod';
import { SignupSchema, Department } from '@repo/schema';

// Re-export Department for backwards compatibility
export type { Department };

export class SignupDto extends createZodDto(SignupSchema) {}
