import { z } from 'zod';
import {
  ProjectRoleSchema,
  ProjectStatusSchema,
  WorkAreaSchema,
} from './enums.js';

const projectNameSchema = z
  .string()
  .min(2, '프로젝트명은 최소 2자 이상이어야 합니다')
  .max(100, '프로젝트명은 최대 100자까지 입력할 수 있습니다');

const projectTypeSchema = z.enum(['OPERATION', 'BUILD']);

const dateSchema = z.string().min(1, '날짜를 선택하세요');

const projectDateRefine = (data: { startDate?: string; endDate?: string }) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
};

const ProjectBaseSchema = z.object({
  projectName: projectNameSchema,
  client: z
    .string()
    .max(100, '클라이언트는 최대 100자까지 입력할 수 있습니다')
    .optional(),
  projectType: projectTypeSchema,
  description: z
    .string()
    .max(1000, '설명은 최대 1000자까지 입력할 수 있습니다')
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const CreateProjectSchema = ProjectBaseSchema.refine(projectDateRefine, {
  message: '종료일은 시작일 이후여야 합니다',
  path: ['endDate'],
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = ProjectBaseSchema.partial()
  .extend({
    status: ProjectStatusSchema.optional(),
  })
  .refine(projectDateRefine, {
    message: '종료일은 시작일 이후여야 합니다',
    path: ['endDate'],
  });

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

export const ProjectFormSchema = z
  .object({
    name: projectNameSchema,
    client: z.string().max(100, '클라이언트는 최대 100자까지 입력할 수 있습니다').optional(),
    projectType: projectTypeSchema,
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine(projectDateRefine, {
    message: '종료일은 시작일 이후여야 합니다',
    path: ['endDate'],
  });

export type ProjectFormInput = z.infer<typeof ProjectFormSchema>;

export const AddProjectMemberSchema = z.object({
  memberId: z.number().min(1, '멤버를 선택하세요'),
  role: ProjectRoleSchema,
  workArea: WorkAreaSchema,
  notes: z.string().optional(),
});

export type AddProjectMemberInput = z.infer<typeof AddProjectMemberSchema>;

export const UpdateProjectMemberRoleSchema = z.object({
  role: ProjectRoleSchema,
  workArea: WorkAreaSchema.optional(),
  notes: z.string().optional(),
});

export type UpdateProjectMemberRoleInput = z.infer<
  typeof UpdateProjectMemberRoleSchema
>;
