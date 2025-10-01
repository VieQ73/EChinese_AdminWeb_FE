import axios from 'axios';
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

// Interceptor để tự động thêm token vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý response và lỗi một cách nhất quán
apiClient.interceptors.response.use(
  // Bất kỳ status code nào trong khoảng 2xx sẽ vào đây
  (response) => response.data,
  // Bất kỳ status code nào ngoài khoảng 2xx sẽ vào đây
  (error) => {
    if (error.response) {
      // Request đã được gửi và server đã trả về với một status code lỗi
      // (ví dụ: 400, 401, 403, 404, 500)
      console.error('API Error:', error.response.data);

      // Tự động logout nếu nhận lỗi 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        // Reload trang để App.tsx xử lý và redirect về trang login
        window.location.href = '/auth';
      }

      // Ném lỗi với message từ backend để component có thể bắt và hiển thị
      return Promise.reject(new Error(error.response.data.message || 'Có lỗi xảy ra từ server.'));
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response (lỗi mạng)
      console.error('Network Error:', error.request);
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại mạng.'));
    } else {
      // Lỗi xảy ra khi thiết lập request
      console.error('Request Setup Error:', error.message);
      return Promise.reject(new Error('Có lỗi xảy ra khi gửi yêu cầu.'));
    }
  }
);

export { apiClient };

