import useSWR from 'swr';
import { fetcher } from './fetcher';

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

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export async function getUsers(params: any = {}): Promise<GetUsersResponse> {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      query.append(key, params[key]);
    }
  });

  return fetcher<GetUsersResponse>(`/api/users?${query.toString()}`);
}

export async function getUser(id: string | number): Promise<User> {
  return fetcher<User>(`/api/users/${id}`);
}

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
 * SWR hook for fetching users list with optional filters
 * @param params - Query parameters (search, page, limit, etc.)
 */
export function useUsers(params: any = {}) {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      query.append(key, params[key]);
    }
  });

  const url = `/api/users?${query.toString()}`;
  const { data, error, isLoading, mutate } = useSWR<GetUsersResponse>(url);

  return {
    users: data?.users,
    total: data?.total,
    page: data?.page,
    limit: data?.limit,
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
