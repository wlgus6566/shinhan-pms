import { createZodDto } from 'nestjs-zod';
import { AddProjectMemberSchema } from '@repo/schema';

export class AddProjectMemberDto extends createZodDto(AddProjectMemberSchema) {}
