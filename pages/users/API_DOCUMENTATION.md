# User Management API Documentation

## Ban/Unban User APIs

### 1. Ban User (Cấm người dùng)

**Endpoint:** `POST /admin/users/:userId/ban`

**Mô tả:** Cấm một người dùng bằng cách đặt `is_active = false`. API này sẽ ghi nhận đầy đủ thông tin về vi phạm vào hệ thống.

**Request Body:**
```typescript
{
  reason: string;        // Lý do cấm (hiển thị trên log) - BẮT BUỘC
  ruleIds: string[];     // Danh sách ID quy tắc vi phạm - BẮT BUỘC
  resolution: string;    // Ghi chú hướng giải quyết - TÙY CHỌN
  severity: 'low' | 'medium' | 'high'; // Mức độ vi phạm - BẮT BUỘC
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user: User; // Thông tin người dùng đã được cập nhật
}
```

**Ví dụ sử dụng:**
```typescript
import { banUser } from './pages/users/userApi';

const handleBanUser = async (userId: string) => {
  try {
    const response = await banUser(userId, {
      reason: 'Lạm dụng ngôn ngữ và spam liên tục',
      ruleIds: ['rule-01', 'rule-03'], // Spam và Ngôn từ không phù hợp
      resolution: 'Cấm tài khoản vĩnh viễn. Người dùng đã được cảnh cáo 3 lần trước đó.',
      severity: 'high'
    });
    
    console.log(response.message); // "Đã cấm người dùng thành công"
    console.log(response.user.is_active); // false
  } catch (error) {
    console.error('Lỗi khi cấm người dùng:', error);
  }
};
```

---

### 2. Unban User (Bỏ cấm người dùng)

**Endpoint:** `POST /admin/users/:userId/unban`

**Mô tả:** Bỏ cấm một người dùng bằng cách đặt `is_active = true`. API này sẽ ghi nhận lý do bỏ cấm vào hệ thống.

**Request Body:**
```typescript
{
  reason: string; // Lý do bỏ cấm (bắt buộc)
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user: User; // Thông tin người dùng đã được cập nhật
}
```

**Ví dụ sử dụng:**
```typescript
import { unbanUser } from './pages/users/userApi';

const handleUnbanUser = async (userId: string) => {
  try {
    const response = await unbanUser(userId, {
      reason: 'Hết hạn cấm, người dùng đã cam kết tuân thủ quy tắc'
    });
    
    console.log(response.message); // "Đã bỏ cấm người dùng thành công"
    console.log(response.user.is_active); // true
  } catch (error) {
    console.error('Lỗi khi bỏ cấm người dùng:', error);
  }
};
```

---

## Tích hợp trong UI

### Trong UserDetail Component

Khi admin/super admin cấm hoặc bỏ cấm người dùng từ trang chi tiết người dùng:

1. **Form nhập liệu:**
   - `BanUserForm.tsx`: Form để nhập lý do cấm, chọn quy tắc vi phạm, mức độ vi phạm
   - `UnbanUserForm.tsx`: Form để nhập lý do bỏ cấm

2. **Xử lý logic:**
   - `useUserActions.ts`: Hook xử lý các action, gọi API và cập nhật state

3. **Flow hoàn chỉnh:**
   ```
   User clicks "Cấm người dùng"
   → Modal mở với BanUserForm
   → Admin nhập lý do và chọn quy tắc
   → Click "Xác nhận"
   → Call banUser() API
   → Backend cập nhật is_active = false
   → Frontend nhận response
   → Cập nhật UI (user.is_active = false)
   → Tạo violation record trong context
   → Ghi moderation log
   → Ghi admin log
   → Hiển thị notification "Đã cấm người dùng"
   ```

---

## Backend Requirements

Backend cần implement 2 endpoints sau:

### POST /admin/users/:userId/ban
```typescript
// Request body
{
  reason: string;        // Lý do cấm ngắn gọn
  ruleIds: string[];     // Danh sách ID quy tắc vi phạm
  resolution: string;    // Ghi chú chi tiết về hướng giải quyết
  severity: 'low' | 'medium' | 'high'; // Mức độ vi phạm
}

// Response
{
  success: true,
  message: "Đã cấm người dùng thành công",
  user: {
    id: "user-id",
    is_active: false,
    // ... other user fields
  }
}
```

**Backend logic:**
1. Validate admin permissions
2. Kiểm tra user tồn tại
3. Cập nhật `is_active = false`
4. Tạo bản ghi vi phạm (violation) với:
   - `user_id`: ID người dùng bị cấm
   - `target_type`: 'user'
   - `target_id`: ID người dùng
   - `severity`: Mức độ vi phạm
   - `resolution`: Ghi chú giải quyết
   - `detected_by`: 'admin' hoặc 'super admin'
5. Liên kết vi phạm với các quy tắc (violation_rules table):
   - Lưu từng `rule_id` trong `ruleIds` vào bảng `violation_rules`
6. Tạo moderation log:
   - `target_type`: 'user'
   - `target_id`: ID người dùng
   - `action`: 'remove'
   - `reason`: Lý do cấm
   - `performed_by`: ID admin thực hiện
7. Trả về user đã cập nhật

### POST /admin/users/:userId/unban
```typescript
// Request body
{
  reason: string
}

// Response
{
  success: true,
  message: "Đã bỏ cấm người dùng thành công",
  user: {
    id: "user-id",
    is_active: true,
    // ... other user fields
  }
}
```

**Backend logic:**
1. Validate admin permissions
2. Kiểm tra user tồn tại
3. Cập nhật `is_active = true`
4. Lưu lý do bỏ cấm vào bảng `moderation_logs`
5. Xóa hoặc đánh dấu hết hạn các ban records
6. Trả về user đã cập nhật

---

## Error Handling

Cả 2 API đều có thể trả về các lỗi sau:

```typescript
// 401 Unauthorized
{
  success: false,
  message: "Không có quyền thực hiện hành động này"
}

// 404 Not Found
{
  success: false,
  message: "Không tìm thấy người dùng"
}

// 400 Bad Request
{
  success: false,
  message: "Lý do cấm/bỏ cấm không được để trống"
}

// 500 Internal Server Error
{
  success: false,
  message: "Lỗi server khi xử lý yêu cầu"
}
```

Frontend sẽ catch các lỗi này và hiển thị notification phù hợp cho admin.

---

## Request/Response Examples

### Ví dụ 1: Cấm người dùng vi phạm spam

**Request:**
```http
POST /admin/users/u2/ban
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "reason": "Đăng spam liên tục trong cộng đồng",
  "ruleIds": ["rule-01", "rule-02"],
  "resolution": "Cấm tài khoản 7 ngày. Nếu tái phạm sẽ cấm vĩnh viễn.",
  "severity": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã cấm người dùng thành công",
  "user": {
    "id": "u2",
    "username": "chen_wei_cool",
    "name": "user_wei_chen",
    "is_active": false,
    "role": "user",
    ...
  }
}
```

### Ví dụ 2: Cấm người dùng vi phạm nghiêm trọng

**Request:**
```http
POST /admin/users/u6/ban
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "reason": "Đe dọa và quấy rối người dùng khác",
  "ruleIds": ["rule-04", "rule-05"],
  "resolution": "Cấm vĩnh viễn. Vi phạm nghiêm trọng quy tắc cộng đồng về an toàn.",
  "severity": "high"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã cấm người dùng thành công",
  "user": {
    "id": "u6",
    "username": "banned_user_01",
    "name": "Tài Khoản Bị Cấm",
    "is_active": false,
    "role": "user",
    ...
  }
}
```

### Ví dụ 3: Bỏ cấm người dùng

**Request:**
```http
POST /admin/users/u2/unban
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "reason": "Hết hạn cấm 7 ngày. Người dùng đã cam kết tuân thủ quy tắc."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã bỏ cấm người dùng thành công",
  "user": {
    "id": "u2",
    "username": "chen_wei_cool",
    "name": "user_wei_chen",
    "is_active": true,
    "role": "user",
    ...
  }
}
```

---

## Database Schema Suggestions

### Bảng `violations`
```sql
CREATE TABLE violations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  target_type VARCHAR(20) NOT NULL, -- 'user', 'post', 'comment'
  target_id UUID NOT NULL,
  severity VARCHAR(10) NOT NULL, -- 'low', 'medium', 'high'
  resolution TEXT,
  detected_by VARCHAR(20) NOT NULL, -- 'admin', 'super admin', 'auto_ai'
  handled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
```

### Bảng `violation_rules` (Many-to-Many)
```sql
CREATE TABLE violation_rules (
  id UUID PRIMARY KEY,
  violation_id UUID NOT NULL REFERENCES violations(id),
  rule_id UUID NOT NULL REFERENCES community_rules(id),
  UNIQUE(violation_id, rule_id)
);
```

### Bảng `moderation_logs`
```sql
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL,
  target_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL, -- 'remove', 'restore'
  reason TEXT,
  performed_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Notes

- **Permissions:** Chỉ admin và super admin mới có quyền ban/unban users
- **Self-ban prevention:** Super admin không thể ban chính mình
- **Logging:** Mọi hành động ban/unban đều được ghi log đầy đủ
- **Violation tracking:** Khi ban user, hệ thống tự động tạo violation record với đầy đủ thông tin
- **Rule tracking:** Các quy tắc vi phạm được lưu trong bảng `violation_rules` để dễ dàng query và báo cáo
- **Audit trail:** Lý do ban/unban, resolution, severity đều được lưu trữ để audit sau này
- **Frontend sync:** Frontend cũng tạo các records tương tự trong context để UI cập nhật ngay lập tức
