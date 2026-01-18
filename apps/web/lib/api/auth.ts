import { fetchApi } from './client';

export async function login(data: any) {
  const result = await fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (result.accessToken) {
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('user', JSON.stringify(result.user));
  }
  
  return result;
}

export async function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  // Optional: call logout API if exists
}

export async function getMe() {
  return fetchApi('/api/auth/me');
}

export async function updateMe(data: any) {
  return fetchApi('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function changePassword(data: any) {
  return fetchApi('/api/auth/me/password', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
