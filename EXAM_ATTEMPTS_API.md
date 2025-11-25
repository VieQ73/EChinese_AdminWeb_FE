# API Kiểm tra Số lần Làm bài

## Tổng quan
Đã thêm hàm `checkExamAttempts()` để kiểm tra số lần làm bài của một đề thi.

## API Endpoint

```
GET /api/admin/exams/:id/check-attempts
```

## Response Format

### Đã có người làm:
```json
{
  "success": true,
  "message": "Đề thi đã có 15 người làm (23 lượt)",
  "data": {
    "exam_id": "550e8400-e29b-41d4-a716-446655440000",
    "has_attempts": true,
    "total_attempts": 23,
    "unique_users": 15,
    "first_attempt_at": "2024-01-10T08:30:00.000Z",
    "last_attempt_at": "2024-01-15T14:20:00.000Z"
  }
}
```

### Chưa có người làm:
```json
{
  "success": true,
  "message": "Đề thi chưa có ai làm",
  "data": {
    "exam_id": "550e8400-e29b-41d4-a716-446655440000",
    "has_attempts": false,
    "total_attempts": 0,
    "unique_users": 0,
    "first_attempt_at": null,
    "last_attempt_at": null
  }
}
```

## TypeScript Types

```typescript
export interface ExamAttemptsData {
    exam_id: string;
    has_attempts: boolean;
    total_attempts: number;
    unique_users: number;
    first_attempt_at: string | null;
    last_attempt_at: string | null;
}

export interface CheckExamAttemptsResponse {
    success: boolean;
    message: string;
    data: ExamAttemptsData;
}
```

## Hàm API

**File:** `pages/tests/api/examsApi.ts`

```typescript
export const checkExamAttempts = async (examId: string): Promise<ExamAttemptsData> => {
    const response = await apiClient.get<CheckExamAttemptsResponse>(
        `/admin/exams/${examId}/check-attempts`
    );
    return response.data;
};
```

## Cách sử dụng

### Ví dụ 1: Kiểm tra trước khi cho phép edit
```typescript
import { checkExamAttempts } from './api/examsApi';

const handleEditExam = async (examId: string) => {
    try {
        const attempts = await checkExamAttempts(examId);
        
        if (attempts.has_attempts) {
            // Có người làm rồi
            const confirm = window.confirm(
                `Đề thi đã có ${attempts.unique_users} người làm (${attempts.total_attempts} lượt). ` +
                `Chỉnh sửa sẽ tạo bản sao mới. Bạn có muốn tiếp tục?`
            );
            
            if (!confirm) return;
        }
        
        // Tiếp tục edit
        navigate(`/mock-tests/edit/${examId}`);
    } catch (error) {
        console.error('Lỗi kiểm tra attempts:', error);
    }
};
```

### Ví dụ 2: Hiển thị thông tin trong modal
```typescript
const ExamInfoModal = ({ examId }) => {
    const [attempts, setAttempts] = useState<ExamAttemptsData | null>(null);
    
    useEffect(() => {
        const loadAttempts = async () => {
            const data = await checkExamAttempts(examId);
            setAttempts(data);
        };
        loadAttempts();
    }, [examId]);
    
    return (
        <div>
            {attempts?.has_attempts ? (
                <div>
                    <p>Đã có {attempts.unique_users} người làm</p>
                    <p>Tổng {attempts.total_attempts} lượt</p>
                    <p>Lần đầu: {new Date(attempts.first_attempt_at!).toLocaleString('vi-VN')}</p>
                    <p>Lần cuối: {new Date(attempts.last_attempt_at!).toLocaleString('vi-VN')}</p>
                </div>
            ) : (
                <p>Chưa có ai làm bài thi này</p>
            )}
        </div>
    );
};
```

### Ví dụ 3: Hiển thị badge trong ExamCard
```typescript
const ExamCard = ({ exam }) => {
    const [attempts, setAttempts] = useState<ExamAttemptsData | null>(null);
    
    useEffect(() => {
        checkExamAttempts(exam.id).then(setAttempts);
    }, [exam.id]);
    
    return (
        <div>
            {/* ... nội dung khác ... */}
            
            {attempts?.has_attempts && (
                <div className="text-xs text-blue-600">
                    👥 {attempts.unique_users} người đã làm
                </div>
            )}
        </div>
    );
};
```

## Các trường dữ liệu

| Field | Type | Mô tả |
|-------|------|-------|
| `exam_id` | string | ID của bài thi |
| `has_attempts` | boolean | Có người làm chưa |
| `total_attempts` | number | Tổng số lượt làm |
| `unique_users` | number | Số người duy nhất đã làm |
| `first_attempt_at` | string \| null | Thời gian lần làm đầu tiên |
| `last_attempt_at` | string \| null | Thời gian lần làm gần nhất |

## Use Cases

### 1. Kiểm tra trước khi edit
- Nếu có người làm → Cảnh báo và tạo bản sao
- Nếu chưa có → Cho phép edit trực tiếp

### 2. Hiển thị thống kê
- Số người đã làm
- Số lượt làm
- Thời gian làm đầu tiên/cuối cùng

### 3. Quyết định có thể xóa không
- Nếu có người làm → Không cho xóa hoặc cảnh báo
- Nếu chưa có → Cho phép xóa

### 4. Badge/Label trong UI
- "🔥 Phổ biến" nếu > 50 người làm
- "⭐ Mới" nếu chưa có người làm
- "👥 X người đã làm" để hiển thị

## Lưu ý

### Performance:
- API này nhanh (chỉ đếm, không load toàn bộ attempts)
- Có thể cache kết quả trong 1-2 phút
- Không nên gọi quá nhiều lần liên tục

### Caching:
```typescript
// Cache trong sessionStorage
const cacheKey = `exam_attempts_${examId}`;
const cached = sessionStorage.getItem(cacheKey);

if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 60000) { // 1 phút
        return data;
    }
}

const data = await checkExamAttempts(examId);
sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
```

### Error Handling:
```typescript
try {
    const attempts = await checkExamAttempts(examId);
    // Xử lý dữ liệu
} catch (error) {
    // Nếu API lỗi, giả sử chưa có người làm
    console.error('Lỗi kiểm tra attempts:', error);
    // Hoặc hiển thị thông báo lỗi
}
```

## Kết luận

Hàm `checkExamAttempts()` đã sẵn sàng sử dụng để:
- ✅ Kiểm tra xem đề thi đã có người làm chưa
- ✅ Lấy thống kê số lượt làm và số người làm
- ✅ Hiển thị thông tin trong UI
- ✅ Quyết định logic edit/delete dựa trên attempts

Import và sử dụng:
```typescript
import { checkExamAttempts } from './api/examsApi';

const data = await checkExamAttempts(examId);
console.log(data.has_attempts); // true/false
console.log(data.unique_users); // số người đã làm
```
