/**
 * Projects - Response 타입 정의
 */

import type { UserBasicInfo, UserDetailInfo } from '../common/types';

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
