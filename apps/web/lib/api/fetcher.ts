import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { z } from 'zod';

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

  setRefreshToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  },

  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
  (response) => {
    const apiResponse = response.data;
    // 새 응답 구조: { code, message, data }
    if (apiResponse && typeof apiResponse === 'object' && 'code' in apiResponse && 'data' in apiResponse) {
      return apiResponse.data;
    }
    // 하위 호환
    return apiResponse;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as any;

    // 로그인/리프레시 요청은 401 처리 건너뜀
    const isLoginRequest = originalRequest?.url?.includes('/api/auth/login');
    const isRefreshRequest = originalRequest?.url?.includes('/api/auth/refresh');

    // 401 Unauthorized 처리
    if (error.response?.status === 401 && !isLoginRequest && !isRefreshRequest) {
      if (isRefreshing) {
        // 이미 갱신 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        // Refresh Token이 없으면 로그아웃
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return Promise.reject(error.response?.data || error);
      }

      try {
        // Refresh Token으로 새 토큰 발급
        console.log('[Token Refresh] Attempting to refresh access token...');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/refresh`,
          { refreshToken }
        );

        console.log('[Token Refresh] Response:', response.data);

        const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;

        if (!accessToken) {
          throw new Error('No access token received from refresh endpoint');
        }

        // 새 토큰 저장
        tokenManager.setAccessToken(accessToken);
        if (newRefreshToken) {
          tokenManager.setRefreshToken(newRefreshToken);
        }

        console.log('[Token Refresh] Success - tokens updated');

        // 대기 중인 요청들 재시도
        processQueue(null, accessToken);

        // 원래 요청 재시도
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        // Refresh Token도 만료됨 - 로그아웃
        console.error('[Token Refresh] Failed:', refreshError.response?.data || refreshError.message);
        processQueue(refreshError, null);
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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

// Validated Fetcher with Zod runtime validation
export const validatedFetcher = async <T>(
  url: string,
  schema: z.ZodType<T>,
  options: FetcherOptions = {}
): Promise<T> => {
  const data = await fetcher(url, options);
  return schema.parse(data);
};

export default apiClient;
