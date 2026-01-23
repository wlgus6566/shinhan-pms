import useSWR from 'swr';
import { fetcher } from './fetcher';
import type {
  Project,
  GetProjectsParams,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../../types/project';

/**
 * 내가 속한 프로젝트 타입
 */
export interface MyProject extends Project {
  myRole: string;
  myWorkArea: string;
}

// ============================================================================
// Mutation Functions (POST/PATCH/DELETE)
// ============================================================================

/**
 * Create a new project
 * Only PM can create projects
 * Creator is automatically assigned as PM
 */
export async function createProject(
  data: CreateProjectRequest,
): Promise<Project> {
  return fetcher<Project>('/api/projects', {
    method: 'POST',
    body: data,
  });
}

/**
 * Update an existing project
 * Only PM/PL can update projects
 */
export async function updateProject(
  id: string | number,
  data: UpdateProjectRequest,
): Promise<Project> {
  return fetcher<Project>(`/api/projects/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * Delete a project (soft delete)
 * Only PM can delete projects
 */
export async function deleteProject(id: string | number): Promise<void> {
  return fetcher<void>(`/api/projects/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// SWR Hooks
// ============================================================================

/**
 * SWR hook for fetching projects list with optional filters
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
 * SWR hook for fetching a single project by ID
 * @param id - Project ID (null to skip fetching)
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

/**
 * SWR hook for fetching my projects
 */
export function useMyProjects() {
  const { data, error, isLoading, mutate } = useSWR<MyProject[]>(
    '/api/projects/my'
  );

  return {
    projects: data,
    isLoading,
    error,
    mutate,
  };
}
