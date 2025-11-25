import { apiClient } from '../../../services/apiClient';
import { Post, CommentWithUser, Violation, ModerationLog } from '../../../types';
import { mockPosts, mockComments, mockPostLikes, mockPostViews, mockBadges as rootMockBadges } from '../../../mock';
import { mockViolations, mockModerationLogs, enrichViolation } from '../../../mock/moderation';
import { mockUsers } from '../../../mock/users';
import { mockBadges } from '../../../mock/settings';

const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API !== 'false';

// Simple cache & inflight tracking to prevent repeated rapid fetch loops
const activityCache = new Map<string, UserCommunityActivity>();
const inflightActivity = new Map<string, Promise<UserCommunityActivity>>();

// Helper: Save JSON to file (browser only)
const saveJsonToFile = (data: unknown, filename: string) => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to save JSON file', e);
  }
};

export interface UserCommunityActivity {
  posts: Post[];
  likedPosts: Post[];
  commentedPosts: Post[];
  viewedPosts: Post[];
  removedPosts: Post[];
  removedComments: CommentWithUser[];
  violations: Violation[];
  moderationLogs: ModerationLog[];
}

// Helper to enrich a raw comment into CommentWithUser (single level, no replies nesting here)
const enrichComment = (comment: any): CommentWithUser => {
  const user = mockUsers.find(u => u.id === comment.user_id) || { id: comment.user_id, name: 'Unknown', avatar_url: '', badge_level: 0, role: 'user' };
  const badge = mockBadges.find(b => b.level === user.badge_level) || mockBadges[0];
  return { ...comment, user, badge, replies: [] } as CommentWithUser;
};

// Helper to enrich a raw post into Post (mirror logic from posts.ts)
const enrichPost = (post: any): Post => {
  const user = mockUsers.find(u => u.id === post.user_id) || { id: 'unknown', name: 'Không xác định', avatar_url: '', badge_level: 0, role: 'user' };
  const badge = mockBadges.find(b => b.level === user?.badge_level) || mockBadges[0];
  return {
    ...post,
    user,
    badge,
    comment_count: mockComments.filter(c => c.post_id === post.id && !c.deleted_at).length,
    likes: mockPostLikes.filter(l => l.post_id === post.id).length,
    views: mockPostViews.filter(v => v.post_id === post.id).length,
  } as Post;
};

export const fetchUserCommunityActivity = async (userId: string, options?: { force?: boolean }): Promise<UserCommunityActivity> => {
  const force = options?.force;
  // Return cached result if available and not forcing refresh
  if (!force && activityCache.has(userId)) {
    return activityCache.get(userId)!;
  }
  // Return existing inflight promise if fetch already started and not forcing
  // Always return the inflight promise to prevent duplicate requests
  if (inflightActivity.has(userId)) {
    return inflightActivity.get(userId)!;
  }

  

  const fetchPromise = (async () => {
  // Mock API cho test hiển thị
  if (USE_MOCK_API) {
    // Posts authored by user (excluding drafts & removed)
    const posts = mockPosts.filter(p => p.user_id === userId && p.status !== 'draft' && p.status !== 'removed').map(enrichPost);

    // Likes
    const likedPostIds = new Set(mockPostLikes.filter(l => l.user_id === userId).map(l => l.post_id));
    const likedPosts = mockPosts.filter(p => likedPostIds.has(p.id)).map(enrichPost);

    // Comments (unique posts commented)
    const userComments = mockComments.filter(c => c.user_id === userId && !c.deleted_at);
    const commentedPostIds = Array.from(new Set(userComments.map(c => c.post_id)));
    const commentedPosts = mockPosts.filter(p => commentedPostIds.includes(p.id)).map(enrichPost);

    // Views
    const viewedPostIds = new Set(mockPostViews.filter(v => v.user_id === userId).map(v => v.post_id));
    const viewedPosts = mockPosts.filter(p => viewedPostIds.has(p.id)).map(enrichPost);

    // Removed posts & comments
    const removedPosts = mockPosts.filter(p => p.user_id === userId && p.status === 'removed').map(enrichPost);
    const removedCommentsRaw = mockComments.filter(c => c.user_id === userId && !!c.deleted_at);
    const removedComments = removedCommentsRaw.sort((a, b) => new Date(b.deleted_at!).getTime() - new Date(a.deleted_at!).getTime()).map(enrichComment);

    // Violations & moderation logs
    const violations = mockViolations.filter(v => v.user_id === userId).map(v => enrichViolation(v));
    const moderationLogs = mockModerationLogs.filter(log => log.target_type === 'post' || log.target_type === 'comment').filter(log => {
      // Collect logs where target belongs to this user
      if (log.target_type === 'post') {
        const post = mockPosts.find(p => p.id === log.target_id);
        return post?.user_id === userId;
      } else if (log.target_type === 'comment') {
        const comment = mockComments.find(c => c.id === log.target_id);
        return comment?.user_id === userId;
      }
      return false;
    });

    const result: UserCommunityActivity = {
      posts: posts as Post[],
      likedPosts: likedPosts as Post[],
      commentedPosts: commentedPosts as Post[],
      viewedPosts: viewedPosts as Post[],
      removedPosts: removedPosts as Post[],
      removedComments,
      violations: violations as Violation[],
      moderationLogs,
    };
    activityCache.set(userId, result);
    
    return result;
  } else {
    // Real API single aggregation endpoint.
    // Backend should return either the plain object or an envelope { success, data }.
    const aggregated: any = await apiClient.get(`/community/users/${userId}/activity`);
    const payload = (aggregated && (aggregated.data || aggregated)) || {};

    const {
      posts = [],
      likedPosts = [],
      commentedPosts = [],
      viewedPosts = [],
      removedPosts = [],
      removedComments = [],
      violations = [],
      moderationLogs = [],
    } = (payload.success ? payload.data : payload) || {};

    const result: UserCommunityActivity = { posts, likedPosts, commentedPosts, viewedPosts, removedPosts, removedComments, violations, moderationLogs } as UserCommunityActivity;
    activityCache.set(userId, result);
    return result;
  }

})();

  // Track inflight for this userId unconditionally to dedupe callers
  inflightActivity.set(userId, fetchPromise);
  try {
    const data = await fetchPromise;
    return data;
  } finally {
    // Remove inflight when finished (only if not replaced by another force call)
    if (inflightActivity.get(userId) === fetchPromise) {
      inflightActivity.delete(userId);
    }
  }
};
