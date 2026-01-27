/**
 * Work Logs - Response 타입 정의
 */

import type { TaskBasicInfo, ProjectBasicInfo } from '../common/types';

// ============================================
// Work Log User (중첩 객체)
// ============================================

export interface WorkLogUser {
  id: string;
  name: string;
  email: string;
}

// ============================================
// Work Log Task (중첩 객체)
// ============================================

export interface WorkLogTask extends TaskBasicInfo {}

// ============================================
// Work Log Response
// ============================================

export interface WorkLog {
  id: string;
  taskId: string;
  userId: string;
  workDate: string;
  content: string;
  workHours?: number | null;
  progress?: number | null;
  issues?: string | null;
  task?: WorkLogTask;
  user?: WorkLogUser;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// My Task Response (업무일지 등록용)
// ============================================

export interface MyTask {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  difficulty: string;
  status: string;
  startDate?: string;
  endDate?: string;
  project?: ProjectBasicInfo;
}
