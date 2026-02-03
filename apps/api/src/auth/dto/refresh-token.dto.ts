import { createZodDto } from 'nestjs-zod';
import { RefreshTokenSchema } from '@repo/schema';

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
