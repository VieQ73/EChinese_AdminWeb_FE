// services/apiClient.ts

// Đọc base URL của API thật từ biến môi trường.
// File .env ở gốc dự án có thể chứa: VITE_API_BASE_URL=http://localhost:5000/api
// Mặc định sử dụng http://localhost:5000/api nếu không được cấu hình để phù hợp yêu cầu người dùng.
//  Cast import.meta to any to resolve TypeScript error regarding 'env' property,
// as the vite/client types are not available in this context.
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Khóa lưu trữ token trong localStorage
const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Biến toàn cục để đồng bộ làm mới token, tránh gọi lặp.
let refreshPromise: Promise<{ token: string; refreshToken?: string }> | null = null;

function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function setTokens(token?: string, refreshToken?: string) {
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    // ignore
  }
}

function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

async function refreshTokenIfNeeded(): Promise<string> {
  // Nếu đã có một yêu cầu refresh đang diễn ra, chờ nó xong.
  if (refreshPromise) {
    const res = await refreshPromise;
    return res.token;
  }

  const currentRefresh = getRefreshToken();
  if (!currentRefresh) {
    throw new Error('Missing refresh token');
  }

  // Tạo yêu cầu refresh mới
  refreshPromise = (async () => {
    const resp = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: currentRefresh }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      const msg = data?.message || 'Refresh token failed';
      throw new Error(msg);
    }

    // Hỗ trợ cả trường hợp API trả về chỉ token hoặc cả refreshToken
    const newToken: string | undefined = data.token;
    const newRefreshToken: string | undefined = data.refreshToken || data.refresh_token;
    if (!newToken) {
      throw new Error('Refresh response missing token');
    }
    setTokens(newToken, newRefreshToken);
    return { token: newToken, refreshToken: newRefreshToken };
  })();

  try {
    const res = await refreshPromise;
    return res.token;
  } finally {
    // Reset để lần sau có thể refresh tiếp nếu cần
    refreshPromise = null;
  }
}

/**
 * Một hàm client fetch chung, có khả năng xử lý body, headers và các cấu hình khác.
 * - Tự động gắn Authorization header nếu có token.
 * - Khi gặp lỗi "Token không hợp lệ" (401), sẽ gọi refresh token và thử lại 1 lần.
 * @param endpoint - Đường dẫn API (ví dụ: '/auth/login').
 * @param config - Cấu hình cho request (method, body, headers...).
 * @returns Promise chứa dữ liệu JSON từ API.
 */
async function client<T>(endpoint: string, { body, ...customConfig }: RequestInit & { body?: any }): Promise<T> {
  const defaultHeaders: HeadersInit = { 'Content-Type': 'application/json' };

  // Gắn Authorization header nếu có token
  const token = getAccessToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // Cấu hình request
  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...authHeader,
      ...customConfig.headers,
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  // Hàm thực hiện request thật sự
  const doFetch = async (): Promise<{ ok: boolean; status: number; data: any }> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response
      .json()
      .catch(() => ({ message: response.statusText || 'Unexpected error' }));
    return { ok: response.ok, status: response.status, data };
  };

  try {
    let { ok, status, data } = await doFetch();
    if (ok) return data;

    // Nếu gặp lỗi token: status 401 hoặc message từ server
    const isInvalidToken =
      status === 401 || (typeof data?.message === 'string' && data.message.includes('Token không hợp lệ'));

    if (isInvalidToken && endpoint !== '/auth/refresh-token') {
      // Thử refresh token và gọi lại request 1 lần
      try {
        await refreshTokenIfNeeded();
        // Cập nhật header Authorization với token mới
        const newToken = getAccessToken();
        config.headers = {
          ...(config.headers as HeadersInit),
          Authorization: newToken ? `Bearer ${newToken}` : undefined,
        } as HeadersInit;
        const retry = await doFetch();
        if (retry.ok) return retry.data;
        // Nếu retry vẫn lỗi, ném lỗi của retry
        const retryMsg = retry.data?.message || `HTTP ${retry.status}`;
        throw new Error(retryMsg);
      } catch (refreshErr) {
        // Refresh thất bại: xóa token và ném lỗi để tầng trên xử lý (chuyển hướng login ...)
        clearTokens();
        const msg = refreshErr instanceof Error ? refreshErr.message : 'Refresh token failed';
        throw new Error(msg);
      }
    }

    // Các lỗi khác: ném thông điệp từ server nếu có
    throw new Error(data?.message || `HTTP ${status}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
    return Promise.reject(new Error(message));
  }
}

// Các phương thức tiện ích để đơn giản hóa việc gọi API
export const apiClient = {
  get: <T>(endpoint: string, config?: RequestInit) => client<T>(endpoint, { ...config, method: 'GET' }),
  post: <T>(endpoint: string, body: any, config?: RequestInit) => client<T>(endpoint, { ...config, body, method: 'POST' }),
  put: <T>(endpoint: string, body: any, config?: RequestInit) => client<T>(endpoint, { ...config, body, method: 'PUT' }),
  //  Added a body parameter to the delete helper to support DELETE requests with a body, making it consistent with post and put.
  delete: <T>(endpoint: string, body?: any, config?: RequestInit) => client<T>(endpoint, { ...config, body, method: 'DELETE' }),

  // Expose helpers for token management if needed elsewhere
  setTokens,
  clearTokens,
};