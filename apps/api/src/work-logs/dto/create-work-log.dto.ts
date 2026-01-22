import { createZodDto } from 'nestjs-zod';
import { CreateWorkLogSchema } from '@repo/schema';

export class CreateWorkLogDto extends createZodDto(CreateWorkLogSchema) {}
