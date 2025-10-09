import { useState } from 'react';
import { 
    Report, 
    RawPost, 
    Comment, 
    User,
    ModerationLog,
    PostLike,
    PostView,
    Violation,
    Appeal,
    CommunityRule,
    ViolationRule,
    Notification,
    UserAchievement,
    BadgeLevel,
    Achievement,
    UserStreak,
    UserUsage
} from '../../types';
import { 
    mockReports, 
    enrichReport,
    mockPosts, 
    mockComments,
    mockUsers,
    mockModerationLogs,
    mockPostLikes,
    mockPostViews,
    mockViolations,
    mockAppeals,
    mockCommunityRules,
    mockViolationRules,
    mockNotifications,
    mockUserAchievements,
    mockBadges,
    mockAchievements,
    mockUserStreaks,
    mockUserUsage
} from '../../mock';

/**
 * Hook tùy chỉnh để quản lý tất cả state của AppDataContext.
 * Khởi tạo dữ liệu từ mock và trả về state cùng với các hàm setter của chúng.
 */
export const useAppDataState = () => {
    const [users, setUsers] = useState<User[]>(() => mockUsers);
    const [reports, setReports] = useState<Report[]>(() => mockReports.map(enrichReport));
    const [postsData, setPostsData] = useState<RawPost[]>(() => mockPosts);
    const [comments, setComments] = useState<Comment[]>(() => mockComments);
    const [postLikes, setPostLikes] = useState<PostLike[]>(() => mockPostLikes);
    const [postViews, setPostViews] = useState<PostView[]>(() => mockPostViews);
    const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>(() => mockModerationLogs);
    const [violationsData, setViolationsData] = useState<Omit<Violation, 'rules' | 'user' | 'targetContent'>[]>(() => mockViolations);
    const [communityRules, setCommunityRules] = useState<CommunityRule[]>(() => mockCommunityRules);
    const [violationRules, setViolationRules] = useState<ViolationRule[]>(() => mockViolationRules);
    const [appealsData, setAppealsData] = useState<Appeal[]>(() => mockAppeals);
    const [notifications, setNotifications] = useState<Notification[]>(() => mockNotifications);
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(() => mockUserAchievements);
    const [badges, setBadges] = useState<BadgeLevel[]>(mockBadges);
    const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);
    
    // Thêm state cho dữ liệu gamification để theo dõi
    const [userStreaks, setUserStreaks] = useState<UserStreak[]>(mockUserStreaks);
    const [userUsage, setUserUsage] = useState<UserUsage[]>(mockUserUsage);


    return {
        users, setUsers,
        reports, setReports,
        postsData, setPostsData,
        comments, setComments,
        postLikes, setPostLikes,
        postViews, setPostViews,
        moderationLogs, setModerationLogs,
        violationsData, setViolationsData,
        communityRules, setCommunityRules,
        violationRules, setViolationRules,
        appealsData, setAppealsData,
        notifications, setNotifications,
        userAchievements, setUserAchievements,
        badges, setBadges,
        achievements, setAchievements,
        userStreaks, setUserStreaks,
        userUsage, setUserUsage,
    };
};