# Community API Documentation

Đây là tài liệu hướng dẫn sử dụng các API và hooks để quản lý nội dung cộng đồng trong hệ thống EChinese Admin.

## Cấu trúc Files

```
src/features/community/
├── communityApi.ts          # API calls cho cộng đồng (chỉ chức năng đã phát triển)
├── hooks/
│   ├── useCommunity.ts      # Hook chính cho quản lý posts & comments
│   ├── useReports.ts        # Placeholder - Reports sẽ có module riêng
│   └── useCommunityStats.ts # Hook quản lý thống kê & logs
└── components/              # Các React components
```

## API Endpoints

### Base URL
```
http://localhost:8080/api/admin (production)
http://localhost:3000/api/admin (development)
```

### Authentication
Tất cả API đều yêu cầu Bearer token trong header:
```
Authorization: Bearer <access_token>
```

## 1. Posts Management API

### Lấy danh sách bài viết
```typescript
GET /admin/community/posts
Query params:
- page?: number (default: 1)
- limit?: number (default: 20)  
- search?: string (tìm kiếm trong title/content)
- topic?: string (filter theo chủ đề)
- user_id?: string (filter theo user)
- is_pinned?: boolean (chỉ lấy bài viết đã ghim)
- include_deleted?: boolean (bao gồm bài viết đã xóa)
- sort_by?: 'created_at'|'likes'|'views'|'comments'
- sort_order?: 'asc'|'desc'

Response: PaginatedResponse<Post>
```

### Tạo bài viết mới
```typescript
POST /admin/community/posts
Body: {
  title: string,
  content: {
    html?: string,
    text?: string,
    images?: string[]
  },
  topic: string
}

Response: Post
```

### Cập nhật bài viết
```typescript
PUT /admin/community/posts/:id
Body: Partial<PostPayload>

Response: Post
```

### Quản lý trạng thái bài viết
```typescript
POST /admin/community/posts/:id/remove    # Xóa mềm
POST /admin/community/posts/:id/restore   # Khôi phục
DELETE /admin/community/posts/:id         # Xóa cứng
POST /admin/community/posts/:id/pin       # Ghim bài viết
POST /admin/community/posts/:id/unpin     # Bỏ ghim
# Note: Approval/Rejection workflow chưa phát triển
```

## 2. Comments Management API

### Lấy bình luận của bài viết
```typescript
GET /community/posts/:postId/comments
Query params:
- include_deleted?: boolean

Response: Comment[]
```

### Thêm bình luận
```typescript
POST /community/posts/:postId/comments
Body: {
  content: {
    html?: string,
    text?: string
  },
  parent_comment_id?: string  # Để trả lời comment khác
}

Response: Comment
```

### Quản lý bình luận (Admin)
```typescript
POST /admin/community/comments/:id/remove    # Xóa mềm
POST /admin/community/comments/:id/restore   # Khôi phục  
DELETE /admin/community/comments/:id         # Xóa cứng
PUT /admin/community/comments/:id            # Cập nhật
```

## 3. Interactions API

### Like/Unlike bài viết
```typescript
POST /community/posts/:id/like      # Like
DELETE /community/posts/:id/like    # Unlike

Response: PostLike | {success: boolean}
```

### Đánh dấu đã xem
```typescript
POST /community/posts/:id/view

Response: PostView
```

### Chia sẻ bài viết
```typescript
POST /community/posts/:id/share

Response: {success: boolean}
```

## 4. Reports API (Chưa phát triển)

**Note**: Chức năng báo cáo sẽ được phát triển trong module riêng về Notifications & Reports cho Admin.

## 5. Statistics API

### Thống kê tổng quan
```typescript
GET /admin/community/statistics

Response: {
  total_posts: number,
  active_posts: number,
  deleted_posts: number,
  pending_posts: number,
  total_comments: number,
  active_comments: number,
  deleted_comments: number,
  total_reports: number,
  pending_reports: number,
  resolved_reports: number,
  total_users_active: number,
  posts_today: number,
  comments_today: number,
  reports_today: number
}
```

### Thống kê theo thời gian
```typescript
GET /admin/community/statistics/by-date
Query params:
- from_date: string (YYYY-MM-DD)
- to_date: string (YYYY-MM-DD)  
- group_by?: 'day'|'week'|'month'

Response: Array<{
  date: string,
  posts_count: number,
  comments_count: number,
  likes_count: number,
  views_count: number,
  reports_count: number
}>
```

### Thống kê theo chủ đề
```typescript
GET /admin/community/statistics/by-topic

Response: Array<{
  topic: string,
  posts_count: number,
  comments_count: number,
  likes_count: number,
  views_count: number
}>
```

## Hooks Usage

### 1. useCommunity Hook

Hook chính để quản lý posts và comments:

```typescript
import { useCommunity } from './hooks/useCommunity';

const MyComponent = () => {
  const {
    posts,
    loading,
    pagination,
    
    // Posts management  
    loadPosts,
    createPost,
    updatePost,
    removePost,
    restorePost,
    pinPost,
    unpinPost,
    
    // Comments management
    fetchComments,
    addComment,
    addReply,
    removeComment,
    
    // Interactions
    likePost,
    unlikePost,
    viewPost,
    sharePost,
    
    // Pagination
    goToPage,
    changePageSize
  } = useCommunity();

  // Sử dụng trong component
  const handleCreatePost = async () => {
    await createPost({
      title: 'Tiêu đề bài viết',
      content: { text: 'Nội dung...' },
      topic: 'Học tiếng Trung'
    });
  };

  return (
    <div>
      {loading ? 'Loading...' : posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
};
```

### 2. useReports Hook

Hook quản lý báo cáo vi phạm:

```typescript
import { useReports } from './hooks/useReports';

const ReportsManagement = () => {
  const {
    reports,
    loading,
    loadReports,
    resolveReport,
    assignReport
  } = useReports();

  const handleResolveReport = async (reportId: string) => {
    await resolveReport(reportId, 'resolved');
  };

  return (
    <div>
      {reports.map(report => (
        <ReportCard 
          key={report.id} 
          report={report}
          onResolve={() => handleResolveReport(report.id)}
        />
      ))}
    </div>
  );
};
```

### 3. useCommunityStats Hook

Hook quản lý thống kê:

```typescript
import { useCommunityStats, useModerationLogs } from './hooks/useCommunityStats';

const StatsPage = () => {
  const { stats, statsByDate, statsByTopic, loading } = useCommunityStats();
  const { logs } = useModerationLogs();

  return (
    <div>
      <div>Tổng số bài viết: {stats?.total_posts}</div>
      <div>Bài viết hôm nay: {stats?.posts_today}</div>
      
      {/* Chart component với statsByDate */}
      <Chart data={statsByDate} />
      
      {/* Moderation logs */}
      <ModerationLogsTable logs={logs} />
    </div>
  );
};
```

## Error Handling

Tất cả API calls đều có error handling tự động qua axios interceptor:

1. **401 Unauthorized**: Tự động refresh token hoặc redirect về trang login
2. **Network errors**: Hiển thị thông báo lỗi mạng  
3. **Server errors**: Hiển thị thông báo lỗi từ server

```typescript
try {
  const result = await createPost(payload);
} catch (error) {
  // Error đã được xử lý tự động
  console.error('Create post failed:', error.message);
}
```

## Environment Variables

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:8080/api/admin

# Development API URL  
VITE_API_BASE_URL=http://localhost:3000/api/admin
```

## Database Schema Reference

API này dựa trên database schema với các bảng chính:

- **Posts**: Lưu bài viết với soft delete support
- **Comments**: Hỗ trợ nested comments (parent_comment_id)  
- **PostLikes**: Theo dõi ai đã like bài viết
- **PostViews**: Theo dõi lượt xem chi tiết
- **Reports**: Báo cáo vi phạm với attachments
- **ModerationLogs**: Lịch sử các hành động admin

Xem file `docs/database-schema.dbml` để biết chi tiết cấu trúc database.

## Testing

Để test API, có thể sử dụng mock data có sẵn trong `src/mock/`:

```typescript
// Trong development mode, có thể switch sang mock data
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

const fetchPosts = USE_MOCK_DATA 
  ? () => Promise.resolve(mockPosts)
  : communityApi.fetchPosts;
```

## Best Practices

1. **Pagination**: Luôn sử dụng pagination cho danh sách
2. **Loading states**: Hiển thị loading khi gọi API
3. **Error handling**: Xử lý và hiển thị lỗi cho user
4. **Optimistic updates**: Cập nhật UI ngay sau action (như like/unlike)
5. **Cache management**: Reload data sau khi thực hiện thay đổi quan trọng
