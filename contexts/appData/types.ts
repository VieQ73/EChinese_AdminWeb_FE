// contexts/appData/types.ts

import {
    User, Post, Comment, ModerationLog, Violation, CommunityRule,
    Notification, Report, Appeal, UserAchievement, BadgeLevel, Achievement,
    AdminLog, UserStreak, UserUsage, ExamType, ExamLevel, QuestionType, RawPost,
    PostLike, PostView, CommentWithUser, Notebook, Vocabulary, Tip, Subscription, Payment, Refund, EnrichedUserSubscription, Exam
} from '../../types';
import { RulePayload } from '../../pages/rules/api';
import { AchievementPayload } from '../../pages/settings/achievements/api';
import { BadgePayload } from '../../pages/settings/badges/api';
import { ExamTypePayload, ExamLevelPayload } from '../../pages/tests/api';
import { NotebookPayload } from '../../pages/content/api/notebooksApi';
import { VocabPayload } from '../../pages/content/api/vocabularyApi';
import { TipPayload } from '../../pages/tips/tipApi';
import { SubscriptionPayload, ProcessRefundPayload, UpdateUserSubscriptionDetailsPayload } from '../../pages/monetization/api';
import { ExamPayload } from '../../pages/tests/api/examsApi';


// Payload for adding a violation
export interface AddViolationPayload {
    user_id: string;
    target_type: 'post' | 'comment' | 'user';
    target_id: string;
    ruleIds: string[];
    severity: Violation['severity'];
    resolution: string;
    detected_by: 'admin' | 'super admin' | 'auto_ai';
}

// Payload for adding a moderation log
export interface AddModerationLogPayload {
    target_type: 'post' | 'comment' | 'user';
    target_id: string;
    action: 'remove' | 'restore';
    reason: string;
    performed_by: string;
}

// Payload for adding an admin log
export interface AddAdminLogPayload {
    action_type: string;
    target_id?: string;
    description: string;
}

// Main context type
export interface AppDataContextType {
    // --- State ---
    users: User[];
    posts: Post[];
    comments: Comment[];
    moderationLogs: ModerationLog[];
    violations: Violation[];
    communityRules: CommunityRule[];
    notifications: Notification[];
    reports: Report[];
    appeals: Appeal[];
    userAchievements: UserAchievement[];
    badges: BadgeLevel[];
    achievements: Achievement[];
    adminLogs: AdminLog[];
    userStreaks: UserStreak[];
    userUsage: UserUsage[];
    examTypes: ExamType[];
    examLevels: ExamLevel[];
    questionTypes: QuestionType[];
    postLikes: PostLike[];
    postViews: PostView[];
    notebooks: Notebook[];
    vocabularies: Vocabulary[];
    tips: Tip[];
    subscriptions: Subscription[];
    payments: Payment[];
    refunds: Refund[];
    userSubscriptions: EnrichedUserSubscription[];
    exams: Exam[];
    
    // --- Getters (Selectors) ---
    getPostsByUserId: (userId: string) => Post[];
    getLikedPostsByUserId: (userId: string) => Post[];
    getViewedPostsByUserId: (userId: string) => Post[];
    getCommentedPostsByUserId: (userId: string) => Post[];
    getRemovedPostsByUserId: (userId: string) => Post[];
    getRemovedCommentsByUserId: (userId: string) => CommentWithUser[];

    // --- Actions ---
    // Community
    addPost: (post: RawPost) => void;
    updatePost: (postId: string, updates: Partial<RawPost>) => void;
    addComment: (comment: Comment) => void;
    updateComment: (commentId: string, updates: Partial<Comment>) => void;
    toggleLike: (postId: string, userId: string) => void;
    toggleView: (postId: string, userId: string) => void;

    // Moderation
    addViolation: (payload: AddViolationPayload) => void;
    removeViolationByTarget: (targetType: 'post' | 'comment' | 'user', targetId: string) => void;
    addModerationLog: (payload: AddModerationLogPayload) => void;

    // Rules
    createRule: (payload: RulePayload) => Promise<void>;
    updateRule: (id: string, payload: Partial<RulePayload>) => Promise<void>;
    deleteRule: (id: string) => Promise<void>;

    // Settings
    createAchievement: (payload: AchievementPayload) => Promise<void>;
    updateAchievement: (id: string, payload: Partial<AchievementPayload>) => Promise<void>;
    deleteAchievement: (id: string) => Promise<void>;
    grantAchievementToUser: (userId: string, achievementId: string) => Promise<void>;
    createBadge: (payload: BadgePayload) => Promise<void>;
    updateBadge: (id: string, payload: Partial<BadgePayload>) => Promise<void>;
    deleteBadge: (id: string) => Promise<void>;
    resyncAllUserBadges: () => Promise<void>;

    // User
    updateUser: (userId: string, updates: Partial<User>) => void;
    updateUserUsage: (userId: string, feature: 'ai_lesson' | 'ai_translate', updates: Partial<UserUsage>) => void;

    // Admin Log
    addAdminLog: (payload: AddAdminLogPayload) => void;

    // Exam Config
    createExamType: (payload: ExamTypePayload) => Promise<void>;
    deleteExamType: (id: string) => Promise<void>;
    createExamLevel: (payload: ExamLevelPayload) => Promise<void>;
    deleteExamLevel: (id: string) => Promise<void>;
    createExam: (payload: ExamPayload) => Promise<Exam>;
    updateExam: (id: string, payload: Partial<ExamPayload>) => Promise<Exam>;
    publishExam: (id: string) => Promise<Exam>;
    unpublishExam: (id: string) => Promise<Exam>;
    deleteExam: (id: string) => Promise<void>;
    duplicateExam: (id: string, newName: string) => Promise<Exam>;
    trashExam: (id: string) => Promise<Exam>;
    restoreExam: (id: string) => Promise<Exam>;

    // Content
    createNotebook: (payload: NotebookPayload) => Promise<void>;
    updateNotebook: (id: string, payload: Partial<NotebookPayload>) => Promise<void>;
    deleteNotebooks: (ids: string[]) => Promise<void>;
    bulkUpdateNotebookStatus: (ids: string[], status: 'published' | 'draft') => Promise<void>;
    createOrUpdateVocabs: (payloads: Partial<Vocabulary>[]) => Promise<void>;
    deleteVocabularies: (ids: string[]) => Promise<void>;
    addVocabsToNotebook: (notebookId: string, vocabIds: string[]) => Promise<void>;
    removeVocabsFromNotebook: (notebookId: string, vocabIds: string[]) => Promise<void>;

    // Tips
    createTip: (payload: TipPayload) => Promise<void>;
    updateTip: (id: string, payload: Partial<TipPayload>) => Promise<void>;
    deleteTip: (id: string) => Promise<void>;
    bulkUploadTips: (tips: TipPayload[]) => Promise<void>;

    // Monetization
    createSubscription: (payload: SubscriptionPayload) => Promise<void>;
    updateSubscription: (id: string, payload: Partial<SubscriptionPayload>) => Promise<void>;
    deleteSubscription: (id: string) => Promise<void>;
    updatePaymentStatus: (id: string, status: 'manual_confirmed' | 'failed') => Promise<void>;
    bulkUpdatePaymentStatus: (ids: string[], status: 'manual_confirmed') => Promise<void>;
    processRefund: (id: string, payload: Omit<ProcessRefundPayload, 'adminId'>) => Promise<void>;
    updateUserSubscriptionDetails: (id: string, payload: UpdateUserSubscriptionDetailsPayload) => Promise<void>;
}