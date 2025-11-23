# Triển khai Upload Ảnh theo Cách Thêm Đề Thi

## Tổng quan
Đã cập nhật tất cả các nơi cần upload ảnh để sử dụng cùng một cách thức như chức năng thêm đề thi:
- Upload file lên Cloudinary thông qua `uploadToCloudinary()` service
- Lưu URL string (không lưu File object)
- Gửi URL string lên backend khi submit

## Component FileInput
**Location:** `pages/tests/create/components/shared/FileInput.tsx`

**Tính năng:**
- Upload file lên Cloudinary tự động
- Hiển thị preview cho ảnh/audio
- Loading state khi đang upload
- Hỗ trợ 2 variants: `default` và `compact`
- Xóa file đã upload

**Props:**
```typescript
interface FileInputProps {
    id: string;
    label: string;
    value?: string | null; // URL string
    onFileChange: (url: string | null) => void;
    accept?: string;
    variant?: 'default' | 'compact';
}
```

## Các nơi đã cập nhật

### 1. CreateEditPostModal (Community Posts)
**File:** `pages/community/components/post/CreateEditPostModal.tsx`

**Thay đổi:**
- ❌ Trước: Dùng `URL.createObjectURL()` tạo blob URL
- ✅ Sau: Upload lên Cloudinary, lưu URL string
- Thêm loading state khi upload nhiều ảnh
- Upload song song với `Promise.all()`

**Code:**
```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxFiles = 4;
    const remainingSlots = maxFiles - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) return;

    setUploading(true);
    try {
        const uploadPromises = filesToUpload.map(file => uploadToCloudinary(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        setImages(prev => [...prev, ...uploadedUrls].slice(0, maxFiles));
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
        setUploading(false);
        e.target.value = '';
    }
};
```

### 2. UserActionModal (User Avatar)
**File:** `pages/users/components/UserActionModal.tsx`

**Thay đổi:**
- ❌ Trước: Input text để nhập URL
- ✅ Sau: Dùng FileInput component để upload ảnh

**Code:**
```typescript
<FileInput
    id="user-avatar-upload"
    label="Ảnh đại diện"
    value={editableUser.avatar_url || null}
    onFileChange={(url) => setEditableUser(prev => prev ? { ...prev, avatar_url: url || undefined } : null)}
    accept="image/*"
/>
```

### 3. VocabFormCard (Vocabulary Image)
**File:** `pages/content/vocabulary/components/VocabFormCard.tsx`

**Thay đổi:**
- ➕ Thêm field upload ảnh minh họa cho từ vựng
- Dùng FileInput component

**Code:**
```typescript
<FileInput
    id={`vocab-image-${index}`}
    label="Hình ảnh minh họa"
    value={vocabData.image_url || null}
    onFileChange={(url) => handleInputChange('image_url', url || '')}
    accept="image/*"
/>
```

### 4. AddEditAchievementModal (Achievement Icon)
**File:** `pages/settings/achievements/components/AddEditAchievementModal.tsx`

**Thay đổi:**
- ❌ Trước: Input text để nhập Icon URL
- ✅ Sau: Dùng FileInput component để upload icon

**Code:**
```typescript
<FileInput
    id="achievement-icon-upload"
    label="Icon"
    value={icon || null}
    onFileChange={(url) => setIcon(url || '')}
    accept="image/*"
/>
```

### 5. EditBadgeModal (Badge Icon)
**File:** `pages/settings/badges/components/EditBadgeModal.tsx`

**Thay đổi:**
- ❌ Trước: Input text để nhập URL Icon
- ✅ Sau: Dùng FileInput component để upload icon

**Code:**
```typescript
<FileInput
    id="badge-icon-upload"
    label="Icon *"
    value={icon || null}
    onFileChange={(url) => setIcon(url || '')}
    accept="image/*"
/>
```

## Service Upload
**File:** `services/cloudinary.ts`

```typescript
const CLOUDINARY_CLOUD_NAME = 'dzhee09z6';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_preset';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};
```

## Lợi ích

1. **Nhất quán:** Tất cả các nơi upload ảnh đều dùng cùng một cách
2. **Đơn giản:** Không cần xử lý File object, chỉ cần URL string
3. **Backend-ready:** URL string có thể gửi trực tiếp lên backend
4. **UX tốt:** Loading state, preview, error handling
5. **Tái sử dụng:** FileInput component có thể dùng ở bất kỳ đâu

## Các nơi đã có sẵn (không cần thay đổi)

- ✅ Exam Prompt images (PromptEditor.tsx)
- ✅ Question images (QuestionEditor.tsx)
- ✅ Option images (MultipleChoiceEditor.tsx)
- ✅ Section audio (SectionEditor.tsx)
- ✅ Subsection audio (SubsectionEditor.tsx)

## Kiểm tra

Tất cả các file đã được kiểm tra với TypeScript diagnostics và không có lỗi.
