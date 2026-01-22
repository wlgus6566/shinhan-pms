import { createZodDto } from 'nestjs-zod';
import { UpdateTaskSchema } from '@repo/schema';

export class UpdateTaskDto extends createZodDto(UpdateTaskSchema) {}
