import { createZodDto } from 'nestjs-zod';
import { CreateTaskSchema } from '@repo/schema';

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
