// contexts/appData/provider.tsx
import React, { ReactNode, useMemo, useContext, useEffect } from 'react';
import { AppDataContext } from './context';
import { useAppDataState } from './state';
import { useDerivedData, useGetters } from './selectors';
import {
    useCommunityActions,
    useModerationActions,
    useRuleActions,
    useSettingsActions,
    useUserActions,
    useLogActions,
    useExamActions,
    useContentActions,       
    useMonetizationActions, 
    useTipsActions,          
} from './actions';
import { User } from '../../types';
import { AuthContext } from '../AuthContext';
import { AddViolationPayload } from './types';
import { fetchExamTypes, fetchExamLevels } from '../../pages/tests/api/configApi';
import { fetchExams } from '../../pages/tests/api/examsApi';
import { fetchVocabularies } from '../../pages/content/api/vocabularyApi';
import { fetchBadges } from '../../pages/settings/badges/api';
import { fetchAchievements } from '../../pages/settings/achievements/api';
import { fetchRules as fetchCommunityRules } from '../../pages/rules/api';
import { fetchModerationLogs } from '../../pages/community/api/stats';
import { fetchViolations } from '../../pages/moderation/api/violations';
import { fetchAdminLogs } from '../../pages/system/api';
import { cacheService, CACHE_KEYS } from '../../services/cacheService';

interface AppDataProviderProps {
    children: ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children }) => {
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.user;
    const isAuthenticated = authContext?.isAuthenticated;

    // 1. Raw State Management
    const state = useAppDataState();

    useEffect(() => {
        const loadInitialData = async () => {
            console.log("Authenticated, loading initial data...");
            try {
                // Thử load từ cache trước
                const cachedTypes = cacheService.get(CACHE_KEYS.EXAM_TYPES);
                const cachedLevels = cacheService.get(CACHE_KEYS.EXAM_LEVELS);
                const cachedExams = cacheService.get(CACHE_KEYS.EXAMS);
                const cachedBadges = cacheService.get(CACHE_KEYS.BADGES);
                const cachedAchievements = cacheService.get(CACHE_KEYS.ACHIEVEMENTS);
                const cachedRules = cacheService.get(CACHE_KEYS.COMMUNITY_RULES);
                const cachedModerationLogs = cacheService.get(CACHE_KEYS.MODERATION_LOGS);
                const cachedViolations = cacheService.get(CACHE_KEYS.VIOLATIONS);
                const cachedAdminLogs = cacheService.get(CACHE_KEYS.ADMIN_LOGS);

                // Set dữ liệu từ cache ngay lập tức nếu có
                if (cachedTypes) state.setExamTypes(cachedTypes as any);
                if (cachedLevels) state.setExamLevels(cachedLevels as any);
                if (cachedExams) state.setExams(cachedExams as any);
                if (cachedBadges) state.setBadges(cachedBadges as any);
                if (cachedAchievements) state.setAchievements(cachedAchievements as any);
                if (cachedRules) state.setCommunityRules(cachedRules as any);
                if (cachedModerationLogs) state.setModerationLogs(cachedModerationLogs as any);
                if (cachedViolations) state.setViolationsData(cachedViolations as any);
                if (cachedAdminLogs) state.setAdminLogs(cachedAdminLogs as any);

                // Fetch dữ liệu mới từ API (chỉ fetch những gì chưa có trong cache)
                const fetchPromises: Promise<any>[] = [];
                
                if (!cachedTypes) fetchPromises.push(fetchExamTypes().then(data => { state.setExamTypes(data); cacheService.set(CACHE_KEYS.EXAM_TYPES, data); }));
                if (!cachedLevels) fetchPromises.push(fetchExamLevels().then(data => { state.setExamLevels(data); cacheService.set(CACHE_KEYS.EXAM_LEVELS, data); }));
                if (!cachedExams) fetchPromises.push(fetchExams({ page: 1, limit: 1000 }).then(res => { state.setExams(res.data); cacheService.set(CACHE_KEYS.EXAMS, res.data); }));
                if (!cachedBadges) fetchPromises.push(fetchBadges().then(data => { state.setBadges(data); cacheService.set(CACHE_KEYS.BADGES, data); }));
                if (!cachedAchievements) fetchPromises.push(fetchAchievements({ page: 1, limit: 1000 }).then(res => { state.setAchievements(res.data); cacheService.set(CACHE_KEYS.ACHIEVEMENTS, res.data); }));
                if (!cachedRules) fetchPromises.push(fetchCommunityRules({ page: 1, limit: 1000, status: 'all' }).then(res => { state.setCommunityRules(res.data); cacheService.set(CACHE_KEYS.COMMUNITY_RULES, res.data); }));
                if (!cachedModerationLogs) fetchPromises.push(fetchModerationLogs().then(res => { state.setModerationLogs(res.data); cacheService.set(CACHE_KEYS.MODERATION_LOGS, res.data); }));
                if (!cachedViolations) fetchPromises.push(fetchViolations({ page: 1, limit: 1000, severity: 'all', targetType: 'all' }).then(res => { const rawViolations = res.data.data as any[]; state.setViolationsData(rawViolations as any); cacheService.set(CACHE_KEYS.VIOLATIONS, rawViolations); }));
                if (!cachedAdminLogs) fetchPromises.push(fetchAdminLogs().then(data => { state.setAdminLogs(data); cacheService.set(CACHE_KEYS.ADMIN_LOGS, data); }));

                // Chờ tất cả các fetch hoàn thành
                if (fetchPromises.length > 0) {
                    await Promise.all(fetchPromises);
                }
            } catch (error) {
                console.error("Failed to load initial app data:", error);
            }
        };

        if (isAuthenticated) {
            loadInitialData();
        } else {
            // Clear data và cache khi logout
            console.log("Not authenticated, clearing initial data...");
            state.setExamTypes([]);
            state.setExamLevels([]);
            state.setExams([]);
            state.setVocabularies([]);
            state.setBadges([]);
            state.setAchievements([]);
            state.setCommunityRules([]);
            state.setModerationLogs([]);
            state.setViolationsData([]);
            cacheService.clearAll();
        }
    }, [isAuthenticated]); // Dependency array now listens to authentication status changes




    // 2. Memoized Derived Data (Selectors)
    const derivedData = useDerivedData({
        postsData: state.postsData,
        commentsData: state.comments,
        violationsData: state.violationsData,
        users: state.users,
        badges: state.badges,
        rules: state.communityRules,
        violationRules: state.violationRules,
        appealsData: state.appealsData,
    });

    const getters = useGetters({
        posts: derivedData.posts,
        allPosts: state.postsData, 
        comments: state.comments,
        postLikes: state.postLikes,
        postViews: state.postViews,
    });
    
    // 3. Action Dispatchers
    const logActions = useLogActions({ setAdminLogs: state.setAdminLogs, currentUser: currentUser as User | null });
    
    const communityActions = useCommunityActions({
        setPostsData: state.setPostsData,
        setComments: state.setComments,
        setPostLikes: state.setPostLikes,
        setPostViews: state.setPostViews,
    });
    
    const moderationActions = useModerationActions({
        setViolationsData: state.setViolationsData,
        setViolationRules: state.setViolationRules,
        setModerationLogs: state.setModerationLogs,
        addAdminLog: logActions.addAdminLog,
    });

    const ruleActions = useRuleActions({ setCommunityRules: state.setCommunityRules, addAdminLog: logActions.addAdminLog });
    
    const settingsActions = useSettingsActions({
        setAchievements: state.setAchievements,
        setUserAchievements: state.setUserAchievements,
        setBadges: state.setBadges,
        users: state.users,
        setUsers: state.setUsers,
        addAdminLog: logActions.addAdminLog,
    });

    const userActions = useUserActions({ setUsers: state.setUsers, setUserUsage: state.setUserUsage, addAdminLog: logActions.addAdminLog });
    
    const examActions = useExamActions({ 
        setExamTypes: state.setExamTypes, 
        setExamLevels: state.setExamLevels, 
        setExams: state.setExams,
        addAdminLog: logActions.addAdminLog 
    });

    const contentActions = useContentActions({
        setNotebooks: state.setNotebooks,
        setVocabularies: state.setVocabularies,
        addAdminLog: logActions.addAdminLog,
    });

    const monetizationActions = useMonetizationActions({
        setSubscriptions: state.setSubscriptions,
        setPayments: state.setPayments,
        setRefunds: state.setRefunds,
        setUserSubscriptions: state.setUserSubscriptions,
        addAdminLog: logActions.addAdminLog,
    });

    const tipsActions = useTipsActions({
        setTips: state.setTips,
        addAdminLog: logActions.addAdminLog,
    });
    
    // 4. Assemble Context Value
    const contextValue = useMemo(() => {
        // Ghi đè hàm addViolation để tích hợp ghi log admin một cách tập trung
        const addViolationWithLogging = (payload: AddViolationPayload) => {
            moderationActions.addViolation(payload);
            const ruleNames = state.communityRules.filter(r => payload.ruleIds.includes(r.id)).map(r => r.title).join(', ');
            logActions.addAdminLog({
                action_type: `CREATE_VIOLATION`,
                target_id: payload.target_id,
                description: `Tạo vi phạm [${ruleNames}] cho ${payload.target_type} của người dùng ${payload.user_id}`
            });
        };

        return {
            // State
            ...state, // Raw state arrays
            ...derivedData, // Enriched data arrays (posts, violations, etc.)

            // Getters
            ...getters,

            // Actions
            ...communityActions,
            ...moderationActions,
            ...ruleActions,
            ...settingsActions,
            ...userActions,
            ...logActions,
            ...examActions,
            ...contentActions,
            ...monetizationActions,
            ...tipsActions,
            
            // Overridden actions with logging
            addViolation: addViolationWithLogging,
        };
    }, [
        state, derivedData, getters, communityActions, moderationActions, ruleActions, 
        settingsActions, userActions, logActions, examActions, contentActions, 
        monetizationActions, tipsActions, isAuthenticated
    ]);

    return (
        <AppDataContext.Provider value={contextValue}>
            {children}
        </AppDataContext.Provider>
    );
};