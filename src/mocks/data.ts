import type {
  UUID, Timestamp,
  User, Subscription, Payment, Post, Comment, AdminLog,
  MockTest, UserTestScore, Vocabulary, Notebook, NotebookVocabItem,
  Tip, AILesson, Report, TranslationHistory, UserUsage,
  Notification, Media, RefreshToken, BadgeLevel
} from '../types/entities';

export const mockUUID = (prefix: string): UUID => `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
export const mockTimestamp = (): Timestamp => new Date().toISOString();

// --- MOCK USERS ---
export const MOCK_USERS: User[] = [
  {
    id: mockUUID('user'), username: 'admin_super', password_hash: 'hashed_password',
    name: 'Super Admin', avatar_url: undefined,
    email: 'superadmin@example.com', provider: 'local', provider_id: undefined,
    role: 'super admin', is_active: true, isVerify: true, community_points: 5000,
    level: '7-9', badge_level: 4, language: 'Tiếng Việt',
    created_at: '2023-01-01T08:00:00Z', last_login: undefined,
    achievements: []
  },
  {
    id: mockUUID('user'), username: 'admin_content', password_hash: 'hashed_password',
    name: 'Content Manager', avatar_url: undefined,
    email: 'admin@example.com', provider: 'local', provider_id: undefined,
    role: 'admin', is_active: true, isVerify: true, community_points: 1200,
    level: '5', badge_level: 2, language: 'Tiếng Anh',
    created_at: '2023-05-10T10:00:00Z', last_login: mockTimestamp(),
    achievements: [{ name: 'Moderator Badge', achieved_at: mockTimestamp(), criteria: 'moderate_10_posts' }]
  },
  {
    id: mockUUID('user'), username: 'premium_user', name: 'Nguyễn Văn A',
    avatar_url: 'https://placehold.co/150x150/2563eb/white?text=NVA',
    email: 'user_premium@example.com', provider: 'google', provider_id: 'google_12345',
    role: 'user', is_active: true, isVerify: true, community_points: 800,
    subscription_id: undefined, // Sẽ được gán sau khi MOCK_SUBSCRIPTIONS được định nghĩa
    subscription_expiry: undefined,
    level: '4', badge_level: 1, language: 'Tiếng Việt',
    created_at: '2024-03-20T12:00:00Z', last_login: mockTimestamp(),
    achievements: [{ name: '7 days streak', achieved_at: mockTimestamp(), criteria: 'login_7_days' }]
  },
  {
    id: mockUUID('user'), username: 'standard_user', name: 'Trần Thị B',
    avatar_url: undefined, email: 'standard_user@example.com', provider: 'local', provider_id: undefined,
    role: 'user', is_active: true, isVerify: false, community_points: 200,
    subscription_id: undefined, subscription_expiry: undefined,
    level: '2', badge_level: 0, language: 'Tiếng Việt',
    created_at: '2024-06-15T09:00:00Z', last_login: mockTimestamp(),
    achievements: []
  }
];

// --- MOCK SUBSCRIPTIONS ---
export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: mockUUID('sub'), name: 'Premium Monthly',
    daily_quota_ai_lesson: 5, daily_quota_translate: 10,
    price: 99.99, duration_months: 1, is_active: true,
    created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: mockUUID('sub'), name: 'Premium Forever',
    daily_quota_ai_lesson: 10, daily_quota_translate: 20,
    price: 499.99, duration_months: null, // Giữ null vì interface cho phép
    is_active: true,
    created_at: '2023-02-01T00:00:00Z', updated_at: '2023-02-01T00:00:00Z'
  }
];

// Gán subscription_id cho premium_user
MOCK_USERS[2].subscription_id = MOCK_SUBSCRIPTIONS[0].id;
MOCK_USERS[2].subscription_expiry = '2025-12-31T23:59:59Z';

// --- MOCK BADGE LEVELS ---
export const MOCK_BADGE_LEVELS: BadgeLevel[] = [
  { level: 0, name: 'Beginner' },
  { level: 1, name: 'Novice' },
  { level: 2, name: 'Intermediate' },
  { level: 3, name: 'Advanced' },
  { level: 4, name: 'Master' }
];

// --- MOCK PAYMENTS ---
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: mockUUID('payment'), user_id: MOCK_USERS[2].id, subscription_id: MOCK_SUBSCRIPTIONS[0].id,
    amount: 99.99, currency: 'VND', status: 'successful', payment_method: 'momo',
    gateway_transaction_id: mockUUID('trans'), transaction_date: '2024-03-20T12:30:00Z',
    gateway_response: { status: 'success', code: '200' }, processed_by_admin: undefined, notes: undefined
  }
];

// --- MOCK POSTS ---
export const MOCK_POSTS: Post[] = [
  {
    id: mockUUID('post'), user_id: MOCK_USERS[2].id, title: 'Tips học HSK4 hiệu quả',
    content: { text: 'Chia sẻ kinh nghiệm học HSK4', format: 'rich' }, topic: 'Học tiếng Trung',
    likes: 15, views: 100, created_at: '2024-04-01T10:00:00Z', is_approved: true, deleted_at: undefined
  }
];

// --- MOCK COMMENTS ---
export const MOCK_COMMENTS: Comment[] = [
  {
    id: mockUUID('comment'), post_id: MOCK_POSTS[0].id, user_id: MOCK_USERS[3].id,
    content: { text: 'Cảm ơn bài chia sẻ!', format: 'rich' }, likes: 5, parent_comment_id: undefined,
    created_at: '2024-04-01T11:00:00Z', deleted_at: undefined
  }
];

// --- MOCK MOCKTESTS ---
export const MOCK_MOCKTESTS: MockTest[] = [
  {
    id: mockUUID('test'), type: 'HSK', level: 'HSK4',
    title: 'HSK4 Practice Test 1', total_time_limit: 90, total_max_score: 300,
    sections: [
      {
        name: 'Listening', time_limit: 30, max_score: 100, total_questions: 45,
        questions: [
          {
            id: mockUUID('question'), type: 'mcq', text: '听对话，选择正确答案',
            options: ['选项A', '选项B', '选项C', '选项D'], correct_answer: '0',
            explanation: 'Giải thích: Câu trả lời đúng là A vì...', media_url: undefined, is_visual: false
          }
        ]
      }
    ],
    instructions: undefined, is_active: true, created_by: MOCK_USERS[1].id, deleted_at: undefined
  }
];

// --- MOCK USER TEST SCORES ---
export const MOCK_USER_TEST_SCORES: UserTestScore[] = [
  {
    id: mockUUID('score'), user_id: MOCK_USERS[2].id, test_id: MOCK_MOCKTESTS[0].id,
    highest_total_score: 240, attempts: [
      {
        attempt_id: mockUUID('attempt'), started_at: '2024-04-10T09:00:00Z',
        submitted_at: '2024-04-10T10:30:00Z', total_score: 240,
        section_scores: [{ section_name: 'Listening', score: 80, completed_questions: 40, total_questions: 45, percentage: 80 }],
        user_answers: [{ question_local_id: MOCK_MOCKTESTS[0].sections[0].questions[0].id, selected_answer: '0', is_correct: true, time_spent: 30 }]
      }
    ],
    explanations_viewed: { [mockUUID('attempt')]: { [MOCK_MOCKTESTS[0].sections[0].questions[0].id]: true } }
  }
];

// --- MOCK NOTEBOOKS ---
export const MOCK_NOTEBOOKS: Notebook[] = [
  {
    id: mockUUID('notebook'), user_id: MOCK_USERS[2].id, name: 'HSK4 Vocabulary',
    vocab_count: 2, created_at: '2024-03-25T08:00:00Z',
    options: { show_hanzi: true, show_pinyin: true, show_meaning: true, sort_by: 'added_at' },
    is_premium: true
  }
];

// --- MOCK VOCABULARY ---
export const MOCK_VOCABULARY: Vocabulary[] = [
  {
    id: mockUUID('vocab'), word_type: 'Động từ', hanzi: '学习', pinyin: 'xuéxí',
    meaning: 'Học tập', notes: undefined, level: 'HSK1',
    image_url: undefined, deleted_at: undefined
  },
  {
    id: mockUUID('vocab'), word_type: 'Danh từ', hanzi: '书', pinyin: 'shū',
    meaning: 'Sách', notes: undefined, level: 'HSK1', image_url: undefined, deleted_at: undefined
  }
];

// --- MOCK NOTEBOOK VOCAB ITEMS ---
export const MOCK_NOTEBOOK_VOCAB_ITEMS: NotebookVocabItem[] = [
  {
    notebook_id: MOCK_NOTEBOOKS[0].id, vocab_id: MOCK_VOCABULARY[0].id,
    status: 'đã thuộc', added_at: '2024-03-25T08:10:00Z'
  },
  {
    notebook_id: MOCK_NOTEBOOKS[0].id, vocab_id: MOCK_VOCABULARY[1].id,
    status: 'chưa thuộc', added_at: '2024-03-25T08:15:00Z'
  }
];

// --- MOCK TIPS ---
export const MOCK_TIPS: Tip[] = [
  {
    id: mockUUID('tip'), order: 1, topic: 'Ngữ pháp', level: 'Sơ cấp',
    content: 'Sử dụng "了" để chỉ hành động đã hoàn thành.', answer: undefined,
    created_by: MOCK_USERS[1].id
  }
];

// --- MOCK AI LESSONS ---
export const MOCK_AI_LESSONS: AILesson[] = [
  {
    id: mockUUID('lesson'), user_id: MOCK_USERS[2].id, theme: 'Daily Conversation',
    level: 'Cơ bản', created_at: '2024-04-05T10:00:00Z',
    content: {
      vocabularies: [{ vocab_id: MOCK_VOCABULARY[0].id, audio_url: undefined }],
      phrases: [],
      tips: [{ tip_id: undefined, vietnamese: 'Sử dụng "了" để chỉ hành động đã hoàn thành.', chinese: '使用“了”表示动作完成' }],
      dialogues: [
        {
          messages: [
            { text: '你好！', pinyin: 'nǐ hǎo!', audio_url: undefined },
            { text: '你好，你好吗？', pinyin: 'nǐ hǎo, nǐ hǎo ma?', audio_url: undefined }
          ]
        }
      ]
    }
  }
];

// --- MOCK ADMIN LOGS ---
export const MOCK_ADMIN_LOGS: AdminLog[] = [
  {
    id: mockUUID('log'), admin_id: MOCK_USERS[1].id, action_type: 'delete_post',
    target_id: undefined, description: undefined, created_at: '2024-04-02T14:00:00Z'
  }
];

// --- MOCK REPORTS ---
export const MOCK_REPORTS: Report[] = [
  {
    id: mockUUID('report'), reporter_id: MOCK_USERS[3].id, target_type: 'post',
    target_id: MOCK_POSTS[0].id, reason: 'Inappropriate content', status: 'pending',
    resolved_by: undefined, created_at: '2024-04-01T12:00:00Z'
  }
];

// --- MOCK TRANSLATION HISTORY ---
export const MOCK_TRANSLATION_HISTORY: TranslationHistory[] = [
  {
    id: mockUUID('translation'), user_id: MOCK_USERS[2].id, original_text: 'Xin chào',
    original_lang: 'vi', translated_text: '你好', translated_lang: 'zh',
    is_ai: true, created_at: '2024-04-03T09:00:00Z'
  }
];

// --- MOCK USER USAGE ---
export const MOCK_USER_USAGE: UserUsage[] = [
  {
    id: mockUUID('usage'), user_id: MOCK_USERS[2].id, feature: 'ai_lesson',
    daily_count: 3, last_reset: '2024-04-05T00:00:00Z'
  }
];

// --- MOCK NOTIFICATIONS ---
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: mockUUID('notification'), user_id: MOCK_USERS[2].id, type: 'community',
    title: 'New Comment', content: 'Your post received a new comment!', related_id: MOCK_COMMENTS[0].id,
    is_read: false, created_at: '2024-04-01T11:05:00Z'
  }
];

// --- MOCK MEDIA ---
export const MOCK_MEDIA: Media[] = [
  {
    id: mockUUID('media'), original_name: 'hsk4_listening.mp3', display_name: undefined,
    s3_path: 's3://bucket/hsk4_listening.mp3', mime_type: undefined, size_bytes: undefined,
    uploaded_by: MOCK_USERS[1].id, usage_type: 'mocktest_audio', created_at: '2024-03-01T08:00:00Z'
  }
];

// --- MOCK REFRESH TOKENS ---
export const MOCK_REFRESH_TOKENS: RefreshToken[] = [
  {
    id: mockUUID('token'), user_id: MOCK_USERS[2].id, token: mockUUID('refresh'),
    created_at: '2024-04-01T08:00:00Z', expires_at: '2024-05-01T08:00:00Z'
  }
];