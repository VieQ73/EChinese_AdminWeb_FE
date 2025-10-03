import React from 'react';
import { Search, Filter, BarChart3 } from 'lucide-react';
import { getAllPostsWithStats } from '../../../mock/posts';

interface CommunitySidebarProps {
  className?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  topicFilter: string;
  setTopicFilter: (topic: string) => void;
  posts: any[];
}

// Component Tìm kiếm Nhanh
const SearchWidget: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Tìm kiếm Nhanh</h3>
      </div>
      <input
        type="text"
        placeholder="Tìm kiếm theo tiêu đề và nội dung..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
      />
    </div>
  );
};

// Component Lọc theo Chủ đề
const TopicFilter: React.FC<{
  topicFilter: string;
  setTopicFilter: (topic: string) => void;
}> = ({ topicFilter, setTopicFilter }) => {
  const topics = [
    'Cơ khí', 'CNTT', 'Dịch', 'Du học', 'Du lịch', 'Góc chia sẻ',
    'Tìm bạn học chung', 'Học tiếng Trung', 'Tìm gia sư', 'Việc làm',
    'Văn hóa', 'Thể thao', 'Xây dựng', 'Y tế', 'Tâm sự', 'Khác'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Lọc theo Chủ đề</h3>
      </div>
      <select
        value={topicFilter}
        onChange={(e) => setTopicFilter(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
      >
        <option value="">Tất cả chủ đề</option>
        {topics.map(topic => (
          <option key={topic} value={topic}>{topic}</option>
        ))}
      </select>
    </div>
  );
};

// Component Thống kê Cộng đồng
const CommunityStats: React.FC<{ posts: any[] }> = ({ posts: _posts }) => {
  // Lấy tất cả posts từ mock data (bao gồm cả đã gỡ) để tính thống kê chính xác
  const allPosts = getAllPostsWithStats();
  
  const totalPosts = allPosts.length;
  const pinnedPosts = allPosts.filter(p => p.is_pinned).length;
  const removedPosts = allPosts.filter(p => p.deleted_at).length;

  // Debug log để kiểm tra
  console.log('CommunitySidebar - Thống kê:', {
    totalPosts,
    pinnedPosts, 
    removedPosts,
    activePosts: totalPosts - removedPosts
  });

  return (
    <div className="bg-white rounded-lg shadow-lg border p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Thống kê Cộng đồng</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 font-medium">Tổng Bài viết:</span>
          <span className="font-bold text-blue-600 text-lg">{totalPosts}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 font-medium">Đã được Ghim:</span>
          <span className="font-bold text-orange-600 text-lg">{pinnedPosts}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 font-medium">Bài viết Đã Gỡ:</span>
          <span className="font-bold text-red-600 text-lg">{removedPosts}</span>
        </div>
      </div>
    </div>
  );
};



// Component sidebar chính theo AdminCommunityInstruction.md
const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ 
  className = '', 
  searchQuery, 
  setSearchQuery, 
  topicFilter, 
  setTopicFilter, 
  posts 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tìm kiếm Nhanh */}
      <SearchWidget 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {/* Lọc theo Chủ đề */}
      <TopicFilter 
        topicFilter={topicFilter}
        setTopicFilter={setTopicFilter}
      />
      
      {/* Thống kê Cộng đồng */}
      <CommunityStats posts={posts} />
    </div>
  );
};

export default CommunitySidebar;