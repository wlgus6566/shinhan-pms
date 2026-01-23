import { createZodDto } from 'nestjs-zod';
import { CreateScheduleSchema } from '@repo/schema';

export class CreateScheduleDto extends createZodDto(CreateScheduleSchema) {}
