# ✅ Sửa Lỗi Like/View Ảnh Hưởng Bài Khác

## 🐛 Vấn Đề

Khi like hoặc view một bài viết, các bài viết khác cũng bị ảnh hưởng (số lượng thay đổi không đúng).

## 🔍 Nguyên Nhân

### 1. useEffect Sync Chạy Cho TẤT CẢ Posts

```typescript
// ❌ Code cũ - Chạy cho TẤT CẢ posts mỗi khi postLikes thay đổi
useEffect(() => {
    setPosts(currentPosts =>
        currentPosts.map(post => {
            const isLiked = postLikes.some(l => l.post_id === post.id && l.user_id === currentUser.id);
            const isViewed = postViews.some(v => v.post_id === post.id && v.user_id === currentUser.id);
            
            // ❌ Update TẤT CẢ posts, không chỉ post được like
            if (post.isLiked !== isLiked || post.isViewed !== isViewed) {
                 return { ...post, isLiked, isViewed };
            }
            return post;
        })
    );
}, [postLikes, postViews, currentUser]); // ❌ Trigger mỗi khi có like/view
```

**Vấn đề:**
- Khi like post A → `postLikes` thay đổi
- useEffect trigger → Loop qua TẤT CẢ posts (A, B, C, D...)
- Mỗi post đều được check và có thể bị update
- Gây ra side effects không mong muốn

### 2. Object Mutation

```typescript
// ❌ Code cũ - Mutate object gốc
if (updates.likesChange !== undefined) {
    newPost.likes = (p.likes || 0) + updates.likesChange;
    delete updates.likesChange; // ❌ Mutate object gốc
}
```

**Vấn đề:**
- `delete updates.likesChange` mutate object gốc
- Nếu object được reuse, có thể gây lỗi

## ✅ Giải Pháp

### 1. Loại Bỏ useEffect Sync

```typescript
// ✅ Code mới - Không cần useEffect sync
// Không cần sync useEffect nữa vì updatePostInList đã xử lý
// API trả về isLiked, isViewed từ đầu, và updatePostInList sẽ update khi có action
```

**Lý do:**
- API đã trả về `isLiked`, `isViewed` từ đầu
- `updatePostInList` chỉ update post cụ thể khi có action
- Không cần loop qua tất cả posts

### 2. Destructure Thay Vì Delete

```typescript
// ✅ Code mới - Destructure để tách riêng
updatePostInList: (postId: string, updates: any) => {
    setPosts(prev => prev.map(p => {
        if (p.id === postId) { // ✅ Chỉ update post này
            // ✅ Destructure để không mutate
            const { likesChange, viewsChange, ...restUpdates } = updates;
            
            const newPost = { ...p };
            
            // Xử lý delta
            if (likesChange !== undefined) {
                newPost.likes = (p.likes || 0) + likesChange;
            }
            if (viewsChange !== undefined) {
                newPost.views = (p.views || 0) + viewsChange;
            }
            
            // Apply updates còn lại
            return { ...newPost, ...restUpdates };
        }
        return p; // ✅ Các posts khác giữ nguyên
    }));
}
```

## 🎯 Luồng Hoạt Động Mới

### Khi User Click Like Post A:

```
1. handleToggleLike('post-a-id')
   ↓
2. context.toggleLike('post-a-id', userId)
   - Chỉ thêm/xóa like cho post A trong context
   ↓
3. updatePostInList('post-a-id', { likesChange: +1, isLiked: true })
   - CHỈ update post A
   - Post B, C, D không bị ảnh hưởng
   ↓
4. setPosts(prev => prev.map(p => {
       if (p.id === 'post-a-id') { // ✅ Chỉ post A
           return { ...p, likes: p.likes + 1, isLiked: true };
       }
       return p; // ✅ Post khác giữ nguyên
   }))
   ↓
5. UI update: Chỉ post A thay đổi
   ↓
6. API call: await api.toggleLike('post-a-id')
   ↓
7. API response: { likes: 16, action: 'liked' }
   ↓
8. updatePostInList('post-a-id', { likes: 16, isLiked: true })
   - Sync với số chính xác từ API
```

## 📊 So Sánh

### Trước (Lỗi):

```
Posts: [A(15 likes), B(20 likes), C(10 likes)]

User click like Post A
→ useEffect trigger cho TẤT CẢ posts
→ Posts: [A(16 likes), B(0 likes ❌), C(0 likes ❌)]
```

### Sau (Đúng):

```
Posts: [A(15 likes), B(20 likes), C(10 likes)]

User click like Post A
→ updatePostInList chỉ update Post A
→ Posts: [A(16 likes ✅), B(20 likes ✅), C(10 likes ✅)]
```

## 🎨 UI Behavior

### Post A (15 likes)
- User click like → **16 likes** ✅
- Post B, C không đổi ✅

### Post B (20 likes)
- Không bị ảnh hưởng ✅
- Vẫn là 20 likes ✅

### Post C (10 likes)
- Không bị ảnh hưởng ✅
- Vẫn là 10 likes ✅

## 🔧 Technical Details

### Isolation (Cô lập)

Mỗi action chỉ ảnh hưởng đến 1 post cụ thể:

```typescript
updatePostInList(postId, updates) {
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            // ✅ CHỈ post này được update
            return { ...p, ...updates };
        }
        return p; // ✅ Posts khác giữ nguyên
    }));
}
```

### No Side Effects

- Không có useEffect chạy cho tất cả posts
- Không có global state sync
- Mỗi action độc lập
- Không có race conditions

## ✅ Checklist

- [x] Loại bỏ useEffect sync toàn bộ posts
- [x] Sử dụng updatePostInList cho từng post
- [x] Destructure thay vì delete
- [x] Chỉ update post được click
- [x] Posts khác không bị ảnh hưởng
- [x] Delta update đúng (+1/-1)
- [x] API sync chính xác
- [x] Revert đúng khi lỗi

## 🎉 Kết Quả

Bây giờ:
- ✅ Like post A → Chỉ post A thay đổi
- ✅ View post B → Chỉ post B thay đổi
- ✅ Posts khác không bị ảnh hưởng
- ✅ Số lượng tăng/giảm đúng
- ✅ Không có side effects

---

**Fixed! 🚀**
