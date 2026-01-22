import { createZodDto } from 'nestjs-zod';
import { UpdateProjectMemberRoleSchema } from '@repo/schema';

export class UpdateProjectMemberRoleDto extends createZodDto(UpdateProjectMemberRoleSchema) {}
