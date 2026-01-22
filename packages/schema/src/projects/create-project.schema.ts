import { z } from 'zod';
import { ProjectTypeEnum } from '../common/enums';

export const CreateProjectSchema = z.object({
  projectName: z
    .string()
    .min(2, '프로젝트명은 2-100자 사이여야 합니다')
    .max(100, '프로젝트명은 2-100자 사이여야 합니다'),
  client: z
    .string()
    .max(100, '클라이언트는 최대 100자까지 입력 가능합니다')
    .optional(),
  projectType: ProjectTypeEnum,
  description: z
    .string()
    .max(1000, '설명은 최대 1000자까지 입력 가능합니다')
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '시작일은 YYYY-MM-DD 형식이어야 합니다')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '종료일은 YYYY-MM-DD 형식이어야 합니다')
    .optional(),
});

export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;
