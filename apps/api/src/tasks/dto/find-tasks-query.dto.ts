import { createZodDto } from 'nestjs-zod';
import { FindTasksQuerySchema } from '@repo/schema';

export class FindTasksQueryDto extends createZodDto(FindTasksQuerySchema) {}
