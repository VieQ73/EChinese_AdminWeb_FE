/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Heart, Eye, Trash2, MoreVertical, RotateCcw } from 'lucide-react';
import type { User, Post } from '../../../types/entities';
import { getAllPostsWithStats } from '../../../mock/posts';
import { getUserViewedOthersPosts, getUserLikedPosts, getUserCommentedPosts } from '../../../mock/userInteractions';
import { useAuth } from '../../../hooks/useAuth';
import PostCard from './PostCard';


interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onPostClick: (postId: string) => void;
  userLikes: Set<string>;
  userViews: Set<string>;
  onLikeToggle: (postId: string) => void;
  onViewToggle: (postId: string) => void;
  onUserClick: (userId: string) => void;
  onRestorePost?: (postId: string) => void;
}

type TabType = 'posted' | 'liked' | 'commented' | 'viewed' | 'deleted';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onPostClick,
  userLikes,
  userViews,
  onLikeToggle,
  onViewToggle,
  onUserClick,
  onRestorePost,
}) => {
  const currentUser = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('posted');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Helper function để kiểm tra có thể khôi phục bài viết không
  const canRestorePost = (post: Post): boolean => {
    if (!post.deleted_at || !currentUser) return false;
    
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super admin';
    const isPostOwner = currentUser.id === post.user_id;
    
    // Kiểm tra thời gian xóa (trong vòng 7 ngày)
    const deletedDate = new Date(post.deleted_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
    const isWithin7Days = daysDiff <= 7;
    
    // Admin không thể khôi phục bài của Super Admin
    if (currentUser.role === 'admin') {
      // Tìm user tạo bài viết để kiểm tra role
      const postAuthor = user; // user trong props chính là user được xem profile
      if (postAuthor.role === 'super admin') {
        return false;
      }
    }
    
    return isWithin7Days && (isAdmin || isPostOwner);
  };

  // Component để render bài viết đã xóa
  const DeletedPostCard: React.FC<{ post: Post }> = ({ post }) => {
    const [showMenu, setShowMenu] = useState(false);
    const canRestore = canRestorePost(post);

    const handleRestore = () => {
      onRestorePost?.(post.id);
      setShowMenu(false);
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden opacity-60">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-through">
              {post.title}
            </h3>
            {canRestore && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleRestore}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-blue-600"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Khôi phục bài viết
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p className="text-red-700 text-sm font-medium">
              Bài viết đã bị gỡ: {post.deleted_reason}
            </p>
            <p className="text-red-600 text-xs mt-1">
              Gỡ bởi: Admin • {new Date(post.deleted_at!).toLocaleDateString('vi-VN')}
            </p>
          </div>
          
          <div className="text-gray-500 text-sm">
            Đăng lúc: {new Date(post.created_at).toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>
    );
  };

  const tabs: Tab[] = [
    {
      id: 'posted',
      label: 'Bài đã đăng',
      icon: <MessageCircle size={16} />
    },
    {
      id: 'liked',
      label: 'Bài đã thích',
      icon: <Heart size={16} />
    },
    {
      id: 'commented',
      label: 'Bài đã bình luận',
      icon: <MessageCircle size={16} />
    },
    {
      id: 'viewed',
      label: 'Bài đã xem',
      icon: <Eye size={16} />
    },
    {
      id: 'deleted',
      label: 'Bài đã gỡ',
      icon: <Trash2 size={16} />
    }
  ];

  // Lấy dữ liệu posts theo tab
  const fetchPostsByTab = React.useCallback((tab: TabType, pageNum: number): Post[] => {
    let filteredPosts: Post[] = [];

    switch (tab) {
      case 'posted': {
        // Bài do user này đăng (không bao gồm bài đã xóa)
        const allPosts = getAllPostsWithStats();
        filteredPosts = allPosts.filter(
          (post) => post.user_id === user.id && !post.deleted_at
        );
        break;
      }

      case 'liked': {
        // Bài mà user đã like (có thể bao gồm bài của chính mình)
        const allPosts = getAllPostsWithStats();
        const likedPostIds = getUserLikedPosts(user.id);
        filteredPosts = allPosts.filter(
          (post) => likedPostIds.includes(post.id) && !post.deleted_at
        );
        break;
      }

      case 'commented': {
        // Bài mà user đã comment (bao gồm cả bài của chính mình)
        const allPosts = getAllPostsWithStats();
        const commentedPostIds = getUserCommentedPosts(user.id);
        filteredPosts = allPosts.filter(
          (post) => commentedPostIds.includes(post.id) && !post.deleted_at
        );
        break;
      }

      case 'viewed': {
        // Bài mà user đã xem nhưng không phải bài của chính mình
        const allPostsForViewed = getAllPostsWithStats();
        const userOwnPostsForViewed = allPostsForViewed
          .filter((post) => post.user_id === user.id)
          .map((post) => post.id);
        const viewedPostIds = getUserViewedOthersPosts(user.id, userOwnPostsForViewed);
        filteredPosts = allPostsForViewed.filter(
          (post) => viewedPostIds.includes(post.id) && !post.deleted_at
        );
        break;
      }

      case 'deleted': {
        // Bài đã bị gỡ của user này
        const allPostsForDeleted = getAllPostsWithStats();
        filteredPosts = allPostsForDeleted.filter(
          (post) => post.user_id === user.id && post.deleted_at
        );
        break;
      }

      default:
        filteredPosts = [];
    }

    // Sắp xếp theo ngày tạo mới nhất
    filteredPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Phân trang
    const startIndex = (pageNum - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPosts.slice(0, endIndex);
  }, [user.id, itemsPerPage]);

  // Load posts khi thay đổi tab hoặc user
  useEffect(() => {
    setLoading(true);
    setPage(1);
    
    setTimeout(() => {
      const newPosts = fetchPostsByTab(activeTab, 1);
      setPosts(newPosts);
      setHasMore(newPosts.length === itemsPerPage);
      setLoading(false);
    }, 500); // Simulate loading delay
  }, [activeTab, user.id, itemsPerPage, fetchPostsByTab]);

  // Load more posts
  const loadMorePosts = () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    setTimeout(() => {
      const allPosts = fetchPostsByTab(activeTab, nextPage);
      const newPosts = allPosts.slice(posts.length);
      
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(nextPage);
        setHasMore(newPosts.length === itemsPerPage);
      }
      setLoading(false);
    }, 800); // Simulate loading delay
  };

  // Handle scroll to load more
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && hasMore && !loading) {
      loadMorePosts();
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar_url || '/default-avatar.png'}
              alt={user.name || user.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name || user.username}</h2>
              <p className="text-sm text-gray-600">Hồ sơ cộng đồng người dùng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div 
          className="p-6 overflow-y-auto max-h-[60vh]"
          onScroll={handleScroll}
        >
          {loading && posts.length === 0 ? (
            // Initial loading placeholder
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-40"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                {tabs.find(tab => tab.id === activeTab)?.icon}
              </div>
              <p className="text-gray-600">
                {activeTab === 'posted' && 'Chưa có bài đăng nào'}
                {activeTab === 'liked' && 'Chưa thích bài nào'}
                {activeTab === 'commented' && 'Chưa bình luận bài nào'}
                {activeTab === 'viewed' && 'Chưa xem bài nào'}
                {activeTab === 'deleted' && 'Không có bài đã gỡ'}
              </p>
            </div>
          ) : (
            // Posts list
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id}>
                  {activeTab === 'deleted' ? (
                    <DeletedPostCard post={post} />
                  ) : (
                    <PostCard
                      post={post}
                      isLiked={userLikes.has(post.id)}
                      isViewed={userViews.has(post.id)}
                      onToggleLike={(postId, _isLiked) => onLikeToggle(postId)}
                      onToggleView={(postId, _isViewed) => onViewToggle(postId)}
                      onComment={() => {
                        onClose(); // Đóng modal trước
                        onPostClick(post.id); // Mở PostDetailModal
                      }}
                      onUserClick={onUserClick}
                    />
                  )}
                </div>
              ))}

              {/* Load more indicator */}
              {loading && posts.length > 0 && (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* No more items */}
              {!loading && !hasMore && posts.length > 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p>Đã hiển thị tất cả bài viết</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;