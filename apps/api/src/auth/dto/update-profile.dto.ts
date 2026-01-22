import { createZodDto } from 'nestjs-zod';
import { UpdateProfileSchema } from '@repo/schema';

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
