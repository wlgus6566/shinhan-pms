import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import type {
  ProjectMember,
  AvailableMember,
  AddProjectMemberRequest,
  UpdateProjectMemberRoleRequest,
} from '@/types/project';

/**
 * 프로젝트 멤버 목록 조회 hook
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
 * 사용 가능한 멤버 목록 조회 hook
 */
export function useAvailableMembers(projectId: string | number | null) {
  const { data, error, isLoading, mutate } = useSWR<AvailableMember[]>(
    projectId ? `/api/members?excludeProject=${projectId}` : null
  );

  return {
    availableMembers: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 프로젝트 멤버 추가
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
 * 프로젝트 멤버 역할 수정
 */
export async function updateProjectMemberRole(
  projectId: string | number,
  memberId: string | number,
  data: UpdateProjectMemberRoleRequest
): Promise<ProjectMember> {
  return fetcher<ProjectMember>(
    `/api/projects/${projectId}/members/${memberId}`,
    {
      method: 'PATCH',
      body: data,
    }
  );
}

/**
 * 프로젝트 멤버 제거
 */
export async function removeProjectMember(
  projectId: string | number,
  memberId: string | number
): Promise<void> {
  return fetcher<void>(`/api/projects/${projectId}/members/${memberId}`, {
    method: 'DELETE',
  });
}
