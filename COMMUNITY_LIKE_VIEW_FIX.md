# ✅ Sửa Lỗi Reset Likes/Views Về 0

## 🐛 Vấn Đề

Khi người dùng like hoặc view một bài đăng, số lượng likes/views bị reset về 0 thay vì tăng/giảm đúng.

## 🔍 Nguyên Nhân

1. **Context chưa có dữ liệu ban đầu**: Khi load posts từ API, context `postLikes` và `postViews` chưa được populate, nên khi tính `postLikes.filter(...).length` ra 0.

2. **Sync logic sai**: useEffect sync đang override số lượng từ API bằng số lượng từ context (0).

## ✅ Giải Pháp

### 1. Không Sync Số Lượng Từ Context

**Trước:**
```typescript
useEffect(() => {
    setPosts(currentPosts =>
        currentPosts.map(post => {
            const newLikes = postLikes.filter(l => l.post_id === post.id).length; // ❌ Ra 0
            const newViews = postViews.filter(v => v.post_id === post.id).length; // ❌ Ra 0
            return { ...post, likes: newLikes, views: newViews }; // ❌ Override thành 0
        })
    );
}, [postLikes, postViews]);
```

**Sau:**
```typescript
useEffect(() => {
    setPosts(currentPosts =>
        currentPosts.map(post => {
            // ✅ CHỈ sync isLiked và isViewed, KHÔNG sync số lượng
            const isLiked = currentUser ? postLikes.some(l => l.post_id === post.id && l.user_id === currentUser.id) : post.isLiked || false;
            const isViewed = currentUser ? postViews.some(v => v.post_id === post.id && v.user_id === currentUser.id) : post.isViewed || false;
            
            // ✅ Giữ nguyên likes và views từ API
            if (post.isLiked !== isLiked || post.isViewed !== isViewed) {
                 return { ...post, isLiked, isViewed };
            }
            return post;
        })
    );
}, [postLikes, postViews, currentUser]);
```

### 2. Update Số Lượng Khi Toggle

**Thêm callback `updatePostInList`:**
```typescript
updatePostInList: (postId: string, updates: any) => {
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            const newPost = { ...p };
            
            // ✅ Xử lý likesChange và viewsChange (delta)
            if (updates.likesChange !== undefined) {
                newPost.likes = (p.likes || 0) + updates.likesChange;
                delete updates.likesChange;
            }
            if (updates.viewsChange !== undefined) {
                newPost.views = (p.views || 0) + updates.viewsChange;
                delete updates.viewsChange;
            }
            
            // Apply các updates còn lại
            return { ...newPost, ...updates };
        }
        return p;
    }));
}
```

### 3. Toggle Like với Delta

```typescript
const handleToggleLike = useCallback(async (postId: string) => {
    if (!currentUser) return;
    
    // Kiểm tra trạng thái hiện tại
    const isCurrentlyLiked = context.postLikes.some(l => l.post_id === postId && l.user_id === currentUser.id);
    
    // Optimistic update context
    context.toggleLike(postId, currentUser.id);
    
    // ✅ Optimistic update UI - Tăng/giảm số lượng
    if (updatePostInList) {
        updatePostInList(postId, {
            likesChange: isCurrentlyLiked ? -1 : 1, // ✅ Delta: +1 nếu like, -1 nếu unlike
            isLiked: !isCurrentlyLiked
        });
    }
    
    try {
        const response = await api.toggleLike(postId, currentUser.id);
        // ✅ API trả về số lượng chính xác, cập nhật lại
        if (updatePostInList && response.data) {
            updatePostInList(postId, {
                likes: response.data.likes, // Số lượng chính xác từ API
                isLiked: response.data.action === 'liked'
            });
        }
    } catch (error) {
        // ✅ Revert nếu API fails
        context.toggleLike(postId, currentUser.id);
        if (updatePostInList) {
            updatePostInList(postId, {
                likesChange: isCurrentlyLiked ? 1 : -1, // Revert delta
                isLiked: isCurrentlyLiked
            });
        }
        alert('Thao tác thất bại, vui lòng thử lại.');
    }
}, [currentUser, context, updatePostInList]);
```

### 4. Toggle View Tương Tự

```typescript
const handleToggleView = useCallback(async (postId: string) => {
    if (!currentUser) return;
    
    const isCurrentlyViewed = context.postViews.some(v => v.post_id === postId && v.user_id === currentUser.id);
    
    context.toggleView(postId, currentUser.id);
    
    // ✅ Tăng/giảm views
    if (updatePostInList) {
        updatePostInList(postId, {
            viewsChange: isCurrentlyViewed ? -1 : 1, // ✅ Delta
            isViewed: !isCurrentlyViewed
        });
    }
    
    try {
        const response = await api.toggleView(postId, currentUser.id);
        if (updatePostInList && response.data) {
            updatePostInList(postId, {
                views: response.data.views, // Số lượng chính xác từ API
                isViewed: true
            });
        }
    } catch (error) {
        // Revert
        context.toggleView(postId, currentUser.id);
        if (updatePostInList) {
            updatePostInList(postId, {
                viewsChange: isCurrentlyViewed ? 1 : -1,
                isViewed: isCurrentlyViewed
            });
        }
        alert('Thao tác thất bại, vui lòng thử lại.');
    }
}, [currentUser, context, updatePostInList]);
```

## 🎯 Luồng Hoạt Động

### Khi User Click Like:

```
1. Kiểm tra trạng thái: isCurrentlyLiked = true/false
   ↓
2. Toggle context: context.toggleLike()
   ↓
3. Optimistic update UI:
   - Nếu chưa like: likesChange = +1 → likes tăng 1
   - Nếu đã like: likesChange = -1 → likes giảm 1
   - isLiked = !isCurrentlyLiked
   ↓
4. UI update ngay lập tức (likes tăng/giảm)
   ↓
5. Gọi API: await api.toggleLike()
   ↓
6. API trả về: { action: 'liked', likes: 16 }
   ↓
7. Update lại với số chính xác từ API
   ↓
8. Nếu API fail: Revert lại (likesChange ngược dấu)
```

### Khi User Click View:

```
1. Kiểm tra trạng thái: isCurrentlyViewed = true/false
   ↓
2. Toggle context: context.toggleView()
   ↓
3. Optimistic update UI:
   - Nếu chưa view: viewsChange = +1 → views tăng 1
   - Nếu đã view: viewsChange = -1 → views giảm 1
   - isViewed = !isCurrentlyViewed
   ↓
4. UI update ngay lập tức (views tăng/giảm)
   ↓
5. Gọi API: await api.toggleView()
   ↓
6. API trả về: { views: 121 }
   ↓
7. Update lại với số chính xác từ API
   ↓
8. Nếu API fail: Revert lại
```

## ✅ Kết Quả

### Trước (Lỗi):
```
Bài viết có 15 likes
User click like
→ likes = 0 ❌ (bị reset)
```

### Sau (Đúng):
```
Bài viết có 15 likes
User click like
→ likes = 16 ✅ (tăng 1)

User click unlike
→ likes = 15 ✅ (giảm 1)
```

## 🎨 UI Behavior

### Like Button
- **Chưa like (15 likes)**: Click → **16 likes** (tăng 1)
- **Đã like (16 likes)**: Click → **15 likes** (giảm 1)
- **Icon**: Đổi màu ngay lập tức
- **Số lượng**: Cập nhật real-time

### View Button
- **Chưa view (120 views)**: Click → **121 views** (tăng 1)
- **Đã view (121 views)**: Click → **120 views** (giảm 1)
- **Icon**: Đổi màu ngay lập tức
- **Số lượng**: Cập nhật real-time

## 🔧 Technical Details

### Delta Update Pattern

Thay vì set giá trị trực tiếp:
```typescript
// ❌ Sai
updatePost(postId, { likes: 16 }); // Không biết giá trị cũ
```

Sử dụng delta (thay đổi):
```typescript
// ✅ Đúng
updatePost(postId, { likesChange: +1 }); // Cộng thêm 1
updatePost(postId, { likesChange: -1 }); // Trừ đi 1
```

### Optimistic Update + API Sync

1. **Optimistic**: Update UI ngay với delta
2. **API Call**: Gọi API ở background
3. **Sync**: Cập nhật lại với giá trị chính xác từ API
4. **Revert**: Nếu API fail, revert lại

## 📝 Testing Checklist

- [x] Load trang → Số lượng hiển thị đúng
- [x] Click like → Tăng 1
- [x] Click unlike → Giảm 1
- [x] Click view → Tăng 1
- [x] Click unview → Giảm 1
- [x] API fail → Revert đúng
- [x] Reload trang → Số lượng vẫn đúng
- [x] Multiple clicks → Số lượng đúng

## 🎉 Hoàn Thành!

Lỗi reset về 0 đã được sửa. Bây giờ:
- ✅ Like tăng/giảm đúng
- ✅ View tăng/giảm đúng
- ✅ UI phản hồi ngay lập tức
- ✅ Sync với API chính xác
- ✅ Revert nếu có lỗi

---

**Fixed! 🚀**
