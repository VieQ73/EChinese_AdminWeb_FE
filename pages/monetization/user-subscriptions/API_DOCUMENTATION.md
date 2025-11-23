# 📚 API Documentation - User Subscriptions Management

## Tổng quan
Module quản lý gói đăng ký của người dùng, cho phép admin xem, chỉnh sửa và quản lý các gói subscription của từng user.

---

## 🔌 API Endpoints

### 1. Lấy danh sách gói người dùng (Enriched)

**Endpoint:** `GET /monetization/user-subscriptions`

**Query Parameters:**
```typescript
{
  page?: number;      // Trang hiện tại (default: 1)
  limit?: number;     // Số item mỗi trang (default: 12)
  search?: string;    // Tìm kiếm theo tên, email, hoặc user ID
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    data: EnrichedUserSubscription[],
    meta: {
      total: number,
      page: number,
      limit: number,
      totalPages: number
    }
  }
}
```

**EnrichedUserSubscription Structure:**
```typescript
{
  user: {
    id: string,
    name: string,
    email: string,
    avatar_url: string
  },
  userSubscription?: {
    id: string,
    user_id: string,
    subscription_id: string,
    start_date: string,
    expiry_date: string | null,  // null = vĩnh viễn
    is_active: boolean,
    auto_renew: boolean,
    last_payment_id: string | null,
    created_at: string,
    updated_at: string
  },
  subscription?: {
    id: string,
    name: string,
    description: object,
    daily_quota_ai_lesson: number,
    daily_quota_translate: number,
    price: number,
    duration_months: number | null,  // null = vĩnh viễn
    is_active: boolean
  },
  quotas?: {
    ai_lesson?: {
      user_id: string,
      feature: 'ai_lesson',
      daily_count: number,
      daily_limit: number,
      last_reset: string
    },
    ai_translate?: {
      user_id: string,
      feature: 'ai_translate',
      daily_count: number,
      daily_limit: number,
      last_reset: string
    }
  }
}
```

---

### 2. Cập nhật chi tiết gói người dùng

**Endpoint:** `PUT /monetization/user-subscriptions/:userSubId`

**Request Body (Union Type):**

#### Action 1: Thay đổi ngày hết hạn
```typescript
{
  action: 'change_expiry',
  new_expiry_date: string | null  // ISO 8601 format hoặc null (vĩnh viễn)
}
```

**Ví dụ:**
```json
{
  "action": "change_expiry",
  "new_expiry_date": "2025-12-31T23:59:59Z"
}
```

Hoặc đặt vĩnh viễn:
```json
{
  "action": "change_expiry",
  "new_expiry_date": null
}
```

#### Action 2: Bật/Tắt tự động gia hạn
```typescript
{
  action: 'toggle_renew',
  auto_renew: boolean
}
```

**Ví dụ:**
```json
{
  "action": "toggle_renew",
  "auto_renew": true
}
```

#### Action 3: Hủy gói ngay lập tức
```typescript
{
  action: 'cancel_now'
}
```

**Ví dụ:**
```json
{
  "action": "cancel_now"
}
```

**Backend xử lý:**
- Đặt `is_active = false`
- Đặt `auto_renew = false`
- Đặt `expiry_date = now()`

#### Action 4: Thay đổi gói đăng ký
```typescript
{
  action: 'change_plan',
  new_subscription_id: string,
  change_type: 'immediate' | 'end_of_term',
  new_expiry_date?: string | null  // Tự động tính từ frontend
}
```

**Ví dụ:**
```json
{
  "action": "change_plan",
  "new_subscription_id": "sub_premium_year",
  "change_type": "immediate",
  "new_expiry_date": "2025-11-23T10:30:00Z"
}
```

**Logic tính `new_expiry_date` (Frontend):**
```typescript
// Nếu gói mới là vĩnh viễn (duration_months = null)
new_expiry_date = null

// Nếu gói mới có thời hạn
new_expiry_date = start_date + duration_months
```

**Ví dụ cụ thể:**
- User bắt đầu: 01/01/2024
- Gói cũ: Premium Tháng (1 tháng) → Hết hạn: 01/02/2024
- Đổi sang: Premium Năm (12 tháng)
- **new_expiry_date = 01/01/2024 + 12 tháng = 01/01/2025**

**Response:**
```typescript
{
  success: boolean,
  message?: string,
  data?: any
}
```

---

### 3. Lấy lịch sử gói của người dùng

**Endpoint:** `GET /monetization/user-subscriptions/history/:userId`

**Response:**
```typescript
{
  success: true,
  data: UserSubscriptionHistoryItem[]
}
```

**UserSubscriptionHistoryItem Structure:**
```typescript
{
  id: string,
  user_id: string,
  subscription_id: string,
  subscriptionName: string,  // Enriched field
  start_date: string,
  expiry_date: string | null,
  is_active: boolean,
  auto_renew: boolean,
  last_payment_id: string | null,
  created_at: string,
  updated_at: string
}
```

---

### 4. Reset quota sử dụng

**Endpoint:** `POST /admin/usage/reset`

**Request Body:**
```typescript
{
  userId: string,
  features: Array<'ai_lesson' | 'ai_translate'>
}
```

**Ví dụ:**
```json
{
  "userId": "u1",
  "features": ["ai_lesson", "ai_translate"]
}
```

**Backend xử lý:**
- Đặt `daily_count = 0` cho các feature được chỉ định
- Cập nhật `last_reset = now()`

**Response:**
```typescript
{
  success: boolean,
  message?: string
}
```

---

## 🎯 Hoạt động của chức năng

### Flow 1: Xem danh sách gói người dùng

```
1. User vào tab "Gói của người dùng"
   ↓
2. Frontend gọi GET /monetization/user-subscriptions?page=1&limit=12
   ↓
3. Backend trả về danh sách EnrichedUserSubscription
   ↓
4. Frontend hiển thị dạng grid cards với:
   - Thông tin user (tên, email, avatar)
   - Gói hiện tại và trạng thái
   - Quota usage với progress bar
   - Cảnh báo hết hạn/sắp hết hạn
```

### Flow 2: Thay đổi gói đăng ký

```
1. Admin click "Quản lý" trên card user
   ↓
2. Modal mở, hiển thị view "main"
   ↓
3. Admin click "Thay đổi gói"
   ↓
4. Frontend gọi GET /monetization/subscriptions?status=active
   để lấy danh sách gói có thể chuyển
   ↓
5. Admin chọn gói mới từ dropdown
   ↓
6. Frontend tự động tính:
   - new_expiry_date = start_date + new_plan.duration_months
   - price_diff = new_plan.price - current_plan.price
   ↓
7. Hiển thị preview:
   - Ngày hết hạn mới (màu xanh)
   - Chênh lệch chi phí (màu vàng/xanh lá)
   ↓
8. Admin click "Xác nhận thay đổi"
   ↓
9. Confirmation modal hiện ra
   ↓
10. Admin xác nhận
    ↓
11. Frontend gọi PUT /monetization/user-subscriptions/:id
    Body: {
      action: 'change_plan',
      new_subscription_id: 'sub_premium_year',
      change_type: 'immediate',
      new_expiry_date: '2025-01-01T00:00:00Z'
    }
    ↓
12. Backend cập nhật:
    - subscription_id = new_subscription_id
    - expiry_date = new_expiry_date
    - updated_at = now()
    ↓
13. Frontend reload danh sách
```

### Flow 3: Sửa ngày hết hạn

```
1. Admin click "Sửa ngày hết hạn"
   ↓
2. View "change_expiry" hiển thị với:
   - Checkbox "Gói vĩnh viễn"
   - Input date (disabled nếu chọn vĩnh viễn)
   ↓
3. Admin có 2 lựa chọn:
   
   Option A: Chọn ngày cụ thể
   - Bỏ checkbox vĩnh viễn
   - Chọn ngày từ date picker
   - Click "Lưu thay đổi"
   - Gửi: { action: 'change_expiry', new_expiry_date: '2025-12-31T23:59:59Z' }
   
   Option B: Chọn vĩnh viễn
   - Check checkbox vĩnh viễn
   - Input date tự động disable
   - Click "Lưu thay đổi"
   - Gửi: { action: 'change_expiry', new_expiry_date: null }
   ↓
4. Backend cập nhật expiry_date
   ↓
5. Frontend reload danh sách
```

### Flow 4: Reset quota

```
1. Admin click "Reset Quota Bài học" hoặc "Reset Quota Dịch"
   ↓
2. Confirmation modal hiện ra
   ↓
3. Admin xác nhận
   ↓
4. Frontend gọi POST /admin/usage/reset
   Body: {
     userId: 'u1',
     features: ['ai_lesson']
   }
   ↓
5. Backend:
   - Tìm UserUsage record
   - Đặt daily_count = 0
   - Cập nhật last_reset = now()
   ↓
6. Frontend:
   - Cập nhật context (đồng bộ với User Detail page)
   - Reload danh sách để cập nhật UI
   - Đóng modal
```

### Flow 5: Bật/Tắt tự động gia hạn

```
1. Admin click "Bật/Tắt tự gia hạn"
   ↓
2. Confirmation modal hiện ra
   ↓
3. Admin xác nhận
   ↓
4. Frontend gọi PUT /monetization/user-subscriptions/:id
   Body: {
     action: 'toggle_renew',
     auto_renew: true/false
   }
   ↓
5. Backend cập nhật auto_renew
   ↓
6. Frontend reload danh sách
```

### Flow 6: Hủy gói ngay

```
1. Admin click "Hủy gói ngay" (button đỏ)
   ↓
2. Confirmation modal hiện ra với cảnh báo
   ↓
3. Admin xác nhận
   ↓
4. Frontend gọi PUT /monetization/user-subscriptions/:id
   Body: {
     action: 'cancel_now'
   }
   ↓
5. Backend:
   - Đặt is_active = false
   - Đặt auto_renew = false
   - Đặt expiry_date = now()
   ↓
6. Frontend reload danh sách
   ↓
7. Card user hiển thị trạng thái "Không hoạt động" với màu đỏ
```

---

## 🔐 Authorization

Tất cả các endpoint yêu cầu:
- **Authentication:** Bearer token trong header
- **Role:** `admin` hoặc `superadmin`

**Header:**
```
Authorization: Bearer <access_token>
```

---

## ⚠️ Error Handling

**Common Error Responses:**

```typescript
// 400 Bad Request
{
  success: false,
  message: "Invalid action type"
}

// 401 Unauthorized
{
  success: false,
  message: "Authentication required"
}

// 403 Forbidden
{
  success: false,
  message: "Admin access required"
}

// 404 Not Found
{
  success: false,
  message: "User subscription not found"
}

// 500 Internal Server Error
{
  success: false,
  message: "Internal server error"
}
```

---

## 📊 Business Logic

### Tính toán ngày hết hạn khi thay đổi gói

**Quy tắc:**
1. Giữ nguyên `start_date` (không thay đổi)
2. Tính `new_expiry_date` dựa trên `duration_months` của gói mới
3. Nếu `duration_months = null` → `expiry_date = null` (vĩnh viễn)

**Công thức:**
```
new_expiry_date = start_date + (new_plan.duration_months * 30 days)
```

**Ví dụ thực tế:**

| Gói cũ | Gói mới | Start Date | Old Expiry | New Expiry |
|--------|---------|------------|------------|------------|
| Tháng (1m) | Năm (12m) | 01/01/2024 | 01/02/2024 | **01/01/2025** |
| Năm (12m) | Tháng (1m) | 01/01/2024 | 01/01/2025 | **01/02/2024** |
| Tháng (1m) | Vĩnh viễn (null) | 01/01/2024 | 01/02/2024 | **null** |
| Vĩnh viễn (null) | Tháng (1m) | 01/01/2024 | null | **01/02/2024** |

### Xử lý chênh lệch chi phí

**Frontend hiển thị:**
- Nếu `price_diff > 0`: Màu vàng, text "cần thu thêm"
- Nếu `price_diff < 0`: Màu xanh lá, text "hoàn lại"
- Nếu `price_diff = 0`: Không hiển thị

**Backend cần xử lý:**
- Tạo payment record cho phần chênh lệch
- Hoặc tạo refund record nếu cần hoàn tiền
- Gửi notification cho user về việc thanh toán bù trừ

---

## 🧪 Testing

**Test Cases:**

1. ✅ Lấy danh sách với pagination
2. ✅ Tìm kiếm theo tên/email/ID
3. ✅ Thay đổi gói từ tháng → năm
4. ✅ Thay đổi gói từ năm → tháng
5. ✅ Thay đổi gói lên vĩnh viễn
6. ✅ Sửa ngày hết hạn thành ngày cụ thể
7. ✅ Sửa ngày hết hạn thành vĩnh viễn
8. ✅ Bật/tắt tự động gia hạn
9. ✅ Hủy gói ngay
10. ✅ Reset quota AI lesson
11. ✅ Reset quota AI translate
12. ✅ Xem lịch sử gói

---

## 📝 Notes

- Frontend tự động tính `new_expiry_date` để đảm bảo tính nhất quán
- Backend nên validate `new_expiry_date` có hợp lý không
- Khi thay đổi gói, cần cập nhật cả `daily_limit` trong `user_usage` table
- Cân nhắc thêm audit log cho các thay đổi quan trọng
- Có thể thêm tính năng "schedule change" để thay đổi gói vào cuối kỳ

---

**Last Updated:** 2024-11-23
**Version:** 1.0.0
