# Tips Management Feature

## Tổng quan
Feature quản lý mẹo học tập cho admin, bao gồm tạo, chỉnh sửa, xóa và quản lý các mẹo học tiếng Trung cho học viên trên app mobile.

## Cấu trúc thư mục

```
src/features/tips/
├── tipApi.ts               # API calls và constants
├── components/
│   ├── RichTextEditor.tsx  # Rich text editor component (giống CreateEditPostModal)
│   ├── CreateEditTipModal.tsx # Modal tạo/chỉnh sửa tip
│   ├── TipCard.tsx        # Component hiển thị một tip
│   └── index.ts           # Export components
├── hooks/                 # Hooks (nếu cần)
├── index.ts              # Export chính
└── README.md             # Tài liệu này
```

## Database Schema
Theo `learning.dbml` và `types/entities/content.ts`:

```sql
Table Tips {
  id UUID [pk]
  topic varchar       -- Chủ đề: 'Văn hóa', 'Ngữ pháp', 'Từ vựng', v.v.
  level varchar       -- Cấp độ: 'Sơ cấp', 'Trung cấp', 'Cao cấp'  
  content jsonb       -- Rich text JSON (giống Post content)
  answer varchar      -- Câu trả lời/giải thích (tuỳ chọn)
  is_pinned boolean   -- Ghim tip lên đầu danh sách
  created_by UUID     -- Admin tạo tip
}
```

## API Endpoints

### GET /admin/tips
Lấy danh sách tips với filter và pagination
```typescript
interface GetTipsParams {
  page?: number;
  limit?: number;
  search?: string;     // Tìm kiếm trong content
  topic?: string;      // Filter theo chủ đề
  level?: string;      // Filter theo cấp độ  
  is_pinned?: boolean; // Chỉ lấy tips đã ghim
}
```

### POST /admin/tips
Tạo tip mới
```typescript
interface TipPayload {
  topic: string;
  level: string;
  content: any;        // Rich text JSON
  answer?: string;
  is_pinned?: boolean;
}
```

### PUT /admin/tips/:id
Cập nhật tip

### DELETE /admin/tips/:id
Xóa tip (soft delete)

### POST /admin/tips/:id/pin
Ghim/bỏ ghim tip

## Components

### RichTextEditor
Rich text editor với toolbar giống CreateEditPostModal nhưng không có ảnh.

**Props:**
- `content: string` - HTML content
- `onChange: (content: string) => void` - Callback khi content thay đổi
- `placeholder?: string` - Placeholder text
- `className?: string` - CSS classes

**Features:**
- Bold, Italic, Underline
- Text color, Background color  
- Text alignment (left, center, right)
- Lists (bullet, numbered)
- Links

### CreateEditTipModal
Modal tạo/chỉnh sửa tip với rich text editor.

**Props:**
- `isOpen: boolean` - Trạng thái mở/đóng modal
- `onClose: () => void` - Callback đóng modal
- `onSave: (tipData: TipPayload) => Promise<void>` - Callback lưu tip
- `initialTip?: Tip | null` - Tip để chỉnh sửa (null = tạo mới)

### TipCard
Component hiển thị một tip với các thao tác admin.

**Props:**
- `tip: Tip` - Dữ liệu tip
- `onEdit?: (tip: Tip) => void` - Callback chỉnh sửa
- `onDelete?: (tip: Tip) => void` - Callback xóa
- `onTogglePin?: (tip: Tip) => void` - Callback ghim/bỏ ghim

## Pages

### TipsManagementPage
Trang chính quản lý tips với đầy đủ tính năng:

- **CRUD Operations**: Tạo, đọc, cập nhật, xóa tips
- **Search & Filter**: Tìm kiếm theo content, filter theo topic/level
- **Pin Management**: Ghim/bỏ ghim tips quan trọng
- **Pagination**: Phân trang danh sách tips
- **Responsive UI**: Giao diện thích ứng mobile/desktop

## Tính năng chính

### 1. Tạo tip mới
- Chọn chủ đề và cấp độ từ dropdown
- Nhập nội dung bằng Rich Text Editor
- Tuỳ chọn thêm câu trả lời/giải thích
- Tuỳ chọn ghim tip

### 2. Quản lý danh sách
- Hiển thị grid responsive tips
- Filter theo chủ đề, cấp độ
- Tìm kiếm trong nội dung
- Chỉ hiển thị tips đã ghim
- Phân trang

### 3. Chỉnh sửa tip
- Click vào nút "Chỉnh sửa" trên TipCard
- Modal hiển thị với dữ liệu hiện tại
- Cập nhật và lưu thay đổi

### 4. Xóa tip
- Click vào nút "Xóa" trên TipCard  
- Modal xác nhận trước khi xóa
- Soft delete (không xóa vĩnh viễn)

### 5. Ghim tip
- Click vào nút "Ghim" trên TipCard
- Tips đã ghim hiển thị với badge đặc biệt
- Filter "Chỉ tips đã ghim"

## Navigation
Đã thêm tab "Mẹo và hướng dẫn" vào MainLayout navbar:
- **Route**: `/tips`
- **Icon**: Lightbulb
- **Tên**: "Mẹo và hướng dẫn"

## Styling
- **Framework**: Tailwind CSS
- **Design**: Consistent với các trang admin khác
- **Colors**: 
  - Sơ cấp: Green (bg-green-500)
  - Trung cấp: Yellow (bg-yellow-500)  
  - Cao cấp: Red (bg-red-500)
- **Icons**: Lucide React

## Usage

```typescript
import TipsManagementPage from '../pages/TipsManagementPage';
import { CreateEditTipModal, TipCard, RichTextEditor } from '../features/tips';

// Trong App.tsx
<Route path="tips" element={<TipsManagementPage />} />
```

## Notes
- Tips này dành cho hiển thị trên mobile app, không có tính năng like/view
- Content format theo chuẩn JSON giống Post (có html và ops)
- Admin có thể ghim tips quan trọng lên đầu danh sách
- Tất cả operations đều có loading states và error handling
- Toast notifications cho user feedback