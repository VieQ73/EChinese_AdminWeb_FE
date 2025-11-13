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
                const [types, levels, examsResponse] = await Promise.all([
                    fetchExamTypes(),
                    fetchExamLevels(),
                    fetchExams({ page: 1, limit: 1000 }), // Fetch a large number of exams initially
                ]);
                state.setExamTypes(types);
                state.setExamLevels(levels);
                state.setExams(examsResponse.data);
            } catch (error) {
                console.error("Failed to load initial app data:", error);
            }
        };

        if (isAuthenticated) {
            loadInitialData();
        } else {
            // Optional: Clear data on logout to prevent stale data showing up briefly on next login
            console.log("Not authenticated, clearing initial data...");
            state.setExamTypes([]);
            state.setExamLevels([]);
            state.setExams([]);
            state.setVocabularies([]);
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