import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema } from '@repo/schema';

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
