import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import type { User, GetUsersResponse, CreateUserRequest } from '@/lib/api/users';

/**
 * 사용자 목록 조회 hook
 */
export function useUsers(params: any = {}) {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      query.append(key, params[key]);
    }
  });

  const queryString = query.toString();
  const url = `/api/users${queryString ? `?${queryString}` : ''}`;

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
 * 단일 사용자 조회 hook
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

/**
 * 사용자 생성
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
  return fetcher<User>('/api/users', {
    method: 'POST',
    body: data,
  });
}

/**
 * 사용자 수정
 */
export async function updateUser(id: string | number, data: any): Promise<User> {
  return fetcher<User>(`/api/users/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * 사용자 비활성화
 */
export async function deactivateUser(id: string | number): Promise<void> {
  return fetcher<void>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}
