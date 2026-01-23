import useSWR from 'swr';
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
export async function getAvailableMembers(
  projectId: string | number,
  search?: string
): Promise<AvailableMember[]> {
  const query = new URLSearchParams({ excludeProject: projectId.toString() });
  if (search) {
    query.append('search', search);
  }
  const response = await fetcher<{ users: AvailableMember[] }>(`/api/users?${query.toString()}`);
  return response.users;
}

// ============================================================================
// SWR Hooks
// ============================================================================

/**
 * SWR hook for fetching project members
 * @param projectId - Project ID (null to skip fetching)
 */
export function useProjectMembers(projectId: string | number | null) {
  const { data, error, isLoading, mutate } = useSWR<ProjectMember[]>(
    projectId ? `/api/projects/${projectId}/members` : null
  );

  return {
    members: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching available members to add to a project
 * @param projectId - Project ID (null to skip fetching)
 * @param search - Optional search query
 */
export function useAvailableMembers(
  projectId: string | number | null,
  search?: string
) {
  let url: string | null = null;
  if (projectId) {
    const query = new URLSearchParams({ excludeProject: projectId.toString() });
    if (search) {
      query.append('search', search);
    }
    url = `/api/users?${query.toString()}`;
  }

  const { data, error, isLoading, mutate } = useSWR<{ users: AvailableMember[] }>(url);

  return {
    members: data?.users,
    isLoading,
    error,
    mutate,
  };
}
