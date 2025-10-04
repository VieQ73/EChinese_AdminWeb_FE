# Quản Lý Mẹo (Admin)

## 1. Phân tích Giao diện Web Admin

### 1.1. Mô tả Giao diện

Giao diện hiển thị cơ bản cho người dùng (và dùng làm khung hiển thị cho Admin) có bố cục dạng cửa sổ modal với các thành phần chính:

- **Tiêu đề**: "Quản lý Mẹo".
- **Bộ lọc (Filters)**: Hai dropdown menu cho phép lọc theo Chủ đề và Cấp độ.
- **Danh sách Mẹo (Content Blocks)**: Các mẹo được trình bày dưới dạng các Thẻ (Card) xếp chồng dọc.
  - Mỗi thẻ có tiêu đề "Chủ đề: \[Tên Chủ đề\]" và nội dung chi tiết bên dưới, hỗ trợ định dạng Rich Text (in đậm, in nghiêng, gạch chân, căn chỉnh).
  - Thẻ Cấp độ (ví dụ: "Sơ cấp") được hiển thị dưới dạng nút/nhãn (tag) ở góc dưới bên phải của mỗi thẻ.

### 1.2. Bố cục Quản lý (Admin Management View)

Thay vì Bảng dữ liệu, Admin sẽ quản lý trực tiếp trên giao diện Thẻ (Card View) tương tự như giao diện người dùng để có trải nghiệm WYSWYG (What You See Is What You Get).

- **Thanh Thao tác Tổng quát (Top Bar)**:
  - Bộ lọc Chủ đề và Cấp độ.
  - Ô tìm kiếm theo Nội dung hoặc Chủ đề/ID.
  - Nút "+ Thêm Mẹo Mới" (Add New Tip).
  - Nút "Tải lên Hàng loạt" (Bulk Upload).
- **Khu vực Hiển thị Mẹo**: Hiển thị danh sách các thẻ mẹo đã lọc. Các mẹo được ghim (is_pinned = true) sẽ luôn hiển thị ở đầu danh sách, sau đó mới đến các mẹo thường.

### 1.3. Thao tác Từng Mẹo (Inline Actions)

Admin sẽ thực hiện các thao tác Sửa/Xóa trực tiếp trên từng thẻ mẹo:

- **Menu Thao tác (3 Chấm Dọc)**: Khi di chuột vào bất kỳ thẻ mẹo nào, một biểu tượng menu (ví dụ: ba chấm dọc ⋮) sẽ hiện ra ở góc trên bên phải của thẻ.
- **Dropdown Menu**: Khi nhấp vào biểu tượng menu, một dropdown sẽ xuất hiện với các tùy chọn:
  - Sửa (Edit)
  - Xóa (Delete)
  - Ghim/Bỏ Ghim (Pin/Unpin): Chuyển đổi trạng thái is_pinned.
- **Chức năng Sửa Nhanh (Inline Edit)**:
  - Khi chọn Sửa, thẻ mẹo sẽ chuyển sang trạng thái chỉnh sửa (edit mode) ngay tại chỗ.
  - Trường content sẽ hiển thị dưới dạng danh sách các khối văn bản (blocks), mỗi khối có:
    - Input hoặc Textarea cho nội dung văn bản.
    - Checkbox cho in đậm, in nghiêng, gạch chân.
    - Dropdown cho căn chỉnh (trái, giữa, phải).
  - Nút Lưu/Hủy sẽ xuất hiện ở cuối thẻ trong trạng thái chỉnh sửa.
- **Chức năng Xóa**:
  - Khi chọn Xóa, một modal xác nhận sẽ bật lên: "Bạn có chắc chắn muốn xóa mẹo này không?"

### 1.4. Giao diện Thêm Mẹo Mới (Modal/Form)

Khi nhấn nút "+ Thêm Mẹo Mới", một form modal đơn giản sẽ bật lên.

- Form này chứa các trường bắt buộc:
  - `topic` (Dropdown)
  - `level` (Dropdown)
  - `content` (Danh sách các khối văn bản với Textarea, checkbox cho định dạng, dropdown cho căn chỉnh)
  - `answer` (Textarea, nếu là Quiz)
  - `is_pinned` (Checkbox)

## 2. Chức năng Quản lý Mẹo (CRUD)

| Chức năng | Mô tả | Chi tiết |
| --- | --- | --- |
| **Thêm (Create)** | Thêm một mẹo mới vào cơ sở dữ liệu. | Dùng Modal Form đơn giản. Sau khi Lưu, mẹo được tạo và hiển thị trên giao diện quản lý. |
| **Sửa (Update)** | Chỉnh sửa nội dung, chủ đề, cấp độ, hoặc đáp án của một mẹo hiện có. | Thực hiện Sửa tại chỗ (Inline Edit) trên thẻ mẹo, hỗ trợ chỉnh sửa Rich Text (JSON). |
| **Gỡ (Delete)** | Xóa vĩnh viễn một mẹo khỏi cơ sở dữ liệu. | Menu 3 chấm → Xóa → Xác nhận bằng Modal. |
| **Ghim (Pin) Mẹo** | Thay đổi trạng thái is_pinned của mẹo. | Logic bắt buộc: Backend cần kiểm tra và đảm bảo chỉ tối đa 3 mẹo được ghim cho mỗi Chủ đề. Nếu Admin cố gắng ghim mẹo thứ 4, thao tác sẽ bị từ chối kèm thông báo lỗi. |
| **Tải lên Hàng loạt** | Thêm nhiều mẹo cùng lúc. | Dùng file JSON chứa mảng Tip\[\]. Dữ liệu sẽ tự phân bổ Chủ đề, Cấp độ, và nội dung Rich Text dựa trên thiết lập trong file JSON. |
| **Xem trước Mobile** | Không cần thiết | (Đã loại bỏ theo yêu cầu.) |

## 3. Cơ chế Cập nhật và Đồng bộ Mobile

- **Cơ chế được đề xuất**: Sửa, Thêm, Xóa, Ghim → Cập nhật Database, Hệ thống Mobile Tự Động Đồng bộ (Real-time/Polling).
- **Lưu ý quan trọng**: Không cần nút "Cập nhật" chung cho toàn bộ. Mọi thao tác CRUD thành công trên Admin Web sẽ ngay lập tức (hoặc gần tức thì) được đồng bộ xuống ứng dụng Mobile qua cơ chế lắng nghe thay đổi của Database (ví dụ: onSnapshot của Firestore). Mobile cần xử lý nội dung Rich Text (JSON) để hiển thị định dạng đúng cách.

## 4. Thiết kế API cho Admin Quản lý Mẹo

Các API được cập nhật để hỗ trợ `content` dưới dạng JSON.

### 4.1. Endpoint Cơ bản: /api/admin/tips

| Phương thức | Endpoint | Chức năng | Body/Query Parameters | Response |
| --- | --- | --- | --- | --- |
| GET | /api/admin/tips | Lấy danh sách mẹo (phân trang & lọc). | page, limit, topic, level, search (theo content.blocks.text). | Tip\[\], total (tổng số mẹo). |
| POST | /api/admin/tips | Thêm một mẹo mới. | Tip object (không cần id, content là JSON). | Tip object vừa tạo. |

### 4.2. Endpoint Chi tiết: /api/admin/tips/{id}

| Phương thức | Endpoint | Chức năng | Body/Query Parameters | Response |
| --- | --- | --- | --- | --- |
| GET | /api/admin/tips/{id} | Lấy chi tiết một mẹo. | (Không) | Tip object. |
| PUT | /api/admin/tips/{id} | Cập nhật toàn bộ một mẹo. | Tip object (content là JSON). | Tip object đã cập nhật. |
| PATCH | /api/admin/tips/{id} | Cập nhật một phần (bao gồm thay đổi is_pinned hoặc content). | Partial object. | Tip object đã cập nhật. |
| DELETE | /api/admin/tips/{id} | Xóa một mẹo. | (Không) | { success: true }. |

### 4.3. Endpoint Thao tác Đặc biệt

| Phương thức | Endpoint | Chức năng | Body/Query Parameters | Response |
| --- | --- | --- | --- | --- |
| POST | /api/admin/tips/bulk-upload | Tải lên mẹo hàng loạt. | File JSON chứa mảng Tip\[\] (content là JSON). | { success: true, count: number }. |

## 5. Cấu trúc Dữ liệu

### 5.1. Bảng Tips

```
Table Tips {
  id uuid [primary key, default: `uuid_generate_v4()`]
  topic varchar(50) [not null, note: "Enum: 'Tất cả', 'Văn hóa', 'Ngữ pháp', 'Từ vựng', 'Phát âm', 'Khẩu ngữ', 'Kỹ năng nghe', 'Kỹ năng đọc', 'Kỹ năng viết', 'Khác'"]
  level varchar(10) [not null, note: "Enum: 'Sơ cấp', 'Trung cấp', 'Cao cấp'"]
  content jsonb [not null, note: "Lưu trữ nội dung Rich Text dưới dạng JSON, hỗ trợ định dạng văn bản và căn chỉnh"]
  answer text
  is_pinned boolean [not null, default: false, note: "Mới: Quyết định mẹo có được ghim (Pin) lên đầu danh sách hay không. Tối đa 3 mẹo được ghim/chủ đề."]
  created_by uuid
  
  Note: '''
  - Mẹo trang chủ với đáp án tùy chọn cho quiz.
  - Tổng số tính toán động.
  - Sử dụng cho mẹo bài học AI nếu lưu riêng.
  '''
  
  Indexes {
    topic [type: btree]
    level [type: btree]
    is_pinned [type: btree]
  }
}
```

### 5.2. Interface Tip

```typescript
export interface Tip {
  id: UUID;
  topic: string;
  level: string;
  content: Json; //RichTextContent
  answer?: string;
  is_pinned?: boolean;
  created_by?: UUID;
}
```