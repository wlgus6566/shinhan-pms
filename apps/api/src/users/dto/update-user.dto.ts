import { createZodDto } from 'nestjs-zod';
import { UpdateUserSchema } from '@repo/schema';

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
