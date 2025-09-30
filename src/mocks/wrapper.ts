import {
  MOCK_USERS, MOCK_SUBSCRIPTIONS, MOCK_PAYMENTS, MOCK_POSTS, MOCK_ADMIN_LOGS,
  MOCK_COMMENTS, MOCK_MOCKTESTS, MOCK_USER_TEST_SCORES, MOCK_NOTEBOOKS,
  MOCK_VOCABULARY, MOCK_NOTEBOOK_VOCAB_ITEMS, MOCK_TIPS, MOCK_AI_LESSONS,
  MOCK_REPORTS, MOCK_TRANSLATION_HISTORY, MOCK_USER_USAGE, MOCK_NOTIFICATIONS,
  MOCK_MEDIA, MOCK_REFRESH_TOKENS, MOCK_BADGE_LEVELS, mockUUID, mockTimestamp
} from './data';
import type {
  User, Subscription, Payment, Post, AdminLog, Comment, MockTest, UserTestScore,
  Notebook, Vocabulary, NotebookVocabItem, Tip, AILesson, Report, TranslationHistory,
  UserUsage, Notification, Media, RefreshToken, BadgeLevel, 
} from '../types/entities';

// Định nghĩa chung cho API Response có Phân trang (Pagination)
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Hàm giả lập API Response, trả về PaginatedResponse<T>
export const getMockPaginatedResponse = <T>(
  data: T[],
  limit: number = 20,
  page: number = 1
): PaginatedResponse<T> => {
  const total = data.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Hàm parse query parameters
const parseQueryParams = (queryString?: string) => {
  if (!queryString) return {};
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

// Logic xử lý chính cho các Endpoint Mock
export const getMockResponse = <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): T => {
  const [path, queryString] = endpoint.split('?');
  const pathSegments = path.split('/').filter(s => s);
  const resource = pathSegments[0];
  const id = pathSegments[1];
  const queryParams = parseQueryParams(queryString);

  // Xử lý phân trang từ query parameters
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 20;

  // GET: Lấy danh sách hoặc chi tiết
  if (method === 'GET') {
    if (id) {
      // Lấy chi tiết theo ID
      switch (resource) {
        case 'users': {
          if (pathSegments[2] === 'deactivate' || pathSegments[2] === 'activate') {
            const user = MOCK_USERS.find(u => u.id === id);
            if (!user) throw new Error(`[MOCK API] User not found: ${id}`);
            return { ...user, is_active: pathSegments[2] === 'activate' } as unknown as T;
          }
          const user = MOCK_USERS.find(u => u.id === id);
          if (!user) throw new Error(`[MOCK API] User not found: ${id}`);
          return user as unknown as T;
        }
        case 'subscriptions': {
          const subscription = MOCK_SUBSCRIPTIONS.find(s => s.id === id);
          if (!subscription) throw new Error(`[MOCK API] Subscription not found: ${id}`);
          return subscription as unknown as T;
        }
        case 'payments': {
          const payment = MOCK_PAYMENTS.find(p => p.id === id);
          if (!payment) throw new Error(`[MOCK API] Payment not found: ${id}`);
          return payment as unknown as T;
        }
        case 'posts': {
          const post = MOCK_POSTS.find(p => p.id === id);
          if (!post) throw new Error(`[MOCK API] Post not found: ${id}`);
          return post as unknown as T;
        }
        case 'admin-logs': {
          const log = MOCK_ADMIN_LOGS.find(l => l.id === id);
          if (!log) throw new Error(`[MOCK API] AdminLog not found: ${id}`);
          return log as unknown as T;
        }
        case 'comments': {
          const comment = MOCK_COMMENTS.find(c => c.id === id);
          if (!comment) throw new Error(`[MOCK API] Comment not found: ${id}`);
          return comment as unknown as T;
        }
        case 'mock-tests': {
          const test = MOCK_MOCKTESTS.find(t => t.id === id);
          if (!test) throw new Error(`[MOCK API] MockTest not found: ${id}`);
          return test as unknown as T;
        }
        case 'user-test-scores': {
          const score = MOCK_USER_TEST_SCORES.find(s => s.id === id);
          if (!score) throw new Error(`[MOCK API] UserTestScore not found: ${id}`);
          return score as unknown as T;
        }
        case 'notebooks': {
          const notebook = MOCK_NOTEBOOKS.find(n => n.id === id);
          if (!notebook) throw new Error(`[MOCK API] Notebook not found: ${id}`);
          return notebook as unknown as T;
        }
        case 'vocabulary': {
          const vocab = MOCK_VOCABULARY.find(v => v.id === id);
          if (!vocab) throw new Error(`[MOCK API] Vocabulary not found: ${id}`);
          return vocab as unknown as T;
        }
        case 'notebook-vocab-items': {
          const item = MOCK_NOTEBOOK_VOCAB_ITEMS.find(i => i.notebook_id === id && i.vocab_id === pathSegments[2]);
          if (!item) throw new Error(`[MOCK API] NotebookVocabItem not found: ${id}/${pathSegments[2]}`);
          return item as unknown as T;
        }
        case 'tips': {
          const tip = MOCK_TIPS.find(t => t.id === id);
          if (!tip) throw new Error(`[MOCK API] Tip not found: ${id}`);
          return tip as unknown as T;
        }
        case 'ai-lessons': {
          const lesson = MOCK_AI_LESSONS.find(l => l.id === id);
          if (!lesson) throw new Error(`[MOCK API] AILesson not found: ${id}`);
          return lesson as unknown as T;
        }
        case 'reports': {
          const report = MOCK_REPORTS.find(r => r.id === id);
          if (!report) throw new Error(`[MOCK API] Report not found: ${id}`);
          return report as unknown as T;
        }
        case 'translation-history': {
          const translation = MOCK_TRANSLATION_HISTORY.find(t => t.id === id);
          if (!translation) throw new Error(`[MOCK API] TranslationHistory not found: ${id}`);
          return translation as unknown as T;
        }
        case 'user-usage': {
          const usage = MOCK_USER_USAGE.find(u => u.id === id);
          if (!usage) throw new Error(`[MOCK API] UserUsage not found: ${id}`);
          return usage as unknown as T;
        }
        case 'notifications': {
          const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);
          if (!notification) throw new Error(`[MOCK API] Notification not found: ${id}`);
          return notification as unknown as T;
        }
        case 'media': {
          const media = MOCK_MEDIA.find(m => m.id === id);
          if (!media) throw new Error(`[MOCK API] Media not found: ${id}`);
          return media as unknown as T;
        }
        case 'refresh-tokens': {
          const token = MOCK_REFRESH_TOKENS.find(t => t.id === id);
          if (!token) throw new Error(`[MOCK API] RefreshToken not found: ${id}`);
          return token as unknown as T;
        }
        case 'badge-levels': {
          const badge = MOCK_BADGE_LEVELS.find(b => b.level.toString() === id);
          if (!badge) throw new Error(`[MOCK API] BadgeLevel not found: ${id}`);
          return badge as unknown as T;
        }
      }
    } else {
      // Lấy danh sách với phân trang
      switch (resource) {
        case 'users': {
          let filteredUsers = MOCK_USERS;
          if (queryParams.role) {
            filteredUsers = filteredUsers.filter(u => u.role === queryParams.role);
          }
          if (queryParams.search) {
            const searchLower = queryParams.search.toLowerCase();
            filteredUsers = filteredUsers.filter(
              u =>
                u.username?.toLowerCase().includes(searchLower) ||
                u.email?.toLowerCase().includes(searchLower) ||
                u.name?.toLowerCase().includes(searchLower)
            );
          }
          if (queryParams.is_active !== undefined) {
            const isActive = queryParams.is_active === 'true';
            filteredUsers = filteredUsers.filter(u => u.is_active === isActive);
          }
          return getMockPaginatedResponse<User>(filteredUsers, limit, page) as unknown as T;
        }
        case 'subscriptions': {
          return getMockPaginatedResponse<Subscription>(MOCK_SUBSCRIPTIONS, limit, page) as unknown as T;
        }
        case 'payments': {
          let filteredPayments = MOCK_PAYMENTS;
          if (queryParams.user_id) {
            filteredPayments = MOCK_PAYMENTS.filter(p => p.user_id === queryParams.user_id);
          }
          return getMockPaginatedResponse<Payment>(filteredPayments, limit, page) as unknown as T;
        }
        case 'posts': {
          let filteredPosts = MOCK_POSTS;
          if (queryParams.user_id) {
            filteredPosts = MOCK_POSTS.filter(p => p.user_id === queryParams.user_id);
          }
          return getMockPaginatedResponse<Post>(filteredPosts, limit, page) as unknown as T;
        }
        case 'admin-logs': {
          return getMockPaginatedResponse<AdminLog>(MOCK_ADMIN_LOGS, limit, page) as unknown as T;
        }
        case 'comments': {
          let filteredComments = MOCK_COMMENTS;
          if (queryParams.post_id) {
            filteredComments = MOCK_COMMENTS.filter(c => c.post_id === queryParams.post_id);
          }
          return getMockPaginatedResponse<Comment>(filteredComments, limit, page) as unknown as T;
        }
        case 'mock-tests': {
          return getMockPaginatedResponse<MockTest>(MOCK_MOCKTESTS, limit, page) as unknown as T;
        }
        case 'user-test-scores': {
          let filteredScores = MOCK_USER_TEST_SCORES;
          if (queryParams.user_id) {
            filteredScores = MOCK_USER_TEST_SCORES.filter(s => s.user_id === queryParams.user_id);
          }
          return getMockPaginatedResponse<UserTestScore>(filteredScores, limit, page) as unknown as T;
        }
        case 'notebooks': {
          let filteredNotebooks = MOCK_NOTEBOOKS;
          if (queryParams.user_id) {
            filteredNotebooks = MOCK_NOTEBOOKS.filter(n => n.user_id === queryParams.user_id);
          }
          return getMockPaginatedResponse<Notebook>(filteredNotebooks, limit, page) as unknown as T;
        }
        case 'vocabulary': {
          return getMockPaginatedResponse<Vocabulary>(MOCK_VOCABULARY, limit, page) as unknown as T;
        }
        case 'notebook-vocab-items': {
          let filteredItems = MOCK_NOTEBOOK_VOCAB_ITEMS;
          if (queryParams.notebook_id) {
            filteredItems = MOCK_NOTEBOOK_VOCAB_ITEMS.filter(i => i.notebook_id === queryParams.notebook_id);
          }
          return getMockPaginatedResponse<NotebookVocabItem>(filteredItems, limit, page) as unknown as T;
        }
        case 'tips': {
          return getMockPaginatedResponse<Tip>(MOCK_TIPS, limit, page) as unknown as T;
        }
        case 'ai-lessons': {
          let filteredLessons = MOCK_AI_LESSONS;
          if (queryParams.user_id) {
            filteredLessons = MOCK_AI_LESSONS.filter(l => l.user_id === queryParams.user_id);
          }
          return getMockPaginatedResponse<AILesson>(filteredLessons, limit, page) as unknown as T;
        }
        case 'reports': {
          let filteredReports = MOCK_REPORTS;
          if (queryParams.status) {
            filteredReports = MOCK_REPORTS.filter(r => r.status === queryParams.status);
          }
          return getMockPaginatedResponse<Report>(filteredReports, limit, page) as unknown as T;
        }
        case 'translation-history': {
          let filteredTranslations = MOCK_TRANSLATION_HISTORY;
          if (queryParams.user_id) {
            filteredTranslations = MOCK_TRANSLATION_HISTORY.filter(t => t.user_id === queryParams.user_id);
          }
          return getMockPaginatedResponse<TranslationHistory>(filteredTranslations, limit, page) as unknown as T;
        }
        case 'user-usage': {
          let filteredUsage = MOCK_USER_USAGE;
          if (queryParams.user_id) {
            filteredUsage = MOCK_USER_USAGE.filter(u => u.user_id === queryParams.user_id);
          }
          return getMockPaginatedResponse<UserUsage>(filteredUsage, limit, page) as unknown as T;
        }
        case 'notifications': {
          let filteredNotifications = MOCK_NOTIFICATIONS;
          if (queryParams.user_id) {
            filteredNotifications = MOCK_NOTIFICATIONS.filter(n => n.user_id === queryParams.user_id);
          }
          return getMockPaginatedResponse<Notification>(filteredNotifications, limit, page) as unknown as T;
        }
        case 'media': {
          return getMockPaginatedResponse<Media>(MOCK_MEDIA, limit, page) as unknown as T;
        }
        case 'refresh-tokens': {
          return getMockPaginatedResponse<RefreshToken>(MOCK_REFRESH_TOKENS, limit, page) as unknown as T;
        }
        case 'badge-levels': {
          return getMockPaginatedResponse<BadgeLevel>(MOCK_BADGE_LEVELS, limit, page) as unknown as T;
        }
      }
    }
  }

  // POST: Tạo mới
  if (method === 'POST') {
    const newId = mockUUID(resource);
    const created_at = mockTimestamp();
    switch (resource) {
      case 'users': {
        return { ...data, id: newId, created_at, is_active: true } as unknown as T;
      }
      case 'subscriptions': {
        return { ...data, id: newId, created_at, updated_at: created_at } as unknown as T;
      }
      case 'payments': {
        return { ...data, id: newId, transaction_date: created_at } as unknown as T;
      }
      case 'posts': {
        return { ...data, id: newId, created_at, likes: 0, views: 0, is_approved: true } as unknown as T;
      }
      case 'admin-logs': {
        return { ...data, id: newId, created_at } as unknown as T;
      }
      case 'comments': {
        return { ...data, id: newId, created_at, likes: 0 } as unknown as T;
      }
      case 'mock-tests': {
        return { ...data, id: newId, created_at, is_active: true } as unknown as T;
      }
      case 'user-test-scores': {
        return { ...data, id: newId, highest_total_score: 0 } as unknown as T;
      }
      case 'notebooks': {
        return { ...data, id: newId, created_at, vocab_count: 0 } as unknown as T;
      }
      case 'vocabulary': {
        return { ...data, id: newId } as unknown as T;
      }
      case 'notebook-vocab-items': {
        return { ...data, added_at: created_at } as unknown as T;
      }
      case 'tips': {
        return { ...data, id: newId } as unknown as T;
      }
      case 'ai-lessons': {
        return { ...data, id: newId, created_at } as unknown as T;
      }
      case 'reports': {
        return { ...data, id: newId, created_at, status: 'pending' } as unknown as T;
      }
      case 'translation-history': {
        return { ...data, id: newId, created_at } as unknown as T;
      }
      case 'user-usage': {
        return { ...data, id: newId, last_reset: created_at } as unknown as T;
      }
      case 'notifications': {
        return { ...data, id: newId, created_at, is_read: false } as unknown as T;
      }
      case 'media': {
        return { ...data, id: newId, created_at } as unknown as T;
      }
      case 'refresh-tokens': {
        return { ...data, id: newId, created_at } as unknown as T;
      }
      case 'badge-levels': {
        return { ...data } as unknown as T;
      }
    }
  }

  // PUT: Cập nhật
  if (method === 'PUT' && id) {
    switch (resource) {
      case 'users': {
        if (pathSegments[2] === 'deactivate' || pathSegments[2] === 'activate') {
          const user = MOCK_USERS.find(u => u.id === id);
          if (!user) throw new Error(`[MOCK API] User not found: ${id}`);
          return { ...user, is_active: pathSegments[2] === 'activate', updated_at: mockTimestamp() } as unknown as T;
        }
        const user = MOCK_USERS.find(u => u.id === id);
        if (!user) throw new Error(`[MOCK API] User not found: ${id}`);
        return { ...user, ...data, updated_at: mockTimestamp() } as unknown as T;
      }
      case 'subscriptions': {
        const subscription = MOCK_SUBSCRIPTIONS.find(s => s.id === id);
        if (!subscription) throw new Error(`[MOCK API] Subscription not found: ${id}`);
        return { ...subscription, ...data, updated_at: mockTimestamp() } as unknown as T;
      }
      case 'payments': {
        const payment = MOCK_PAYMENTS.find(p => p.id === id);
        if (!payment) throw new Error(`[MOCK API] Payment not found: ${id}`);
        return { ...payment, ...data } as unknown as T;
      }
      case 'posts': {
        const post = MOCK_POSTS.find(p => p.id === id);
        if (!post) throw new Error(`[MOCK API] Post not found: ${id}`);
        return { ...post, ...data } as unknown as T;
      }
      case 'admin-logs': {
        const log = MOCK_ADMIN_LOGS.find(l => l.id === id);
        if (!log) throw new Error(`[MOCK API] AdminLog not found: ${id}`);
        return { ...log, ...data } as unknown as T;
      }
      case 'comments': {
        const comment = MOCK_COMMENTS.find(c => c.id === id);
        if (!comment) throw new Error(`[MOCK API] Comment not found: ${id}`);
        return { ...comment, ...data } as unknown as T;
      }
      case 'mock-tests': {
        const test = MOCK_MOCKTESTS.find(t => t.id === id);
        if (!test) throw new Error(`[MOCK API] MockTest not found: ${id}`);
        return { ...test, ...data } as unknown as T;
      }
      case 'user-test-scores': {
        const score = MOCK_USER_TEST_SCORES.find(s => s.id === id);
        if (!score) throw new Error(`[MOCK API] UserTestScore not found: ${id}`);
        return { ...score, ...data } as unknown as T;
      }
      case 'notebooks': {
        const notebook = MOCK_NOTEBOOKS.find(n => n.id === id);
        if (!notebook) throw new Error(`[MOCK API] Notebook not found: ${id}`);
        return { ...notebook, ...data } as unknown as T;
      }
      case 'vocabulary': {
        const vocab = MOCK_VOCABULARY.find(v => v.id === id);
        if (!vocab) throw new Error(`[MOCK API] Vocabulary not found: ${id}`);
        return { ...vocab, ...data } as unknown as T;
      }
      case 'tips': {
        const tip = MOCK_TIPS.find(t => t.id === id);
        if (!tip) throw new Error(`[MOCK API] Tip not found: ${id}`);
        return { ...tip, ...data } as unknown as T;
      }
      case 'ai-lessons': {
        const lesson = MOCK_AI_LESSONS.find(l => l.id === id);
        if (!lesson) throw new Error(`[MOCK API] AILesson not found: ${id}`);
        return { ...lesson, ...data } as unknown as T;
      }
      case 'reports': {
        const report = MOCK_REPORTS.find(r => r.id === id);
        if (!report) throw new Error(`[MOCK API] Report not found: ${id}`);
        return { ...report, ...data } as unknown as T;
      }
      case 'translation-history': {
        const translation = MOCK_TRANSLATION_HISTORY.find(t => t.id === id);
        if (!translation) throw new Error(`[MOCK API] TranslationHistory not found: ${id}`);
        return { ...translation, ...data } as unknown as T;
      }
      case 'user-usage': {
        const usage = MOCK_USER_USAGE.find(u => u.id === id);
        if (!usage) throw new Error(`[MOCK API] UserUsage not found: ${id}`);
        return { ...usage, ...data } as unknown as T;
      }
      case 'notifications': {
        const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);
        if (!notification) throw new Error(`[MOCK API] Notification not found: ${id}`);
        return { ...notification, ...data } as unknown as T;
      }
      case 'media': {
        const media = MOCK_MEDIA.find(m => m.id === id);
        if (!media) throw new Error(`[MOCK API] Media not found: ${id}`);
        return { ...media, ...data } as unknown as T;
      }
      case 'refresh-tokens': {
        const token = MOCK_REFRESH_TOKENS.find(t => t.id === id);
        if (!token) throw new Error(`[MOCK API] RefreshToken not found: ${id}`);
        return { ...token, ...data } as unknown as T;
      }
      case 'badge-levels': {
        const badge = MOCK_BADGE_LEVELS.find(b => b.level.toString() === id);
        if (!badge) throw new Error(`[MOCK API] BadgeLevel not found: ${id}`);
        return { ...badge, ...data } as unknown as T;
      }
    }
  }

  // DELETE: Xóa mềm hoặc xóa cứng
  if (method === 'DELETE' && id) {
    switch (resource) {
      case 'users': {
        const user = MOCK_USERS.find(u => u.id === id);
        if (!user) throw new Error(`[MOCK API] User not found: ${id}`);
        return { message: `User ${id} deleted` } as unknown as T;
      }
      case 'subscriptions': {
        const subscription = MOCK_SUBSCRIPTIONS.find(s => s.id === id);
        if (!subscription) throw new Error(`[MOCK API] Subscription not found: ${id}`);
        return { message: `Subscription ${id} deleted` } as unknown as T;
      }
      case 'payments': {
        const payment = MOCK_PAYMENTS.find(p => p.id === id);
        if (!payment) throw new Error(`[MOCK API] Payment not found: ${id}`);
        return { message: `Payment ${id} deleted` } as unknown as T;
      }
      case 'posts': {
        const post = MOCK_POSTS.find(p => p.id === id);
        if (!post) throw new Error(`[MOCK API] Post not found: ${id}`);
        return { ...post, deleted_at: mockTimestamp() } as unknown as T; // Xóa mềm
      }
      case 'comments': {
        const comment = MOCK_COMMENTS.find(c => c.id === id);
        if (!comment) throw new Error(`[MOCK API] Comment not found: ${id}`);
        return { ...comment, deleted_at: mockTimestamp() } as unknown as T; // Xóa mềm
      }
      case 'mock-tests': {
        const test = MOCK_MOCKTESTS.find(t => t.id === id);
        if (!test) throw new Error(`[MOCK API] MockTest not found: ${id}`);
        return { ...test, deleted_at: mockTimestamp() } as unknown as T; // Xóa mềm
      }
      case 'vocabulary': {
        const vocab = MOCK_VOCABULARY.find(v => v.id === id);
        if (!vocab) throw new Error(`[MOCK API] Vocabulary not found: ${id}`);
        return { ...vocab, deleted_at: mockTimestamp() } as unknown as T; // Xóa mềm
      }
      case 'reports': {
        const report = MOCK_REPORTS.find(r => r.id === id);
        if (!report) throw new Error(`[MOCK API] Report not found: ${id}`);
        return { message: `Report ${id} deleted` } as unknown as T;
      }
      case 'translation-history': {
        const translation = MOCK_TRANSLATION_HISTORY.find(t => t.id === id);
        if (!translation) throw new Error(`[MOCK API] TranslationHistory not found: ${id}`);
        return { message: `TranslationHistory ${id} deleted` } as unknown as T;
      }
      case 'user-usage': {
        const usage = MOCK_USER_USAGE.find(u => u.id === id);
        if (!usage) throw new Error(`[MOCK API] UserUsage not found: ${id}`);
        return { message: `UserUsage ${id} deleted` } as unknown as T;
      }
      case 'notifications': {
        const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);
        if (!notification) throw new Error(`[MOCK API] Notification not found: ${id}`);
        return { message: `Notification ${id} deleted` } as unknown as T;
      }
      case 'media': {
        const media = MOCK_MEDIA.find(m => m.id === id);
        if (!media) throw new Error(`[MOCK API] Media not found: ${id}`);
        return { message: `Media ${id} deleted` } as unknown as T;
      }
      case 'refresh-tokens': {
        const token = MOCK_REFRESH_TOKENS.find(t => t.id === id);
        if (!token) throw new Error(`[MOCK API] RefreshToken not found: ${id}`);
        return { message: `RefreshToken ${id} deleted` } as unknown as T;
      }
    }
  }

  throw new Error(`[MOCK API] Endpoint not found or method not supported: ${method} ${endpoint}`);
};