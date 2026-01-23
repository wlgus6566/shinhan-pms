import type { TaskStatus, TaskDifficulty } from './task';
import type { CreateWorkLogRequest, UpdateWorkLogRequest } from '@repo/schema';

// Re-export request types from schema
export type { CreateWorkLogRequest, UpdateWorkLogRequest };

export interface WorkLogUser {
  id: string;
  name: string;
  email: string;
}

export interface WorkLogTask {
  id: string;
  taskName: string;
  projectId: string;
  status?: TaskStatus;
  difficulty?: TaskDifficulty;
}

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

export interface MyTask {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  difficulty: string;
  status: string;
  startDate?: string;
  endDate?: string;
  project?: {
    id: string;
    projectName: string;
    
  };
}
