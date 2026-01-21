import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Token Manager
export const tokenManager = {
  setAccessToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  },

  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },
};

// API Client
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isHandlingAuthError = false;

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<any>) => {

    // 401 Unauthorized 처리
    if (error.response?.status === 401) {
      // 중복 처리 방지
      if (isHandlingAuthError) {
        return Promise.reject(error.response?.data || error);
      }
      isHandlingAuthError = true;

      // 토큰 제거 및 로그아웃 처리
      tokenManager.clearTokens();

      // 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }

      // 플래그 리셋
      setTimeout(() => {
        isHandlingAuthError = false;
      }, 1000);

      return Promise.reject(error.response?.data || error);
    }

    // 403 Forbidden 처리
    if (error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        alert('접근 권한이 없습니다.');
      }
      return Promise.reject(error.response?.data || error);
    }

    // 500 Server Error 처리
    if (error.response?.status === 500) {
      if (typeof window !== 'undefined') {
        console.error('서버 오류가 발생했습니다:', error.response?.data);
      }
      return Promise.reject(error.response?.data || error);
    }

    return Promise.reject(error.response?.data || error);
  }
);

// Fetcher 함수
interface FetcherOptions extends Omit<AxiosRequestConfig, 'method' | 'data'> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
}

export const fetcher = async <T = any>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> => {
  const { method = 'GET', body, ...config } = options;
  const upperMethod = method.toUpperCase();

  try {
    // interceptor에서 이미 response.data를 반환하므로 그대로 반환
    if (upperMethod === 'GET' || upperMethod === 'DELETE') {
      return await apiClient[upperMethod.toLowerCase() as 'get' | 'delete']<T>(
        url,
        config
      ) as any as T;
    } else {
      return await apiClient[
        upperMethod.toLowerCase() as 'post' | 'put' | 'patch'
      ]<T>(url, body, config) as any as T;
    }
  } catch (error) {
    throw error;
  }
};

export default apiClient;
