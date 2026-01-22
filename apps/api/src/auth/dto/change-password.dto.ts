import { createZodDto } from 'nestjs-zod';
import { ChangePasswordSchema } from '@repo/schema';

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
