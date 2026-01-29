/**
 * Tasks - Response 타입 정의
 */

import { z } from 'zod';
import type { UserBasicInfo, UserDetailInfo } from '../common/types';
import { UserBasicInfoSchema, UserDetailInfoSchema, AuditFieldsSchema } from '../common/types';

// ============================================
// Task Response
// ============================================

export interface Task {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  difficulty: string;
  clientName?: string;
  planningAssignees?: UserDetailInfo[];
  designAssignees?: UserDetailInfo[];
  frontendAssignees?: UserDetailInfo[];
  backendAssignees?: UserDetailInfo[];
  status: string;
  startDate?: string;
  endDate?: string;
  openDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export const TaskSchema = z
  .object({
    id: z.string(),
    projectId: z.string(),
    taskName: z.string(),
    description: z.string().optional(),
    difficulty: z.string(),
    clientName: z.string().optional(),
    planningAssignees: z.array(UserDetailInfoSchema).optional(),
    designAssignees: z.array(UserDetailInfoSchema).optional(),
    frontendAssignees: z.array(UserDetailInfoSchema).optional(),
    backendAssignees: z.array(UserDetailInfoSchema).optional(),
    status: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    openDate: z.string().optional(),
    notes: z.string().optional(),
  })
  .merge(AuditFieldsSchema);
