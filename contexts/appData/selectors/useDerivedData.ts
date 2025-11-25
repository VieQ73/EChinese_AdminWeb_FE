// contexts/appData/selectors/useDerivedData.ts
import { useMemo } from 'react';
import {
    RawPost, Post, Comment, User, BadgeLevel, Violation, CommunityRule,
    ViolationRule, Report, Appeal
} from '../../../types';
import { mockBadges } from '../../../mock';

interface UseDerivedDataProps {
    postsData: RawPost[];
    commentsData: Comment[];
    violationsData: Omit<Violation, 'rules' | 'user' | 'targetContent'>[];
    users: User[];
    badges: BadgeLevel[];
    rules: CommunityRule[];
    violationRules: ViolationRule[];
    appealsData: Appeal[];
}

export const useDerivedData = ({
    postsData,
    commentsData,
    violationsData,
    users,
    badges,
    rules,
    violationRules,
    appealsData,
}: UseDerivedDataProps) => {

    const posts = useMemo((): Post[] => {
        return postsData.map(post => {
            const user = users.find(u => u.id === post.user_id);
            const badge = badges.find(b => b.level === user?.badge_level) || mockBadges[0];
            return {
                ...post,
                user: user || { id: 'unknown', name: 'Người dùng không xác định', avatar_url: '', badge_level: 0, role: 'user' },
                badge,
                comment_count: commentsData.filter(c => c.post_id === post.id && !c.deleted_at).length,
            };
        });
    }, [postsData, users, badges, commentsData]);

    const violations = useMemo((): Violation[] => {
        return violationsData.map(v => {
            const enriched = v as any;
            const user = users.find(u => u.id === v.user_id) || enriched.user || null;
            const computedTarget = v.target_type === 'post' ? postsData.find(p => p.id === v.target_id)
                : v.target_type === 'comment' ? commentsData.find(c => c.id === v.target_id)
                : users.find(u => u.id === v.target_id);
            const targetContent = computedTarget || enriched.targetContent || null;

            const relatedRuleIds = violationRules.filter(vr => vr.violation_id === v.id).map(vr => vr.rule_id);
            const relatedRules = relatedRuleIds.length > 0
                ? rules.filter(rule => relatedRuleIds.includes(rule.id))
                : (enriched.rules || []);

            return {
                ...(v as any),
                user,
                targetContent,
                rules: relatedRules,
            } as Violation;
        });
    }, [violationsData, users, postsData, commentsData, violationRules, rules]);
    
    const appeals = useMemo((): Appeal[] => {
        return appealsData.map(a => {
             const user = users.find(u => u.id === a.user_id);
             const violation = violations.find(v => v.id === a.violation_id);
             return { ...a, user, violation };
        })
    }, [appealsData, users, violations]);


    return {
        posts,
        violations,
        appeals,
    };
};
