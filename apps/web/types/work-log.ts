export interface WorkLogUser {
  id: string;
  name: string;
  email: string;
}

export interface WorkLogTask {
  id: string;
  taskName: string;
  projectId: string;
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

export interface CreateWorkLogRequest {
  workDate: string;
  content: string;
  workHours?: number;
  progress?: number;
  issues?: string;
}

export interface UpdateWorkLogRequest {
  workDate?: string;
  content?: string;
  workHours?: number;
  progress?: number;
  issues?: string;
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
