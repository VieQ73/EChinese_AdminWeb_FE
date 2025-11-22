# API Specification: Notifications APIs

## Mô tả tổng quan
Hệ thống quản lý thông báo bao gồm **2 loại thông báo chính**:
1. **Received Notifications** (Thông báo nhận): Thông báo từ hệ thống hoặc gửi đến admin
2. **Sent Notifications** (Thông báo đã gửi): Thông báo do admin tạo và gửi đi

---

## 1. API: fetchReceivedNotifications

### Mô tả
Lấy danh sách thông báo mà admin đã nhận từ hệ thống hoặc các thông báo được gửi đến admin.

### Endpoint

#### Real API
```
GET /api/admin/notifications/received
```

#### Mock API
Filter từ `mockNotifications` với điều kiện: `n.from_system || n.audience === 'admin'`

---

### Request Parameters

#### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Giá trị hợp lệ | Mô tả |
|---------|------|----------|----------|----------------|-------|
| `page` | number | Không | 1 | >= 1 | Số trang hiện tại |
| `limit` | number | Không | 15 | 1-100 | Số lượng items mỗi trang |
| `read_status` | string | Không | - | 'read', 'unread' | Lọc theo trạng thái đọc |
| `type` | string | Không | - | 'system', 'report', 'violation', 'appeal', 'subscription', 'community', 'achievement', 'reminder', 'feedback' | Lọc theo loại thông báo |

#### TypeScript Interface
```typescript
interface FetchReceivedNotificationsParams {
    page?: number;
    limit?: number;
    read_status?: 'read' | 'unread';
    type?: string;
}
```

---

### Response Format

```typescript
type NotificationsEnvelope = { 
    success: boolean; 
    data: Notification[]; 
    meta: { 
        total: number;      // Tổng số thông báo (sau khi filter)
        page: number;       // Trang hiện tại
        limit: number;      // Số items mỗi trang
        totalPages: number; // Tổng số trang
    } 
};

interface Notification {
    id: string;
    title: string;
    content: {
        message?: string;
        html?: string;
        text?: string;
    } | string;
    type: 'system' | 'report' | 'violation' | 'appeal' | 'subscription' | 'community' | 'achievement' | 'reminder' | 'feedback';
    audience: 'all' | 'user' | 'admin';
    from_system: boolean;
    priority: number;
    read_at: string | null;
    created_at: string;
    related_type?: string;
    related_id?: string;
    data?: Record<string, any>;
}
```

### Example Response
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

---

### Usage Examples

#### 1. Lấy tất cả thông báo nhận (mặc định)
```typescript
const response = await fetchReceivedNotifications({ page: 1, limit: 15 });
```

**API Call:**
```
GET /api/admin/notifications/received?page=1&limit=15
```

---

#### 2. Lấy thông báo chưa đọc
```typescript
const response = await fetchReceivedNotifications({ 
    page: 1, 
    limit: 15, 
    read_status: 'unread' 
});
```

**API Call:**
```
GET /api/admin/notifications/received?page=1&limit=15&read_status=unread
```

---

#### 3. Lọc theo loại thông báo
```typescript
const response = await fetchReceivedNotifications({ 
    page: 1, 
    limit: 15, 
    type: 'report' 
});
```

**API Call:**
```
GET /api/admin/notifications/received?page=1&limit=15&type=report
```

---

#### 4. Kết hợp nhiều filter
```typescript
const response = await fetchReceivedNotifications({ 
    page: 1, 
    limit: 15, 
    read_status: 'unread',
    type: 'violation'
});
```

**API Call:**
```
GET /api/admin/notifications/received?page=1&limit=15&read_status=unread&type=violation
```

---

## 2. API: fetchSentNotifications

### Mô tả
Lấy danh sách thông báo mà admin đã tạo và gửi đi (bao gồm cả nháp và đã phát hành).

### Endpoint

#### Real API
```
GET /api/admin/notifications/sent
```

#### Mock API
Filter từ `mockNotifications` với điều kiện: `!n.from_system`

---

### Request Parameters

#### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Giá trị hợp lệ | Mô tả |
|---------|------|----------|----------|----------------|-------|
| `page` | number | Không | 1 | >= 1 | Số trang hiện tại |
| `limit` | number | Không | 15 | 1-100 | Số lượng items mỗi trang |
| `status` | string | Không | - | 'draft', 'published' | Lọc theo trạng thái phát hành |
| `audience` | string | Không | - | 'all', 'user', 'admin' | Lọc theo đối tượng nhận |
| `type` | string | Không | - | 'system', 'community', 'reminder', 'feedback' | Lọc theo loại thông báo |

#### TypeScript Interface
```typescript
interface FetchSentNotificationsParams {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published';
    audience?: string;
    type?: string;
}
```

---

### Response Format

```typescript
type NotificationsEnvelope = { 
    success: boolean; 
    data: Notification[]; 
    meta: { 
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    } 
};

interface Notification {
    id: string;
    title: string;
    content: {
        message?: string;
        html?: string;
    } | string;
    type: 'system' | 'community' | 'reminder' | 'feedback';
    audience: 'all' | 'user' | 'admin';
    from_system: boolean;
    is_push_sent: boolean;  // true = published, false = draft
    priority: number;
    created_at: string;
    published_at?: string;
}
```

### Example Response
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

---

### Usage Examples

#### 1. Lấy tất cả thông báo đã gửi
```typescript
const response = await fetchSentNotifications({ page: 1, limit: 15 });
```

**API Call:**
```
GET /api/admin/notifications/sent?page=1&limit=15
```

---

#### 2. Lấy thông báo nháp
```typescript
const response = await fetchSentNotifications({ 
    page: 1, 
    limit: 15, 
    status: 'draft' 
});
```

**API Call:**
```
GET /api/admin/notifications/sent?page=1&limit=15&status=draft
```

---

#### 3. Lọc theo đối tượng
```typescript
const response = await fetchSentNotifications({ 
    page: 1, 
    limit: 15, 
    audience: 'all' 
});
```

**API Call:**
```
GET /api/admin/notifications/sent?page=1&limit=15&audience=all
```

---

#### 4. Kết hợp nhiều filter
```typescript
const response = await fetchSentNotifications({ 
    page: 1, 
    limit: 15, 
    status: 'published',
    audience: 'user',
    type: 'community'
});
```

**API Call:**
```
GET /api/admin/notifications/sent?page=1&limit=15&status=published&audience=user&type=community
```
