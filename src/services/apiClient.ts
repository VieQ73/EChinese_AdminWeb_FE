import { getMockResponse} from '../mocks/wrapper';
import type { PaginatedResponse } from '../mocks/wrapper';
import type {
  User, Subscription, Payment, Post, AdminLog, Comment, MockTest, UserTestScore,
  Notebook, Vocabulary, NotebookVocabItem, Tip, AILesson, Report, TranslationHistory,
  UserUsage, Notification, Media, RefreshToken, BadgeLevel
} from '../types/entities';

// Khai báo biến môi trường (Giả định có trong Vite)
const USE_MOCK_DATA = "true" === 'true'; // Giả lập đọc từ import.meta.env.VITE_USE_MOCK_DATA
const API_BASE_URL = 'http://localhost:3000/api/admin'; // Giả lập đọc từ import.meta.env.VITE_API_BASE_URL

// Định nghĩa cơ sở cho kết quả API
export type ApiResponse<T> = Promise<T>;
export type PaginatedApiResponse<T> = Promise<PaginatedResponse<T>>;

// Hàm lấy token giả lập (thay thế bằng logic thực tế trong dự án)
const getAuthToken = (): string | null => {
  // Giả lập lấy token từ localStorage hoặc nguồn khác
  return localStorage.getItem('authToken') || null;
};

// Hàm wrapper chung cho mọi lời gọi API
export const apiClient = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any = null
): ApiResponse<T> => {
  if (USE_MOCK_DATA) {
    // --- CHẾ ĐỘ MOCK DATA ---
    console.warn(`[MOCK] Gọi API: ${method} ${endpoint}`);
    try {
      const mockResult = getMockResponse<T>(endpoint, method, data);
      return new Promise(resolve => setTimeout(() => resolve(mockResult), 500 + Math.random() * 500));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Lỗi Mock API:', error.message);
      return Promise.reject({ status: 500, message: error.message || 'Lỗi Mock API' });
    }
  }

  // --- CHẾ ĐỘ REAL API ---
  console.log(`[REAL] Gọi API: ${method} ${API_BASE_URL}${endpoint}`);
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: method !== 'GET' && data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Lỗi server: ${response.status}`);
    }

    return response.json() as T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Lỗi Real API:', error.message);
    return Promise.reject({ status: 500, message: error.message || 'Lỗi kết nối API' });
  }
};

// --- API Methods for Users ---
export const getUsers = async (params: { page?: number; limit?: number } = {}): PaginatedApiResponse<User> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
  }).toString();
  return apiClient<PaginatedResponse<User>>(`/users?${query}`);
};

export const getUserById = async (id: string): ApiResponse<User> => {
  return apiClient<User>(`/users/${id}`);
};

export const createUser = async (data: Partial<User>): ApiResponse<User> => {
  return apiClient<User>('/users', 'POST', data);
};

export const updateUser = async (id: string, data: Partial<User>): ApiResponse<User> => {
  return apiClient<User>(`/users/${id}`, 'PUT', data);
};

export const deleteUser = async (id: string): ApiResponse<{ message: string }> => {
  return apiClient<{ message: string }>(`/users/${id}`, 'DELETE');
};

// --- API Methods for Subscriptions ---
export const getSubscriptions = async (params: { page?: number; limit?: number } = {}): PaginatedApiResponse<Subscription> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
  }).toString();
  return apiClient<PaginatedResponse<Subscription>>(`/subscriptions?${query}`);
};

export const getSubscriptionById = async (id: string): ApiResponse<Subscription> => {
  return apiClient<Subscription>(`/subscriptions/${id}`);
};

export const createSubscription = async (data: Partial<Subscription>): ApiResponse<Subscription> => {
  return apiClient<Subscription>('/subscriptions', 'POST', data);
};

export const updateSubscription = async (id: string, data: Partial<Subscription>): ApiResponse<Subscription> => {
  return apiClient<Subscription>(`/subscriptions/${id}`, 'PUT', data);
};

export const deleteSubscription = async (id: string): ApiResponse<{ message: string }> => {
  return apiClient<{ message: string }>(`/subscriptions/${id}`, 'DELETE');
};

// --- API Methods for Payments ---
export const getPayments = async (params: { page?: number; limit?: number; user_id?: string } = {}): PaginatedApiResponse<Payment> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
    ...(params.user_id && { user_id: params.user_id }),
  }).toString();
  return apiClient<PaginatedResponse<Payment>>(`/payments?${query}`);
};

export const getPaymentById = async (id: string): ApiResponse<Payment> => {
  return apiClient<Payment>(`/payments/${id}`);
};

export const createPayment = async (data: Partial<Payment>): ApiResponse<Payment> => {
  return apiClient<Payment>('/payments', 'POST', data);
};

export const updatePayment = async (id: string, data: Partial<Payment>): ApiResponse<Payment> => {
  return apiClient<Payment>(`/payments/${id}`, 'PUT', data);
};

export const deletePayment = async (id: string): ApiResponse<{ message: string }> => {
  return apiClient<{ message: string }>(`/payments/${id}`, 'DELETE');
};

// --- API Methods for Posts ---
export const getPosts = async (params: { page?: number; limit?: number; user_id?: string } = {}): PaginatedApiResponse<Post> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
    ...(params.user_id && { user_id: params.user_id }),
  }).toString();
  return apiClient<PaginatedResponse<Post>>(`/posts?${query}`);
};

export const getPostById = async (id: string): ApiResponse<Post> => {
  return apiClient<Post>(`/posts/${id}`);
};

export const createPost = async (data: Partial<Post>): ApiResponse<Post> => {
  return apiClient<Post>('/posts', 'POST', data);
};

export const updatePost = async (id: string, data: Partial<Post>): ApiResponse<Post> => {
  return apiClient<Post>(`/posts/${id}`, 'PUT', data);
};

export const deletePost = async (id: string): ApiResponse<Post> => {
  return apiClient<Post>(`/posts/${id}`, 'DELETE');
};

// --- API Methods for Comments ---
export const getComments = async (params: { page?: number; limit?: number; post_id?: string } = {}): PaginatedApiResponse<Comment> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
    ...(params.post_id && { post_id: params.post_id }),
  }).toString();
  return apiClient<PaginatedResponse<Comment>>(`/comments?${query}`);
};

export const getCommentById = async (id: string): ApiResponse<Comment> => {
  return apiClient<Comment>(`/comments/${id}`);
};

export const createComment = async (data: Partial<Comment>): ApiResponse<Comment> => {
  return apiClient<Comment>('/comments', 'POST', data);
};

export const updateComment = async (id: string, data: Partial<Comment>): ApiResponse<Comment> => {
  return apiClient<Comment>(`/comments/${id}`, 'PUT', data);
};

export const deleteComment = async (id: string): ApiResponse<Comment> => {
  return apiClient<Comment>(`/comments/${id}`, 'DELETE');
};

// --- API Methods for MockTests ---
export const getMockTests = async (params: { page?: number; limit?: number } = {}): PaginatedApiResponse<MockTest> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
  }).toString();
  return apiClient<PaginatedResponse<MockTest>>(`/mock-tests?${query}`);
};

export const getMockTestById = async (id: string): ApiResponse<MockTest> => {
  return apiClient<MockTest>(`/mock-tests/${id}`);
};

export const createMockTest = async (data: Partial<MockTest>): ApiResponse<MockTest> => {
  return apiClient<MockTest>('/mock-tests', 'POST', data);
};

export const updateMockTest = async (id: string, data: Partial<MockTest>): ApiResponse<MockTest> => {
  return apiClient<MockTest>(`/mock-tests/${id}`, 'PUT', data);
};

export const deleteMockTest = async (id: string): ApiResponse<MockTest> => {
  return apiClient<MockTest>(`/mock-tests/${id}`, 'DELETE');
};

// --- API Methods for UserTestScores ---
export const getUserTestScores = async (params: { page?: number; limit?: number; user_id?: string } = {}): PaginatedApiResponse<UserTestScore> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
    ...(params.user_id && { user_id: params.user_id }),
  }).toString();
  return apiClient<PaginatedResponse<UserTestScore>>(`/user-test-scores?${query}`);
};

export const getUserTestScoreById = async (id: string): ApiResponse<UserTestScore> => {
  return apiClient<UserTestScore>(`/user-test-scores/${id}`);
};

export const createUserTestScore = async (data: Partial<UserTestScore>): ApiResponse<UserTestScore> => {
  return apiClient<UserTestScore>('/user-test-scores', 'POST', data);
};

export const updateUserTestScore = async (id: string, data: Partial<UserTestScore>): ApiResponse<UserTestScore> => {
  return apiClient<UserTestScore>(`/user-test-scores/${id}`, 'PUT', data);
};

// --- API Methods for Notebooks ---
export const getNotebooks = async (params: { page?: number; limit?: number; user_id?: string } = {}): PaginatedApiResponse<Notebook> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
    ...(params.user_id && { user_id: params.user_id }),
  }).toString();
  return apiClient<PaginatedResponse<Notebook>>(`/notebooks?${query}`);
};

export const getNotebookById = async (id: string): ApiResponse<Notebook> => {
  return apiClient<Notebook>(`/notebooks/${id}`);
};

export const createNotebook = async (data: Partial<Notebook>): ApiResponse<Notebook> => {
  return apiClient<Notebook>('/notebooks', 'POST', data);
};

export const updateNotebook = async (id: string, data: Partial<Notebook>): ApiResponse<Notebook> => {
  return apiClient<Notebook>(`/notebooks/${id}`, 'PUT', data);
};

export const deleteNotebook = async (id: string): ApiResponse<{ message: string }> => {
  return apiClient<{ message: string }>(`/notebooks/${id}`, 'DELETE');
};

// --- API Methods for Vocabulary ---
export const getVocabulary = async (params: { page?: number; limit?: number } = {}): PaginatedApiResponse<Vocabulary> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
  }).toString();
  return apiClient<PaginatedResponse<Vocabulary>>(`/vocabulary?${query}`);
};

export const getVocabularyById = async (id: string): ApiResponse<Vocabulary> => {
  return apiClient<Vocabulary>(`/vocabulary/${id}`);
};

export const createVocabulary = async (data: Partial<Vocabulary>): ApiResponse<Vocabulary> => {
  return apiClient<Vocabulary>('/vocabulary', 'POST', data);
};

export const updateVocabulary = async (id: string, data: Partial<Vocabulary>): ApiResponse<Vocabulary> => {
  return apiClient<Vocabulary>(`/vocabulary/${id}`, 'PUT', data);
};

export const deleteVocabulary = async (id: string): ApiResponse<Vocabulary> => {
  return apiClient<Vocabulary>(`/vocabulary/${id}`, 'DELETE');
};

// --- API Methods for NotebookVocabItems ---
export const getNotebookVocabItems = async (params: { page?: number; limit?: number; notebook_id?: string } = {}): PaginatedApiResponse<NotebookVocabItem> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
    ...(params.notebook_id && { notebook_id: params.notebook_id }),
  }).toString();
  return apiClient<PaginatedResponse<NotebookVocabItem>>(`/notebook-vocab-items?${query}`);
};

export const getNotebookVocabItemById = async (notebook_id: string, vocab_id: string): ApiResponse<NotebookVocabItem> => {
  return apiClient<NotebookVocabItem>(`/notebook-vocab-items/${notebook_id}/${vocab_id}`);
};

export const createNotebookVocabItem = async (data: Partial<NotebookVocabItem>): ApiResponse<NotebookVocabItem> => {
  return apiClient<NotebookVocabItem>('/notebook-vocab-items', 'POST', data);
};

// --- API Methods for Tips ---
export const getTips = async (params: { page?: number; limit?: number } = {}): PaginatedApiResponse<Tip> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
  }).toString();
  return apiClient<PaginatedResponse<Tip>>(`/tips?${query}`);
};

export const getTipById = async (id: string): ApiResponse<Tip> => {
  return apiClient<Tip>(`/tips/${id}`);
};

export const createTip = async (data: Partial<Tip>): ApiResponse<Tip> => {
  return apiClient<Tip>('/tips', 'POST', data);
};

export const updateTip = async (id: string, data: Partial<Tip>): ApiResponse<Tip> => {
  return apiClient<Tip>(`/tips/${id}`, 'PUT', data);
};

// --- API Methods for AILessons ---
export const getAILessons = async (params: { page?: number; limit?: number; user_id?: string } = {}): PaginatedApiResponse<AILesson> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
    ...(params.user_id && { user_id: params.user_id }),
  }).toString();
  return apiClient<PaginatedResponse<AILesson>>(`/ai-lessons?${query}`);
};

export const getAILessonById = async (id: string): ApiResponse<AILesson> => {
  return apiClient<AILesson>(`/ai-lessons/${id}`);
};

export const createAILesson = async (data: Partial<AILesson>): ApiResponse<AILesson> => {
  return apiClient<AILesson>('/ai-lessons', 'POST', data);
};

export const updateAILesson = async (id: string, data: Partial<AILesson>): ApiResponse<AILesson> => {
  return apiClient<AILesson>(`/ai-lessons/${id}`, 'PUT', data);
};

// --- API Methods for AdminLogs ---
export const getAdminLogs = async (params: { page?: number; limit?: number } = {}): PaginatedApiResponse<AdminLog> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
  }).toString();
  return apiClient<PaginatedResponse<AdminLog>>(`/admin-logs?${query}`);
};

export const getAdminLogById = async (id: string): ApiResponse<AdminLog> => {
  return apiClient<AdminLog>(`/admin-logs/${id}`);
};

export const createAdminLog = async (data: Partial<AdminLog>): ApiResponse<AdminLog> => {
  return apiClient<AdminLog>('/admin-logs', 'POST', data);
};

// --- API Methods for Reports ---
export const getReports = async (params: { page?: number; limit?: number; status?: string } = {}): PaginatedApiResponse<Report> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
    ...(params.status && { status: params.status }),
  }).toString();
  return apiClient<PaginatedResponse<Report>>(`/reports?${query}`);
};

export const getReportById = async (id: string): ApiResponse<Report> => {
  return apiClient<Report>(`/reports/${id}`);
};

export const createReport = async (data: Partial<Report>): ApiResponse<Report> => {
  return apiClient<Report>('/reports', 'POST', data);
};

export const updateReport = async (id: string, data: Partial<Report>): ApiResponse<Report> => {
  return apiClient<Report>(`/reports/${id}`, 'PUT', data);
};

export const deleteReport = async (id: string): ApiResponse<{ message: string }> => {
  return apiClient<{ message: string }>(`/reports/${id}`, 'DELETE');
};

// --- API Methods for TranslationHistory ---
export const getTranslationHistory = async (params: { page?: number; limit?: number; user_id?: string } = {}): PaginatedApiResponse<TranslationHistory> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
    ...(params.user_id && { user_id: params.user_id }),
  }).toString();
  return apiClient<PaginatedResponse<TranslationHistory>>(`/translation-history?${query}`);
};

export const getTranslationHistoryById = async (id: string): ApiResponse<TranslationHistory> => {
  return apiClient<TranslationHistory>(`/translation-history/${id}`);
};

export const createTranslationHistory = async (data: Partial<TranslationHistory>): ApiResponse<TranslationHistory> => {
  return apiClient<TranslationHistory>('/translation-history', 'POST', data);
};

export const deleteTranslationHistory = async (id: string): ApiResponse<{ message: string }> => {
  return apiClient<{ message: string }>(`/translation-history/${id}`, 'DELETE');
};

// --- API Methods for UserUsage ---
export const getUserUsage = async (params: { page?: number; limit?: number; user_id?: string } = {}): PaginatedApiResponse<UserUsage> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
    ...(params.user_id && { user_id: params.user_id }),
  }).toString();
  return apiClient<PaginatedResponse<UserUsage>>(`/user-usage?${query}`);
};

export const getUserUsageById = async (id: string): ApiResponse<UserUsage> => {
  return apiClient<UserUsage>(`/user-usage/${id}`);
};

export const createUserUsage = async (data: Partial<UserUsage>): ApiResponse<UserUsage> => {
  return apiClient<UserUsage>('/user-usage', 'POST', data);
};

export const updateUserUsage = async (id: string, data: Partial<UserUsage>): ApiResponse<UserUsage> => {
  return apiClient<UserUsage>(`/user-usage/${id}`, 'PUT', data);
};

export const deleteUserUsage = async (id: string): ApiResponse<{ message: string }> => {
  return apiClient<{ message: string }>(`/user-usage/${id}`, 'DELETE');
};

// --- API Methods for Notifications ---
export const getNotifications = async (params: { page?: number; limit?: number; user_id?: string } = {}): PaginatedApiResponse<Notification> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
    ...(params.user_id && { user_id: params.user_id }),
  }).toString();
  return apiClient<PaginatedResponse<Notification>>(`/notifications?${query}`);
};

export const getNotificationById = async (id: string): ApiResponse<Notification> => {
  return apiClient<Notification>(`/notifications/${id}`);
};

export const createNotification = async (data: Partial<Notification>): ApiResponse<Notification> => {
  return apiClient<Notification>('/notifications', 'POST', data);
};

export const updateNotification = async (id: string, data: Partial<Notification>): ApiResponse<Notification> => {
  return apiClient<Notification>(`/notifications/${id}`, 'PUT', data);
};

export const deleteNotification = async (id: string): ApiResponse<{ message: string }> => {
  return apiClient<{ message: string }>(`/notifications/${id}`, 'DELETE');
};

// --- API Methods for Media ---
export const getMedia = async (params: { page?: number; limit?: number } = {}): PaginatedApiResponse<Media> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
  }).toString();
  return apiClient<PaginatedResponse<Media>>(`/media?${query}`);
};

export const getMediaById = async (id: string): ApiResponse<Media> => {
  return apiClient<Media>(`/media/${id}`);
};

export const createMedia = async (data: Partial<Media>): ApiResponse<Media> => {
  return apiClient<Media>('/media', 'POST', data);
};

export const updateMedia = async (id: string, data: Partial<Media>): ApiResponse<Media> => {
  return apiClient<Media>(`/media/${id}`, 'PUT', data);
};

export const deleteMedia = async (id: string): ApiResponse<{ message: string }> => {
  return apiClient<{ message: string }>(`/media/${id}`, 'DELETE');
};

// --- API Methods for RefreshTokens ---
export const getRefreshTokens = async (params: { page?: number; limit?: number } = {}): PaginatedApiResponse<RefreshToken> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
  }).toString();
  return apiClient<PaginatedResponse<RefreshToken>>(`/refresh-tokens?${query}`);
};

export const getRefreshTokenById = async (id: string): ApiResponse<RefreshToken> => {
  return apiClient<RefreshToken>(`/refresh-tokens/${id}`);
};

export const createRefreshToken = async (data: Partial<RefreshToken>): ApiResponse<RefreshToken> => {
  return apiClient<RefreshToken>('/refresh-tokens', 'POST', data);
};

export const deleteRefreshToken = async (id: string): ApiResponse<{ message: string }> => {
  return apiClient<{ message: string }>(`/refresh-tokens/${id}`, 'DELETE');
};

// --- API Methods for BadgeLevels ---
export const getBadgeLevels = async (params: { page?: number; limit?: number } = {}): PaginatedApiResponse<BadgeLevel> => {
  const query = new URLSearchParams({
    page: params.page?.toString() || '1',
    limit: params.limit?.toString() || '20',
  }).toString();
  return apiClient<PaginatedResponse<BadgeLevel>>(`/badge-levels?${query}`);
};

export const getBadgeLevelById = async (level: number): ApiResponse<BadgeLevel> => {
  return apiClient<BadgeLevel>(`/badge-levels/${level}`);
};

export const createBadgeLevel = async (data: Partial<BadgeLevel>): ApiResponse<BadgeLevel> => {
  return apiClient<BadgeLevel>('/badge-levels', 'POST', data);
};

export const updateBadgeLevel = async (level: number, data: Partial<BadgeLevel>): ApiResponse<BadgeLevel> => {
  return apiClient<BadgeLevel>(`/badge-levels/${level}`, 'PUT', data);
};