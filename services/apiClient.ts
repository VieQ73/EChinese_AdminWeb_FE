// services/apiClient.ts

// Đọc base URL của API thật từ biến môi trường.
// File .env ở gốc dự án sẽ chứa: VITE_API_BASE_URL=http://localhost:8080/api/admin
// Cung cấp một giá trị dự phòng để tránh lỗi runtime nếu biến môi trường không được định nghĩa.
// FIX: Cast import.meta to any to resolve TypeScript error regarding 'env' property,
// as the vite/client types are not available in this context.
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

/**
 * Một hàm client fetch chung, có khả năng xử lý body, headers và các cấu hình khác.
 * @param endpoint - Đường dẫn API (ví dụ: '/auth/login').
 * @param config - Cấu hình cho request (method, body, headers...).
 * @returns Promise chứa dữ liệu JSON từ API.
 */
async function client<T>(endpoint: string, { body, ...customConfig }: RequestInit & { body?: any }): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  // Cấu hình request
  const config: RequestInit = {
    method: body ? 'POST' : 'GET', // Mặc định là GET nếu không có body, ngược lại là POST
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (response.ok) {
      return data;
    }

    // Ném lỗi nếu response không thành công, ưu tiên message từ backend
    throw new Error(data.message || response.statusText);
  } catch (err) {
    // Bắt các lỗi mạng hoặc lỗi parse JSON và ném lại để component có thể xử lý
    const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
    return Promise.reject(new Error(message));
  }
}

// Các phương thức tiện ích để đơn giản hóa việc gọi API
export const apiClient = {
  get: <T>(endpoint: string, config?: RequestInit) => client<T>(endpoint, { ...config, method: 'GET' }),
  post: <T>(endpoint: string, body: any, config?: RequestInit) => client<T>(endpoint, { ...config, body, method: 'POST' }),
  put: <T>(endpoint: string, body: any, config?: RequestInit) => client<T>(endpoint, { ...config, body, method: 'PUT' }),
  // FIX: Added a body parameter to the delete helper to support DELETE requests with a body, making it consistent with post and put.
  delete: <T>(endpoint: string, body?: any, config?: RequestInit) => client<T>(endpoint, { ...config, body, method: 'DELETE' }),
};