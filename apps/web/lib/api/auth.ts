import type {
  ChangePasswordInput,
  LoginInput,
  UpdateProfileInput,
} from '@repo/schema';
import { fetcher, tokenManager } from './fetcher';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string | number;
    email: string;
    name: string;
    role: string;
    department: string;
  };
}

export async function login(data: LoginInput): Promise<LoginResponse> {
  const result = await fetcher<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: data,
  });
  
  if (result.accessToken) {
    tokenManager.setAccessToken(result.accessToken);
    localStorage.setItem('user', JSON.stringify(result.user));
  }
  
  return result;
}

export async function logout(): Promise<void> {
  tokenManager.clearTokens();
  // Optional: call logout API if exists
}

export async function getMe() {
  return fetcher('/api/auth/me');
}

export async function updateMe(data: UpdateProfileInput) {
  return fetcher('/api/auth/me', {
    method: 'PATCH',
    body: data,
  });
}

export async function changePassword(data: ChangePasswordInput) {
  return fetcher('/api/auth/me/password', {
    method: 'PATCH',
    body: data,
  });
}
