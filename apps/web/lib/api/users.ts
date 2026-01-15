import { fetchApi } from './client';

export async function getUsers(params: any = {}) {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      query.append(key, params[key]);
    }
  });
  
  return fetchApi(`/api/users?${query.toString()}`);
}

export async function getUser(id: string | number) {
  return fetchApi(`/api/users/${id}`);
}

export async function updateUser(id: string | number, data: any) {
  return fetchApi(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deactivateUser(id: string | number) {
  return fetchApi(`/api/users/${id}`, {
    method: 'DELETE',
  });
}
