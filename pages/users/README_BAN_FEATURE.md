# 🚫 Ban/Unban User Feature - Complete Documentation

## 📚 Tài liệu tham khảo

Thư mục này chứa tất cả tài liệu liên quan đến tính năng cấm/bỏ cấm người dùng.

### 📄 Danh sách files

1. **`API_DOCUMENTATION.md`** ⭐ CHI TIẾT NHẤT
   - Tài liệu đầy đủ về API endpoints
   - Request/Response examples
   - Backend requirements
   - Error handling
   - Database schema suggestions
   - Query examples

2. **`BAN_USER_SUMMARY.md`** ⚡ ĐỌC NHANH
   - Tóm tắt ngắn gọn
   - Flow xử lý
   - Dữ liệu được lưu
   - Checklist backend implementation

3. **`BACKEND_TYPES.ts`** 💻 CHO BACKEND DEV
   - TypeScript types/interfaces
   - Validation schemas
   - Error responses
   - Example implementation (pseudo-code)
   - SQL queries reference

4. **`IMPLEMENTATION_CHECKLIST.md`** ✅ THEO DÕI TIẾN ĐỘ
   - Checklist frontend (đã hoàn thành)
   - Checklist backend (cần implement)
   - Testing checklist
   - Deployment checklist

5. **`README_BAN_FEATURE.md`** 📖 FILE NÀY
   - Tổng quan về feature
   - Hướng dẫn sử dụng tài liệu

---

## 🎯 Quick Start

### Cho Backend Developer

**Bước 1:** Đọc `BAN_USER_SUMMARY.md` để hiểu flow (5 phút)

**Bước 2:** Xem `BACKEND_TYPES.ts` để copy types (10 phút)

**Bước 3:** Implement theo `IMPLEMENTATION_CHECKLIST.md` (4-6 giờ)

**Bước 4:** Tham khảo `API_DOCUMENTATION.md` khi cần chi tiết

### Cho Frontend Developer

✅ Frontend đã hoàn thành 100%!

Nếu cần sửa đổi, xem:
- `pages/users/userApi.ts` - API functions
- `pages/users/hooks/useUserActions.ts` - Business logic
- `pages/users/components/forms/BanUserForm.tsx` - UI form

---

## 📊 Thông tin gửi lên Backend

### Khi cấm người dùng (POST /admin/users/:userId/ban)

```typescript
{
  reason: string;        // Lý do cấm
  ruleIds: string[];     // Danh sách ID quy tắc vi phạm
  resolution: string;    // Ghi chú hướng giải quyết
  severity: 'low' | 'medium' | 'high'; // Mức độ vi phạm
}
```

### Khi bỏ cấm người dùng (POST /admin/users/:userId/unban)

```typescript
{
  reason: string; // Lý do bỏ cấm
}
```

---

## 🔄 Flow hoàn chỉnh

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│ 1. Admin clicks "Cấm người dùng"                            │
│ 2. Modal opens with BanUserForm                             │
│ 3. Admin fills:                                              │
│    - Lý do cấm                                               │
│    - Quy tắc vi phạm (checkboxes)                           │
│    - Ghi chú giải quyết                                      │
│    - Mức độ vi phạm (radio)                                 │
│ 4. Click "Xác nhận"                                          │
│ 5. Call banUser(userId, payload)                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
├─────────────────────────────────────────────────────────────┤
│ 1. Validate admin permissions                                │
│ 2. Validate request body                                     │
│ 3. Check user exists                                         │
│ 4. Start transaction:                                        │
│    a. Update users.is_active = false                         │
│    b. Insert into violations                                 │
│    c. Insert into violation_rules (for each ruleId)         │
│    d. Insert into moderation_logs                            │
│ 5. Commit transaction                                        │
│ 6. Return updated user                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│ 1. Receive response                                          │
│ 2. Update UI state                                           │
│ 3. Create violation in context (for UI)                     │
│ 4. Create moderation log in context (for UI)                │
│ 5. Create admin log in context (for UI)                     │
│ 6. Show success notification                                 │
│ 7. Close modal                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Database Tables

### violations
```sql
CREATE TABLE violations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL,
  target_id UUID NOT NULL,
  severity VARCHAR(10) NOT NULL,
  resolution TEXT,
  detected_by VARCHAR(20) NOT NULL,
  handled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
```

### violation_rules
```sql
CREATE TABLE violation_rules (
  id UUID PRIMARY KEY,
  violation_id UUID NOT NULL,
  rule_id UUID NOT NULL,
  UNIQUE(violation_id, rule_id)
);
```

### moderation_logs
```sql
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL,
  target_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  reason TEXT,
  performed_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing

### Test với Postman/Thunder Client

**Request:**
```http
POST http://localhost:5000/api/admin/users/u2/ban
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "reason": "Đăng spam liên tục",
  "ruleIds": ["rule-01", "rule-03"],
  "resolution": "Cấm 7 ngày. Nếu tái phạm sẽ cấm vĩnh viễn.",
  "severity": "medium"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã cấm người dùng thành công",
  "user": {
    "id": "u2",
    "username": "chen_wei_cool",
    "name": "user_wei_chen",
    "is_active": false,
    ...
  }
}
```

---

## ❓ FAQs

### Q: Tại sao phải gửi cả ruleIds, resolution, severity?
**A:** Để có audit trail đầy đủ, thống kê được quy tắc nào bị vi phạm nhiều, và có bằng chứng rõ ràng nếu user khiếu nại.

### Q: Backend có bắt buộc phải lưu tất cả thông tin không?
**A:** Có. Frontend đã gửi đầy đủ, backend nên lưu hết để có dữ liệu phân tích và báo cáo sau này.

### Q: Có thể ban tạm thời (temporary ban) không?
**A:** Hiện tại chưa có. Đây là enhancement trong tương lai. Có thể thêm field `ban_until` vào bảng `users`.

### Q: Super admin có thể ban chính mình không?
**A:** Không. Frontend và backend đều có check để prevent điều này.

### Q: Có cần gửi email thông báo khi ban user không?
**A:** Tùy business requirements. Hiện tại chưa implement, nhưng có thể thêm sau.

---

## 🚀 Next Steps

1. ✅ Frontend: Hoàn thành
2. ⏳ Backend: Implement theo checklist
3. 🧪 Testing: Test đầy đủ các cases
4. 📦 Deployment: Deploy lên staging → production
5. 📊 Monitoring: Monitor logs và performance

---

## 📞 Support

Nếu có câu hỏi về implementation:
1. Đọc lại tài liệu trong thư mục này
2. Check `IMPLEMENTATION_CHECKLIST.md` để đảm bảo không bỏ sót bước nào
3. Xem example code trong `BACKEND_TYPES.ts`
4. Liên hệ team lead nếu vẫn còn thắc mắc

---

## 📝 Changelog

### 2025-11-15
- ✅ Hoàn thành frontend implementation
- ✅ Tạo đầy đủ documentation
- ✅ Cập nhật API để gửi đầy đủ thông tin
- ✅ Tạo types cho backend
- ✅ Tạo checklist implementation

---

**Happy Coding! 🎉**
