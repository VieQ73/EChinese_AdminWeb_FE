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
    console.log('[refreshToken] Đang đợi request refresh hiện tại...');
    const res = await refreshPromise;
    return res.token;
  }

  const currentRefresh = getRefreshToken();
  if (!currentRefresh) {
    console.error('[refreshToken] Không tìm thấy refresh token trong localStorage');
    throw new Error('Missing refresh token');
  }

  console.log('[refreshToken] Bắt đầu gọi API refresh token...');

  // Tạo yêu cầu refresh mới
  refreshPromise = (async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: currentRefresh }),
      });

      console.log('[refreshToken] Response status:', resp.status);

      // Parse response
      let data: any;
      try {
        data = await resp.json();
        console.log('[refreshToken] Response data:', data);
      } catch (parseErr) {
        console.error('[refreshToken] Lỗi parse JSON:', parseErr);
        data = {};
      }

      if (!resp.ok) {
        const msg = data?.message || `HTTP ${resp.status}`;
        console.error('[refreshToken] API trả về lỗi:', msg);
        throw new Error(msg);
      }

      // Hỗ trợ nhiều format response từ backend
      const newToken: string | undefined = 
        data.token || 
        data.access_token || 
        data.accessToken ||
        data.result?.token ||
        data.result?.access_token ||
        data.result?.accessToken ||
        data.data?.token ||
        data.data?.access_token;
        
      const newRefreshToken: string | undefined = 
        data.refreshToken || 
        data.refresh_token || 
        data.result?.refreshToken ||
        data.result?.refresh_token ||
        data.data?.refreshToken ||
        data.data?.refresh_token;

      if (!newToken) {
        console.error('[refreshToken] Response không chứa token. Data:', data);
        throw new Error('Refresh response missing token');
      }

      console.log('[refreshToken] Đã nhận token mới, đang lưu vào localStorage...');
      console.log('[refreshToken] New access_token:', newToken.substring(0, 30) + '...');
      console.log('[refreshToken] New refresh_token:', newRefreshToken ? newRefreshToken.substring(0, 30) + '...' : 'Không có (giữ lại token cũ)');
      
      // Nếu không có refresh token mới, giữ lại refresh token cũ
      const finalRefreshToken = newRefreshToken || currentRefresh;
      setTokens(newToken, finalRefreshToken);
      console.log('[refreshToken] Lưu token thành công!');

      return { token: newToken, refreshToken: finalRefreshToken };
    } catch (error) {
      console.error('[refreshToken] Lỗi trong quá trình refresh:', error);
      throw error;
    }
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
 * - Tự động gọi lại API ban đầu sau khi refresh token thành công.
 * @param endpoint - Đường dẫn API (ví dụ: '/auth/login').
 * @param config - Cấu hình cho request (method, body, headers...).
 * @returns Promise chứa dữ liệu JSON từ API.
 */
async function client<T>(endpoint: string, { body, ...customConfig }: RequestInit & { body?: any }): Promise<T> {
  const defaultHeaders: HeadersInit = { 'Content-Type': 'application/json' };

  // Hàm thực hiện request với token hiện tại
  const doFetch = async (token?: string): Promise<{ ok: boolean; status: number; data: any }> => {
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    
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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response
      .json()
      .catch(() => ({ message: response.statusText || 'Unexpected error' }));
    return { ok: response.ok, status: response.status, data };
  };

  try {
    // Lần gọi đầu tiên với token hiện tại
    const token = getAccessToken();
    let { ok, status, data } = await doFetch(token);
    
    if (ok) return data;

    // Kiểm tra lỗi token: status 401 hoặc message từ server
    const isInvalidToken =
      status === 401 || 
      (typeof data?.message === 'string' && (
        data.message.includes('Token không hợp lệ') ||
        data.message.includes('Token expired') ||
        data.message.includes('Invalid token') ||
        data.message.includes('jwt expired')
      ));

    // Nếu gặp lỗi token và không phải endpoint refresh-token hoặc login
    if (isInvalidToken && endpoint !== '/auth/refresh-token' && endpoint !== '/auth/login') {
      try {
        console.log('[apiClient] Token hết hạn cho endpoint:', endpoint);
        console.log('[apiClient] Status:', status, 'Message:', data?.message);
        
        // Gọi refresh token (sẽ tự động đợi nếu đã có request refresh đang chạy)
        const newToken = await refreshTokenIfNeeded();
        
        console.log('[apiClient] Refresh token thành công! Token mới:', newToken.substring(0, 20) + '...');
        console.log('[apiClient] Đang gọi lại API:', endpoint);
        
        // Gọi lại request với token mới
        const retry = await doFetch(newToken);
        
        if (retry.ok) {
          console.log('[apiClient] ✅ Gọi lại API thành công!');
          return retry.data;
        }
        
        // Nếu retry vẫn lỗi
        console.error('[apiClient] ❌ Gọi lại API thất bại. Status:', retry.status, 'Data:', retry.data);
        const retryMsg = retry.data?.message || `HTTP ${retry.status}`;
        throw new Error(retryMsg);
      } catch (refreshErr) {
        console.error('[apiClient] ❌ Refresh token thất bại:', refreshErr);
        
        // Refresh thất bại: xóa token và chuyển về trang login
        clearTokens();
        
        // Xóa thông tin user
        try {
          localStorage.removeItem('auth_user');
        } catch {}
        
        // Chuyển về trang login sau 1 giây để có thời gian xem log
        console.warn('[apiClient] Sẽ chuyển về trang login sau 1 giây...');
        setTimeout(() => {
          if (window.location.hash !== '#/login') {
            window.location.href = '/#/login';
          }
        }, 1000);
        
        const msg = refreshErr instanceof Error ? refreshErr.message : 'Phiên đăng nhập đã hết hạn';
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
  patch: <T>(endpoint: string, body: any, config?: RequestInit) => client<T>(endpoint, { ...config, body, method: 'PATCH' }),
  //  Added a body parameter to the delete helper to support DELETE requests with a body, making it consistent with post and put.
  delete: <T>(endpoint: string, body?: any, config?: RequestInit) => client<T>(endpoint, { ...config, body, method: 'DELETE' }),

  // Expose helpers for token management if needed elsewhere
  setTokens,
  clearTokens,
};