import { createZodDto } from 'nestjs-zod';
import { UpdateProjectTaskTypeSchema } from '@repo/schema';

export class UpdateProjectTaskTypeDto extends createZodDto(UpdateProjectTaskTypeSchema) {}
