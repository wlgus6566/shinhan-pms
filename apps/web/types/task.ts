export type TaskDifficulty = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'HOLD';

export interface Task {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  difficulty: TaskDifficulty;
  clientName?: string;
  planningAssignee?: {
    id: string;
    name: string;
    email: string;
  };
  designAssignee?: {
    id: string;
    name: string;
    email: string;
  };
  frontendAssignee?: {
    id: string;
    name: string;
    email: string;
  };
  backendAssignee?: {
    id: string;
    name: string;
    email: string;
  };
  startDate?: string;
  endDate?: string;
  notes?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  taskName: string;
  description?: string;
  difficulty: TaskDifficulty;
  clientName?: string;
  planningAssigneeId?: number;
  designAssigneeId?: number;
  frontendAssigneeId?: number;
  backendAssigneeId?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus;
}
