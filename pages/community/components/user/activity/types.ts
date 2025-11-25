/**
 * Types cho UserActivityModal và các tab con
 */
import { User, Post, CommentWithUser } from '../../../../../types';

// Props chung cho tất cả các tab hiển thị danh sách bài viết
export interface PostTabProps {
    user: User;
    currentUser: User | null;
    likedPosts: Set<string>;
    viewedPosts: Set<string>;
    onPostSelect: (post: Post) => void;
    onToggleLike: (postId: string, isLiked: boolean) => void;
    onToggleView: (postId: string, isViewed: boolean) => void;
    onUserClick: (user: User) => void;
    onEditPost: (post: Post) => void;
    onRemovePost: (post: Post) => void;
}

// Props mở rộng cho tab Removed (có thêm restore)
export interface RemovedTabProps extends PostTabProps {
    initialSubTab?: 'posts' | 'comments';
    onRestorePost: (post: Post) => void;
    onRestoreComment: (comment: CommentWithUser) => void;
}

// Props cho UserActivityModal
export interface UserActivityModalProps {
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
