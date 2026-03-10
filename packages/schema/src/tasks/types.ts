/**
 * Tasks - Response 타입 정의
 */

import { z } from 'zod';
import type { UserBasicInfo, UserDetailInfo } from '../common/types';
import { UserBasicInfoSchema, UserDetailInfoSchema, AuditFieldsSchema } from '../common/types';

// ============================================
// Task Response
// ============================================

export interface TaskAssigneeInfo extends UserDetailInfo {
  startDate?: string;
  endDate?: string;
}

export interface Task {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  difficulty: string;
  clientName?: string;
  taskTypeId?: string;
  taskType?: {
    id: string;
    name: string;
    description?: string;
  };
  planningAssignees?: TaskAssigneeInfo[];
  designAssignees?: TaskAssigneeInfo[];
  publishingAssignees?: TaskAssigneeInfo[];
  frontendAssignees?: TaskAssigneeInfo[];
  backendAssignees?: TaskAssigneeInfo[];
  status: string;
  startDate?: string;
  endDate?: string;
  openDates?: string[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export const TaskAssigneeInfoSchema = UserDetailInfoSchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const TaskSchema = z
  .object({
    id: z.string(),
    projectId: z.string(),
    taskName: z.string(),
    description: z.string().optional(),
    difficulty: z.string(),
    clientName: z.string().optional(),
    taskTypeId: z.string().optional(),
    taskType: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
    }).optional(),
    planningAssignees: z.array(TaskAssigneeInfoSchema).optional(),
    designAssignees: z.array(TaskAssigneeInfoSchema).optional(),
    publishingAssignees: z.array(TaskAssigneeInfoSchema).optional(),
    frontendAssignees: z.array(TaskAssigneeInfoSchema).optional(),
    backendAssignees: z.array(TaskAssigneeInfoSchema).optional(),
    status: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    openDates: z.array(z.string()).optional(),
    notes: z.string().optional(),
  })
  .merge(AuditFieldsSchema);
