# ✅ Implementation Checklist - Ban/Unban User Feature

## Frontend (✅ Đã hoàn thành)

### API Layer
- [x] Tạo `BanUserPayload` interface với đầy đủ fields
- [x] Tạo `UnbanUserPayload` interface
- [x] Tạo `BanUserResponse` interface
- [x] Implement `banUser()` function
- [x] Implement `unbanUser()` function
- [x] Export types và functions từ `userApi.ts`

### Business Logic
- [x] Cập nhật `useUserActions.ts` để gọi API mới
- [x] Gửi đầy đủ 4 thông tin khi ban user:
  - [x] `reason` - Lý do cấm
  - [x] `ruleIds` - Danh sách quy tắc vi phạm
  - [x] `resolution` - Ghi chú giải quyết
  - [x] `severity` - Mức độ vi phạm
- [x] Xử lý response từ backend
- [x] Cập nhật UI state sau khi ban/unban
- [x] Tạo violation record trong context
- [x] Tạo moderation log trong context
- [x] Tạo admin log trong context

### UI Components
- [x] `BanUserForm.tsx` - Form nhập thông tin cấm
  - [x] Input: Lý do cấm
  - [x] Checkbox list: Quy tắc vi phạm
  - [x] Textarea: Ghi chú giải quyết
  - [x] Radio: Mức độ vi phạm
- [x] `UnbanUserForm.tsx` - Form nhập lý do bỏ cấm
- [x] `UserActionModal.tsx` - Modal container
- [x] Validation: Không cho submit nếu thiếu thông tin bắt buộc

### Documentation
- [x] `API_DOCUMENTATION.md` - Tài liệu chi tiết
- [x] `BAN_USER_SUMMARY.md` - Tóm tắt nhanh
- [x] `BACKEND_TYPES.ts` - Types cho backend
- [x] `IMPLEMENTATION_CHECKLIST.md` - Checklist này

---

## Backend (⏳ Cần implement)

### Database Schema
- [ ] Tạo/cập nhật bảng `violations`
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK → users.id)
  - target_type (VARCHAR)
  - target_id (UUID)
  - severity (VARCHAR)
  - resolution (TEXT)
  - detected_by (VARCHAR)
  - handled (BOOLEAN)
  - created_at (TIMESTAMP)
  - resolved_at (TIMESTAMP)
  ```

- [ ] Tạo/cập nhật bảng `violation_rules`
  ```sql
  - id (UUID, PK)
  - violation_id (UUID, FK → violations.id)
  - rule_id (UUID, FK → community_rules.id)
  - UNIQUE(violation_id, rule_id)
  ```

- [ ] Tạo/cập nhật bảng `moderation_logs`
  ```sql
  - id (UUID, PK)
  - target_type (VARCHAR)
  - target_id (UUID)
  - action (VARCHAR)
  - reason (TEXT)
  - performed_by (UUID, FK → users.id)
  - created_at (TIMESTAMP)
  ```

- [ ] Tạo indexes cho performance
  ```sql
  - CREATE INDEX idx_violations_user_id ON violations(user_id);
  - CREATE INDEX idx_violation_rules_violation_id ON violation_rules(violation_id);
  - CREATE INDEX idx_moderation_logs_target ON moderation_logs(target_type, target_id);
  ```

### API Endpoints

#### POST /admin/users/:userId/ban
- [ ] Tạo route handler
- [ ] Validate admin permissions (middleware)
- [ ] Validate request body:
  - [ ] `reason`: string, 10-500 chars, required
  - [ ] `ruleIds`: array of UUIDs, min 1 item, required
  - [ ] `resolution`: string, max 1000 chars, optional
  - [ ] `severity`: enum ['low', 'medium', 'high'], required
- [ ] Check user exists
- [ ] Check self-ban prevention (super admin cannot ban self)
- [ ] Start database transaction
- [ ] Update `users.is_active = false`
- [ ] Insert into `violations` table
- [ ] Insert into `violation_rules` table (loop ruleIds)
- [ ] Insert into `moderation_logs` table
- [ ] Commit transaction
- [ ] Return response:
  ```json
  {
    "success": true,
    "message": "Đã cấm người dùng thành công",
    "user": { ... }
  }
  ```
- [ ] Handle errors properly
- [ ] Add logging

#### POST /admin/users/:userId/unban
- [ ] Tạo route handler
- [ ] Validate admin permissions (middleware)
- [ ] Validate request body:
  - [ ] `reason`: string, 10-500 chars, required
- [ ] Check user exists
- [ ] Start database transaction
- [ ] Update `users.is_active = true`
- [ ] Update/soft-delete violations (optional)
- [ ] Insert into `moderation_logs` table
- [ ] Commit transaction
- [ ] Return response
- [ ] Handle errors properly
- [ ] Add logging

### Testing
- [ ] Unit tests cho validation
- [ ] Unit tests cho business logic
- [ ] Integration tests cho API endpoints
- [ ] Test cases:
  - [ ] Ban user thành công
  - [ ] Unban user thành công
  - [ ] Validation errors (missing fields)
  - [ ] User not found
  - [ ] Unauthorized (not admin)
  - [ ] Self-ban prevention
  - [ ] Transaction rollback on error
  - [ ] Invalid rule IDs
  - [ ] Invalid severity value

### Security
- [ ] Rate limiting cho ban/unban endpoints
- [ ] Audit logging cho mọi ban/unban actions
- [ ] Validate rule IDs tồn tại trong database
- [ ] Sanitize input để prevent SQL injection
- [ ] Check admin permissions properly
- [ ] Add CSRF protection

### Performance
- [ ] Add database indexes
- [ ] Optimize queries (use joins instead of N+1)
- [ ] Add caching cho community rules
- [ ] Monitor query performance
- [ ] Add pagination cho violation history

---

## Testing Checklist

### Manual Testing
- [ ] Test ban user với đầy đủ thông tin
- [ ] Test ban user với thông tin tối thiểu
- [ ] Test unban user
- [ ] Test validation errors
- [ ] Test permissions (user không thể ban)
- [ ] Test self-ban prevention
- [ ] Test UI updates sau khi ban/unban
- [ ] Test notification messages
- [ ] Test với nhiều quy tắc vi phạm
- [ ] Test với các mức độ vi phạm khác nhau

### API Testing (Postman/Thunder Client)
- [ ] Test endpoint với valid data
- [ ] Test endpoint với invalid data
- [ ] Test endpoint với missing fields
- [ ] Test endpoint với invalid user ID
- [ ] Test endpoint với invalid rule IDs
- [ ] Test endpoint với unauthorized user
- [ ] Test response format
- [ ] Test error responses

---

## Deployment Checklist

### Database Migration
- [ ] Tạo migration files
- [ ] Test migration trên dev environment
- [ ] Test rollback migration
- [ ] Backup production database
- [ ] Run migration trên staging
- [ ] Verify data integrity
- [ ] Run migration trên production

### Code Deployment
- [ ] Merge frontend code
- [ ] Merge backend code
- [ ] Run tests
- [ ] Deploy to staging
- [ ] Test trên staging
- [ ] Deploy to production
- [ ] Monitor logs
- [ ] Monitor errors

### Post-Deployment
- [ ] Verify ban/unban functionality works
- [ ] Check database records được tạo đúng
- [ ] Monitor performance
- [ ] Check error logs
- [ ] Notify team về feature mới
- [ ] Update user documentation (nếu cần)

---

## Documentation Updates
- [ ] Update API documentation
- [ ] Update database schema documentation
- [ ] Update admin user guide
- [ ] Update changelog
- [ ] Update README

---

## Future Enhancements (Optional)
- [ ] Email notification khi user bị cấm
- [ ] Temporary ban với expiry date
- [ ] Ban appeal system
- [ ] Ban history timeline
- [ ] Export ban reports
- [ ] Analytics dashboard cho violations
- [ ] Auto-ban based on violation count
- [ ] IP ban functionality
- [ ] Device ban functionality

---

## Notes
- Frontend đã sẵn sàng 100%
- Backend cần implement theo checklist trên
- Tham khảo `BACKEND_TYPES.ts` cho types
- Tham khảo `BAN_USER_SUMMARY.md` cho flow
- Tham khảo `API_DOCUMENTATION.md` cho chi tiết

**Estimated Backend Implementation Time:** 4-6 hours
