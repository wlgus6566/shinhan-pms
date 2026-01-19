// Project status enum
export type ProjectStatus = 'PENDING' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

// Project role enum
export type ProjectRole = 'PM' | 'PL' | 'PA';

// User role enum (system-wide)
export type UserRole = 'ADMIN' | 'USER';

// Department enum
export type Department = 'PLANNING' | 'DESIGN' | 'DEVELOPMENT' | 'OPERATION';

// Work area enum (프로젝트 내 담당 분야)
export type WorkArea = 'PLANNING' | 'DESIGN' | 'FRONTEND' | 'BACKEND';

// Project interface
export interface Project {
  id: number;
  name: string;
  description?: string | null;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: ProjectStatus;
  progress: number; // 0-100
  creatorId: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// Project member interface
export interface ProjectMember {
  id: number;
  projectId: number;
  memberId: number;
  role: ProjectRole;
  workArea: WorkArea;
  member?: {
    id: number;
    name: string;
    email: string;
    department: Department;
    role: UserRole;
  };
  createdAt: string;
  updatedAt: string;
}

// API request/response types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  progress: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  progress?: number;
}

export interface GetProjectsParams {
  search?: string;
  status?: ProjectStatus;
}

export interface AddProjectMemberRequest {
  memberId: number;
  role: ProjectRole;
  workArea: WorkArea;
}

export interface UpdateProjectMemberRoleRequest {
  role: ProjectRole;
  workArea?: WorkArea;
}

// Available member (not yet in project)
export interface AvailableMember {
  id: number;
  name: string;
  email: string;
  department: Department;
  role: UserRole;
}
