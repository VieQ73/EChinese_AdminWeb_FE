import {
    Report,
    RawPost,
    Comment,
    Post,
    User,
    CommentWithUser,
    ModerationLog,
    PostLike,
    PostView,
    Violation,
    Appeal,
    ViolationRule,
    CommunityRule,
    Notification,
    UserAchievement,
    BadgeLevel,
    Achievement,
    UserUsage,
} from '../../types';
import * as badgeApi from '../../pages/settings/badges/api';
import { RulePayload } from '../../pages/rules/api';
import { AchievementPayload } from '../../pages/settings/achievements/api';

/**
 * Định nghĩa payload cho việc thêm mới một vi phạm.
 * Bao gồm các thông tin cần thiết để tạo bản ghi vi phạm và liên kết với các quy tắc.
 */
export type AddViolationPayload = Omit<Violation, 'id' | 'created_at' | 'handled' | 'rules'> & { ruleIds?: string[] };

/**
 * Định nghĩa cấu trúc đầy đủ của AppDataContext.
 * Bao gồm tất cả state và các hàm action để tương tác với state trên toàn ứng dụng.
 */
export interface AppDataContextType {
    // --- States ---
    users: User[];
    reports: Report[];
    posts: Post[];
    comments: Comment[];
    postLikes: PostLike[];
    postViews: PostView[];
    moderationLogs: ModerationLog[];
    violations: Violation[];
    appeals: Appeal[];
    communityRules: CommunityRule[];
    notifications: Notification[];
    userAchievements: UserAchievement[];
    badges: BadgeLevel[];
    achievements: Achievement[];
    userUsage: UserUsage[];

    // --- Actions ---
    // User Actions
    updateUser: (userId: string, updatedData: Partial<User>) => void;
    updateUserUsage: (userId: string, feature: 'ai_lesson' | 'ai_translate', updatedData: Partial<UserUsage>) => void;
    
    // Report/Appeal Actions
    updateReport: (reportId: string, updatedData: Partial<Report>) => void;
    updateAppeal: (appealId: string, updatedData: Partial<Appeal>, currentUser: User) => void;

    // Community Actions
    addPost: (postData: Omit<RawPost, 'id' | 'created_at' | 'user_id' | 'likes' | 'views'>, currentUser: User) => void;
    updatePost: (postId: string, postData: Partial<Omit<RawPost, 'id'>>) => void;
    addComment: (comment: Comment) => void;
    updateComment: (commentId: string, updatedData: Partial<Comment>) => void;
    toggleLike: (postId: string, userId: string) => void;
    toggleView: (postId: string, userId: string) => void;
    
    // Moderation Actions
    addModerationLog: (log: Omit<ModerationLog, 'id' | 'created_at'>) => void;
    addViolation: (payload: AddViolationPayload) => void;
    removeViolationByTarget: (targetType: 'post' | 'comment' | 'user', targetId: string) => void;

    // Notification Actions
    addNotification: (notificationData: Omit<Notification, 'id' | 'created_at'>) => void;
    publishNotifications: (notificationIds: string[]) => void;
    deleteNotifications: (notificationIds: string[]) => void;
    markNotificationsAsRead: (notificationIds: string[], asRead: boolean) => void;

    // Achievement & Badge Actions
    grantAchievementToUser: (userId: string, achievementId: string) => Promise<UserAchievement>;
    createBadge: (payload: badgeApi.BadgePayload) => Promise<void>;
    updateBadge: (badgeId: string, payload: Partial<badgeApi.BadgePayload>) => Promise<void>;
    deleteBadge: (badgeId: string) => Promise<void>;
    resyncAllUserBadges: () => Promise<void>;
    createAchievement: (payload: AchievementPayload) => Promise<void>;
    updateAchievement: (achievementId: string, payload: Partial<AchievementPayload>) => Promise<void>;
    deleteAchievement: (achievementId: string) => Promise<void>;
    
    // Rule Actions
    createRule: (payload: RulePayload) => Promise<void>;
    updateRule: (ruleId: string, payload: Partial<RulePayload>) => Promise<void>;
    deleteRule: (ruleId: string) => Promise<void>;

    // --- Getters ---
    getLikedPostsByUserId: (userId: string) => Post[];
    getCommentedPostsByUserId: (userId: string) => Post[];
    getViewedPostsByUserId: (userId: string) => Post[];
    getRemovedCommentsByUserId: (userId: string) => CommentWithUser[];
}