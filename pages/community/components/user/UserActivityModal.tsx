import React, { useState, useMemo } from 'react';
import { User, Post, CommentWithUser } from '../../../../types';
import type { UserCommunityActivity } from '../../api/activity';
import Modal from '../../../../components/Modal';
import Badge from '../ui/Badge';
import { mockBadges } from '../../../../mock/settings';
import RemovedContentTab from '../moderation/RemovedContentTab';
//  Corrected import from PostFeed (list component) to PostCard (single item component).
import PostFeedCard from '../feed/PostCard';
import { useAppData } from '../../../../contexts/appData/context'; 
import { ShieldExclamationIcon } from '../../../../constants'; 

interface UserActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    currentUser: User | null;
    initialTab?: string;
    initialSubTab?: string;
    activityData?: UserCommunityActivity | null; // Aggregated data from API
    getPostsByUserId: (userId: string) => Post[];
    getLikedPostsByUserId: (userId: string) => Post[];
    getCommentedPostsByUserId: (userId: string) => Post[];
    getViewedPostsByUserId: (userId: string) => Post[];
    getRemovedPostsByUserId: (userId: string) => Post[];
    getRemovedCommentsByUserId: (userId: string) => CommentWithUser[];
    onPostSelect: (post: Post) => void;
    // Props cho PostFeedCard và RemovedContentTab
    likedPosts: Set<string>;
    viewedPosts: Set<string>;
    onToggleLike: (postId: string, isLiked: boolean) => void;
    onToggleView: (postId: string, isViewed: boolean) => void;
    onUserClick: (user: User) => void;
    onEditPost: (post: Post) => void;
    onRemovePost: (post: Post) => void;
    onRestorePost: (post: Post) => void;
    onRestoreComment: (comment: CommentWithUser) => void;
}

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            active ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
        {children}
    </button>
);

const UserActivityModal: React.FC<UserActivityModalProps> = ({ 
    isOpen, 
    onClose, 
    user,
    currentUser,
    initialTab,
    initialSubTab,
    activityData,
    getPostsByUserId,
    getLikedPostsByUserId,
    getCommentedPostsByUserId,
    getViewedPostsByUserId,
    onPostSelect,
    ...rest
}) => {
    const { violations, posts: contextPosts, users: contextUsers, badges: contextBadges } = useAppData();
    const [activeTab, setActiveTab] = useState(initialTab || 'posts');
    
    // ⚠️ TẤT CẢ HOOKS PHẢI Ở TRÊN CÙNG, TRƯỚC BẤT KỲ EARLY RETURN NÀO
    React.useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab || 'posts');
        }
    }, [initialTab, isOpen]);

    // Tính toán số vi phạm - phải tính trước khi check user
    const violationCount = useMemo(() => {
        if (!user) return 0;
        return violations.filter(v => v.user_id === user.id).length;
    }, [violations, user]);

    const content = useMemo(() => {
        if (!user) return null;
        let posts: Post[] = [];

        // Use aggregated data if available, else fallback to getter functions
        if (activeTab === 'posts') {
            const base = (activityData?.posts || getPostsByUserId(user.id)).filter(p => p.status !== 'removed');
            // Đảm bảo post có user/badge bằng cách lấy bản enrich từ context
            posts = base.map(p => contextPosts.find(cp => cp.id === p.id) || p);
        }
        else if (activeTab === 'likes') posts = activityData?.likedPosts || getLikedPostsByUserId(user.id);
        else if (activeTab === 'comments') posts = activityData?.commentedPosts || getCommentedPostsByUserId(user.id);
        else if (activeTab === 'views') posts = activityData?.viewedPosts || getViewedPostsByUserId(user.id);
        else if (activeTab === 'removed') {
            console.log('[UserActivityModal] Rendering removed tab');
            console.log('[UserActivityModal] activityData:', activityData);
            console.log('[UserActivityModal] initialSubTab:', initialSubTab);
            // Enrich removed posts/comments bằng dữ liệu context nếu phía API trả về dạng thô
            const removedPostsEnriched = (activityData?.removedPosts || []).map(p => contextPosts.find(cp => cp.id === p.id) || p);
            const removedCommentsEnriched = (activityData?.removedComments || []).map((c: any) => {
                if (c.user) return c;
                const u = contextUsers.find(u => u.id === (c.user_id || c.user?.id));
                const badge = u ? (contextBadges.find(b => b.level === u.badge_level) || contextBadges[0]) : undefined;
                return { ...c, user: u, badge, replies: c.replies || [] };
            });
            console.log('[UserActivityModal] removedPostsEnriched:', removedPostsEnriched);
            console.log('[UserActivityModal] removedCommentsEnriched:', removedCommentsEnriched);
            return (
                <RemovedContentTab
                    user={user}
                    currentUser={currentUser}
                    onPostSelect={onPostSelect}
                    initialSubTab={initialSubTab as 'posts' | 'comments'}
                    removedPosts={removedPostsEnriched as any}
                    removedComments={removedCommentsEnriched as any}
                    {...rest}
                />
            );
        }

        const loading = isOpen && activityData === undefined; // undefined => still loading
        if (loading) {
            return <p className="text-center text-gray-400 py-16">Đang tải dữ liệu hoạt động...</p>;
        }

        return posts.length > 0 
            ? posts.map(post => (
                <div key={`${activeTab}-${post.id}`}>
                    <PostFeedCard 
                        post={post}
                        currentUser={currentUser}
                        isLiked={rest.likedPosts.has(post.id)}
                        isViewed={rest.viewedPosts.has(post.id)}
                        onViewDetails={onPostSelect}
                        onEdit={rest.onEditPost}
                        onRemove={rest.onRemovePost}
                        onToggleLike={rest.onToggleLike}
                        onToggleView={rest.onToggleView}
                        onUserClick={rest.onUserClick}
                    />
                </div>
            ))
            : <p className="text-center text-gray-500 py-16">Không có hoạt động nào.</p>;
            
    }, [activeTab, user, currentUser, getPostsByUserId, getLikedPostsByUserId, getCommentedPostsByUserId, getViewedPostsByUserId, onPostSelect, initialSubTab, rest, activityData, isOpen, contextPosts, contextUsers, contextBadges]);

    // Xử lý trường hợp user chưa load - PHẢI SAU TẤT CẢ HOOKS
    if (!user) {
        return (
            <Modal isOpen={isOpen} onClose={() => {}} title="Đang tải..." className="max-w-4xl">
                <div className="flex items-center justify-center py-16">
                    <p className="text-gray-500">Đang tải thông tin người dùng...</p>
                </div>
            </Modal>
        );
    }
    
    const userBadge = mockBadges.find(b => b.level === user.badge_level);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Hoạt động của ${user.name}`} className="max-w-4xl">
            <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img src={user.avatar_url || ''} alt={user.name} className="w-16 h-16 rounded-full" />
                    <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                           <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                           {userBadge && <Badge badge={userBadge} />}
                           {violationCount > 0 && (
                                <div className="flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                    <ShieldExclamationIcon className="w-3.5 h-3.5 mr-1" />
                                    {violationCount} vi phạm
                                </div>
                           )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
                    <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')}>Bài đã đăng</TabButton>
                    <TabButton active={activeTab === 'likes'} onClick={() => setActiveTab('likes')}>Đã thích</TabButton>
                    <TabButton active={activeTab === 'comments'} onClick={() => setActiveTab('comments')}>Đã bình luận</TabButton>
                    <TabButton active={activeTab === 'views'} onClick={() => setActiveTab('views')}>Bài đã xem</TabButton>
                    <TabButton active={activeTab === 'removed'} onClick={() => setActiveTab('removed')}>Đã gỡ</TabButton>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                    {content}
                </div>
            </div>
        </Modal>
    );
};

export default UserActivityModal;