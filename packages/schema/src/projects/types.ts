/**
 * Projects - Response 타입 정의
 */

import { z } from 'zod';
import type { UserBasicInfo, UserDetailInfo } from '../common/types';
import {
  UserBasicInfoSchema,
  UserDetailInfoSchema,
  AuditFieldsSchema,
} from '../common/types';

// ============================================
// Project Response
// ============================================

export interface Project {
  id: string;
  name: string;
  client?: string | null;
  projectType: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  status: string;
  creatorId?: string;
  creator?: UserBasicInfo;
  createdAt: string;
  updatedAt?: string;
}

export const ProjectSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    client: z.string().nullable().optional(),
    projectType: z.string(),
    description: z.string().nullable().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string(),
    creatorId: z.string().optional(),
    creator: UserBasicInfoSchema.optional(),
  })
  .merge(AuditFieldsSchema);

// ============================================
// Project Member Response
// ============================================

export interface ProjectMember {
  id: string;
  projectId: string;
  memberId: string;
  role: string;
  workArea: string;
  notes?: string;
  member?: UserDetailInfo;
  createdAt: string;
  updatedAt?: string;
}

export const ProjectMemberSchema = z
  .object({
    id: z.string(),
    projectId: z.string(),
    memberId: z.string(),
    role: z.string(),
    workArea: z.string(),
    notes: z.string().optional(),
    member: UserDetailInfoSchema.optional(),
  })
  .merge(AuditFieldsSchema);

// ============================================
// My Project Response (대시보드용)
// ============================================

export interface MyProject {
  id: string;
  name: string;
  projectType: string;
  status: string;
  role: string;
  workArea: string;
  startDate?: string;
  endDate?: string;
}

export const MyProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  projectType: z.string(),
  status: z.string(),
  role: z.string(),
  workArea: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
