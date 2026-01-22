import { createZodDto } from 'nestjs-zod';
import { CreateProjectSchema } from '@repo/schema';

export class CreateProjectDto extends createZodDto(CreateProjectSchema) {}
