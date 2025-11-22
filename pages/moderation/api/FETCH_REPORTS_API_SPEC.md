# API Specification: fetchReports

## Mô tả
API để lấy danh sách báo cáo (reports) với hỗ trợ **server-side pagination, filtering và searching**.

---

## Endpoint

### Real API
```
GET /api/moderation/reports
```

### Mock API
Sử dụng mock data từ `mockReports` với delay 300ms

---

## Request Parameters

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Giá trị hợp lệ | Mô tả |
|---------|------|----------|----------|----------------|-------|
| `page` | number | Không | 1 | >= 1 | Số trang hiện tại |
| `limit` | number | Không | 10 | 1-100 | Số lượng items mỗi trang (khuyến nghị: 12) |
| `search` | string | Không | - | - | Tìm kiếm theo: tên người báo cáo, lý do, ID báo cáo |
| `status` | string | Không | 'all' | 'all', 'pending', 'in_progress', 'resolved', 'dismissed' | Lọc theo trạng thái báo cáo |
| `target_type` | string | Không | 'all' | 'all', 'post', 'comment', 'user', 'bug', 'other' | Lọc theo loại đối tượng bị báo cáo |

### TypeScript Interface
```typescript
interface FetchReportsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'pending' | 'in_progress' | 'resolved' | 'dismissed';
    targetType?: 'all' | 'post' | 'comment' | 'user' | 'bug' | 'other';
}
```

---

## Response Format

### Success Response (200 OK)

```typescript
type ReportsEnvelope = { 
    success: boolean; 
    data: PaginatedResponse<Report> 
};

interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;      // Tổng số items (sau khi filter)
        page: number;       // Trang hiện tại
        limit: number;      // Số items mỗi trang
        totalPages: number; // Tổng số trang
    };
}

interface Report {
    id: string;
    reporter_id: string;
    reporter?: User;
    target_type: 'post' | 'comment' | 'user' | 'bug' | 'other';
    target_id: string;
    target_user_id?: string;
    targetContent?: RawPost | Comment | User | null;
    reason: string;
    details?: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'dismissed';
    resolved_by?: string;
    resolved_at?: string;
    resolution?: string;
    related_violation_id?: string;
    auto_flagged: boolean;
    created_at: string;
    updated_at: string;
}
```

### Example Response
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
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "target_type": "post",
        "target_id": "post_789",
        "target_user_id": "user_999",
        "targetContent": {
          "id": "post_789",
          "content": "Nội dung bài viết...",
          "status": "published",
          "user_id": "user_999"
        },
        "reason": "Spam",
        "details": "Bài viết chứa nội dung spam quảng cáo",
        "status": "pending",
        "resolved_by": null,
        "resolved_at": null,
        "resolution": null,
        "related_violation_id": null,
        "auto_flagged": false,
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

---

## Usage Examples

### 1. Lấy trang đầu tiên (mặc định)
```typescript
const response = await fetchReports({ page: 1, limit: 12 });
```

**API Call:**
```
GET /api/moderation/reports?page=1&limit=12
```

---

### 2. Lọc báo cáo đang chờ xử lý
```typescript
const response = await fetchReports({ 
    page: 1, 
    limit: 12, 
    status: 'pending' 
});
```

**API Call:**
```
GET /api/moderation/reports?page=1&limit=12&status=pending
```

---

### 3. Lọc báo cáo về bài viết
```typescript
const response = await fetchReports({ 
    page: 1, 
    limit: 12, 
    targetType: 'post' 
});
```

**API Call:**
```
GET /api/moderation/reports?page=1&limit=12&target_type=post
```

---

### 4. Tìm kiếm báo cáo
```typescript
const response = await fetchReports({ 
    page: 1, 
    limit: 12, 
    search: 'spam' 
});
```

**API Call:**
```
GET /api/moderation/reports?page=1&limit=12&search=spam
```

---

### 5. Kết hợp nhiều filter
```typescript
const response = await fetchReports({ 
    page: 2, 
    limit: 12, 
    status: 'pending',
    targetType: 'post',
    search: 'spam'
});
```

**API Call:**
```
GET /api/moderation/reports?page=2&limit=12&search=spam&status=pending&target_type=post
```