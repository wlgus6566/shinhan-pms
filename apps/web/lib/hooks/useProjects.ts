import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import type {
  Project,
  GetProjectsParams,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/types/project';

/**
 * 프로젝트 목록 조회 hook
 */
export function useProjects(params: GetProjectsParams = {}) {
  const query = new URLSearchParams();

  if (params.search) {
    query.append('search', params.search);
  }

  if (params.status) {
    query.append('status', params.status);
  }

  const queryString = query.toString();
  const url = `/api/projects${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<Project[]>(url);

  return {
    projects: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 단일 프로젝트 조회 hook
 */
export function useProject(id: string | number | null) {
  const { data, error, isLoading, mutate } = useSWR<Project>(
    id ? `/api/projects/${id}` : null
  );

  return {
    project: data,
    isLoading,
    error,
    mutate,
  };
}
