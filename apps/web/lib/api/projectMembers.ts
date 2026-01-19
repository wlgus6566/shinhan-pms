import { fetcher } from './fetcher';
import type {
  ProjectMember,
  AvailableMember,
  AddProjectMemberRequest,
  UpdateProjectMemberRoleRequest,
} from '../../types/project';

/**
 * Get all members of a project
 */
export async function getProjectMembers(projectId: string | number): Promise<ProjectMember[]> {
  return fetcher<ProjectMember[]>(`/api/projects/${projectId}/members`);
}

/**
 * Add a member to a project
 * Only PM/PL can add members
 */
export async function addProjectMember(
  projectId: string | number,
  data: AddProjectMemberRequest
): Promise<ProjectMember> {
  return fetcher<ProjectMember>(`/api/projects/${projectId}/members`, {
    method: 'POST',
    body: data,
  });
}

/**
 * Update a project member's role
 * Only PM/PL can update roles
 */
export async function updateProjectMemberRole(
  projectId: string | number,
  memberId: string | number,
  data: UpdateProjectMemberRoleRequest
): Promise<ProjectMember> {
  return fetcher<ProjectMember>(`/api/projects/${projectId}/members/${memberId}`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * Remove a member from a project
 * Only PM/PL can remove members
 * Cannot remove creator or self
 */
export async function removeProjectMember(
  projectId: string | number,
  memberId: string | number
): Promise<void> {
  return fetcher<void>(`/api/projects/${projectId}/members/${memberId}`, {
    method: 'DELETE',
  });
}

/**
 * Get available members (not yet in the project)
 * Used for adding new members
 */
export async function getAvailableMembers(projectId: string | number): Promise<AvailableMember[]> {
  return fetcher<AvailableMember[]>(`/api/members?excludeProject=${projectId}`);
}
