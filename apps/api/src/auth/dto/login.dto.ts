import { createZodDto } from 'nestjs-zod';
import { LoginSchema } from '@repo/schema';

export class LoginDto extends createZodDto(LoginSchema) {}
