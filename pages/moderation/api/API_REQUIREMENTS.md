# API Requirements - Trung tâm Kiểm duyệt & Thông báo

## Tổng quan
Tài liệu này mô tả chi tiết các API cần thiết cho trang **Trung tâm Kiểm duyệt & Thông báo**, bao gồm params, response format và ví dụ.

---

## 1. API Báo cáo (Reports)

### Endpoint
```
GET /api/moderation/reports
```

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | number | Không | 1 | Số trang hiện tại |
| limit | number | Không | 12 | Số lượng items mỗi trang |
| status | string | Không | - | Lọc theo trạng thái: 'pending', 'in_progress', 'resolved', 'dismissed' |
| target_type | string | Không | - | Lọc theo loại mục tiêu: 'post', 'comment', 'user' |
| search | string | Không | - | Tìm kiếm theo nội dung báo cáo, tên người báo cáo |

### Response Format
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "report_123",
        "reporter_id": "user_456",
        "reporter": {
          "id": "user_456",
          "name": "Nguyễn Văn A",
          "email": "nguyenvana@example.com",
          "avatar": "https://example.com/avatar.jpg"
        },
        "target_type": "post",
        "target_id": "post_789",
        "target_user_id": "user_999",
        "reason": "Spam",
        "description": "Bài viết chứa nội dung spam quảng cáo",
        "status": "pending",
        "resolved_by": null,
        "resolved_at": null,
        "resolution": null,
        "created_at": "2025-11-22T10:00:00Z",
        "updated_at": "2025-11-22T10:00:00Z"
      }
    ],
    "meta": {
      "total": 150,
      "page": 1,
      "limit": 12,
      "totalPages": 13
    }
  }
}
```

### Ví dụ Request
```bash
# Lấy trang 1, 12 items, chỉ báo cáo pending về post
GET /api/moderation/reports?page=1&limit=12&status=pending&target_type=post

# Tìm kiếm báo cáo
GET /api/moderation/reports?page=1&limit=12&search=spam
```

---

## 2. API Vi phạm (Violations)

### Endpoint
```
GET /api/moderation/violations
```

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | number | Không | 1 | Số trang hiện tại |
| limit | number | Không | 12 | Số lượng items mỗi trang |
| severity | string | Không | - | Lọc theo mức độ: 'low', 'medium', 'high' |
| targetType | string | Không | - | Lọc theo loại: 'post', 'comment', 'user' |
| search | string | Không | - | Tìm kiếm theo username, email |

### Response Format
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "violation_123",
        "user_id": "user_456",
        "user": {
          "id": "user_456",
          "name": "Nguyễn Văn B",
          "email": "nguyenvanb@example.com",
          "avatar": "https://example.com/avatar.jpg"
        },
        "target_type": "post",
        "target_id": "post_789",
        "severity": "high",
        "detected_by": "admin",
        "handled": true,
        "resolution": "Bài viết đã bị gỡ do vi phạm quy định cộng đồng",
        "created_at": "2025-11-22T09:00:00Z",
        "resolved_at": "2025-11-22T10:00:00Z",
        "rules": [
          {
            "id": "rule_001",
            "title": "Không spam",
            "description": "Không đăng nội dung spam"
          }
        ]
      }
    ],
    "meta": {
      "total": 200,
      "page": 1,
      "limit": 12,
      "totalPages": 17
    }
  }
}
```

### Ví dụ Request
```bash
# Lấy vi phạm mức độ cao về post
GET /api/moderation/violations?page=1&limit=12&severity=high&targetType=post

# Tìm kiếm theo username
GET /api/moderation/violations?page=1&limit=12&search=nguyenvanb
```

---

## 3. API Khiếu nại (Appeals)

### Endpoint
```
GET /api/moderation/appeals
```

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | number | Không | 1 | Số trang hiện tại |
| limit | number | Không | 12 | Số lượng items mỗi trang |
| status | string | Không | - | Lọc theo trạng thái: 'pending', 'accepted', 'rejected' |
| search | string | Không | - | Tìm kiếm theo username, nội dung khiếu nại |

### Response Format
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "appeal_123",
        "violation_id": "violation_456",
        "user_id": "user_789",
        "user": {
          "id": "user_789",
          "name": "Trần Thị C",
          "email": "tranthic@example.com",
          "avatar": "https://example.com/avatar.jpg"
        },
        "reason": "Tôi không vi phạm, đây là hiểu lầm",
        "status": "pending",
        "resolved_by": null,
        "resolved_at": null,
        "notes": null,
        "created_at": "2025-11-22T11:00:00Z",
        "updated_at": "2025-11-22T11:00:00Z",
        "violation": {
          "id": "violation_456",
          "target_type": "post",
          "target_id": "post_999",
          "severity": "medium",
          "resolution": "Bài viết bị gỡ"
        }
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 12,
      "totalPages": 5
    }
  }
}
```

### Ví dụ Request
```bash
# Lấy khiếu nại đang chờ xử lý
GET /api/moderation/appeals?page=1&limit=12&status=pending

# Tìm kiếm khiếu nại
GET /api/moderation/appeals?page=1&limit=12&search=tranthic
```

---

## 4. API Thông báo Nhận (Received Notifications)

### Endpoint
```
GET /api/admin/notifications/received
```

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | number | Không | 1 | Số trang hiện tại |
| limit | number | Không | 15 | Số lượng items mỗi trang |
| read_status | string | Không | - | Lọc theo trạng thái đọc: 'read', 'unread' |
| type | string | Không | - | Lọc theo loại: 'system', 'report', 'violation', 'appeal', 'community', 'achievement', 'subscription', 'reminder', 'feedback' |

### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_123",
      "title": "Báo cáo mới cần xử lý",
      "content": {
        "message": "Có 5 báo cáo mới đang chờ xử lý",
        "html": "<p>Có <strong>5 báo cáo mới</strong> đang chờ xử lý</p>"
      },
      "type": "report",
      "audience": "admin",
      "from_system": true,
      "priority": 1,
      "read_at": null,
      "created_at": "2025-11-22T12:00:00Z",
      "related_type": "report",
      "related_id": "report_456",
      "data": {
        "count": 5,
        "redirect_url": "/reports?status=pending"
      }
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 15,
    "totalPages": 7
  }
}
```

### Ví dụ Request
```bash
# Lấy thông báo chưa đọc
GET /api/admin/notifications/received?page=1&limit=15&read_status=unread

# Lọc theo loại
GET /api/admin/notifications/received?page=1&limit=15&type=report
```

---

## 5. API Thông báo Đã gửi (Sent Notifications)

### Endpoint
```
GET /api/admin/notifications/sent
```

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | number | Không | 1 | Số trang hiện tại |
| limit | number | Không | 15 | Số lượng items mỗi trang |
| status | string | Không | - | Lọc theo trạng thái: 'draft', 'published' |
| audience | string | Không | - | Lọc theo đối tượng: 'all', 'user', 'admin' |
| type | string | Không | - | Lọc theo loại: 'system', 'community', 'reminder', 'feedback' |

### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_789",
      "title": "Thông báo bảo trì hệ thống",
      "content": {
        "message": "Hệ thống sẽ bảo trì vào 23h tối nay",
        "html": "<p>Hệ thống sẽ <strong>bảo trì</strong> vào 23h tối nay</p>"
      },
      "type": "system",
      "audience": "all",
      "from_system": false,
      "is_push_sent": true,
      "priority": 1,
      "created_at": "2025-11-22T08:00:00Z",
      "published_at": "2025-11-22T08:05:00Z"
    }
  ],
  "meta": {
    "total": 80,
    "page": 1,
    "limit": 15,
    "totalPages": 6
  }
}
```

### Ví dụ Request
```bash
# Lấy thông báo nháp
GET /api/admin/notifications/sent?page=1&limit=15&status=draft

# Lọc theo đối tượng
GET /api/admin/notifications/sent?page=1&limit=15&audience=all
```
