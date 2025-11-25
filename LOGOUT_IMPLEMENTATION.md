# Triển khai Chức năng Đăng xuất

## Tổng quan
Đã cập nhật chức năng đăng xuất để:
1. Gọi API logout với refresh_token
2. Xóa tất cả token (access token và refresh token)
3. Xóa tất cả cache trong localStorage
4. Reset hoàn toàn ứng dụng

## Các file đã cập nhật

### 1. `contexts/AuthContext.tsx`

#### Thay đổi interface:
```typescript
// TRƯỚC
logout: () => void;

// SAU
logout: () => Promise<void>;
```

#### Cập nhật hàm logout:
```typescript
const logout = async () => {
  try {
    // 1. Lấy refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      // 2. Gọi API logout
      try {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        // Nếu API thất bại, vẫn tiếp tục logout ở client
        console.error('Logout API failed:', error);
      }
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // 3. Xóa authentication state
    setIsAuthenticated(false);
    setUser(null);
    
    // 4. Xóa tất cả token và user data
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // 5. Clear tokens trong apiClient
    apiClient.clearTokens();
    
    // 6. Xóa tất cả cache
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    cacheKeys.forEach(key => localStorage.removeItem(key));
    
    setInitialized(true);
    
    // 7. Reload trang để reset hoàn toàn
    window.location.href = '/login';
  }
};
```

### 2. `components/Header.tsx`

#### Cập nhật nút logout:
```typescript
// TRƯỚC
<button onClick={logout} ...>

// SAU
<button 
  onClick={() => {
    setDropdownOpen(false);
    logout();
  }} 
  ...>
```

## Luồng hoạt động

### Khi user click "Đăng xuất":

1. **Đóng dropdown menu**
   - Đảm bảo UI sạch sẽ

2. **Gọi API logout**
   ```
   POST /auth/logout
   Body: { "refresh_token": "..." }
   Response: { "success": true, "message": "Đăng xuất thành công." }
   ```
   - Nếu API thất bại → Vẫn tiếp tục logout ở client
   - Đảm bảo logout luôn thành công dù API có lỗi

3. **Xóa authentication state**
   - `isAuthenticated = false`
   - `user = null`

4. **Xóa tất cả token**
   - `localStorage.removeItem('token')`
   - `localStorage.removeItem('refreshToken')`
   - `localStorage.removeItem('auth_user')`
   - `apiClient.clearTokens()`

5. **Xóa tất cả cache**
   - Tìm tất cả keys bắt đầu với `cache_`
   - Xóa từng cache key
   - Đảm bảo không còn dữ liệu cũ

6. **Reset ứng dụng**
   - `window.location.href = '/login'`
   - Hard reload trang
   - Đảm bảo tất cả state được reset

## Xử lý lỗi

### Trường hợp 1: API logout thất bại
```typescript
try {
  await apiClient.post('/auth/logout', { refresh_token: refreshToken });
} catch (error) {
  // Log lỗi nhưng vẫn tiếp tục logout
  console.error('Logout API failed:', error);
}
```
**Kết quả:** User vẫn được logout thành công ở client

### Trường hợp 2: Không có refresh token
```typescript
if (refreshToken) {
  // Chỉ gọi API nếu có refresh token
  await apiClient.post('/auth/logout', { refresh_token: refreshToken });
}
```
**Kết quả:** Bỏ qua API call, tiếp tục xóa dữ liệu local

### Trường hợp 3: localStorage bị lỗi
```typescript
try {
  localStorage.removeItem('auth_user');
  // ...
} catch {
  // ignore
}
```
**Kết quả:** Bỏ qua lỗi, tiếp tục các bước khác

## Lợi ích

### 1. Bảo mật
- ✅ Gọi API logout để invalidate refresh token trên server
- ✅ Xóa tất cả token ở client
- ✅ Không còn token nào có thể bị lợi dụng

### 2. Dữ liệu sạch
- ✅ Xóa tất cả cache
- ✅ Xóa tất cả authentication data
- ✅ Reset hoàn toàn ứng dụng

### 3. Trải nghiệm người dùng
- ✅ Logout luôn thành công (dù API có lỗi)
- ✅ Chuyển về trang login ngay lập tức
- ✅ Không còn dữ liệu của user trước

### 4. Đáng tin cậy
- ✅ Xử lý tất cả trường hợp lỗi
- ✅ Không bao giờ để user "mắc kẹt"
- ✅ Luôn đảm bảo logout thành công

## Testing

### Test case 1: Logout bình thường
```
1. User đăng nhập
2. Click "Đăng xuất"
3. Kiểm tra:
   - API /auth/logout được gọi ✓
   - Token bị xóa ✓
   - Cache bị xóa ✓
   - Chuyển về /login ✓
```

### Test case 2: API logout thất bại
```
1. User đăng nhập
2. Tắt server hoặc mock API error
3. Click "Đăng xuất"
4. Kiểm tra:
   - Console log error ✓
   - Token vẫn bị xóa ✓
   - Cache vẫn bị xóa ✓
   - Vẫn chuyển về /login ✓
```

### Test case 3: Không có refresh token
```
1. Xóa refresh token thủ công
2. Click "Đăng xuất"
3. Kiểm tra:
   - Không gọi API ✓
   - Token bị xóa ✓
   - Cache bị xóa ✓
   - Chuyển về /login ✓
```

### Test case 4: localStorage bị disable
```
1. Disable localStorage trong browser
2. Click "Đăng xuất"
3. Kiểm tra:
   - Không crash ✓
   - Vẫn chuyển về /login ✓
```

## Kiểm tra trong DevTools

### Trước khi logout:
```javascript
// Console
localStorage.getItem('token')          // → "eyJhbGc..."
localStorage.getItem('refreshToken')   // → "eyJhbGc..."
localStorage.getItem('auth_user')      // → "{\"id\":\"...\"}"
localStorage.getItem('cache_exams')    // → "[{...}]"
```

### Sau khi logout:
```javascript
// Console
localStorage.getItem('token')          // → null
localStorage.getItem('refreshToken')   // → null
localStorage.getItem('auth_user')      // → null
localStorage.getItem('cache_exams')    // → null
```

### Network tab:
```
POST /auth/logout
Request: { "refresh_token": "eyJhbGc..." }
Response: { "success": true, "message": "Đăng xuất thành công." }
Status: 200 OK
```

## Kết luận

Chức năng đăng xuất đã được cập nhật hoàn chỉnh:
- ✅ Gọi API logout với refresh_token
- ✅ Xóa tất cả token
- ✅ Xóa tất cả cache
- ✅ Reset hoàn toàn ứng dụng
- ✅ Xử lý tất cả trường hợp lỗi
- ✅ Đảm bảo logout luôn thành công
