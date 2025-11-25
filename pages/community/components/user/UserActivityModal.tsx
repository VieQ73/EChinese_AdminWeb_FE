/**
 * Modal hiển thị hoạt động của user trong cộng đồng
 * Sử dụng React Query pattern - mỗi tab có API riêng
 */
import React, { useState, useEffect, useMemo } from 'react';
import { User, Post, CommentWithUser } from '../../../../types';
import Modal from '../../../../components/Modal';
import Badge from '../ui/Badge';
import { mockBadges } from '../../../../mock/settings';
import { useAppData } from '../../../../contexts/appData/context';
import { ShieldExclamationIcon } from '../../../../constants';
import { PostsTab, LikesTab, CommentsTab, ViewsTab, RemovedTab } from './ActivityTabs';
import { useActivityCounts } from '../../hooks/useUserActivity';

interface UserActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    currentUser: User | null;
    initialTab?: string;
    initialSubTab?: string;
    onPostSelect: (post: Post) => void;
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

type TabKey = 'posts' | 'likes' | 'comments' | 'views' | 'removed';

const TABS: { key: TabKey; label: string }[] = [
    { key: 'posts', label: 'Bài đã đăng' },
    { key: 'likes', label: 'Đã thích' },
    { key: 'comments', label: 'Đã bình luận' },
    { key: 'views', label: 'Bài đã xem' },
    { key: 'removed', label: 'Đã gỡ' },
];

const UserActivityModal: React.FC<UserActivityModalProps> = ({
    isOpen, onClose, user, currentUser, initialTab, initialSubTab,
    onPostSelect, likedPosts, viewedPosts, onToggleLike, onToggleView,
    onUserClick, onEditPost, onRemovePost, onRestorePost, onRestoreComment,
}) => {
    const { violations } = useAppData();
    const [activeTab, setActiveTab] = useState<TabKey>((initialTab as TabKey) || 'posts');
    const userBadge = mockBadges.find(b => b.level === user.badge_level);
    const violationCount = useMemo(() => violations.filter(v => v.user_id === user.id).length, [violations, user.id]);
    
    // Lấy số lượng cho các tab
    const counts = useActivityCounts(user.id, isOpen);

    // Reset tab khi modal mở
    useEffect(() => {
        if (isOpen) setActiveTab((initialTab as TabKey) || 'posts');
    }, [initialTab, isOpen, user.id]);

    // Props chung cho các tab
    const tabProps = {
        userId: user.id,
        currentUser,
        likedPosts,
        viewedPosts,
        onPostSelect,
        onToggleLike,
        onToggleView,
        onUserClick,
        onEditPost,
        onRemovePost,
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Hoạt động của ${user.name}`} className="max-w-4xl">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img src={user.avatar_url || ''} alt={user.name} className="w-14 h-14 rounded-full object-cover bg-gray-200" />
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                            {userBadge && <Badge badge={userBadge} />}
                            {violationCount > 0 && (
                                <span className="flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                    <ShieldExclamationIcon className="w-3.5 h-3.5 mr-1" />{violationCount} vi phạm
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
                    {TABS.map(tab => {
                        const count = counts[tab.key as keyof typeof counts];
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                                    activeTab === tab.key
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label}
                                {typeof count === 'number' && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-4">
                    {activeTab === 'posts' && <PostsTab {...tabProps} enabled={isOpen && activeTab === 'posts'} />}
                    {activeTab === 'likes' && <LikesTab {...tabProps} enabled={isOpen && activeTab === 'likes'} />}
                    {activeTab === 'comments' && <CommentsTab {...tabProps} enabled={isOpen && activeTab === 'comments'} />}
                    {activeTab === 'views' && <ViewsTab {...tabProps} enabled={isOpen && activeTab === 'views'} />}
                    {activeTab === 'removed' && (
                        <RemovedTab
                            {...tabProps}
                            enabled={isOpen && activeTab === 'removed'}
                            initialSubTab={initialSubTab as 'posts' | 'comments'}
                            onRestorePost={onRestorePost}
                            onRestoreComment={onRestoreComment}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default UserActivityModal;
