# 📚 QUẢN LÝ NGƯỜI DÙNG - BACKEND API INTEGRATION

## 🎯 Tổng quan dự án

API đã được refactor để chỉ chứa các endpoints thực sự được **sử dụng bởi frontend hiện tại**, loại bỏ các chức năng chưa phát triển.

## 📁 Cấu trúc Files

```
src/features/users/
├── userApi.ts                          # ❌ API mock 
├── userManagementApi.ts                # ✅ API thật - ĐÃ ĐƯỢC REFACTOR
├── USER_MANAGEMENT_API.md              # 📖 Documentation chi tiết  
└── components/                         # Components sử dụng API
    ├── UserDetailModal.tsx
    ├── UserListTable.tsx  
    └── UserFilter.tsx
```

## 🛠️ Files chính đã phân tích

### Frontend Components:
- ✅ `UsersManagementPage.tsx` - Trang quản lý chính
- ✅ `UserDetailModal.tsx` - Modal chi tiết user
- ✅ `UserListTable.tsx` - Bảng danh sách
- ✅ `UserFilter.tsx` - Bộ lọc và tìm kiếm
- ✅ `UserActions.tsx` - Các hành động trên user

### Related APIs:
- ✅ `authApi.ts` - Authentication
- ✅ `subscriptionApi.ts` - Quản lý gói đăng ký
- ✅ `badgeApi.ts` - Quản lý huy hiệu

### Database & Types:
- ✅ `docs/database-schema.dbml` - Schema database
- ✅ `src/types/entities.ts` - TypeScript interfaces

## 🚀 Tính năng đã thiết kế

### ✅ CHỨC NĂNG ĐÃ PHÁT TRIỂN (API Hiện Tại):

1. **CRUD Operations** - fetchAllUsers, fetchUserById, updateUser, deleteUser
2. **Account Control** - activateUser, deactivateUser  
3. **AI Quota Management** - fetchUserUsage, resetUserQuota
4. **Pagination & Search** - Lọc theo role, search, phân trang

### ❌ CHỨC NĂNG CHƯA PHÁT TRIỂN (Đã loại bỏ):

- **Advanced Filtering** - Lọc phức tạp
- **Bulk Operations** - Thao tác hàng loạt  
- **User Statistics** - Thống kê tổng quan
- **Email Verification** - Xác thực email
- **Password Management** - Reset mật khẩu
- **Subscription Management** - Có module riêng
- **Badge Level Management** - Có module riêng
- **Notifications** - Sẽ có module riêng
- **Admin Logs** - Audit trail

### 📋 Audit & Compliance:
21. **Admin Logs** - Lịch sử hành động admin
22. **Activity Tracking** - Theo dõi hoạt động user
23. **Audit Trail** - Đường dẫn kiểm toán

### 📤 Data Management:
24. **Export Functions** - Xuất danh sách ra Excel/CSV
25. **Advanced Search** - Tìm kiếm nâng cao multi-criteria

## 🌟 Tính năng nổi bật

### 🔒 Security Features Đã Có:
- **Role-based Access Control** - Phân quyền theo vai trò  
- **Self-Protection** - Super Admin không thể tự hạ cấp
- **Admin Restrictions** - Admin không thể sửa admin khác

### ⚡ Performance Features Đã Có:  
- **Pagination** - Phân trang với meta data
- **Search & Filter** - Tìm kiếm theo name, email, username
- **Debounced Search** - Tối ưu performance

## 🔧 Backend Implementation Guide

### 1️⃣ Required Endpoints (8 endpoints - CHỈ CÁC API ĐƯỢC SỬ DỤNG):

```javascript
// User CRUD - Core functions
GET    /api/admin/users                    // fetchAllUsers - với pagination & search
GET    /api/admin/users/:id                // fetchUserById - chi tiết user  
PUT    /api/admin/users/:id                // updateUser - cập nhật thông tin
DELETE /api/admin/users/:id                // deleteUser - xóa user

// User Status Management  
PUT    /api/admin/users/:id/activate       // activateUser - mở khóa tài khoản
PUT    /api/admin/users/:id/deactivate     // deactivateUser - khóa tài khoản

// AI Quota Management
GET    /api/admin/users/:id/usage          // fetchUserUsage - xem usage AI
POST   /api/admin/users/:id/reset-quota    // resetUserQuota - reset quota AI

// AI Quota & Usage
GET    /api/admin/users/:id/usage          // User usage stats
POST   /api/admin/users/:id/reset-quota    // Reset AI quota
GET    /api/admin/usage-stats              // System usage stats

// Badge & Achievement
PUT    /api/admin/users/:id/badge-level    // Update badge level
PUT    /api/admin/users/:id/community-points // Update points
POST   /api/admin/users/:id/achievements   // Add achievement
DELETE /api/admin/users/:id/achievements/:name // Remove achievement

```

### 2️⃣ Các API Không Cần Thiết (Đã Loại Bỏ):

```javascript
// ❌ Không sử dụng bởi frontend hiện tại
GET    /api/admin/users/stats              // User statistics  
POST   /api/admin/users                    // Create user
PUT    /api/admin/users/:id/verify         // Email verification
PUT    /api/admin/users/:id/subscription   // Subscription (có module riêng)
POST   /api/admin/users/bulk-operations    // Bulk operations
POST   /api/admin/users/export             // Export users  
GET    /api/admin/users/search             // Advanced search
GET    /api/admin/logs                     // Admin logs
POST   /api/admin/notifications/broadcast  // Notifications (sẽ có module riêng)
POST   /api/admin/users/:id/reset-password // Password reset
```

### 3️⃣ Database Tables Cần Thiết:

Dựa theo `database-schema.dbml` và usage hiện tại:
- ✅ **Users** - Bảng chính (CRUD operations)
- ✅ **UserUsage** - Sử dụng AI (fetchUserUsage, resetUserQuota)
- 📋 **Subscriptions** - Có sẵn ở module khác (subscriptionApi)  
- 📋 **BadgeLevels** - Có sẵn ở module khác (badgeApi)

### 4️⃣ Authentication & Authorization Cần Thiết:

```javascript
// Permission matrix dựa trên usage hiện tại
const permissions = {
  'fetchAllUsers': ['admin', 'super admin'],
  'fetchUserById': ['admin', 'super admin'],  
  'updateUser': ['admin', 'super admin'],     // Có logic phân quyền trong frontend
  'deleteUser': ['super admin'],              // Chỉ super admin
  'activateUser': ['admin', 'super admin'],
  'deactivateUser': ['admin', 'super admin'],
  'fetchUserUsage': ['admin', 'super admin'],
  'resetUserQuota': ['admin', 'super admin']
};
app.delete('/api/admin/users/:id', requireAuth, requireRole(['super admin']), deleteUserController);
```

## 📖 Cách sử dụng

### 1️⃣ Chuyển từ Mock sang Real API:

```typescript
// 1. Set environment variable
VITE_USE_MOCK_API=false

// 2. Import functions không thay đổi tên  
import { 
  fetchAllUsers,     // ✅ Giữ nguyên tên
  fetchUserById,     // ✅ Giữ nguyên tên
  updateUser,        // ✅ Giữ nguyên tên
  activateUser,      // ✅ Giữ nguyên tên
  deactivateUser     // ✅ Giữ nguyên tên
} from '../userManagementApi';  // Chỉ cần đổi đường dẫn
```

### 2️⃣ Components Đã Sẵn Sàng:

**KHÔNG CẦN THAY ĐỔI** gì trong components hiện tại:
- ✅ **UsersManagementPage.tsx** - Đã dùng đúng function names
- ✅ **UserDetailModal.tsx** - Đã dùng đúng function names  
- ✅ **UserListTable.tsx** - Chỉ nhận props
- ✅ **UserFilter.tsx** - Chỉ nhận props

### 3️⃣ API Surface So Sánh:

```typescript
// ✅ TRƯỚC (userApi.ts mock)
fetchAllUsers(params) -> PaginatedResponse<User>
fetchUserById(id) -> User
updateUser(id, data) -> User  
deleteUser(id) -> { message }
activateUser(id) -> User
deactivateUser(id) -> User
fetchUserUsage(id) -> UserUsage[]
resetUserQuota(id, payload) -> { message }

// ✅ SAU (userManagementApi.ts real) - GIỐNG HỆT
fetchAllUsers(params) -> PaginatedResponse<User>  
fetchUserById(id) -> User
updateUser(id, data) -> User
deleteUser(id) -> { message }
activateUser(id) -> User
deactivateUser(id) -> User
fetchUserUsage(id) -> UserUsage[]
resetUserQuota(id, payload) -> { message }
```

## ⚠️ Migration Checklist - CỰC KỲ ĐƠN GIẢN!

### Frontend Tasks (Chỉ 2 bước):
- [ ] Update environment variables: `VITE_USE_MOCK_API=false`
- [ ] Replace import path: `'../userApi'` → `'../userManagementApi'`

- [ ] Update function names where needed
- [ ] Test pagination changes
- [ ] Test new bulk operations
- [ ] Test enhanced user detail modal
- [ ] Implement error handling for new endpoints

### Backend Tasks:
- [ ] Implement 25 API endpoints
- [ ] Set up role-based middleware
- [ ] Implement pagination logic
- [ ] Create audit logging system
- [ ] Set up notification system
- [ ] Implement bulk operations
- [ ] Add export functionality
- [ ] Set up proper error handling
- [ ] Implement rate limiting
- [ ] Add input validation

### Database Tasks:
- [ ] Verify schema matches `database-schema.dbml`
- [ ] Add proper indexes for performance
- [ ] Set up foreign key constraints
- [ ] Implement soft delete for audit trail
- [ ] Set up backup procedures

### Security Tasks:
- [ ] Implement JWT authentication
- [ ] Set up role-based access control
- [ ] Add input sanitization
- [ ] Implement rate limiting
- [ ] Set up CORS properly
- [ ] Add request logging
- [ ] Implement password policies

## 🧪 Testing Strategy

### API Testing:
```javascript
// Example test cases
describe('User Management API', () => {
  test('GET /api/admin/users - should return paginated users', async () => {
    const response = await request(app)
      .get('/api/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.meta).toHaveProperty('total');
  });

  test('PUT /api/admin/users/:id/activate - should activate user', async () => {
    const response = await request(app)
      .put(`/api/admin/users/${testUserId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.is_active).toBe(true);
  });

  test('POST /api/admin/users/:id/reset-quota - should reset AI quota', async () => {
    const response = await request(app)
      .post(`/api/admin/users/${testUserId}/reset-quota`)
      .send({ feature: 'ai_lesson' })
      .set('Authorization', `Bearer ${superAdminToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('reset');
  });
});
```

### Frontend Testing:
- Unit tests cho API functions
- Integration tests cho components
- E2E tests cho user flows
- Performance tests cho pagination

## 📈 Monitoring & Analytics

### Metrics to Track:
- API response times
- Error rates by endpoint
- User activity patterns
- Admin action frequency
- System usage statistics

### Logging Strategy:
```javascript
// Admin action logging
const logAdminAction = (adminId, action, targetId, details) => {
  AdminLog.create({
    user_id: adminId,
    action_type: action,
    target_id: targetId,
    description: details,
    created_at: new Date()
  });
};

// Usage in controllers
const activateUserController = async (req, res) => {
  // ... activate user logic
  
  await logAdminAction(
    req.user.id, 
    'ACTIVATE_USER', 
    userId, 
    `Admin ${req.user.username} activated user ${user.username}`
  );
};
```

## 🎯 Kết luận

Toàn bộ hệ thống API cho phần **Quản lý Người dùng** đã được thiết kế hoàn chỉnh và sẵn sàng implement:

### ✅ Đã hoàn thành:
1. **API Architecture** - 25 endpoints với đầy đủ chức năng
2. **TypeScript Types** - Type-safe cho toàn bộ system
3. **Documentation** - Hướng dẫn chi tiết và examples
4. **Security Design** - Role-based access control
5. **Database Schema** - Mapping với entities
6. **Component Integration** - Ready để thay thế mock API

### 🚀 Sẵn sàng để:
- Backend developers implement theo specification
- Frontend team chuyển sang real API
- QA team thiết lập test cases
- DevOps team setup monitoring

### 📞 Support:
Mọi thắc mắc về API design, database schema, hoặc integration có thể được giải đáp dựa trên documentation và examples đã cung cấp.

---

**🎉 Chúc team thành công trong việc implement hệ thống quản lý người dùng hoàn chỉnh!**