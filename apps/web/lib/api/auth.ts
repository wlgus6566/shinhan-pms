import { fetcher, tokenManager } from './fetcher';
import type { User, ChangePasswordRequest } from '@repo/schema';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const result = await fetcher<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: data,
  });

  if (result.accessToken) {
    tokenManager.setAccessToken(result.accessToken);
    tokenManager.setRefreshToken(result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.user));
  }

  return result;
}

export async function logout(): Promise<void> {
  try {
    // Call logout API to invalidate refresh token
    await fetcher('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    // Ignore errors - clear tokens anyway
    console.error('Logout API error:', error);
  } finally {
    tokenManager.clearTokens();
  }
}

export async function getMe() {
  return fetcher('/api/auth/me');
}

export async function updateMe(data: any) {
  return fetcher('/api/auth/me', {
    method: 'PATCH',
    body: data,
  });
}

export async function changePassword(data: ChangePasswordRequest) {
  return fetcher('/api/auth/me/password', {
    method: 'PATCH',
    body: data,
  });
}
