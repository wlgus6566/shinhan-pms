import { z } from 'zod';
import { CreateUserSchema } from './create-user.schema';
import { UpdateUserSchema } from './update-user.schema';

// Request Types
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

// Response Types
export * from './types';

// Export Schemas
export { CreateUserSchema, UpdateUserSchema };

