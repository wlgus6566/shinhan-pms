import useSWR from 'swr';
import { fetcher } from './fetcher';
import type {
  PaginatedData,
  ProjectTaskType,
  CreateProjectTaskTypeRequest,
  UpdateProjectTaskTypeRequest,
} from '@repo/schema';
import type {
  Project,
  GetProjectsParams,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../../types/project';
import {
  extractPagination,
  appendPaginationParams,
  buildQueryString,
  type PaginationParams,
} from './pagination';

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
 * SWR hook for fetching projects list with optional filters and pagination
 */
export function useProjects(params: GetProjectsParams & PaginationParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  appendPaginationParams(query, params);

  const url = `/api/projects${buildQueryString(query)}`;
  const { data, error, isLoading, mutate } = useSWR<PaginatedData<Project>>(url);

  return {
    projects: data?.list,
    pagination: extractPagination(data),
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
 * SWR hook for fetching my projects with pagination
 */
export function useMyProjects(params: PaginationParams = {}) {
  const query = new URLSearchParams();
  appendPaginationParams(query, params);

  const url = `/api/projects/my${buildQueryString(query)}`;
  const { data, error, isLoading, mutate } = useSWR<PaginatedData<MyProject>>(url);

  return {
    projects: data?.list,
    pagination: extractPagination(data),
    isLoading,
    error,
    mutate,
  };
}

// ============================================================================
// Project Task Types
// ============================================================================

/**
 * 프로젝트 업무 구분 생성
 * PM만 가능
 */
export async function createProjectTaskType(
  projectId: string,
  data: CreateProjectTaskTypeRequest,
): Promise<ProjectTaskType> {
  return fetcher<ProjectTaskType>(`/api/projects/${projectId}/task-types`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 프로젝트 업무 구분 수정
 * PM만 가능
 */
export async function updateProjectTaskType(
  projectId: string,
  id: string,
  data: UpdateProjectTaskTypeRequest,
): Promise<ProjectTaskType> {
  return fetcher<ProjectTaskType>(`/api/projects/${projectId}/task-types/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * 프로젝트 업무 구분 삭제 (soft delete)
 * PM만 가능
 */
export async function deleteProjectTaskType(
  projectId: string,
  id: string,
): Promise<void> {
  return fetcher<void>(`/api/projects/${projectId}/task-types/${id}`, {
    method: 'DELETE',
  });
}

/**
 * SWR hook for fetching project task types with pagination
 * @param projectId - Project ID (null to skip fetching)
 * @param params - Pagination parameters
 */
export function useProjectTaskTypes(
  projectId: string | null,
  params: PaginationParams = {},
) {
  const query = new URLSearchParams();
  appendPaginationParams(query, params);

  const url = projectId ? `/api/projects/${projectId}/task-types${buildQueryString(query)}` : null;
  const { data, error, isLoading, mutate, isValidating } = useSWR<PaginatedData<ProjectTaskType>>(url);

  return {
    taskTypes: data?.list,
    pagination: extractPagination(data),
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
