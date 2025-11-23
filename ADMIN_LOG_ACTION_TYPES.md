# 📋 Admin Log Action Types - Danh sách đầy đủ

## Tổng quan

File này liệt kê tất cả các `action_type` được sử dụng trong hệ thống để ghi admin log. Mỗi action đại diện cho một hành động mà admin/super admin thực hiện trong hệ thống.


## 📊 Danh sách Action Types

### 👥 User Management (9 actions)

| Action Type | Mô tả | Target ID | File |
|------------|-------|-----------|------|
| `BAN_USER` | Cấm người dùng | User ID | useUserActions.ts |
| `UNBAN_USER` | Bỏ cấm người dùng | User ID | useUserActions.ts |
| `UPDATE_USER_INFO` | Cập nhật thông tin người dùng | User ID | useUserActions.ts |
| `CHANGE_USER_ROLE` | Thay đổi vai trò người dùng | User ID | useUserActions.ts |
| `RESET_USER_PASSWORD` | Yêu cầu đặt lại mật khẩu | User ID | useUserActions.ts |
| `DELETE_USER` | Xóa vĩnh viễn người dùng | User ID | useUserActions.ts |
| `GRANT_ACHIEVEMENT` | Cấp thành tích cho người dùng | User ID | settingsActions.ts |
| `RESYNC_BADGES` | Đồng bộ lại huy hiệu cho tất cả người dùng | - | settingsActions.ts |
| `UPDATE_USER_SUBSCRIPTION` | Cập nhật chi tiết gói của người dùng | Subscription ID | monetizationActions.ts |

---

### 🗑️ Content Moderation (3 actions)

| Action Type | Mô tả | Target ID | File |
|------------|-------|-----------|------|
| `REMOVE_CONTENT` | Gỡ nội dung (post/comment) | Post/Comment ID | moderationActions.ts |
| `RESTORE_CONTENT` | Khôi phục nội dung | Post/Comment ID | moderationActions.ts |
| `CREATE_VIOLATION` | Tạo vi phạm | Target ID | provider.tsx |

---

### 📚 Content Management (8 actions)

| Action Type | Mô tả | Target ID | File |
|------------|-------|-----------|------|
| `CREATE_NOTEBOOK` | Tạo sổ tay mới | Notebook ID | contentActions.ts |
| `UPDATE_NOTEBOOK` | Cập nhật sổ tay | Notebook ID | contentActions.ts |
| `BULK_DELETE_NOTEBOOKS` | Xóa vĩnh viễn nhiều sổ tay | - | contentActions.ts |
| `BULK_UPDATE_NOTEBOOK_STATUS` | Cập nhật trạng thái nhiều sổ tay | - | contentActions.ts |
| `BULK_UPSERT_VOCABS` | Tạo/cập nhật nhiều từ vựng | - | contentActions.ts |
| `BULK_DELETE_VOCABS` | Xóa vĩnh viễn nhiều từ vựng | - | contentActions.ts |
| `ADD_VOCABS_TO_NOTEBOOK` | Thêm từ vựng vào sổ tay | Notebook ID | contentActions.ts |
| `REMOVE_VOCABS_FROM_NOTEBOOK` | Xóa từ vựng khỏi sổ tay | Notebook ID | contentActions.ts |

---

### 🏆 Settings - Achievements (4 actions)

| Action Type | Mô tả | Target ID | File |
|------------|-------|-----------|------|
| `CREATE_ACHIEVEMENT` | Tạo thành tích mới | Achievement ID | settingsActions.ts |
| `UPDATE_ACHIEVEMENT` | Cập nhật thành tích | Achievement ID | settingsActions.ts |
| `DELETE_ACHIEVEMENT` | Xóa thành tích | Achievement ID | settingsActions.ts |
| `GRANT_ACHIEVEMENT` | Cấp thành tích cho người dùng | User ID | settingsActions.ts |

---

### 🎖️ Settings - Badges (3 actions)

| Action Type | Mô tả | Target ID | File |
|------------|-------|-----------|------|
| `CREATE_BADGE` | Tạo huy hiệu mới | Badge ID | settingsActions.ts |
| `UPDATE_BADGE` | Cập nhật huy hiệu | Badge ID | settingsActions.ts |
| `DELETE_BADGE` | Xóa huy hiệu | Badge ID | settingsActions.ts |

---

### 📝 Exam Management (14 actions)

| Action Type | Mô tả | Target ID | File |
|------------|-------|-----------|------|
| `CREATE_EXAM_TYPE` | Tạo loại bài thi mới | Exam Type ID | examActions.ts |
| `DELETE_EXAM_TYPE` | Xóa loại bài thi | Exam Type ID | examActions.ts |
| `CREATE_EXAM_LEVEL` | Tạo cấp độ mới | Exam Level ID | examActions.ts |
| `DELETE_EXAM_LEVEL` | Xóa cấp độ | Exam Level ID | examActions.ts |
| `CREATE_EXAM` | Tạo bài thi mới | Exam ID | examActions.ts |
| `UPDATE_EXAM` | Cập nhật chi tiết bài thi | Exam ID | examActions.ts |
| `PUBLISH_EXAM` | Xuất bản bài thi | Exam ID | examActions.ts |
| `UNPUBLISH_EXAM` | Hủy xuất bản bài thi | Exam ID | examActions.ts |
| `DELETE_EXAM` | Xóa bài thi | Exam ID | examActions.ts |
| `DUPLICATE_EXAM` | Sao chép bài thi | New Exam ID | examActions.ts |
| `TRASH_EXAM` | Chuyển bài thi vào thùng rác | Exam ID | examActions.ts |
| `RESTORE_EXAM` | Khôi phục bài thi | Exam ID | examActions.ts |

---

### 💰 Monetization (7 actions)

| Action Type | Mô tả | Target ID | File |
|------------|-------|-----------|------|
| `CREATE_SUBSCRIPTION` | Tạo gói đăng ký mới | Subscription ID | monetizationActions.ts |
| `UPDATE_SUBSCRIPTION` | Cập nhật gói đăng ký | Subscription ID | monetizationActions.ts |
| `DELETE_SUBSCRIPTION` | Xóa gói đăng ký | Subscription ID | monetizationActions.ts |
| `UPDATE_PAYMENT_STATUS` | Cập nhật trạng thái giao dịch | Payment ID | monetizationActions.ts |
| `BULK_UPDATE_PAYMENT_STATUS` | Xác nhận hàng loạt giao dịch | - | monetizationActions.ts |
| `PROCESS_REFUND` | Xử lý hoàn tiền | Refund ID | monetizationActions.ts |
| `UPDATE_USER_SUBSCRIPTION` | Cập nhật chi tiết gói của người dùng | Subscription ID | monetizationActions.ts |

---

### 💡 Tips Management (5 actions)

| Action Type | Mô tả | Target ID | File |
|------------|-------|-----------|------|
| `CREATE_TIP` | Tạo mẹo mới | Tip ID | tipsActions.ts |
| `UPDATE_TIP` | Cập nhật mẹo | Tip ID | tipsActions.ts |
| `UPDATE_TIP_PIN_STATUS` | Ghim/Bỏ ghim mẹo | Tip ID | tipsActions.ts |
| `DELETE_TIP` | Xóa mẹo | Tip ID | tipsActions.ts |
| `BULK_UPLOAD_TIPS` | Tải lên hàng loạt mẹo mới | - | tipsActions.ts |

---

### 📜 Rules Management (3 actions)

| Action Type | Mô tả | Target ID | File |
|------------|-------|-----------|------|
| `CREATE_RULE` | Tạo quy tắc mới | Rule ID | ruleActions.ts |
| `UPDATE_RULE` | Cập nhật quy tắc | Rule ID | ruleActions.ts |
| `DELETE_RULE` | Xóa quy tắc | Rule ID | ruleActions.ts |

---



### Community Management
- `REMOVE_POST` - Gỡ bài viết (riêng biệt với REMOVE_CONTENT)
- `RESTORE_POST` - Khôi phục bài viết
- `REMOVE_COMMENT` - Gỡ bình luận
- `RESTORE_COMMENT` - Khôi phục bình luận
- `PIN_POST` - Ghim bài viết
- `UNPIN_POST` - Bỏ ghim bài viết

### Notifications
- `CREATE_NOTIFICATION` - Tạo thông báo
- `SEND_BULK_NOTIFICATION` - Gửi thông báo hàng loạt

### Reports & Appeals
- `RESOLVE_REPORT` - Giải quyết báo cáo
- `DISMISS_REPORT` - Bỏ qua báo cáo
- `APPROVE_APPEAL` - Chấp nhận khiếu nại
- `REJECT_APPEAL` - Từ chối khiếu nại

---

