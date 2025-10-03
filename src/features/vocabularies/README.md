# Notebooks & Vocabulary Management API

## 📋 Tổng quan

File API này chứa **35+ endpoints** để kết nối với backend thật cho phần quản lý "Sổ tay và từ vựng" trong admin panel. Được thiết kế dựa trên database schema và logic hiện tại từ mock APIs.

## 🏗️ Kiến trúc Database

### Bảng chính
- **Notebooks**: Chứa thông tin sổ tay học tập
- **Vocabulary**: Chứa từ vựng tiếng Trung (có soft delete)
- **NotebookVocabItems**: Bảng N:N kết nối notebook-vocabulary với trạng thái học tập
- **WordType**: Phân loại từ (danh từ, động từ, tính từ...)
- **VocabularyWordType**: Bảng N:N kết nối vocabulary-wordtype

### Relationship quan trọng
- `Notebooks (1) ↔ (N) NotebookVocabItems (N) ↔ (1) Vocabulary`
- Hỗ trợ soft delete cho vocabularies
- Status tracking cho mỗi vocabulary trong notebook

## 🔧 Tính năng chính

### 1. Quản lý Notebooks (8 endpoints)
- ✅ **CRUD cơ bản**: Tạo, sửa, xóa, xem chi tiết
- ✅ **Bulk operations**: Xóa nhiều notebooks
- ✅ **Publishing**: Đồng bộ lên mobile app
- ✅ **Statistics**: Thống kê tổng quan
- ✅ **User assignment**: Notebook của user hoặc system

### 2. Quản lý Notebook Items (4 endpoints)
- ✅ **Thêm/xóa vocabulary** từ notebook
- ✅ **Status tracking**: "đã thuộc", "chưa thuộc", "yêu thích", "không chắc"
- ✅ **Bulk status update**: Cập nhật trạng thái hàng loạt
- ✅ **Item management**: Quản lý từng item riêng biệt

### 3. Quản lý Vocabularies (9 endpoints)
- ✅ **CRUD đầy đủ**: Tạo, sửa, xem vocabulary
- ✅ **Soft delete system**: Xóa mềm với khôi phục
- ✅ **Hard delete**: Xóa vĩnh viễn (super admin)
- ✅ **Bulk operations**: Tạo/xóa/khôi phục hàng loạt
- ✅ **Advanced filtering**: Theo level, word type, date range

### 4. Import & Export (3 endpoints)
- ✅ **Import Excel/CSV**: Import hàng loạt vocabulary
- ✅ **Export vocabularies**: Xuất danh sách với filter
- ✅ **Export notebook**: Xuất notebook cụ thể
- ✅ **Duplicate handling**: Xử lý trùng lặp khi import

### 5. Word Types Management (3 endpoints)
- ✅ **Quản lý phân loại từ**: Danh từ, động từ, tính từ...
- ✅ **CRUD word types**: Thêm/xóa loại từ mới
- ✅ **Validation**: Kiểm tra sử dụng trước khi xóa

### 6. Media & Pronunciation (2 endpoints)
- ✅ **Audio generation**: Tạo file phát âm tự động
- ✅ **Image upload**: Upload hình ảnh minh họa
- ✅ **File management**: Quản lý media files

### 7. Search & Analytics (3 endpoints)
- ✅ **Advanced search**: Tìm kiếm đa tiêu chí
- ✅ **Duplicate detection**: Tìm vocabularies trùng lặp
- ✅ **Merge duplicates**: Gộp vocabularies trùng lặp
- ✅ **Usage analytics**: Thống kê sử dụng

### 8. Admin & Audit (2 endpoints)
- ✅ **Audit logs**: Theo dõi thao tác admin
- ✅ **Action history**: Lịch sử notebook/vocabulary
- ✅ **Admin tracking**: Ai làm gì khi nào

### 9. System Utilities (2 endpoints)
- ✅ **Usage recount**: Tính lại số lượng sử dụng
- ✅ **Sync counts**: Đồng bộ vocab_count của notebooks
- ✅ **Data integrity**: Đảm bảo tính nhất quán dữ liệu

## 📊 Các Interface quan trọng

```typescript
// Tham số lấy notebooks với filter đầy đủ
GetNotebooksParams {
  page, limit, search, is_premium, user_id, sort_by, sort_order
}

// Tham số lấy vocabularies với filter phức tạp
GetVocabulariesParams {
  search, level, word_types, include_deleted, notebook_id, date_range
}

// Response notebook với chi tiết đầy đủ
NotebookDetailResponse {
  ...Notebook, items[], total_items, items_by_status
}

// Response import với thống kê chi tiết
ImportVocabulariesResponse {
  success_count, duplicate_count, error_count, created_vocabularies, errors
}
```

## 🔄 Migration từ Mock API

### File cần thay thế:
- ❌ `src/features/notebooks/notebookApi.ts` (mock)
- ❌ `src/features/vocabularies/vocabApi.ts` (mock)
- ✅ `src/features/vocabularies/vocabularyManagementApi.ts` (real API)

### Các component cần update import:
- `src/pages/NotebooksPage.tsx`
- `src/pages/NotebookDetail.tsx`
- `src/pages/NotebookTrash.tsx`
- `src/components/vocab/AddVocabularyModal.tsx`
- `src/components/vocab/VocabularyDetailModal.tsx`
- `src/components/vocab/ImportPreviewModal.tsx`

### Migration steps:
1. **Replace imports**: Đổi import từ mock API sang real API
2. **Update function calls**: Một số function có thể thay đổi tham số
3. **Error handling**: Thêm xử lý error cho các API call thật
4. **Loading states**: Đảm bảo loading states hoạt động đúng

## 🚀 Backend Requirements

### Database Tables cần tạo:
```sql
-- Đã có trong schema hiện tại
CREATE TABLE Notebooks (...)
CREATE TABLE Vocabulary (...)  
CREATE TABLE NotebookVocabItems (...)
CREATE TABLE WordType (...)
CREATE TABLE VocabularyWordType (...)
```

### API Endpoints cần implement:
- **35 endpoints** với prefix `/api/admin/`
- Authentication: JWT token trong header
- Role-based access: admin/super admin permissions
- Pagination: limit/offset với total_count
- Error handling: Consistent error response format

### File Upload Support:
- Image upload cho vocabulary: `/admin/vocabularies/:id/upload-image`
- Excel/CSV import: Parse và validate data
- Audio generation: TTS service integration

## 📈 Performance Considerations

- **Pagination**: Tất cả list APIs có pagination
- **Indexing**: Cần index trên hanzi, pinyin, created_at
- **Bulk operations**: Batch processing cho large datasets  
- **Caching**: Redis cache cho word types và stats
- **File handling**: CDN cho images và audio files

## 🔒 Security & Permissions

### Admin Roles:
- **Admin**: CRUD notebooks/vocabularies, bulk operations
- **Super Admin**: Hard delete, system utilities, audit logs

### API Security:
- JWT authentication required
- Role validation per endpoint
- Rate limiting cho bulk operations
- Input validation và sanitization

## 📱 Frontend Integration

### State Management:
- React Query/SWR cho API calls
- Optimistic updates cho UX tốt hơn
- Error boundaries cho error handling

### UI Components được support:
- ✅ Multi-select với bulk actions
- ✅ Import/export workflows  
- ✅ Pagination với search
- ✅ Modal dialogs cho CRUD
- ✅ Status badges và filters
- ✅ Drag & drop (có thể mở rộng)

## 🧪 Testing Strategy

### Unit Tests:
- Test từng API function với mock data
- Validate request parameters và responses
- Error handling scenarios

### Integration Tests:  
- End-to-end workflows (tạo notebook → thêm vocabulary → export)
- Bulk operations với large datasets
- Import với different file formats

---

**📝 Lưu ý**: File API này thay thế hoàn toàn mock APIs và cần backend implementation đầy đủ. Tất cả endpoints đều thiết kế cho admin panel với permissions cao và audit trail đầy đủ.