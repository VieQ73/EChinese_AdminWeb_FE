# USER MANAGEMENT API DOCUMENTATION

## Tổng quan

File `userManagementApi.ts` chứa tất cả các API endpoints cần thiết để kết nối với backend thật cho phần **Quản lý Người dùng** trong admin panel.

## Cấu trúc API

### 🔗 Base URL
Tất cả API endpoints sử dụng prefix `/api/admin` để phân biệt với API của end-user.

### 🛡️ Authentication
- Tất cả endpoints đều yêu cầu authentication token
- Role-based access control:
  - **Super Admin**: Toàn quyền truy cập
  - **Admin**: Hạn chế một số thao tác nhạy cảm
  - **User**: Không được truy cập admin endpoints

## Nhóm API chính

### 1️⃣ User CRUD Operations

#### `GET /api/admin/users`
Lấy danh sách người dùng với phân trang và bộ lọc nâng cao.

**Parameters:**
```typescript
{
  page?: number;           // Trang hiện tại (mặc định: 1)
  limit?: number;          // Số lượng mỗi trang (mặc định: 10)
  search?: string;         // Tìm kiếm theo name, email, username
  role?: string;           // Lọc theo vai trò
  is_active?: boolean;     // Lọc theo trạng thái hoạt động
  sort_by?: string;        // Sắp xếp theo trường
  sort_order?: string;     // Thứ tự sắp xếp (asc/desc)
  // ... và nhiều filters khác
}
```

**Response:**
```typescript
PaginatedResponse<User> = {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

#### `GET /api/admin/users/:id`
Lấy chi tiết một người dùng với thông tin mở rộng.

**Response:**
```typescript
UserDetailResponse = User & {
  subscription_details?: Subscription;
  usage_stats?: UserUsage[];
  payment_history?: Payment[];
  total_posts?: number;
  total_comments?: number;
  // ...
}
```

#### `POST /api/admin/users`
Tạo người dùng mới (chỉ admin/super admin).

#### `PUT /api/admin/users/:id`
Cập nhật thông tin người dùng.

#### `DELETE /api/admin/users/:id`
Xóa vĩnh viễn người dùng (chỉ super admin).

### 2️⃣ User Status Management

#### `PUT /api/admin/users/:id/activate`
Kích hoạt tài khoản người dùng.

#### `PUT /api/admin/users/:id/deactivate`
Vô hiệu hóa tài khoản người dùng.

#### `PUT /api/admin/users/:id/verify`
Xác thực email của người dùng.

#### `PUT /api/admin/users/:id/unverify`
Bỏ xác thực email của người dùng.

### 3️⃣ Subscription Management

#### `PUT /api/admin/users/:id/subscription`
Thay đổi gói đăng ký của người dùng.

**Payload:**
```typescript
{
  subscription_id: UUID;
  custom_expiry?: Timestamp; // Tùy chỉnh ngày hết hạn
}
```

#### `DELETE /api/admin/users/:id/subscription`
Xóa gói đăng ký (về free plan).

#### `GET /api/admin/users/:id/payments`
Lấy lịch sử thanh toán của người dùng.

### 4️⃣ AI Quota & Usage Management

#### `GET /api/admin/users/:id/usage`
Lấy thông tin sử dụng AI của người dùng.

**Response:**
```typescript
UserUsage[] = [
  {
    id: UUID;
    user_id: UUID;
    feature: 'ai_lesson' | 'ai_translate';
    daily_count: number;
    last_reset: Timestamp;
  }
]
```

#### `POST /api/admin/users/:id/reset-quota`
Reset quota AI của người dùng.

**Payload:**
```typescript
{
  feature?: 'ai_lesson' | 'ai_translate'; // Nếu không có thì reset all
  reset_all?: boolean;
}
```

### 5️⃣ Badge & Achievement Management

#### `PUT /api/admin/users/:id/badge-level`
Thay đổi cấp độ huy hiệu.

#### `PUT /api/admin/users/:id/community-points`
Cập nhật điểm cộng đồng.

**Payload:**
```typescript
{
  points: number;
  operation: 'set' | 'add' | 'subtract'; // Mặc định: 'set'
}
```

#### `POST /api/admin/users/:id/achievements`
Thêm thành tích cho người dùng.

#### `DELETE /api/admin/users/:id/achievements/:achievementName`
Xóa thành tích của người dùng.

### 6️⃣ Bulk Operations

#### `POST /api/admin/users/bulk-operations`
Thực hiện hành động hàng loạt trên nhiều người dùng.

**Payload:**
```typescript
{
  user_ids: UUID[];
  action: 'activate' | 'deactivate' | 'delete' | 'verify' | 'unverify' | 'reset_quota';
  reason?: string;
  reset_quota_feature?: 'ai_lesson' | 'ai_translate';
}
```

### 7️⃣ Statistics & Analytics

#### `GET /api/admin/users/stats`
Lấy thống kê tổng quan về người dùng.

**Response:**
```typescript
{
  total_users: number;
  active_users: number;
  users_by_role: {
    user: number;
    admin: number;
    'super admin': number;
  };
  users_by_subscription: Array<{
    subscription_name: string;
    user_count: number;
  }>;
  // ...
}
```

#### `GET /api/admin/usage-stats`
Thống kê sử dụng AI toàn hệ thống.

### 8️⃣ Admin Logs & Audit Trail

#### `GET /api/admin/logs`
Lấy lịch sử hành động admin.

#### `GET /api/admin/users/:id/activity-logs`
Lịch sử hoạt động của một user cụ thể.

### 9️⃣ Notification Management

#### `POST /api/admin/notifications/broadcast`
Gửi thông báo broadcast tới tất cả hoặc nhóm người dùng.

#### `POST /api/admin/notifications/send-to-user/:userId`
Gửi thông báo riêng tư tới một người dùng.

### 🔟 Password Management

#### `POST /api/admin/users/:id/reset-password`
Reset mật khẩu cho người dùng.

**Options:**
- Gửi email với mật khẩu mới
- Hoặc trả về mật khẩu tạm thời

#### `PUT /api/admin/users/:id/force-password-change`
Buộc user đổi mật khẩu ở lần đăng nhập tiếp theo.

## Tích hợp với Frontend

### Thay thế userApi.ts hiện tại

```typescript
// Thay vì import từ userApi.ts
import { fetchAllUsers } from '../users/userApi';

// Sử dụng API mới
import { fetchUsers } from '../users/userManagementApi';
```

### Sử dụng với React Components

```typescript
// Trong UserDetailModal.tsx
import { 
  fetchUserDetail, 
  updateUser, 
  fetchUserUsage, 
  resetUserQuota 
} from '../userManagementApi';

// Trong UsersManagementPage.tsx
import { 
  fetchUsers, 
  fetchUserStats,
  activateUser, 
  deactivateUser 
} from '../userManagementApi';
```

### Error Handling

Tất cả API functions đều sử dụng `apiClient` với interceptors đã được cấu hình sẵn để:
- Tự động thêm Authorization header
- Handle HTTP errors
- Redirect tới login nếu token hết hạn

## Database Schema Mapping

API được thiết kế dựa trên database schema trong `docs/database-schema.dbml`:

### Related Tables:
- **Users**: Bảng chính chứa thông tin user
- **Subscriptions**: Gói đăng ký
- **BadgeLevels**: Cấp độ huy hiệu  
- **UserUsage**: Quota sử dụng AI
- **Payments**: Lịch sử thanh toán
- **AdminLogs**: Audit trail
- **Notifications**: Hệ thống thông báo

### Key Relationships:
```sql
Users.subscription_id -> Subscriptions.id
Users.badge_level -> BadgeLevels.level
UserUsage.user_id -> Users.id
Payments.user_id -> Users.id
AdminLogs.user_id -> Users.id (admin thực hiện)
AdminLogs.target_id -> Users.id (user bị tác động)
```

## Security & Permissions

### Role-based Access Control:

#### Super Admin có thể:
- Tất cả operations
- Delete users vĩnh viễn
- Tạo/sửa/xóa admins khác
- Reset quota cho bất kỳ user nào
- Xem tất cả admin logs

#### Admin có thể:
- Quản lý users thông thường (không phải admin khác)
- Activate/deactivate users
- Xem user details và stats
- Reset quota (giới hạn)
- Gửi notifications

#### Restrictions:
- Admin không thể sửa thông tin admin khác
- Super Admin không thể tự hạ cấp role của mình
- Một số operations nhạy cảm chỉ dành cho Super Admin

## Migration Guide

### Từ Mock API sang Real API:

1. **Update environment variable:**
   ```env
   VITE_USE_MOCK_API=false
   ```

2. **Replace imports:**
   ```typescript
   // Cũ
   import { fetchAllUsers, updateUser } from './userApi';
   
   // Mới
   import { fetchUsers, updateUser } from './userManagementApi';
   ```

3. **Update function calls:**
   ```typescript
   // Cũ
   const response = await fetchAllUsers(params);
   
   // Mới  
   const response = await fetchUsers(params);
   ```

4. **Handle new response structure:**
   - Nhiều endpoints trả về thêm metadata
   - Error handling chuẩn hóa
   - Pagination response structure

## API Testing

### Postman Collection
Tạo Postman collection với:
- Environment variables (base URL, auth token)
- Pre-request scripts để set authorization
- Tests để validate response structure

### Example Requests:

```javascript
// Get users with pagination
GET /api/admin/users?page=1&limit=10&role=user&search=nguyen

// Update user subscription
PUT /api/admin/users/123e4567-e89b-12d3-a456-426614174000/subscription
{
  "subscription_id": "sub-premium-001",
  "custom_expiry": "2025-12-31T23:59:59Z"
}

// Reset user AI quota
POST /api/admin/users/123e4567-e89b-12d3-a456-426614174000/reset-quota
{
  "feature": "ai_lesson"
}
```

## Backend Implementation Notes

### Database Queries Optimization:
- Index trên các trường search thường xuyên
- JOIN tables để lấy thông tin subscription_details
- Aggregate queries cho statistics
- Pagination với LIMIT/OFFSET

### Security Implementation:
- JWT token validation
- Role-based middleware
- Input validation & sanitization
- Rate limiting cho sensitive operations

### Audit Trail:
- Log tất cả admin actions vào AdminLogs table
- Include IP address, user agent
- Soft delete với reason tracking

### Notification System:
- Queue system cho bulk notifications
- Email/Push notification integration
- Notification preferences per user

---

**📝 Note:** File này là blueprint hoàn chỉnh cho backend developers để implement APIs. Frontend đã sẵn sàng tích hợp khi backend hoàn thành.