/**
 * 공통 Response 타입 정의
 * Frontend-Backend 간 타입 계약 (BigInt → JSON → string 변환 반영)
 */

import { z } from 'zod';

// ============================================
// 기본 멤버 정보 (중첩 객체용)
// ============================================

export interface UserBasicInfo {
  id: string;
  name: string;
  email: string;
}

export const UserBasicInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export interface UserDetailInfo extends UserBasicInfo {
  department: string;
  position?: string;
  role: string;
}

export const UserDetailInfoSchema = UserBasicInfoSchema.extend({
  department: z.string(),
  position: z.string().optional(),
  role: z.string(),
});

// ============================================
// 프로젝트/업무 기본 정보 (중첩 객체용)
// ============================================

export interface ProjectBasicInfo {
  id: string;
  projectName: string;
}

export const ProjectBasicInfoSchema = z.object({
  id: z.string(),
  projectName: z.string(),
});

export interface TaskBasicInfo {
  id: string;
  taskName: string;
  projectId: string;
  status?: string;
  difficulty?: string;
}

export const TaskBasicInfoSchema = z.object({
  id: z.string(),
  taskName: z.string(),
  projectId: z.string(),
  status: z.string().optional(),
  difficulty: z.string().optional(),
});

// ============================================
// 공통 컬럼 스키마 (모든 Response에서 재사용)
// ============================================

export const AuditFieldsSchema = z.object({
  createdAt: z.string(), // ISO 8601 string
  updatedAt: z.string().optional(),
});
