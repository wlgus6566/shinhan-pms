import { fetcher } from './fetcher';
import type {
  Project,
  GetProjectsParams,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../../types/project';

/**
 * Get all projects with optional filters
 */
export async function getProjects(params: GetProjectsParams = {}): Promise<Project[]> {
  const query = new URLSearchParams();
  
  if (params.search) {
    query.append('search', params.search);
  }
  
  if (params.status) {
    query.append('status', params.status);
  }
  
  const queryString = query.toString();
  return fetcher<Project[]>(`/api/projects${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string | number): Promise<Project> {
  return fetcher<Project>(`/api/projects/${id}`);
}

/**
 * Create a new project
 * Only PM can create projects
 * Creator is automatically assigned as PM
 */
export async function createProject(data: CreateProjectRequest): Promise<Project> {
  const { name, ...rest } = data;
  return fetcher<Project>('/api/projects', {
    method: 'POST',
    body: {
      ...rest,
      projectName: name,
    },
  });
}

/**
 * Update an existing project
 * Only PM/PL can update projects
 */
export async function updateProject(
  id: string | number,
  data: UpdateProjectRequest
): Promise<Project> {
  const { name, ...rest } = data;
  return fetcher<Project>(`/api/projects/${id}`, {
    method: 'PATCH',
    body: {
      ...rest,
      ...(name && { projectName: name }),
    },
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
