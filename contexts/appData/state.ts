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
    UserUsage,
    ExamType,
    ExamLevel,
    QuestionType,
    AdminLog,
    Notebook,
    Vocabulary,
    Tip,
    Subscription,
    Payment,
    Refund,
    EnrichedUserSubscription,
    Exam
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
    mockUserUsage,
    MOCK_EXAM_TYPES,
    MOCK_EXAM_LEVELS,
    MOCK_QUESTION_TYPES,
    mockAdminLogs,
    mockNotebooks,
    mockVocab,
    mockTips,
    mockSubscriptions,
    mockPayments,
    mockRefunds,
    mockUserSubscriptions,
    MOCK_EXAMS
} from '../../mock';

/**
 * Hook tùy chỉnh để quản lý tất cả state của AppDataContext.
 * Khởi tạo dữ liệu từ mock và trả về state cùng với các hàm setter của chúng.
 */
export const useAppDataState = () => {
    const [users, setUsers] = useState<User[]>(() => [...mockUsers]);
    const [reports, setReports] = useState<Report[]>(() => mockReports.map(enrichReport));
    const [postsData, setPostsData] = useState<RawPost[]>(() => [...mockPosts]);
    const [comments, setComments] = useState<Comment[]>(() => [...mockComments]);
    const [postLikes, setPostLikes] = useState<PostLike[]>(() => [...mockPostLikes]);
    const [postViews, setPostViews] = useState<PostView[]>(() => [...mockPostViews]);
    const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>(() => [...mockModerationLogs]);
    const [violationsData, setViolationsData] = useState<Omit<Violation, 'rules' | 'user' | 'targetContent'>[]>(() => [...mockViolations]);
    const [communityRules, setCommunityRules] = useState<CommunityRule[]>(() => [...mockCommunityRules]);
    const [violationRules, setViolationRules] = useState<ViolationRule[]>(() => [...mockViolationRules]);
    const [appealsData, setAppealsData] = useState<Appeal[]>(() => [...mockAppeals]);
    const [notifications, setNotifications] = useState<Notification[]>(() => [...mockNotifications]);
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(() => [...mockUserAchievements]);
    const [badges, setBadges] = useState<BadgeLevel[]>([...mockBadges]);
    const [achievements, setAchievements] = useState<Achievement[]>([...mockAchievements]);
    const [adminLogs, setAdminLogs] = useState<AdminLog[]>(() => [...mockAdminLogs]);
    
    // Thêm state cho dữ liệu gamification để theo dõi
    const [userStreaks, setUserStreaks] = useState<UserStreak[]>([...mockUserStreaks]);
    const [userUsage, setUserUsage] = useState<UserUsage[]>([...mockUserUsage]);
    
    // Thêm state cho các module mới
    const [notebooks, setNotebooks] = useState<Notebook[]>([...mockNotebooks]);
    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([...mockVocab]);
    const [tips, setTips] = useState<Tip[]>([...mockTips]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([...mockSubscriptions]);
    const [payments, setPayments] = useState<Payment[]>([...mockPayments]);
    const [refunds, setRefunds] = useState<Refund[]>([...mockRefunds]);
    const [userSubscriptions, setUserSubscriptions] = useState<EnrichedUserSubscription[]>([]); // Sẽ được fetch
    const [exams, setExams] = useState<Exam[]>([...MOCK_EXAMS]);
    
    // Thêm state cho dữ liệu quản lý bài thi
    const [examTypes, setExamTypes] = useState<ExamType[]>([...MOCK_EXAM_TYPES]);
    const [examLevels, setExamLevels] = useState<ExamLevel[]>([...MOCK_EXAM_LEVELS]);
    const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([...MOCK_QUESTION_TYPES]);


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
        adminLogs, setAdminLogs,
        userStreaks, setUserStreaks,
        userUsage, setUserUsage,
        examTypes, setExamTypes,
        examLevels, setExamLevels,
        questionTypes, setQuestionTypes,
        notebooks, setNotebooks,
        vocabularies, setVocabularies,
        tips, setTips,
        subscriptions, setSubscriptions,
        payments, setPayments,
        refunds, setRefunds,
        userSubscriptions, setUserSubscriptions,
        exams, setExams,
    };
};