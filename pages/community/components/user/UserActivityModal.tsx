/**
 * Modal hiển thị hoạt động của user trong cộng đồng
 * Sử dụng context trực tiếp để đồng bộ likes/views realtime
 */
import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/Modal';
import Badge from '../ui/Badge';
import { mockBadges } from '../../../../mock/settings';
import { ShieldExclamationIcon } from '../../../../constants';

// Import từ activity folder
import {
    UserActivityModalProps,
    TabButton,
    PostList,
    RemovedTab,
    useUserActivityData,
} from './activity';

const UserActivityModal: React.FC<UserActivityModalProps> = ({
    isOpen,
    onClose,
    user,
    currentUser,
    initialTab,
    initialSubTab,
    onPostSelect,
    likedPosts,
    viewedPosts,
    onToggleLike,
    onToggleView,
    onUserClick,
    onEditPost,
    onRemovePost,
    onRestorePost,
    onRestoreComment,
}) => {
    // Lấy dữ liệu từ hook
    const {
        userPosts,
        userLikedPosts,
        userCommentedPosts,
        userViewedPosts,
        removedPosts,
        removedComments,
        violationCount,
    } = useUserActivityData(user.id);

    const [activeTab, setActiveTab] = useState(initialTab || 'posts');
    const userBadge = mockBadges.find(b => b.level === user.badge_level);

    // Reset tab khi modal mở hoặc user thay đổi
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab || 'posts');
        }
    }, [initialTab, isOpen, user.id]);

    // Props chung cho PostList
    const postListProps = {
        currentUser,
        likedPosts,
        viewedPosts,
        onViewDetails: onPostSelect,
        onEdit: onEditPost,
        onRemove: onRemovePost,
        onToggleLike,
        onToggleView,
        onUserClick,
    };

    // Render nội dung theo tab
    const renderContent = () => {
        switch (activeTab) {
            case 'posts':
                return (
                    <PostList
                        posts={userPosts}
                        tabKey="posts"
                        emptyMessage="Chưa có bài viết nào."
                        {...postListProps}
                    />
                );
            case 'likes':
                return (
                    <PostList
                        posts={userLikedPosts}
                        tabKey="likes"
                        emptyMessage="Chưa thích bài viết nào."
                        {...postListProps}
                    />
                );
            case 'comments':
                return (
                    <PostList
                        posts={userCommentedPosts}
                        tabKey="comments"
                        emptyMessage="Chưa bình luận bài viết nào."
                        {...postListProps}
                    />
                );
            case 'views':
                return (
                    <PostList
                        posts={userViewedPosts}
                        tabKey="views"
                        emptyMessage="Chưa xem bài viết nào."
                        {...postListProps}
                    />
                );
            case 'removed':
                return (
                    <RemovedTab
                        user={user}
                        currentUser={currentUser}
                        initialSubTab={initialSubTab as 'posts' | 'comments'}
                        likedPosts={likedPosts}
                        viewedPosts={viewedPosts}
                        onPostSelect={onPostSelect}
                        onToggleLike={onToggleLike}
                        onToggleView={onToggleView}
                        onUserClick={onUserClick}
                        onEditPost={onEditPost}
                        onRemovePost={onRemovePost}
                        onRestorePost={onRestorePost}
                        onRestoreComment={onRestoreComment}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Hoạt động của ${user.name}`} 
            className="max-w-4xl"
        >
            <div className="space-y-4">
                {/* User info header */}
                <UserInfoHeader 
                    user={user} 
                    userBadge={userBadge} 
                    violationCount={violationCount} 
                />

                {/* Tab buttons với số lượng */}
                <ActivityTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    counts={{
                        posts: userPosts.length,
                        likes: userLikedPosts.length,
                        comments: userCommentedPosts.length,
                        views: userViewedPosts.length,
                        removed: removedPosts.length + removedComments.length,
                    }}
                />

                {/* Tab content */}
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                    {renderContent()}
                </div>
            </div>
        </Modal>
    );
};

// Sub-component: User info header
interface UserInfoHeaderProps {
    user: UserActivityModalProps['user'];
    userBadge: ReturnType<typeof mockBadges.find>;
    violationCount: number;
}

const UserInfoHeader: React.FC<UserInfoHeaderProps> = ({ user, userBadge, violationCount }) => (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <img 
            src={user.avatar_url || ''} 
            alt={user.name} 
            className="w-16 h-16 rounded-full object-cover bg-gray-200" 
        />
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
);

// Sub-component: Activity tabs navigation
interface ActivityTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    counts: {
        posts: number;
        likes: number;
        comments: number;
        views: number;
        removed: number;
    };
}

const ActivityTabs: React.FC<ActivityTabsProps> = ({ activeTab, onTabChange, counts }) => (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        <TabButton 
            active={activeTab === 'posts'} 
            onClick={() => onTabChange('posts')}
            count={counts.posts}
        >
            Bài đã đăng
        </TabButton>
        <TabButton 
            active={activeTab === 'likes'} 
            onClick={() => onTabChange('likes')}
            count={counts.likes}
        >
            Đã thích
        </TabButton>
        <TabButton 
            active={activeTab === 'comments'} 
            onClick={() => onTabChange('comments')}
            count={counts.comments}
        >
            Đã bình luận
        </TabButton>
        <TabButton 
            active={activeTab === 'views'} 
            onClick={() => onTabChange('views')}
            count={counts.views}
        >
            Bài đã xem
        </TabButton>
        <TabButton 
            active={activeTab === 'removed'} 
            onClick={() => onTabChange('removed')}
            count={counts.removed}
        >
            Đã gỡ
        </TabButton>
    </div>
);

export default UserActivityModal;
