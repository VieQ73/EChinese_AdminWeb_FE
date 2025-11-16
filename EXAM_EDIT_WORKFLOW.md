# Exam Edit Workflow - Quy trình cập nhật bài thi

## Tổng quan
Khi người dùng click vào thẻ bài thi để cập nhật, hệ thống sẽ kiểm tra trạng thái xuất bản và số lượng người đã làm bài để hiển thị thông báo phù hợp.

## Quy trình

### 1. Click vào thẻ bài thi
- Nếu bài thi đã bị xóa (`is_deleted = true`) → Không cho phép chỉnh sửa
- Nếu không → Tiếp tục bước 2

### 2. Kiểm tra số lượng người đã làm bài
Gọi API `checkExamAttempts(exam.id)` để kiểm tra:
```typescript
const response = await checkExamAttempts(exam.id);
// response.has_attempts: boolean
```

### 3. Xử lý dựa trên kết quả kiểm tra

#### Trường hợp 1: Bài thi đã có người làm (`has_attempts = true`)
→ Hiển thị modal cảnh báo (bất kể published hay unpublished)

**Nếu bài thi đã xuất bản:**
```
┌─────────────────────────────────────────────┐
│ ⚠️ Xác nhận cập nhật bài thi                │
│                                             │
│ Bài thi đã có người làm. Khi cập nhập bài   │
│ thi sẽ tạo ra một phiên bản mới của bài     │
│ thi. Hủy xuất bản trước khi cập nhập        │
│                                             │
│                    [Hủy]  [Xác nhận]        │
└─────────────────────────────────────────────┘
```

**Nếu bài thi chưa xuất bản:**
```
┌─────────────────────────────────────────────┐
│ ⚠️ Xác nhận cập nhật bài thi                │
│                                             │
│ Bài thi đã có người làm. Khi cập nhập bài   │
│ thi sẽ tạo ra một phiên bản mới của bài thi.│
│                                             │
│                    [Hủy]  [Xác nhận]        │
└─────────────────────────────────────────────┘
```

#### Trường hợp 2: Bài thi chưa có người làm (`has_attempts = false`)

**Nếu bài thi đã xuất bản:**
→ Hiển thị modal yêu cầu unpublish
```
┌─────────────────────────────────────────────┐
│ ⚠️ Xác nhận cập nhật bài thi                │
│                                             │
│ Hủy xuất bản trước khi cập nhập             │
│                                             │
│                    [Hủy]  [Xác nhận]        │
└─────────────────────────────────────────────┘
```

**Nếu bài thi chưa xuất bản:**
→ Cho phép sửa trực tiếp, chuyển đến trang edit ngay lập tức

### 4. Xử lý hành động người dùng

#### Nếu người dùng nhấn "Hủy"
- Đóng modal
- Không thực hiện hành động gì

#### Nếu người dùng nhấn "Xác nhận"
1. Nếu bài thi đang xuất bản → Gọi action `unpublish` để hủy xuất bản
2. Đóng modal
3. Chuyển đến trang sửa đề thi (`/mock-tests/edit/${exam.id}`)
   - Nếu có unpublish: sau 500ms
   - Nếu không cần unpublish: ngay lập tức

## Implementation

### Files Modified

#### 1. `pages/tests/exam/components/list/ExamCard.tsx`
- Thêm state management cho modal và checking status
- Thêm logic kiểm tra `checkExamAttempts` khi click vào card
- Thêm modal xác nhận với 2 trường hợp thông báo khác nhau
- Xử lý unpublish và navigate khi xác nhận

#### 2. `types/mocktest.ts`
- Thêm field `version_at?: Timestamp` vào interface `Exam`
- Field này lưu timestamp của phiên bản bài thi

#### 3. `pages/tests/api/examsApi.ts` (đã có từ trước)
- Function `checkExamAttempts(examId: string)` để kiểm tra số lượng người làm bài

## UI/UX Notes

### Loading State
- Khi đang kiểm tra attempts, cursor thay đổi thành `cursor-wait`
- Ngăn người dùng click nhiều lần trong lúc đang xử lý

### Error Handling
- Nếu API `checkExamAttempts` thất bại, hiển thị alert: "Không thể kiểm tra trạng thái bài thi"
- Log error ra console để debug

### Click Event Handling
- Không xử lý click nếu người dùng click vào menu actions (`.exam-card-actions`)
- Ngăn conflict giữa card click và action menu click

## API Endpoints

### Check Exam Attempts
```
GET /api/exams/{examId}/attempts/check
Response: {
  has_attempts: boolean
}
```

### Unpublish Exam
```
PATCH /api/exams/{examId}
Body: {
  is_published: false
}
```

## Version Display
Nếu bài thi có `version_at`, hiển thị thông tin phiên bản ở card:
- Icon: Clock (màu cam)
- Format: `v{date}` (ví dụ: v16/11/2025)
- Tooltip: Hiển thị đầy đủ ngày giờ phiên bản

## Testing Checklist
- [ ] Click vào bài thi chưa xuất bản, chưa có người làm → Chuyển thẳng đến trang edit
- [ ] Click vào bài thi chưa xuất bản, đã có người làm → Hiển thị modal "Bài thi đã có người làm..."
- [ ] Click vào bài thi đã xuất bản, chưa có người làm → Hiển thị modal "Hủy xuất bản trước khi cập nhập"
- [ ] Click vào bài thi đã xuất bản, đã có người làm → Hiển thị modal với thông báo về phiên bản mới và yêu cầu unpublish
- [ ] Nhấn "Hủy" trong modal → Đóng modal, không làm gì
- [ ] Nhấn "Xác nhận" trong modal (bài thi published) → Unpublish và chuyển đến trang edit
- [ ] Nhấn "Xác nhận" trong modal (bài thi unpublished) → Chuyển thẳng đến trang edit
- [ ] Click vào action menu → Không trigger card click
- [ ] API checkExamAttempts thất bại → Hiển thị alert lỗi
