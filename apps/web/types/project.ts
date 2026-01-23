import type {
  ProjectType,
  MemberRole,
  WorkArea,
  CreateProjectRequest,
  UpdateProjectRequest,
  AddProjectMemberRequest,
  UpdateProjectMemberRoleRequest,
} from '@repo/schema';

// Re-export schema types
export type { ProjectType, WorkArea };
export type ProjectRole = MemberRole;

// Project status enum (extended for UI)
export type ProjectStatus = 'PENDING' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

// User role enum (system-wide)
export type UserRole = 'ADMIN' | 'USER';

// Department enum
export type Department = 'PLANNING' | 'DESIGN' | 'DEVELOPMENT' | 'OPERATION';

// Project interface
export interface Project {
  id: number;
  name: string;
  client?: string | null;
  projectType: ProjectType;
  description?: string | null;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: ProjectStatus;
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
  notes?: string;
  member?: {
    id: number;
    name: string;
    email: string;
    department: Department;
    position?: string;
    role: UserRole;
  };
  createdAt: string;
  updatedAt: string;
}

// Re-export request types from schema
export type {
  CreateProjectRequest,
  UpdateProjectRequest,
  AddProjectMemberRequest,
  UpdateProjectMemberRoleRequest,
};

// UI-specific request types
export interface GetProjectsParams {
  search?: string;
  status?: ProjectStatus;
}

// Available member (not yet in project)
export interface AvailableMember {
  id: number;
  name: string;
  email: string;
  department: Department;
  role: UserRole;
}
