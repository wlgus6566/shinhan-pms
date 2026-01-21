import { z } from 'zod';
import { TaskDifficultySchema, TaskStatusSchema } from './enums.js';

const TaskBaseSchema = z.object({
  taskName: z
    .string()
    .min(2, '작업명은 2자 이상이어야 합니다')
    .max(100, '작업명은 100자 이하여야 합니다'),
  description: z
    .string()
    .max(1000, '작업내용은 1000자 이하여야 합니다')
    .optional(),
  difficulty: TaskDifficultySchema,
  clientName: z
    .string()
    .max(100, '담당 RM은 100자 이하여야 합니다')
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

const taskDateRefine = (data: { startDate?: string; endDate?: string }) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
};

export const CreateTaskSchema = TaskBaseSchema
  .extend({
    planningAssigneeId: z.number().optional(),
    designAssigneeId: z.number().optional(),
    frontendAssigneeId: z.number().optional(),
    backendAssigneeId: z.number().optional(),
  })
  .refine(taskDateRefine, {
    message: '종료일은 시작일보다 이후여야 합니다',
    path: ['endDate'],
  });

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = TaskBaseSchema.partial()
  .extend({
    planningAssigneeId: z.number().optional(),
    designAssigneeId: z.number().optional(),
    frontendAssigneeId: z.number().optional(),
    backendAssigneeId: z.number().optional(),
    status: TaskStatusSchema.optional(),
  })
  .refine(taskDateRefine, {
    message: '종료일은 시작일보다 이후여야 합니다',
    path: ['endDate'],
  });

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

const TaskFormBaseSchema = TaskBaseSchema.extend({
  planningAssigneeId: z.string().optional(),
  designAssigneeId: z.string().optional(),
  frontendAssigneeId: z.string().optional(),
  backendAssigneeId: z.string().optional(),
});

export const CreateTaskFormSchema = TaskFormBaseSchema.refine(
  taskDateRefine,
  {
    message: '종료일은 시작일보다 이후여야 합니다',
    path: ['endDate'],
  },
);

export type CreateTaskFormInput = z.infer<typeof CreateTaskFormSchema>;

export const UpdateTaskFormSchema = TaskFormBaseSchema.extend({
  status: TaskStatusSchema,
}).refine(taskDateRefine, {
  message: '종료일은 시작일보다 이후여야 합니다',
  path: ['endDate'],
});

export type UpdateTaskFormInput = z.infer<typeof UpdateTaskFormSchema>;
