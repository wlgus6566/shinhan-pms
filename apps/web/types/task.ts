export type TaskDifficulty = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus =
  | 'WAITING'           // 작업 대기
  | 'IN_PROGRESS'       // 작업 중
  | 'WORK_COMPLETED'    // 작업 완료
  | 'OPEN_WAITING'      // 오픈 대기
  | 'OPEN_RESPONDING'   // 오픈 대응
  | 'COMPLETED';        // 완료

// 한글 라벨 매핑
export const STATUS_LABELS: Record<TaskStatus, string> = {
  WAITING: '작업 대기',
  IN_PROGRESS: '작업 중',
  WORK_COMPLETED: '작업 완료',
  OPEN_WAITING: '오픈 대기',
  OPEN_RESPONDING: '오픈 대응',
  COMPLETED: '완료',
};

// 상태별 색상 (Badge 클래스)
export const STATUS_COLORS: Record<TaskStatus, string> = {
  WAITING: 'bg-gray-100 text-gray-700 border-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-300',
  WORK_COMPLETED: 'bg-green-100 text-green-700 border-green-300',
  OPEN_WAITING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  OPEN_RESPONDING: 'bg-orange-100 text-orange-700 border-orange-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
};

// 중요도 라벨 매핑
export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

// 중요도별 색상
export const DIFFICULTY_COLORS: Record<TaskDifficulty, string> = {
  HIGH: 'bg-red-100 text-red-700 border-red-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
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
