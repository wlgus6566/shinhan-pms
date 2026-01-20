import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Token Manager (고급 버전 - 토큰 갱신 지원)
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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];
let isHandlingAuthError = false;

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
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
  (response) => response.data,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 Unauthorized 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 특정 에러 코드는 즉시 로그아웃
      const errorCode = error.response?.data?.code;
      if (
        ['ERR401_004', 'ERR401_005', 'ERR401_006', 'ERR401_999'].includes(
          errorCode
        )
      ) {
        if (isHandlingAuthError) {
          return Promise.reject(error.response?.data || error);
        }
        isHandlingAuthError = true;

        const errorMessages: Record<
          string,
          { title: string; message: string }
        > = {
          ERR401_004: {
            title: '중복 로그인',
            message: '다른 환경에서 접속되어 로그아웃되었습니다.',
          },
          ERR401_005: {
            title: '세션 만료',
            message: '장시간 미사용으로 자동 로그아웃되었습니다.',
          },
          ERR401_006: {
            title: '비밀번호 초기화',
            message: '비밀번호가 초기화되어 로그아웃되었습니다.',
          },
          ERR401_999: {
            title: '보안 경고',
            message: '비정상 접근이 감지되어 로그아웃됩니다.',
          },
        };

        const errorInfo = errorMessages[errorCode] || {
          title: '인증 오류',
          message: '다시 로그인해주세요.',
        };

        if (typeof window !== 'undefined') {
          alert(`${errorInfo.title}\n${errorInfo.message}`);
          tokenManager.clearTokens();
          window.location.href = '/';
        }

        setTimeout(() => {
          isHandlingAuthError = false;
        }, 1000);

        return Promise.reject(error.response?.data || error);
      }

      // 토큰 갱신 시도 (리프레시 토큰 API가 있는 경우)
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 API 호출 (백엔드에 해당 API가 있는 경우)
        // const response = await axios.post('/api/auth/refresh');
        // const newAccessToken = response.data.accessToken;

        // tokenManager.setAccessToken(newAccessToken);
        // processQueue(null, newAccessToken);

        // if (originalRequest.headers) {
        //   originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        // }
        // return apiClient(originalRequest);

        // 현재는 리프레시 토큰 API가 없으므로 로그아웃 처리
        throw new Error('토큰 갱신 불가');
      } catch (refreshError) {
        processQueue(refreshError, null);

        if (!isHandlingAuthError) {
          isHandlingAuthError = true;
          if (typeof window !== 'undefined') {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            tokenManager.clearTokens();
            window.location.href = '/';
          }
          setTimeout(() => {
            isHandlingAuthError = false;
          }, 1000);
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
        console.error('서버 오류:', error.response?.data);
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
