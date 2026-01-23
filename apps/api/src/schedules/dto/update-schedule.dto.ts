import { createZodDto } from 'nestjs-zod';
import { UpdateScheduleSchema } from '@repo/schema';

export class UpdateScheduleDto extends createZodDto(UpdateScheduleSchema) {}
