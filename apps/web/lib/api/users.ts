import useSWR from 'swr';
import { fetcher } from './fetcher';
import type { PaginatedData } from '@repo/schema';
import {
  extractPagination,
  appendPaginationParams,
  buildQueryString,
  type PaginationParams,
} from './pagination';

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  profileImage?: string;
  department: string;
  role: string;
}

export interface User {
  id: string | number;
  email: string;
  name: string;
  profileImage?: string;
  department: string;
  role: string;
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
