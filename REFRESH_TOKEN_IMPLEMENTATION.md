# Triển khai Refresh Token

## Tổng quan
Hệ thống refresh token đã được triển khai trong `services/apiClient.ts` với các tính năng:

### ✅ Tính năng đã triển khai

1. **Tự động refresh token khi hết hạn**
   - Khi API trả về lỗi 401 (Unauthorized)
   - Khi message chứa: "Token không hợp lệ", "Token expired", "Invalid token", "jwt expired"
   - Tự động gọi API `/auth/refresh-token` để lấy token mới

2. **Tự động gọi lại API ban đầu**
   - Sau khi refresh token thành công
   - Sử dụng token mới để gọi lại API đã thất bại
   - Trả về kết quả như bình thường

3. **Tránh gọi refresh token nhiều lần**
   - Sử dụng biến `refreshPromise` để đồng bộ
   - Nếu có nhiều request cùng lúc gặp lỗi 401, chỉ gọi refresh 1 lần
   - Các request khác sẽ đợi kết quả của lần refresh đầu tiên

4. **Xử lý khi refresh token thất bại**
   - Xóa tất cả token khỏi localStorage
   - Xóa thông tin user
   - Tự động chuyển về trang login
   - Hiển thị thông báo "Phiên đăng nhập đã hết hạn"

## Cách hoạt động

### Flow chuẩn:
```
1. User gọi API → Token hợp lệ → Trả về dữ liệu ✅

2. User gọi API → Token hết hạn (401) 
   → Tự động gọi refresh token
   → Lưu token mới
   → Gọi lại API ban đầu với token mới
   → Trả về dữ liệu ✅

3. User gọi API → Token hết hạn (401)
   → Gọi refresh token → Refresh token cũng hết hạn
   → Xóa token
   → Chuyển về trang login
   → Hiển thị lỗi ❌
```

### Ví dụ sử dụng:

```typescript
// Trong component hoặc page
import { apiClient } from '../../services/apiClient';

// Gọi API bình thường, không cần xử lý refresh token
const fetchData = async () => {
  try {
    const data = await apiClient.get('/users');
    // Nếu token hết hạn, apiClient sẽ tự động:
    // 1. Refresh token
    // 2. Gọi lại API /users
    // 3. Trả về dữ liệu
    console.log(data);
  } catch (error) {
    // Chỉ xử lý lỗi thật sự (không phải lỗi token)
    console.error(error);
  }
};
```

## API Backend cần hỗ trợ

Backend cần có endpoint:

```
POST /auth/refresh-token
Body: { "refresh_token": "..." }
Response: { 
  "token": "new_access_token",
  "refreshToken": "new_refresh_token" // optional
}
```

## Lưu ý

- Endpoint `/auth/refresh-token` và `/auth/login` sẽ KHÔNG tự động refresh
- Token được lưu trong localStorage với key: `token` và `refreshToken`
- Khi refresh thất bại, user sẽ bị logout tự động
- Console sẽ log các bước refresh để dễ debug

## Debug khi gặp vấn đề

### Vấn đề: API refresh được gọi nhưng vẫn redirect về login

**Các bước debug:**

1. **Mở Console (F12)** và xem log chi tiết:
   ```
   [refreshToken] Bắt đầu gọi API refresh token...
   [refreshToken] Response status: 200
   [refreshToken] Response data: {...}
   [refreshToken] Đã nhận token mới, đang lưu vào localStorage...
   ```

2. **Kiểm tra response từ API refresh token:**
   - API có trả về status 200 không?
   - Response có chứa field `token` hoặc `access_token` không?
   - Format response có đúng không?

3. **Các format response được hỗ trợ:**
   ```json
   // Format 1: Token trực tiếp
   { "token": "...", "refreshToken": "..." }
   
   // Format 2: Với access_token
   { "access_token": "...", "refresh_token": "..." }
   
   // Format 3: Nested trong result (Backend của bạn)
   { 
     "success": true,
     "message": "Thành công",
     "result": { 
       "access_token": "..." 
     } 
   }
   
   // Format 4: Nested trong data
   { "data": { "token": "...", "refreshToken": "..." } }
   ```

4. **Lưu ý về refresh_token:**
   - Nếu API không trả về refresh_token mới, hệ thống sẽ tự động giữ lại refresh_token cũ
   - Điều này phù hợp với backend chỉ trả về access_token mới

4. **Kiểm tra localStorage:**
   - Mở DevTools > Application > Local Storage
   - Xem các key: `token`, `refreshToken`, `auth_user`
   - Token có được cập nhật sau khi refresh không?

### Sử dụng component test

Đã tạo component `pages/test/TestRefreshToken.tsx` để test:

1. **Thêm route vào router:**
   ```tsx
   import TestRefreshToken from './pages/test/TestRefreshToken';
   
   // Trong routes
   <Route path="/test-refresh" element={<TestRefreshToken />} />
   ```

2. **Truy cập:** `http://localhost:3000/#/test-refresh`

3. **Các test có sẵn:**
   - Test 1: Gọi API bình thường
   - Test 2: Làm hỏng token & test refresh tự động
   - Test 3: Xem token hiện tại
   - Test 4: Gọi trực tiếp API refresh để xem response

## Test chức năng

Để test, bạn có thể:

1. **Test tự động refresh:**
   - Đăng nhập vào hệ thống
   - Đợi token hết hạn (hoặc sửa token trong localStorage thành token không hợp lệ)
   - Gọi bất kỳ API nào
   - Kiểm tra console log xem có refresh tự động không

2. **Test nhiều request đồng thời:**
   - Sửa token thành token không hợp lệ
   - Gọi nhiều API cùng lúc
   - Kiểm tra chỉ có 1 request refresh được gọi

3. **Test refresh thất bại:**
   - Xóa refresh token trong localStorage
   - Gọi API bất kỳ
   - Kiểm tra có chuyển về trang login không

## Console Logs

Khi chạy, bạn sẽ thấy các log sau:

```
[apiClient] Token hết hạn cho endpoint: /users
[apiClient] Status: 401 Message: Token không hợp lệ
[refreshToken] Bắt đầu gọi API refresh token...
[refreshToken] Response status: 200
[refreshToken] Response data: { token: "...", refreshToken: "..." }
[refreshToken] Đã nhận token mới, đang lưu vào localStorage...
[refreshToken] Lưu token thành công!
[apiClient] Refresh token thành công! Token mới: eyJhbGciOiJIUzI1NiIs...
[apiClient] Đang gọi lại API: /users
[apiClient] ✅ Gọi lại API thành công!
```
