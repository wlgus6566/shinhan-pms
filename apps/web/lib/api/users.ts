import useSWR from 'swr';
import { fetcher } from './fetcher';
import type { PaginatedData, CreateUserRequest } from '@repo/schema';
import {
  extractPagination,
  appendPaginationParams,
  buildQueryString,
  type PaginationParams,
} from './pagination';

export interface User {
  id: string | number;
  email: string;
  name: string;
  profileImage?: string;
  department: string;
  position: string;
  role: string;
  grade: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// Mutation Functions (POST/PATCH/DELETE)
// ============================================================================

export async function createUser(data: CreateUserRequest): Promise<User> {
  return fetcher<User>('/api/users', {
    method: 'POST',
    body: data,
  });
}

export async function updateUser(id: string | number, data: any): Promise<User> {
  return fetcher<User>(`/api/users/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

export async function deactivateUser(id: string | number): Promise<void> {
  return fetcher<void>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// SWR Hooks
// ============================================================================

/**
 * SWR hook for fetching users list with optional filters and pagination
 * @param params - Query parameters (search, pageNum, pageSize, etc.)
 */
export function useUsers(params: {
  search?: string;
  department?: string;
  role?: string;
  isActive?: boolean;
  excludeProject?: string;
} & PaginationParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.department) query.append('department', params.department);
  if (params.role) query.append('role', params.role);
  if (params.isActive !== undefined) query.append('isActive', String(params.isActive));
  if (params.excludeProject) query.append('excludeProject', params.excludeProject);
  appendPaginationParams(query, params);

  const url = `/api/users${buildQueryString(query)}`;
  const { data, error, isLoading, mutate } = useSWR<PaginatedData<User>>(url);

  return {
    users: data?.list,
    pagination: extractPagination(data),
    isLoading,
    error,
    mutate,
  };
}

/**
 * SWR hook for fetching a single user by ID
 * @param id - User ID (null to skip fetching)
 */
export function useUser(id: string | number | null) {
  const { data, error, isLoading, mutate } = useSWR<User>(
    id ? `/api/users/${id}` : null
  );

  return {
    user: data,
    isLoading,
    error,
    mutate,
  };
}

export interface UserProjectAssignment {
  id: string;
  projectId: string;
  projectName: string;
  projectType: string;
  status: string;
  client: string | null;
  role: string;
  workArea: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

/**
 * SWR hook for fetching a user's project assignments
 * @param userId - User ID (null to skip fetching)
 */
export function useUserProjects(userId: string | number | null) {
  const { data, error, isLoading } = useSWR<UserProjectAssignment[]>(
    userId ? `/api/users/${userId}/projects` : null
  );

  return {
    projects: data,
    isLoading,
    error,
  };
}
