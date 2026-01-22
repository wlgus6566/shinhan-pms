import { createZodDto } from 'nestjs-zod';
import { UpdateWorkLogSchema } from '@repo/schema';

export class UpdateWorkLogDto extends createZodDto(UpdateWorkLogSchema) {}
