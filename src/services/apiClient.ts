import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import type {
  User, Subscription, Payment, Post, AdminLog, Comment, MockTest, UserTestScore,
  Notebook, Vocabulary, NotebookVocabItem, Tip, AILesson, Report, TranslationHistory,
  UserUsage, Notification, Media, RefreshToken, BadgeLevel
} from '../types/entities';

// VITE_API_BASE_URL=http://localhost:8080/api/admin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/admin';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Refresh token flow helpers
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      if (token && prom.config.headers) prom.config.headers['Authorization'] = `Bearer ${token}`;
      prom.resolve(axios(prom.config));
    }
  });
  failedQueue = [];
};

// Attach Authorization header if token exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with refresh-token support
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError & { config?: AxiosRequestConfig }) => {
    const originalConfig = error.config as AxiosRequestConfig & { _retry?: boolean } | undefined;

    if (error.response && error.response.status === 401 && originalConfig && !originalConfig._retry) {
      const refreshToken = localStorage.getItem('admin_refresh_token');

      if (!refreshToken) {
        // No refresh token -> logout
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/auth';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalConfig });
        });
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const data = resp.data as { token: string; refreshToken?: string };
        const newToken = data.token;
        const newRefresh = data.refreshToken;

        if (newToken) {
          localStorage.setItem('admin_token', newToken);
          if (newRefresh) localStorage.setItem('admin_refresh_token', newRefresh);

          processQueue(null, newToken);

          if (originalConfig.headers) originalConfig.headers['Authorization'] = `Bearer ${newToken}`;
          return axios(originalConfig);
        }

        // No token in refresh response -> logout
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/auth';
        return Promise.reject(error);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      return Promise.reject(new Error((error.response.data as any)?.message || 'Có lỗi xảy ra từ server.'));
    }
    if (error.request) {
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại mạng.'));
    }

    return Promise.reject(new Error(error.message || 'Có lỗi xảy ra khi gửi yêu cầu.'));
  }
);

export { apiClient };

