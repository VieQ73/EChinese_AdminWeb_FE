import React, { ReactNode, useCallback, useMemo, useEffect } from 'react';
import {
    Report, RawPost, Comment, Post, User, CommentWithUser, ModerationLog,
    PostLike, PostView, Violation, Appeal, ViolationRule, CommunityRule,
    Notification, UserAchievement, BadgeLevel, Achievement, UserUsage
} from '../../types';
import { useAppDataState } from './state';
import { AppDataContext } from './context';
import { grantAchievementToUser as grantAchievementApi } from '../../pages/settings/achievements/api';
import * as badgeApi from '../../pages/settings/badges/api';
import * as ruleApi from '../../pages/rules/api';
import * as achievementApi from '../../pages/settings/achievements/api';
import { AddViolationPayload, AppDataContextType } from './types';

/**
 * Component Provider chính cho AppDataContext.
 * Chứa tất cả logic quản lý state, actions, và dữ liệu memoized.
 */
export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const {
        users, setUsers, reports, setReports, postsData, setPostsData,
        comments, setComments, postLikes, setPostLikes, postViews, setPostViews,
        moderationLogs, setModerationLogs, violationsData, setViolationsData,
        communityRules, setCommunityRules, violationRules, setViolationRules,
        appealsData, setAppealsData, notifications, setNotifications,
        userAchievements, setUserAchievements, badges, setBadges,
        achievements, setAchievements, userStreaks, setUserStreaks, userUsage, setUserUsage,
    } = useAppDataState();

    // --- Logic làm giàu dữ liệu và tạo state dẫn xuất (derived state) ---
    const enrichPosts = useCallback((rawPosts: RawPost[]): Post[] => {
        return rawPosts.map(post => {
            const user = users.find(u => u.id === post.user_id);
            const badge = badges.find(b => b.level === user?.badge_level) || badges[0];
            return {
                ...post,
                user: user || { id: 'unknown', name: 'Người dùng không xác định', avatar_url: '', badge_level: 0, role: 'user' },
                badge: badge,
                comment_count: comments.filter(c => c.post_id === post.id && !c.deleted_at).length,
                likes: postLikes.filter(l => l.post_id === post.id).length,
                views: postViews.filter(v => v.post_id === post.id).length,
            };
        }).sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [users, comments, postLikes, postViews, badges]);
    
    const posts = useMemo(() => enrichPosts(postsData), [postsData, enrichPosts]);

    const enrichViolation = useCallback((violation: Omit<Violation, 'rules' | 'user' | 'targetContent'>): Violation => {
        const user = users.find(u => u.id === violation.user_id);
        let target: Partial<RawPost & Comment & User> | null = null;
        if (violation.target_type === 'post') target = postsData.find(p => p.id === violation.target_id) || null;
        else if (violation.target_type === 'comment') target = comments.find(c => c.id === violation.target_id) || null;
        else if (violation.target_type === 'user') target = users.find(u => u.id === violation.target_id) || null;
        
        const relatedRuleIds = violationRules.filter(vr => vr.violation_id === violation.id).map(vr => vr.rule_id);
        const rules = communityRules.filter(rule => relatedRuleIds.includes(rule.id));
        
        return { ...violation, user, targetContent: target, rules };
    }, [users, postsData, comments, violationRules, communityRules]);

    const enrichAppeal = useCallback((appeal: Appeal): Appeal => {
        const user = users.find(u => u.id === appeal.user_id);
        if (appeal.status === 'accepted' && appeal.violation_snapshot) return { ...appeal, user };
        const violationData = violationsData.find(v => v.id === appeal.violation_id);
        const enrichedViolation = violationData ? enrichViolation(violationData) : undefined;
        return { ...appeal, user, violation: enrichedViolation };
    }, [users, violationsData, enrichViolation]);
    
    const violations = useMemo(() => violationsData.map(enrichViolation).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [violationsData, enrichViolation]);
    const appeals = useMemo(() => appealsData.map(enrichAppeal), [appealsData, enrichAppeal]);

    // --- Logic tự động cấp thành tích ---
    useEffect(() => {
        const activeAchievements = achievements.filter(a => a.is_active);
        if (!activeAchievements.length) return;
        
        const newAchievementsToGrant: UserAchievement[] = [];
        const existingUserAchievementSet = new Set(userAchievements.map(ua => `${ua.user_id}-${ua.achievement_id}`));

        for (const user of users) {
            for (const ach of activeAchievements) {
                const key = `${user.id}-${ach.id}`;
                if (existingUserAchievementSet.has(key)) continue;

                let criteriaMet = false;
                const criteria = ach.criteria as any;

                switch (criteria.type) {
                    case 'community_points':
                        if (user.community_points >= criteria.min_points) criteriaMet = true;
                        break;
                    case 'login_streak':
                        const streak = userStreaks.find(s => s.user_id === user.id);
                        if (streak && streak.current_streak >= criteria.min_streak) criteriaMet = true;
                        break;
                    case 'usage':
                        const usage = userUsage.find(u => u.user_id === user.id && u.feature === criteria.feature);
                        if (usage && usage.daily_count >= criteria.min_count) criteriaMet = true;
                        break;
                    // Thêm các case khác ở đây (ví dụ: mock_test)
                }

                if (criteriaMet) {
                    newAchievementsToGrant.push({
                        id: `ua_auto_${Date.now()}_${Math.random()}`,
                        user_id: user.id,
                        achievement_id: ach.id,
                        achieved_at: new Date().toISOString(),
                        achievement_name: ach.name,
                        user_name: user.name,
                        user_avatar: user.avatar_url,
                    });
                     existingUserAchievementSet.add(key); // Tránh cấp lại trong cùng một lần chạy
                }
            }
        }
        
        if (newAchievementsToGrant.length > 0) {
            setUserAchievements(prev => [...prev, ...newAchievementsToGrant]);
        }
    }, [users, achievements, userAchievements, userStreaks, userUsage, setUserAchievements]);

    // --- Định nghĩa các hàm Action (useCallback) ---
    const updateUser = useCallback((userId: string, updatedData: Partial<User>) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData } : u)), [setUsers]);
    const updateUserUsage = useCallback((userId: string, feature: 'ai_lesson' | 'ai_translate', updatedData: Partial<UserUsage>) => {
        setUserUsage(prev => prev.map(u => u.user_id === userId && u.feature === feature ? { ...u, ...updatedData } : u));
    }, [setUserUsage]);
    const updateReport = useCallback((reportId: string, updatedData: Partial<Report>) => setReports(prev => prev.map(r => r.id === reportId ? { ...r, ...updatedData } as Report : r)), [setReports]);
    const addPost = useCallback((postData: Omit<RawPost, 'id' | 'created_at' | 'user_id' | 'likes' | 'views'>, currentUser: User) => setPostsData(prev => [{ id: `p${Date.now()}`, user_id: currentUser.id, created_at: new Date().toISOString(), likes: 0, views: 0, ...postData }, ...prev]), [setPostsData]);
    const updatePost = useCallback((postId: string, postData: Partial<Omit<RawPost, 'id'>>) => setPostsData(prev => prev.map(p => p.id === postId ? { ...p, ...postData } : p)), [setPostsData]);
    const addComment = useCallback((comment: Comment) => setComments(prev => [...prev, comment]), [setComments]);
    const updateComment = useCallback((commentId: string, updatedData: Partial<Comment>) => { const mockIndex = comments.findIndex(c => c.id === commentId); if (mockIndex !== -1) { comments[mockIndex] = { ...comments[mockIndex], ...updatedData }; } setComments(prev => prev.map(c => (c.id === commentId ? { ...c, ...updatedData } : c))); }, [comments, setComments]);
    const toggleLike = useCallback((postId: string, userId: string) => { setPostLikes(prev => { const index = prev.findIndex(l => l.post_id === postId && l.user_id === userId); if (index > -1) { return prev.filter((_, i) => i !== index); } return [...prev, { id: `pl${Date.now()}`, post_id: postId, user_id: userId, created_at: new Date().toISOString() }]; }); }, [setPostLikes]);
    const toggleView = useCallback((postId: string, userId: string) => { setPostViews(prev => { const index = prev.findIndex(v => v.post_id === postId && v.user_id === userId); if (index > -1) { return prev.filter((_, i) => i !== index); } return [...prev, { id: `pv${Date.now()}`, post_id: postId, user_id: userId, viewed_at: new Date().toISOString() }]; }); }, [setPostViews]);
    const addModerationLog = useCallback((logData: Omit<ModerationLog, 'id' | 'created_at'>) => setModerationLogs(prev => [{ id: `ml${Date.now()}`, created_at: new Date().toISOString(), ...logData }, ...prev]), [setModerationLogs]);
    const addViolation = useCallback(({ ruleIds, ...violationData }: AddViolationPayload) => { const newId = `v${Date.now()}`; setViolationsData(prev => [{ id: newId, created_at: new Date().toISOString(), handled: true, resolved_at: new Date().toISOString(), ...violationData }, ...prev]); if (ruleIds?.length) { setViolationRules(prev => [...prev, ...ruleIds.map(ruleId => ({ id: `vr${Date.now()}${Math.random()}`, violation_id: newId, rule_id: ruleId }))]); } }, [setViolationsData, setViolationRules]);
    const removeViolationByTarget = useCallback((targetType: 'post' | 'comment' | 'user', targetId: string) => { let violationIdToRemove: string | null = null; setViolationsData(prev => { const violation = prev.find(v => v.target_type === targetType && v.target_id === targetId); if (violation) { violationIdToRemove = violation.id; return prev.filter(v => v.id !== violationIdToRemove); } return prev; }); if (violationIdToRemove) { setViolationRules(prev => prev.filter(vr => vr.violation_id !== violationIdToRemove)); } }, [setViolationsData, setViolationRules]);
    const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'created_at'>) => { setNotifications(prev => [{ id: `notif-${Date.now()}`, created_at: new Date().toISOString(), ...notificationData }, ...prev]); }, [setNotifications]);
    const publishNotifications = useCallback((notificationIds: string[]) => { const idsToPublish = new Set(notificationIds); const newReceived: Notification[] = []; notifications.filter(n => idsToPublish.has(n.id)).forEach(notif => { if (!notif.from_system && (notif.audience === 'all' || notif.audience === 'admin')) { newReceived.push({ ...notif, id: `notif-receipt-${notif.id}-${Date.now()}`, from_system: true, audience: 'admin', is_push_sent: true, read_at: null }); } }); setNotifications(prev => [...prev.map(n => idsToPublish.has(n.id) ? { ...n, is_push_sent: true } : n), ...newReceived]); }, [notifications, setNotifications]);
    const deleteNotifications = useCallback((notificationIds: string[]) => { setNotifications(prev => prev.filter(n => !new Set(notificationIds).has(n.id))); }, [setNotifications]);
    const markNotificationsAsRead = useCallback((notificationIds: string[], asRead: boolean) => { setNotifications(prev => prev.map(n => new Set(notificationIds).has(n.id) ? { ...n, read_at: asRead ? (n.read_at || new Date().toISOString()) : null } : n)); }, [setNotifications]);
    const updateAppeal = useCallback((appealId: string, updatedData: Partial<Appeal>, currentUser: User) => { const appeal = appealsData.find(a => a.id === appealId); if (!appeal) return; const finalUpdate = { ...updatedData, resolved_by: currentUser.id, resolved_at: new Date().toISOString() }; if (updatedData.status === 'accepted') { const violation = violationsData.find(v => v.id === appeal.violation_id); if (!violation) return; const snapshot = enrichViolation(violation); setAppealsData(prev => prev.map(a => a.id === appealId ? { ...a, ...finalUpdate, violation_snapshot: snapshot } as Appeal : a)); setViolationsData(prev => prev.filter(v => v.id !== violation.id)); const reason = `Khôi phục do khiếu nại được chấp nhận (ID: ${appealId.substring(0, 4)}...)`; if (snapshot.target_type === 'post') updatePost(snapshot.target_id, { status: 'published', deleted_at: null, deleted_by: null, deleted_reason: null }); else if (snapshot.target_type === 'comment') updateComment(snapshot.target_id, { deleted_at: null, deleted_by: null, deleted_reason: null }); else if (snapshot.target_type === 'user') updateUser(snapshot.target_id, { is_active: true }); addModerationLog({ target_type: snapshot.target_type, target_id: snapshot.target_id, action: 'restore', reason, performed_by: currentUser.id }); } else { setAppealsData(prev => prev.map(a => a.id === appealId ? { ...a, ...finalUpdate } as Appeal : a)); } }, [appealsData, violationsData, setAppealsData, setViolationsData, enrichViolation, updatePost, updateComment, updateUser, addModerationLog]);
    const grantAchievementToUser = useCallback(async (userId: string, achievementId: string): Promise<UserAchievement> => { if (userAchievements.find(ua => ua.user_id === userId && ua.achievement_id === achievementId)) throw new Error("Người dùng đã có thành tích này."); try { const newUserAchievement = await grantAchievementApi(userId, achievementId); setUserAchievements(prev => [newUserAchievement, ...prev]); return newUserAchievement; } catch (error) { console.error("Failed to grant achievement", error); throw error; } }, [userAchievements, setUserAchievements]);
    const createAchievement = useCallback(async (payload: achievementApi.AchievementPayload) => { const newAchievement = await achievementApi.createAchievement(payload); setAchievements(prev => [newAchievement, ...prev]); }, [setAchievements]);
    const updateAchievement = useCallback(async (id: string, payload: Partial<achievementApi.AchievementPayload>) => { const updatedAchievement = await achievementApi.updateAchievement(id, payload); setAchievements(prev => prev.map(a => a.id === id ? updatedAchievement : a)); }, [setAchievements]);
    const deleteAchievement = useCallback(async (id: string) => { await achievementApi.deleteAchievement(id); setAchievements(prev => prev.filter(a => a.id !== id)); }, [setAchievements]);
    const resyncAllUserBadges = useCallback(async () => { const { updatedUsers } = await badgeApi.resyncAllUserBadges(); setUsers(updatedUsers); }, [setUsers]);
    const createBadge = useCallback(async (payload: badgeApi.BadgePayload) => { const newBadge = await badgeApi.createBadge(payload); setBadges(prev => [...prev, newBadge]); if (newBadge.is_active) await resyncAllUserBadges(); }, [setBadges, resyncAllUserBadges]);
    const updateBadge = useCallback(async (badgeId: string, payload: Partial<badgeApi.BadgePayload>) => { const updatedBadge = await badgeApi.updateBadge(badgeId, payload); setBadges(prev => prev.map(b => b.id === badgeId ? updatedBadge : b)); if (payload.is_active !== undefined || payload.min_points !== undefined) await resyncAllUserBadges(); }, [setBadges, resyncAllUserBadges]);
    const deleteBadge = useCallback(async (badgeId: string) => { await badgeApi.deleteBadge(badgeId); setBadges(prev => prev.filter(b => b.id !== badgeId)); await resyncAllUserBadges(); }, [setBadges, resyncAllUserBadges]);
    const createRule = useCallback(async (payload: ruleApi.RulePayload) => { const newRule = await ruleApi.createRule(payload); setCommunityRules(prev => [newRule, ...prev]); }, [setCommunityRules]);
    const updateRule = useCallback(async (ruleId: string, payload: Partial<ruleApi.RulePayload>) => { const updatedRule = await ruleApi.updateRule(ruleId, payload); setCommunityRules(prev => prev.map(r => (r.id === ruleId ? updatedRule : r))); }, [setCommunityRules]);
    const deleteRule = useCallback(async (ruleId: string) => { await ruleApi.deleteRule(ruleId); setCommunityRules(prev => prev.filter(r => r.id !== ruleId)); }, [setCommunityRules]);
    const getLikedPostsByUserId = useCallback((userId: string) => { const ids = new Set(postLikes.filter(l => l.user_id === userId).map(l => l.post_id)); return posts.filter(p => ids.has(p.id)); }, [posts, postLikes]);
    const getCommentedPostsByUserId = useCallback((userId: string) => { const ids = new Set(comments.filter(c => c.user_id === userId).map(c => c.post_id)); return posts.filter(p => ids.has(p.id)); }, [posts, comments]);
    const getViewedPostsByUserId = useCallback((userId: string) => { const ids = new Set(postViews.filter(v => v.user_id === userId).map(v => v.post_id)); return posts.filter(p => ids.has(p.id)); }, [posts, postViews]);
    const getRemovedCommentsByUserId = useCallback((userId: string): CommentWithUser[] => { return comments.filter(c => c.user_id === userId && c.deleted_at).map(comment => { const user = users.find(u => u.id === comment.user_id); const badge = badges.find(b => b.level === user?.badge_level) || badges[0]; return { ...comment, user: user!, badge: badge, replies: [] }; }).sort((a, b) => new Date(b.deleted_at!).getTime() - new Date(a.deleted_at!).getTime()); }, [comments, users, badges]);

    const contextValue: AppDataContextType = useMemo(() => ({
        users, reports, posts, comments, postLikes, postViews, moderationLogs, violations, appeals, communityRules, notifications, userAchievements, badges, achievements, userUsage,
        updateUser, updateUserUsage, updateReport, addPost, updatePost, addComment, updateComment, toggleLike, toggleView,
        addModerationLog, addViolation, removeViolationByTarget, updateAppeal,
        addNotification, publishNotifications, deleteNotifications, markNotificationsAsRead,
        grantAchievementToUser, createBadge, updateBadge, deleteBadge, resyncAllUserBadges,
        createAchievement, updateAchievement, deleteAchievement,
        createRule, updateRule, deleteRule,
        getLikedPostsByUserId, getCommentedPostsByUserId, getViewedPostsByUserId, getRemovedCommentsByUserId,
    }), [
        users, reports, posts, comments, postLikes, postViews, moderationLogs, violations, appeals, communityRules, notifications, userAchievements, badges, achievements, userUsage,
        updateUser, updateUserUsage, updateReport, addPost, updatePost, addComment, updateComment, toggleLike, toggleView,
        addModerationLog, addViolation, removeViolationByTarget, updateAppeal,
        addNotification, publishNotifications, deleteNotifications, markNotificationsAsRead,
        grantAchievementToUser, createBadge, updateBadge, deleteBadge, resyncAllUserBadges,
        createAchievement, updateAchievement, deleteAchievement,
        createRule, updateRule, deleteRule,
        getLikedPostsByUserId, getCommentedPostsByUserId, getViewedPostsByUserId, getRemovedCommentsByUserId,
    ]);

    return (
        <AppDataContext.Provider value={contextValue}>
            {children}
        </AppDataContext.Provider>
    );
};