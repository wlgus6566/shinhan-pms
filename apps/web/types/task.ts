export type TaskDifficulty = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus =
  | 'WAITING'           // 작업 대기
  | 'IN_PROGRESS'       // 작업 중
  | 'WORK_COMPLETED'    // 작업 완료
  | 'OPEN_WAITING'      // 오픈 대기
  | 'OPEN_RESPONDING'   // 오픈 대응
  | 'OPEN_COMPLETED';        // 오픈 완료

// 한글 라벨 매핑
export const STATUS_LABELS: Record<TaskStatus, string> = {
  WAITING: '작업 대기',
  IN_PROGRESS: '작업 중',
  WORK_COMPLETED: '작업 완료',
  OPEN_WAITING: '오픈 대기',
  OPEN_RESPONDING: '오픈 대응',
  OPEN_COMPLETED: '오픈 완료',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  // 내부 작업 흐름
  WAITING: 'bg-gray-100 text-gray-700 border-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-300',
  WORK_COMPLETED: 'bg-green-100 text-green-700 border-green-300',

  // 오픈 이슈 흐름
  OPEN_WAITING: 'bg-amber-100 text-amber-800 border-amber-300',
  OPEN_RESPONDING: 'bg-orange-100 text-orange-800 border-orange-300',
  OPEN_COMPLETED: 'bg-green-50 text-green-700 border-green-300',
};

// 중요도 라벨 매핑
export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

// 중요도별 색상
export const DIFFICULTY_COLORS: Record<TaskDifficulty, string> = {
  HIGH: 'bg-rose-50 text-rose-700 border-rose-300',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-300',
  LOW: 'bg-green-100 text-green-700 border-green-300',
};

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
