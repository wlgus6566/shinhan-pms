import { createZodDto } from 'nestjs-zod';
import { UpdateProjectSchema } from '@repo/schema';

export class UpdateProjectDto extends createZodDto(UpdateProjectSchema) {}
