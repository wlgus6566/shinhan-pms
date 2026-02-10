import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { toast } from 'sonner';

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
  withCredentials: true, // Enable sending cookies
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

// Mutation 메서드별 성공 메시지
const MUTATION_SUCCESS_MESSAGES: Record<string, string> = {
  POST: '저장되었습니다',
  PATCH: '수정되었습니다',
  PUT: '수정되었습니다',
  DELETE: '삭제되었습니다',
};

// Toast를 표시하지 않을 URL 패턴
const SILENT_URL_PATTERNS = ['/auth/', '/export'];

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Mutation 성공 시 toast 표시
    const method = response.config.method?.toUpperCase();
    const url = response.config.url || '';
    const isSilent = SILENT_URL_PATTERNS.some((p) => url.includes(p));

    if (method && method in MUTATION_SUCCESS_MESSAGES && !isSilent) {
      toast.success(MUTATION_SUCCESS_MESSAGES[method]);
    }

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

      try {
        // Refresh Token으로 새 토큰 발급 (cookie에서 자동으로 전송됨)
        console.log('[Token Refresh] Attempting to refresh access token...');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/refresh`,
          {}, // Empty body
          { withCredentials: true } // Send cookies
        );

        console.log('[Token Refresh] Response:', response.data);

        const { accessToken } = response.data.data || response.data;

        if (!accessToken) {
          throw new Error('No access token received from refresh endpoint');
        }

        // 새 access token 저장 (refresh token은 쿠키로 자동 관리됨)
        tokenManager.setAccessToken(accessToken);

        console.log('[Token Refresh] Success - token updated');

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
      toast.error('접근 권한이 없습니다');
      return Promise.reject(error.response?.data || error);
    }

    // 500 Server Error 처리
    if (error.response?.status === 500) {
      toast.error('서버 오류가 발생했습니다');
      return Promise.reject(error.response?.data || error);
    }

    // 기타 에러 (400, 404, 409 등)
    const errorMessage = error.response?.data?.message;
    if (errorMessage && typeof errorMessage === 'string') {
      toast.error(errorMessage);
    } else if (error.response?.status) {
      toast.error('요청 처리 중 오류가 발생했습니다');
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
