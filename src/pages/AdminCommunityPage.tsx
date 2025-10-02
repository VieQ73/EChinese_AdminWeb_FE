import React, { useState } from 'react';
import { Heart, MessageCircle, Eye, Pin, MoreVertical, Search, Filter } from 'lucide-react';
import CreateEditPostModal from '../features/community/components/CreateEditPostModal';
import RemoveConfirmModal from '../features/community/components/RemoveConfirmModal';
import { useAuth } from '../hooks/useAuth';
import type { Post, User, BadgeLevel } from '../types/entities';

// Mock data dựa trên entities.ts
const mockBadgeLevels: BadgeLevel[] = [
  { level: 0, name: 'Người mới', icon: '🌱' },
  { level: 1, name: 'Học viên', icon: '📚' },
  { level: 2, name: 'Thành thạo', icon: '⭐' },
  { level: 3, name: 'Chuyên gia', icon: '🏆' },
  { level: 4, name: 'Quản trị viên', icon: '👑' },
];

const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'nguyenvana',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'user',
    is_active: true,
    isVerify: true,
    community_points: 1250,
    subscription_id: 'sub1',
    level: '3',
    badge_level: 2,
    language: 'Tiếng Việt',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'admin1',
    username: 'admin',
    name: 'Admin System',
    email: 'admin@echinese.com',
    role: 'admin',
    is_active: true,
    isVerify: true,
    community_points: 5000,
    subscription_id: 'sub2',
    level: '6',
    badge_level: 4,
    language: 'Tiếng Việt',
    created_at: '2023-10-01T08:00:00Z',
  },
  {
    id: 'user2',
    username: 'tranthib',
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    role: 'user',
    is_active: false,
    isVerify: true,
    community_points: 850,
    subscription_id: 'sub1',
    level: '2',
    badge_level: 1,
    language: 'Tiếng Việt',
    created_at: '2024-03-20T14:30:00Z',
  },
];

const mockPosts: Post[] = [
  {
    id: 'post1',
    user_id: 'admin1',
    title: 'Chào mừng đến với cộng đồng EChinese!',
    content: {
      html: '<p><strong>Chào mừng</strong> tất cả mọi người đến với cộng đồng học tiếng Trung EChinese! 🎉</p><p>Đây là nơi các bạn có thể:</p><ul><li>Chia sẻ kinh nghiệm học tập</li><li>Đặt câu hỏi và nhận được sự hỗ trợ</li><li>Kết nối với những người cùng đam mê</li></ul><p>Chúc các bạn học tập hiệu quả! 加油! 💪</p>'
    },
    topic: 'Góc chia sẻ',
    likes: 24,
    views: 156,
    created_at: '2025-10-02T08:30:00Z',
    is_approved: true,
    is_pinned: true,
    deleted_by: 'admin1',
  },
  {
    id: 'post2',
    user_id: 'user1',
    title: 'Cách học từ vựng HSK hiệu quả',
    content: {
      html: '<p>Mình muốn chia sẻ một số phương pháp học từ vựng HSK mà mình thấy hiệu quả:</p><p><strong>1. Flashcard với hình ảnh:</strong> Kết hợp từ vựng với hình ảnh sinh động để dễ nhớ hơn.</p><p><strong>2. Lặp lại ngắt quãng:</strong> Sử dụng phương pháp spaced repetition để ghi nhớ lâu dài.</p><p><strong>3. Áp dụng vào câu:</strong> Không chỉ học từ đơn lẻ mà phải học trong ngữ cảnh.</p><p>Các bạn có phương pháp nào khác không? Chia sẻ nhé! 😊</p>'
    },
    topic: 'Học tiếng Trung',
    likes: 18,
    views: 89,
    created_at: '2025-10-02T07:15:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_by: 'user1',
  },
  {
    id: 'post3',
    user_id: 'user2',
    title: 'Tìm bạn học chung tại Hà Nội',
    content: {
      html: '<p>Mình đang ở Hà Nội và đang học HSK 4. Muốn tìm bạn học chung để:</p><ul><li>Luyện nói tiếng Trung với nhau</li><li>Chia sẻ tài liệu học tập</li><li>Động viên nhau trong quá trình học</li></ul><p>Ai có nhu cầu thì inbox mình nhé! 📚✨</p>'
    },
    topic: 'Tìm bạn học chung',
    likes: 7,
    views: 34,
    created_at: '2025-10-01T19:45:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-10-02T09:00:00Z',
    deleted_reason: 'Vi phạm quy định đăng thông tin liên lạc',
    deleted_by: 'admin1',
  },
  {
    id: 'post4',
    user_id: 'user1',
    title: 'Review khóa học tiếng Trung online',
    content: {
      html: '<p>Vừa hoàn thành khóa học <em>Tiếng Trung cơ bản</em> và muốn review:</p><p><strong>Điểm tốt:</strong></p><ul><li>Giáo viên nhiệt tình, phát âm chuẩn</li><li>Tài liệu phong phú, có video minh họa</li><li>Lịch học linh hoạt</li></ul><p><strong>Điểm cần cải thiện:</strong></p><ul><li>Thiếu bài tập thực hành</li><li>Chưa có nhiều hoạt động tương tác</li></ul><p>Tổng thể: <strong>4/5 ⭐</strong></p>'
    },
    topic: 'Khác',
    likes: 12,
    views: 67,
    created_at: '2025-10-01T14:20:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_by: 'user1',
  },
];

// Helper function để format thời gian
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diff = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
};

// Component PostCard theo thiết kế Facebook
const PostCard: React.FC<{
  post: Post;
  user: User;
  badge: BadgeLevel;
  onLike: () => void;
  onUnLike: () => void;
  onComment: () => void;
  onView: () => void;
  onUnView: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}> = ({ post, user, badge, onLike, onUnLike, onComment, onView, onUnView, onPin, onUnpin, onEdit, onRemove }) => {
  const currentUser = useAuth();
  const [liked, setLiked] = useState(false);
  const [viewed, setViewed] = useState(false);
  const isOwner = currentUser?.id === post.user_id;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super admin';
  
  const handleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);

    if (newLikedState) {
      onLike();
    } else {
      onUnLike();
    }
  };

  const handleView = () => {
    const newViewedState = !viewed;
    setViewed(newViewedState);

    if (newViewedState) {
      onView();
    } else {
      onUnView();
    }
  };

  const isDeleted = !!post.deleted_at;

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${isDeleted ? 'opacity-60' : ''}`}>
      {/* 1. Header - Thông tin người đăng */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!user.is_active && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              )}
            </div>
            
            {/* Tên và thông tin */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 hover:underline cursor-pointer">
                  {user.name}
                </span>
                <span className="text-lg" title={badge.name}>
                  {badge.icon}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span className="font-medium text-blue-600">{post.topic}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Trạng thái ghim và menu */}
          <div className="flex items-center gap-2">
            {post.is_pinned && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                <Pin className="w-3 h-3" />
                <span>Đã ghim</span>
              </div>
            )}
            
            {(isOwner || isAdmin) && (
              <div className="relative group">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {isAdmin && !isDeleted && (
                    <>
                      {post.is_pinned ? (
                        <button onClick={onUnpin} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                          <Pin className="w-4 h-4" />
                          Bỏ ghim
                        </button>
                      ) : (
                        <button onClick={onPin} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                          <Pin className="w-4 h-4" />
                          Ghim bài viết
                        </button>
                      )}
                    </>
                  )}
                  {isOwner && !isDeleted && (
                    <button onClick={onEdit} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                      Chỉnh sửa
                    </button>
                  )}
                  {(isOwner || isAdmin) && !isDeleted && (
                    <button onClick={onRemove} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">
                      Gỡ bài viết
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 2. Nội dung chính */}
      <div className="p-4">
        {/* Tiêu đề */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {post.title}
        </h3>
        
        {/* Nội dung */}
        <div 
          className="text-gray-700 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content.html || '' }}
        />
        
        {isDeleted && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">
              Bài viết đã bị gỡ: {post.deleted_reason}
            </p>
          </div>
        )}
      </div>
      
      {/* 3. Thanh tương tác */}
      {!isDeleted && (
        <>
          {/* Stats */}
          <div className="px-4 py-2 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-4">
              {post.likes > 0 && (
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  {post.likes}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>{post.views} lượt xem</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="px-4 py-2 border-t border-gray-100 grid grid-cols-3 gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                liked 
                  ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          <span className="font-medium">{liked ? 'Bỏ thích' : 'Thích'}</span>            </button>
            
            <button
              onClick={onComment}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Bình luận</span>
            </button>
            
            <button
              onClick={handleView}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                viewed 
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Eye className={`w-5 h-5 ${viewed ? 'fill-current' : ''}`} />
          <span className="font-medium">{viewed ? 'Đã xem' : 'Xem'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const AdminCommunityPage: React.FC = () => {
  const currentUser = useAuth();
  const [posts, setPosts] = useState(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Post | null>(null);

  // Helper functions
  const getUserById = (userId: string): User => {
    return mockUsers.find(u => u.id === userId) || mockUsers[0];
  };

  const getBadgeByLevel = (level: number): BadgeLevel => {
    return mockBadgeLevels.find(b => b.level === level) || mockBadgeLevels[0];
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.html?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTopic = !topicFilter || post.topic === topicFilter;
    
    return matchesSearch && matchesTopic;
  }).sort((a, b) => {
    // Pinned posts first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    // Then by creation time
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Event handlers
  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      )
    );
  };

  const handleUnlike = (postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p
      )
    );
  };

  const handleView = (postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, views: p.views + 1 } : p
      )
    );
  };

  const handleUnview = (postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, views: Math.max(0, p.views - 1) } : p
      )
    );
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

  const handleRemove = (post: Post) => {
    setConfirmTarget(post);
    setConfirmOpen(true);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setEditOpen(true);
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
      // Update existing post
      setPosts(prev => prev.map(p => 
        p.id === editingPost.id 
          ? { ...p, ...data, updated_at: new Date().toISOString() }
          : p
      ));
    } else {
      // Create new post
      const newPost: Post = {
        id: `post${Date.now()}`,
        user_id: currentUser?.id || 'admin1',
        title: data.title,
        content: data.content,
        topic: data.topic,
        likes: 0,
        views: 0,
        created_at: new Date().toISOString(),
        is_approved: true,
        is_pinned: false,
        deleted_by: currentUser?.id || 'admin1',
      };
      setPosts(prev => [newPost, ...prev]);
    }
    
    setEditOpen(false);
    setEditingPost(null);
  };

  const topics = [
    'Cơ khí', 'CNTT', 'Dịch', 'Du học', 'Du lịch', 'Góc chia sẻ',
    'Tìm bạn học chung', 'Học tiếng Trung', 'Tìm gia sư', 'Việc làm',
    'Văn hóa', 'Thể thao', 'Xây dựng', 'Y tế', 'Tâm sự', 'Khác'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 max-w-2xl">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Nội dung Cộng đồng</h1>
              <p className="text-gray-600">Quản lý và kiểm duyệt các bài viết trong cộng đồng</p>
            </div>

            {/* Post Composer */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <button
                  onClick={() => { setEditingPost(null); setEditOpen(true); }}
                  className="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Bạn đang nghĩ gì...?
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không có bài viết nào được tìm thấy
                </div>
              ) : (
                filteredPosts.map(post => {
                  const user = getUserById(post.user_id);
                  const badge = getBadgeByLevel(user.badge_level);
                  
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      user={user}
                      badge={badge}
                      onLike={() => handleLike(post.id)}
                      onUnLike={() => handleUnlike(post.id)}
                      onComment={() => console.log('Comment on', post.id)}
                      onView={() => handleView(post.id)}
                      onUnView={() => handleUnview(post.id)}
                      onPin={() => handlePin(post.id)}
                      onUnpin={() => handleUnpin(post.id)}
                      onEdit={() => handleEdit(post)}
                      onRemove={() => handleRemove(post)}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-4">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Tìm kiếm</h3>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Topic Filter */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900">Lọc theo chủ đề</h3>
              </div>
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả chủ đề</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thống kê</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng bài viết:</span>
                  <span className="font-semibold text-blue-600">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã ghim:</span>
                  <span className="font-semibold text-orange-600">
                    {posts.filter(p => p.is_pinned).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã gỡ:</span>
                  <span className="font-semibold text-red-600">
                    {posts.filter(p => p.deleted_at).length}
                  </span>
                </div>
              </div>
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
    </div>
  );
};

export default AdminCommunityPage;
