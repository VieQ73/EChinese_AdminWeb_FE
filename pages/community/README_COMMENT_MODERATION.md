# 🗑️ Comment Moderation Feature - Complete Documentation

## 📚 Tổng quan

Tính năng gỡ/khôi phục bình luận với đầy đủ thông tin về vi phạm, tương tự như tính năng ban/unban user.

## 📄 Tài liệu

1. **`COMMENT_MODERATION_API.md`** - Tài liệu API chi tiết
2. **`COMMENT_BACKEND_TYPES.ts`** - Types cho backend developer
3. **`README_COMMENT_MODERATION.md`** - File này

## 🎯 Quick Start

### Cho Backend Developer

**Bước 1:** Đọc `COMMENT_MODERATION_API.md` (10 phút)

**Bước 2:** Copy types từ `COMMENT_BACKEND_TYPES.ts` (5 phút)

**Bước 3:** Implement 2 endpoints (2-3 giờ):
- `POST /community/comments/:commentId/remove`
- `POST /community/comments/:commentId/restore`

### Cho Frontend Developer

✅ Frontend đã hoàn thành 100%!

Files liên quan:
- `pages/community/api/comments.ts` - API functions
- `pages/community/hooks/useCommunityHandlers.ts` - Business logic

---

## 📡 API Endpoints

### 1. Remove Comment

```http
POST /community/comments/:commentId/remove

{
  "reason": "Bình luận chứa spam",
  "ruleIds": ["rule-01"],
  "resolution": "Gỡ bình luận và cảnh cáo người dùng.",
  "severity": "low"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã gỡ bình luận thành công",
  "comment": {
    "id": "c123",
    "deleted_at": "2025-11-15T10:30:00Z",
    "deleted_by": "admin-id",
    "deleted_reason": "Bình luận chứa spam"
  }
}
```

### 2. Restore Comment

```http
POST /community/comments/:commentId/restore

{
  "reason": "Gỡ nhầm, nội dung không vi phạm"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã khôi phục bình luận thành công",
  "comment": {
    "id": "c123",
    "deleted_at": null,
    "deleted_by": null,
    "deleted_reason": null
  }
}
```

---

## 🔄 Flow

```
Admin clicks "Gỡ bình luận"
  ↓
Modal mở với form (reason, ruleIds, resolution, severity)
  ↓
Click "Xác nhận"
  ↓
Call removeComment(commentId, payload)
  ↓
Backend:
  - Update comments table
  - Create violation
  - Create violation_rules
  - Create moderation_log
  ↓
Frontend:
  - Update UI
  - Create violation in context
  - Show notification
```

---

## 💾 Database Changes

### comments table
```sql
ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE comments ADD COLUMN deleted_by UUID REFERENCES users(id);
ALTER TABLE comments ADD COLUMN deleted_reason TEXT;

CREATE INDEX idx_comments_deleted_at ON comments(deleted_at);
```

### violations table (already exists)
- Sử dụng chung với user/post violations
- `target_type = 'comment'`
- `target_id = comment.id`

---

## ✅ Implementation Status

### Frontend
- [x] `RemoveCommentPayload` interface
- [x] `RestoreCommentPayload` interface
- [x] `removeComment()` API function
- [x] `restoreComment()` API function
- [x] Update `useCommunityHandlers` to use new APIs
- [x] Send full information (reason, ruleIds, resolution, severity)
- [x] Handle response and update UI
- [x] Create violation in context
- [x] Create moderation log

### Backend
- [ ] `POST /community/comments/:commentId/remove` endpoint
- [ ] `POST /community/comments/:commentId/restore` endpoint
- [ ] Validate request body
- [ ] Update comments table
- [ ] Create violation records
- [ ] Create violation-rule mappings
- [ ] Create moderation logs
- [ ] Transaction handling
- [ ] Error handling
- [ ] Tests

---

## 🧪 Testing

### Test với Postman

**Remove Comment:**
```http
POST http://localhost:5000/api/community/comments/c123/remove
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "reason": "Spam và quảng cáo",
  "ruleIds": ["rule-01"],
  "resolution": "Gỡ bình luận và cảnh cáo.",
  "severity": "low"
}
```

**Restore Comment:**
```http
POST http://localhost:5000/api/community/comments/c123/restore
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "reason": "Gỡ nhầm"
}
```

---

## 📊 So sánh với Ban User

| Feature | Ban User | Remove Comment |
|---------|----------|----------------|
| Endpoint | `/admin/users/:id/ban` | `/community/comments/:id/remove` |
| Payload | reason, ruleIds, resolution, severity | reason, ruleIds, resolution, severity |
| Update field | `is_active = false` | `deleted_at = NOW()` |
| Violation | ✅ Yes | ✅ Yes |
| Moderation log | ✅ Yes | ✅ Yes |
| Self-action | ❌ Cannot ban self | ✅ Can remove own comment |

---

## ❓ FAQs

### Q: User có thể tự gỡ comment không?
**A:** Có. Khi user tự gỡ, không cần nhập ruleIds/severity. Lý do tự động là "Tự gỡ".

### Q: Có cần tạo violation khi user tự gỡ không?
**A:** Không. Chỉ tạo violation khi admin/mod gỡ comment của người khác.

### Q: Có thể gỡ comment đã bị gỡ không?
**A:** Không. Backend nên check và trả về error.

### Q: Khôi phục comment có xóa violation không?
**A:** Tùy business logic. Có thể giữ violation nhưng đánh dấu `handled = false`.

---

## 🚀 Next Steps

1. ✅ Frontend: Hoàn thành
2. ⏳ Backend: Implement 2 endpoints
3. 🧪 Testing: Test đầy đủ
4. 📦 Deployment: Deploy lên staging → production

---

## 📝 Notes

- Frontend sẵn sàng 100%
- Backend cần 2-3 giờ để implement
- Tương tự như ban/unban user
- Có thể tái sử dụng logic violation
- Đảm bảo transaction cho data consistency

**Happy Coding! 🎉**
