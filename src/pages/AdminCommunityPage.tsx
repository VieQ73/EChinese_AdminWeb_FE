import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import PostCard from '../features/community/components/PostCard';
import CommunitySidebar from '../features/community/components/CommunitySidebar';
import CreateEditPostModal from '../features/community/components/CreateEditPostModal';
import RemoveConfirmModal from '../features/community/components/RemoveConfirmModal';
import PostDetailModal from '../features/community/components/PostDetailModal';
import UserProfileModal from '../features/community/components/UserProfileModal';
import { useAuth } from '../hooks/useAuth';
import type { Post, User } from '../types/entities';
import { getActivePostsWithStats } from '../mock/posts';
import { getAllMockUsers } from '../features/users/userApi';
import { getUserLikedPosts, getUserViewedPosts } from '../mock/userInteractions';
import debugUserInteractions from '../mock/debug';

const AdminCommunityPage: React.FC = () => {
  const currentUser = useAuth();
  const [posts, setPosts] = useState(getActivePostsWithStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Post | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostDetail, setShowPostDetail] = useState(false);

  // User Profile Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Theo dõi trạng thái like/view của user hiện tại
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userViews, setUserViews] = useState<Set<string>>(new Set());

  // Init user likes/views từ mock data khi component mount
  React.useEffect(() => {
    if (currentUser?.id) {
      const likedPosts = getUserLikedPosts(currentUser.id);
      const viewedPosts = getUserViewedPosts(currentUser.id);
      
      setUserLikes(new Set(likedPosts));
      setUserViews(new Set(viewedPosts));

      // Debug để kiểm tra
      console.log('🔍 Current User Interactions:', {
        userId: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        likedPosts,
        viewedPosts
      });
      
      // Debug all interactions
      debugUserInteractions();
    }
  }, [currentUser]);

  // Đồng bộ selectedPost khi posts thay đổi
  React.useEffect(() => {
    if (selectedPost) {
      const updatedPost = posts.find(p => p.id === selectedPost.id);
      if (updatedPost) {
        setSelectedPost(updatedPost);
      }
    }
  }, [posts, selectedPost]);



  // Filter và sắp xếp posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof post.content === 'string' 
        ? post.content.toLowerCase().includes(searchQuery.toLowerCase())
        : post.content?.ops?.some((op: any) => 
            op.insert?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    
    const matchesTopic = !topicFilter || post.topic === topicFilter;
    
    return matchesSearch && matchesTopic;
  }).sort((a, b) => {
    // Bài viết được ghim lên đầu
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    // Sắp xếp theo thời gian tạo
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Event handlers


  // Xử lý logic Toggle Like 
  const handleToggleLike = (postId: string, isLiked: boolean) => {
    // Cập nhật trạng thái like của user
    setUserLikes(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });

    // Cập nhật số lượt like của post
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, likes: (p.likes || 0) + (isLiked ? 1 : -1) };
      }
      return p;
    }));
  };

  // Xử lý logic Toggle View 
  const handleToggleView = (postId: string, isViewed: boolean) => {
    // Cập nhật trạng thái view của user
    setUserViews(prev => {
      const newSet = new Set(prev);
      if (isViewed) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });

    // Cập nhật số lượt xem của post
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, views: (p.views || 0) + (isViewed ? 1 : -1) };
      }
      return p;
    }));
  };

  const handleComment = (postId: string) => {
    // Tìm bài viết và mở modal chi tiết
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setShowPostDetail(true);
    }
  };

  // Handler cho user click
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  // Handler cho user click by ID
  const handleUserClickById = (userId: string) => {
    const user = getAllMockUsers().find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowUserProfile(true);
    }
  };

  const handlePin = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, is_pinned: true } : p
    ));
  };

  const handleUnpin = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, is_pinned: false } : p
    ));
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setEditOpen(true);
  };

  const handleRemove = (post: Post) => {
    setConfirmTarget(post);
    setConfirmOpen(true);
  };

  const doRemove = async (reason?: string) => {
    if (!confirmTarget) return;
    
    setPosts(prev => prev.map(p => 
      p.id === confirmTarget.id 
        ? { 
            ...p, 
            deleted_at: new Date().toISOString(),
            deleted_reason: reason || 'Không có lý do',
            deleted_by: currentUser?.id || 'admin'
          } 
        : p
    ));
    
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const doSavePost = async (data: any) => {
    if (editingPost) {
      // Cập nhật bài viết có sẵn
      setPosts(prev => prev.map(p => 
        p.id === editingPost.id 
          ? { ...p, ...data, updated_at: new Date().toISOString() }
          : p
      ));
    } else {
      // Tạo bài viết mới
      const newPost: Post & { commentsCount: number } = {
        id: `post${Date.now()}`,
        user_id: currentUser?.id || 'admin1',
        title: data.title || '',
        content: data.content,
        topic: data.topic || 'Khác',
        likes: 0,
        views: 0,
        commentsCount: 0,
        created_at: new Date().toISOString(),
        is_approved: true,
        is_pinned: false,
        deleted_by: null,
      };
      setPosts(prev => [newPost, ...prev]);
    }
    
    setEditOpen(false);
    setEditingPost(null);
  };

  const handleRestorePost = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            deleted_at: null,
            deleted_reason: null,
            deleted_by: null
          } 
        : p
    ));
    
    // Hiển thị thông báo thành công
    alert('Bài viết đã được khôi phục thành công!');
  };



  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Grid Layout 3 cột theo AdminCommunityInstruction.md */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Khu vực Nội dung Chính (2/3 trên desktop) */}
          <div className="lg:col-span-2">
            {/* Header - Theo AdminCommunityInstruction.md */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Nội dung Cộng đồng</h1>
              <p className="text-gray-600">Quản lý và kiểm duyệt các bài viết trong cộng đồng một cách hiệu quả</p>
            </div>

            {/* Widget Tạo Bài viết - Theo AdminCommunityInstruction.md */}
            <div className="bg-white rounded-lg shadow-lg border p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center text-white font-bold">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <button
                  onClick={() => { setEditingPost(null); setEditOpen(true); }}
                  className="flex-1 text-left px-4 py-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  Tạo bài viết mới cho cộng đồng...
                </button>
              </div>
            </div>



            {/* Posts Feed */}
            <div className="space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <div className="text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có bài viết nào phù hợp với tìm kiếm của bạn</p>
                  </div>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isLiked={userLikes.has(post.id)}
                    isViewed={userViews.has(post.id)}
                    onToggleLike={handleToggleLike}
                    onToggleView={handleToggleView}
                    onComment={() => handleComment(post.id)}
                    onPin={() => handlePin(post.id)}
                    onUnpin={() => handleUnpin(post.id)}
                    onEdit={() => handleEdit(post)}
                    onRemove={() => handleRemove(post)}
                    onUserClick={(userId) => {
                      const user = getAllMockUsers().find(u => u.id === userId);
                      if (user) handleUserClick(user);
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Thanh Công cụ Bên Phải (1/3 trên desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <CommunitySidebar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                topicFilter={topicFilter}
                setTopicFilter={setTopicFilter}
                posts={posts}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateEditPostModal
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setEditingPost(null); }}
        onSave={doSavePost}
        initial={editingPost || undefined}
      />

      <RemoveConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        onConfirm={doRemove}
        requireReason={currentUser?.id !== confirmTarget?.user_id}
      />

      {/* Post Detail Modal */}
      <PostDetailModal
        isOpen={showPostDetail}
        onClose={() => {
          setShowPostDetail(false);
          setSelectedPost(null);
        }}
        post={selectedPost || undefined}
        isLiked={selectedPost ? userLikes.has(selectedPost.id) : false}
        isViewed={selectedPost ? userViews.has(selectedPost.id) : false}
        onToggleLike={handleToggleLike}
        onToggleView={handleToggleView}
        onUserClick={(userId) => {
          const user = getAllMockUsers().find((u: User) => u.id === userId);
          if (user) handleUserClick(user);
        }}
      />

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => {
            setShowUserProfile(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onPostClick={handleComment}
          userLikes={userLikes}
          userViews={userViews}
          onLikeToggle={(postId: string) => handleToggleLike(postId, !userLikes.has(postId))}
          onViewToggle={(postId: string) => handleToggleView(postId, !userViews.has(postId))}
          onUserClick={handleUserClickById}
          onRestorePost={handleRestorePost}
        />
      )}
    </div>
  );
};

export default AdminCommunityPage;
