# Post Moderation API Documentation

## 📋 API Gỡ/Khôi phục Bài viết

### Endpoint: `POST /community/posts/:postId/moderation`

**Mô tả:** API tổng hợp để gỡ hoặc khôi phục bài viết. API này kết hợp việc cập nhật trạng thái bài viết và tạo violation record trong một request duy nhất để đảm bảo tính nhất quán dữ liệu (atomic operation).

---

## 🔄 Request Structure

### Request Body

```typescript
{
  action: 'remove' | 'restore';  // Hành động: gỡ hoặc khôi phục
  
  post_update: {                 // Cập nhật cho bài viết
    status: 'removed' | 'published';
    deleted_at: string | null;   // ISO timestamp hoặc null
    deleted_by: string | null;   // User ID hoặc null
    deleted_reason: string | null;
  };
  
  violation?: {                  // Thông tin vi phạm (chỉ khi action = 'remove')
    ruleIds: string[];           // Danh sách ID quy tắc vi phạm
    severity: 'low' | 'medium' | 'high';
    resolution: string;          // Ghi chú hướng giải quyết
    reason: string;              // Lý do gỡ
    performed_by: string;        // User ID của admin/mod
    user_id: string;             // User ID của chủ bài viết
    target_type: 'post';
    target_id: string;           // Post ID
  };
}
```
**Response:**
```json
{
  "success": true,
  "message": "Đã gỡ bài viết thành công",
  "post": {
    "id": "p123",
    "status": "removed",
    "deleted_at": "2025-11-15T10:30:00Z",
    "deleted_by": "admin-id",
    "deleted_reason": "Bài viết chứa spam và quảng cáo",
    ...
  }
}
```


### 3. Admin khôi phục bài viết

**Scenario:** Admin khôi phục bài viết đã bị gỡ nhầm.

**Request:**
```json
POST /community/posts/p123/moderation

{
  "action": "restore",
  "post_update": {
    "status": "published",
    "deleted_at": null,
    "deleted_by": null,
    "deleted_reason": null
  }
  // Không có violation field
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã khôi phục bài viết thành công",
  "post": {
    "id": "p123",
    "status": "published",
    "deleted_at": null,
    "deleted_by": null,
    "deleted_reason": null,
    ...
  }
}
```
