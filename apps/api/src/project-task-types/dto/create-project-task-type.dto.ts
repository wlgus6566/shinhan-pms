import { createZodDto } from 'nestjs-zod';
import { CreateProjectTaskTypeSchema } from '@repo/schema';

export class CreateProjectTaskTypeDto extends createZodDto(CreateProjectTaskTypeSchema) {}
