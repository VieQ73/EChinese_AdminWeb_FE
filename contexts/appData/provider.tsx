// contexts/appData/provider.tsx
import React, { ReactNode, useMemo, useContext } from 'react';
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
    useContentActions,       // Thêm mới
    useMonetizationActions,  // Thêm mới
    useTipsActions,          // Thêm mới
} from './actions';
import { User } from '../../types';
import { AuthContext } from '../AuthContext';
import { AddViolationPayload } from './types';

interface AppDataProviderProps {
    children: ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children }) => {
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.user;

    // 1. Raw State Management
    const state = useAppDataState();

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
        monetizationActions, tipsActions
    ]);

    return (
        <AppDataContext.Provider value={contextValue}>
            {children}
        </AppDataContext.Provider>
    );
};