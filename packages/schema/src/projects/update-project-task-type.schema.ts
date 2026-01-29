import { z } from 'zod';

export const UpdateProjectTaskTypeSchema = z.object({
  name: z.string().min(2).max(50).optional(),
});

export type UpdateProjectTaskTypeRequest = z.infer<typeof UpdateProjectTaskTypeSchema>;
