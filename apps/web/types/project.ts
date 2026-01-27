// ============================================
// Re-export Response types from @repo/schema
// ============================================

export type {
  Project,
  ProjectMember,
  MyProject,
  AvailableMember,
  User,
} from '@repo/schema';

// ============================================
// Re-export Enums from @repo/schema
// ============================================

export type {
  ProjectType,
  ProjectStatus,
  MemberRole as ProjectRole,
  WorkArea,
  Department,
  UserRole,
} from '@repo/schema';

// ============================================
// Re-export Request types from @repo/schema
// ============================================

export type {
  CreateProjectRequest,
  UpdateProjectRequest,
  AddProjectMemberRequest,
  UpdateProjectMemberRoleRequest,
} from '@repo/schema';

// ============================================
// UI-specific types (not in @repo/schema)
// ============================================

export interface GetProjectsParams {
  search?: string;
  status?: string;
}
