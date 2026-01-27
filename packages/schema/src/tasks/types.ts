/**
 * Tasks - Response 타입 정의
 */

import type { UserBasicInfo } from '../common/types';

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
  planningAssignees?: UserBasicInfo[];
  designAssignees?: UserBasicInfo[];
  frontendAssignees?: UserBasicInfo[];
  backendAssignees?: UserBasicInfo[];
  status: string;
  startDate?: string;
  endDate?: string;
  openDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
