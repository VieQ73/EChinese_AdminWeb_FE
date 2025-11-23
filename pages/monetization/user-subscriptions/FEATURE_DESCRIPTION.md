# 🎯 Mô tả chức năng: Quản lý Gói của Người dùng

## Tổng quan

Chức năng "Gói của người dùng" (User Subscriptions Management) cho phép admin xem và quản lý các gói đăng ký của từng người dùng trong hệ thống. Đây là một phần quan trọng của module Monetization, giúp admin có thể:

- Xem tổng quan gói đăng ký của tất cả người dùng
- Theo dõi quota sử dụng (AI lesson, AI translate)
- Thay đổi gói đăng ký cho người dùng
- Điều chỉnh thời hạn gói
- Quản lý tự động gia hạn
- Reset quota khi cần thiết

---

## 🎨 Giao diện người dùng

### 1. Màn hình danh sách (Grid View)

**Layout:**
- Grid responsive: 1 cột (mobile) → 2 cột (tablet) → 3 cột (desktop)
- Mỗi card hiển thị thông tin một người dùng
- Thanh tìm kiếm ở trên cùng
- Pagination ở dưới cùng

**Card thông tin người dùng:**

```
┌─────────────────────────────────────┐
│ 👤 Nguyễn Văn A          [✏️ Quản lý]│
│ email@example.com                   │
│ 🏷️ Sắp hết hạn                      │
│                                     │
│ 📦 Premium Tháng        ✅ Hoạt động │
│ Từ: 01/01/2024                      │
│ Đến: 01/02/2024                     │
│                                     │
│ 📊 Sử dụng quota                    │
│ Bài học AI: 5/10                    │
│ ████████░░ 50%                      │
│                                     │
│ Dịch thuật: 30/100                  │
│ ███░░░░░░░ 30%                      │
│                                     │
│ 🔄 Tự động gia hạn      #abc123     │
└─────────────────────────────────────┘
```

**Màu sắc cảnh báo:**
- 🔴 Đỏ: Gói đã hết hạn
- 🟡 Vàng: Gói sắp hết hạn (còn < 7 ngày)
- ⚪ Trắng: Gói bình thường

### 2. Modal quản lý chi tiết

**View Main (Tổng quan):**

```
┌─────────────────────────────────────────────┐
│ Quản lý gói cho Nguyễn Văn A           [✕]  │
├─────────────────────────────────────────────┤
│                                             │
│ Gói hiện tại: Premium Tháng                 │
│ ┌─────────────────────────────────────────┐ │
│ │ Ngày bắt đầu: 01/01/2024                │ │
│ │ Ngày hết hạn: 01/02/2024                │ │
│ │ Tự động gia hạn: Bật                    │ │
│ │ Thanh toán cuối: pay_123456             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Hành động quản lý                           │
│ ─────────────────────────────────────────── │
│ [Thay đổi gói] [Sửa ngày hết hạn]          │
│ [Bật/Tắt tự gia hạn] [🔴 Hủy gói ngay]     │
│                                             │
│ Hành động khác                              │
│ ─────────────────────────────────────────── │
│ [Reset Quota Bài học] [Reset Quota Dịch]   │
│                                             │
│ Lịch sử gói                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ Tên gói    │ Thời gian      │ Trạng thái││ │
│ │ Premium Năm│ 01/01-01/02/24 │ Không HĐ  ││ │
│ │ Premium Th.│ 01/02-01/03/24 │ Hoạt động ││ │
│ └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**View Thay đổi gói:**

```
┌─────────────────────────────────────────────┐
│ Thay đổi gói đăng ký                   [✕]  │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Gói hiện tại: Premium Tháng             │ │
│ │ Ngày bắt đầu: 01/01/2024                │ │
│ │ Ngày hết hạn hiện tại: 01/02/2024       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Chọn gói mới                                │
│ ┌─────────────────────────────────────────┐ │
│ │ Premium Năm (2,399,000₫) - 12 tháng  ▼ │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 📅 Ngày hết hạn mới: 01/01/2025         │ │
│ │ Tính từ: 01/01/2024 + 12 tháng         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 💰 Chênh lệch: 2,160,000₫ (cần thu)    │ │
│ │ Cần thông báo người dùng thanh toán    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│              [Hủy] [Xác nhận thay đổi]      │
└─────────────────────────────────────────────┘
```

**View Sửa ngày hết hạn:**

```
┌─────────────────────────────────────────────┐
│ Thay đổi ngày hết hạn                  [✕]  │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ☑️ Gói vĩnh viễn (không hết hạn)        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Ngày hết hạn mới                            │
│ ┌─────────────────────────────────────────┐ │
│ │ [Disabled - chọn từ lịch]              │ │
│ └─────────────────────────────────────────┘ │
│ Gói vĩnh viễn không cần ngày hết hạn        │
│                                             │
│              [Hủy] [Lưu thay đổi]           │
└─────────────────────────────────────────────┘
```

---

## 🔄 Luồng hoạt động chi tiết

### Kịch bản 1: Admin xem danh sách gói người dùng

**Bước 1:** Admin vào tab "Gói của người dùng"
- Hệ thống tự động load trang 1 với 12 items

**Bước 2:** Hệ thống hiển thị
- Grid cards với thông tin từng user
- Mỗi card có:
  - Avatar, tên, email
  - Gói hiện tại và trạng thái
  - Progress bar quota usage
  - Badge cảnh báo (nếu có)
  - Button "Quản lý"

**Bước 3:** Admin có thể
- Tìm kiếm theo tên/email/ID
- Chuyển trang
- Click "Quản lý" để xem chi tiết

---

### Kịch bản 2: Thay đổi gói từ Tháng lên Năm

**Tình huống:**
- User: Nguyễn Văn A
- Gói hiện tại: Premium Tháng (239,000₫/tháng)
- Ngày bắt đầu: 01/01/2024
- Ngày hết hạn hiện tại: 01/02/2024
- Muốn nâng cấp: Premium Năm (2,399,000₫/năm)

**Bước 1:** Admin click "Quản lý" trên card của user
- Modal mở ra, hiển thị view "main"
- Hệ thống tự động load lịch sử gói

**Bước 2:** Admin click "Thay đổi gói"
- View chuyển sang "change_plan"
- Hệ thống load danh sách gói có thể chuyển

**Bước 3:** Admin chọn "Premium Năm" từ dropdown
- Hệ thống tự động tính toán:
  ```
  new_expiry_date = 01/01/2024 + 12 tháng = 01/01/2025
  price_diff = 2,399,000 - 239,000 = 2,160,000₫
  ```

**Bước 4:** Hệ thống hiển thị preview
- Box xanh: "📅 Ngày hết hạn mới: 01/01/2025"
- Box vàng: "💰 Chênh lệch: 2,160,000₫ (cần thu thêm)"
- Text gợi ý: "Cần thông báo người dùng thanh toán bù trừ"

**Bước 5:** Admin click "Xác nhận thay đổi"
- Confirmation modal hiện ra
- Text: "Bạn có chắc chắn muốn thực hiện hành động này không?"

**Bước 6:** Admin click "Xác nhận"
- Frontend gửi request:
  ```json
  PUT /monetization/user-subscriptions/us1
  {
    "action": "change_plan",
    "new_subscription_id": "sub_premium_year",
    "change_type": "immediate",
    "new_expiry_date": "2025-01-01T00:00:00Z"
  }
  ```

**Bước 7:** Backend xử lý
- Cập nhật `subscription_id = sub_premium_year`
- Cập nhật `expiry_date = 2025-01-01T00:00:00Z`
- Cập nhật `updated_at = now()`
- Cập nhật `daily_limit` trong bảng `user_usage`

**Bước 8:** Frontend nhận response thành công
- Đóng modal
- Reload danh sách
- Card user hiển thị gói mới

**Kết quả:**
- Gói: Premium Năm ✅
- Ngày hết hạn: 01/01/2025
- Quota mới: 15 bài học/ngày, 200 lượt dịch/ngày

---

### Kịch bản 3: Đổi gói từ Năm xuống Tháng

**Tình huống:**
- User: Trần Thị B
- Gói hiện tại: Premium Năm
- Ngày bắt đầu: 01/01/2024
- Ngày hết hạn hiện tại: 01/01/2025
- Muốn hạ xuống: Premium Tháng

**Logic tính toán:**
```
new_expiry_date = 01/01/2024 + 1 tháng = 01/02/2024
price_diff = 239,000 - 2,399,000 = -2,160,000₫ (hoàn lại)
```

**Hiển thị:**
- Box xanh: "📅 Ngày hết hạn mới: 01/02/2024"
- Box xanh lá: "💰 Chênh lệch: 2,160,000₫ (hoàn lại)"
- Text: "Cần xử lý hoàn tiền cho người dùng"

**Lưu ý:**
- Admin cần tạo refund request riêng
- Hoặc hệ thống tự động tạo refund record

---

### Kịch bản 4: Đổi sang gói Vĩnh viễn

**Tình huống:**
- User: Lê Văn C
- Gói hiện tại: Premium Tháng
- Muốn nâng cấp: Premium Vĩnh viễn (5,999,000₫)

**Logic:**
```
new_expiry_date = null (vĩnh viễn)
price_diff = 5,999,000 - 239,000 = 5,760,000₫
```

**Hiển thị:**
- Box xanh: "📅 Ngày hết hạn mới: Vĩnh viễn (không hết hạn)"
- Box vàng: "💰 Chênh lệch: 5,760,000₫ (cần thu thêm)"

**Request:**
```json
{
  "action": "change_plan",
  "new_subscription_id": "sub_lifetime",
  "change_type": "immediate",
  "new_expiry_date": null
}
```

---

### Kịch bản 5: Sửa ngày hết hạn thành Vĩnh viễn

**Tình huống:**
- User VIP cần được tặng gói vĩnh viễn
- Không muốn thay đổi gói hiện tại
- Chỉ muốn bỏ ngày hết hạn

**Bước 1:** Admin click "Sửa ngày hết hạn"

**Bước 2:** Admin check ☑️ "Gói vĩnh viễn"
- Input date tự động disable
- Màu xám, cursor not-allowed

**Bước 3:** Admin click "Lưu thay đổi"

**Request:**
```json
{
  "action": "change_expiry",
  "new_expiry_date": null
}
```

**Kết quả:**
- Gói không đổi (vẫn Premium Tháng)
- Nhưng `expiry_date = null` → Vĩnh viễn
- Card hiển thị: "Vĩnh viễn" thay vì ngày cụ thể

---

### Kịch bản 6: Reset Quota khi user báo lỗi

**Tình huống:**
- User báo: "Em đã dùng hết quota nhưng chưa đến cuối ngày"
- Admin kiểm tra: Có thể do bug hoặc timezone issue
- Quyết định: Reset quota để user tiếp tục sử dụng

**Bước 1:** Admin click "Reset Quota Bài học"

**Bước 2:** Confirmation modal
- Text: "Bạn có chắc muốn reset quota Bài học AI cho người dùng này không?"
- "Lượt sử dụng trong ngày sẽ được đặt về 0"

**Bước 3:** Admin xác nhận

**Request:**
```json
POST /admin/usage/reset
{
  "userId": "u1",
  "features": ["ai_lesson"]
}
```

**Backend xử lý:**
```sql
UPDATE user_usage 
SET daily_count = 0, 
    last_reset = NOW()
WHERE user_id = 'u1' 
  AND feature = 'ai_lesson'
```

**Kết quả:**
- Quota reset về 0/10
- User có thể tiếp tục sử dụng
- Progress bar cập nhật ngay lập tức

---

### Kịch bản 7: Hủy gói ngay lập tức

**Tình huống:**
- User vi phạm chính sách
- Admin quyết định hủy gói ngay

**Bước 1:** Admin click "🔴 Hủy gói ngay"

**Bước 2:** Confirmation modal (màu đỏ)
- Text cảnh báo nghiêm trọng
- "Hành động này sẽ hủy gói ngay lập tức"

**Bước 3:** Admin xác nhận

**Request:**
```json
{
  "action": "cancel_now"
}
```

**Backend xử lý:**
```sql
UPDATE user_subscriptions 
SET is_active = false,
    auto_renew = false,
    expiry_date = NOW(),
    updated_at = NOW()
WHERE id = 'us1'
```

**Kết quả:**
- Gói chuyển sang "Không hoạt động"
- Card hiển thị màu đỏ
- User không thể sử dụng tính năng premium

---

## 🎯 Các tính năng đặc biệt

### 1. Tự động tính ngày hết hạn

**Tại sao cần?**
- Đảm bảo tính nhất quán
- Tránh lỗi tính toán thủ công
- Dễ dàng preview trước khi lưu

**Cách hoạt động:**
```typescript
// Frontend tự động tính
if (newPlan.duration_months === null) {
  newExpiryDate = null; // Vĩnh viễn
} else {
  const startDate = new Date(userSubscription.start_date);
  newExpiryDate = new Date(startDate);
  newExpiryDate.setMonth(startDate.getMonth() + newPlan.duration_months);
}
```

### 2. Preview trước khi lưu

**Lợi ích:**
- Admin thấy rõ kết quả trước khi commit
- Giảm thiểu sai sót
- Tăng độ tin cậy

**Thông tin preview:**
- Ngày hết hạn mới (màu xanh)
- Chênh lệch chi phí (màu vàng/xanh lá)
- Gợi ý hành động tiếp theo

### 3. Confirmation modal 2 lớp

**Tại sao?**
- Tránh thao tác nhầm
- Đặc biệt quan trọng với action nguy hiểm (hủy gói, reset quota)

**Flow:**
```
User action → Confirmation modal → API call → Success/Error
```

### 4. Real-time quota tracking

**Hiển thị:**
- Progress bar trực quan
- Số liệu cụ thể (5/10)
- Phần trăm sử dụng

**Cập nhật:**
- Sau khi reset quota
- Sau khi reload danh sách
- Đồng bộ với User Detail page

### 5. Cảnh báo hết hạn

**Logic:**
```typescript
const isExpired = expiry_date && new Date(expiry_date) <= new Date();
const isExpiringSoon = expiry_date && 
  new Date(expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
```

**Hiển thị:**
- Badge đỏ: "Đã hết hạn"
- Badge vàng: "Sắp hết hạn"
- Border màu tương ứng

---

## 🔒 Bảo mật và Phân quyền

### Authorization
- Chỉ admin và superadmin mới truy cập được
- Mỗi action đều cần xác nhận

### Audit Log
- Ghi lại tất cả thay đổi quan trọng
- Bao gồm: admin_id, action, timestamp, old_value, new_value

### Validation
- Frontend validate trước khi gửi
- Backend validate lại để đảm bảo
- Kiểm tra logic nghiệp vụ (ví dụ: không cho đổi sang gói đã inactive)

---

## 📊 Metrics và Monitoring

### Các chỉ số cần theo dõi:
1. Số lượng thay đổi gói/ngày
2. Tỷ lệ nâng cấp vs hạ cấp
3. Số lần reset quota
4. Số gói bị hủy
5. Thời gian xử lý trung bình

### Alert cần thiết:
- Quá nhiều reset quota trong ngày (có thể bug)
- Quá nhiều gói bị hủy (vấn đề chất lượng?)
- Chênh lệch chi phí quá lớn (cần review)

---

## 🚀 Tối ưu hóa

### Performance:
- Pagination để giảm tải
- Lazy load modal components
- Cache danh sách gói
- Debounce search input

### UX:
- Loading states rõ ràng
- Error messages hữu ích
- Success feedback
- Smooth transitions

---

**Tài liệu này mô tả đầy đủ hoạt động của chức năng Quản lý Gói Người dùng.**
**Cập nhật lần cuối: 2024-11-23**
