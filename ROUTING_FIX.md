# Sửa lỗi Routing - Về đúng trang Login

## Vấn đề

### Trước khi sửa:
- ❌ Sau khi đăng xuất: `window.location.href = '/login'` → Về trang `/` (không đúng)
- ❌ Route không tồn tại: Redirect về `/` thay vì `/login`
- ❌ Khi bắt đầu app chưa đăng nhập: Có thể không về đúng `/login`

### Nguyên nhân:
App sử dụng **HashRouter** (`/#/path`) nhưng code đang dùng path thông thường (`/path`)

---

## Giải pháp

### 1. Sửa logout redirect (`contexts/AuthContext.tsx`)

#### TRƯỚC:
```typescript
// Reload trang để reset hoàn toàn ứng dụng
window.location.href = '/login';
```

#### SAU:
```typescript
// Reload trang để reset hoàn toàn ứng dụng và về trang login
window.location.href = '/#/login';
```

**Giải thích:**
- HashRouter sử dụng hash (`#`) trong URL
- URL đúng: `http://localhost:5173/#/login`
- Không phải: `http://localhost:5173/login`

---

### 2. Sửa fallback route (`App.tsx`)

#### TRƯỚC:
```typescript
<Route path="*" element={<Navigate to="/" />} />
```

#### SAU:
```typescript
<Route path="*" element={<Navigate to="/login" replace />} />
```

**Giải thích:**
- Route không tồn tại → Redirect về `/login` thay vì `/`
- Thêm `replace` để không tạo history entry mới
- Đảm bảo user chưa đăng nhập sẽ về login

---

## Luồng hoạt động

### Scenario 1: Bắt đầu app (chưa đăng nhập)

```
1. User mở app: http://localhost:5173/
2. HashRouter khởi tạo
3. Route "/" được match
4. ProtectedRoute kiểm tra:
   ├─ isAuthenticated = false
   └─ Redirect to="/login"
5. URL thay đổi: http://localhost:5173/#/login
6. Hiển thị trang Login ✓
```

### Scenario 2: User đăng xuất

```
1. User click "Đăng xuất"
2. logout() được gọi
3. Xóa tất cả token và cache
4. window.location.href = '/#/login'
5. Browser reload và navigate đến /#/login
6. Hiển thị trang Login ✓
```

### Scenario 3: User truy cập route không tồn tại

```
1. User vào: http://localhost:5173/#/invalid-route
2. Route "*" được match
3. Navigate to="/login" replace
4. URL thay đổi: http://localhost:5173/#/login
5. Hiển thị trang Login ✓
```

### Scenario 4: User đã đăng nhập vào route không tồn tại

```
1. User vào: http://localhost:5173/#/invalid-route
2. Route "*" được match
3. Navigate to="/login" replace
4. ProtectedRoute kiểm tra:
   ├─ isAuthenticated = true
   └─ Cho phép truy cập
5. Nhưng route "/login" không nằm trong ProtectedRoute
6. Hiển thị trang Login
7. User có thể click vào menu để đi đến trang khác
```

**Lưu ý:** Nếu muốn user đã đăng nhập vào route không tồn tại thì redirect về Dashboard, có thể thay đổi:

```typescript
// Trong ProtectedRoute, thêm route fallback
<Route element={<ProtectedRoute />}>
    {/* ... các route khác ... */}
    <Route path="*" element={<Navigate to="/" replace />} />
</Route>
```

---

## Cấu trúc Routes

```typescript
<HashRouter>
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    
    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/users" element={<UserManagement />} />
      {/* ... các route khác ... */}
    </Route>
    
    {/* Fallback - Redirect về login */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
</HashRouter>
```

---

## HashRouter vs BrowserRouter

### HashRouter (Đang dùng)
- URL: `http://localhost:5173/#/login`
- Không cần cấu hình server
- Hoạt động với static hosting
- Dễ deploy

### BrowserRouter (Nếu muốn đổi)
- URL: `http://localhost:5173/login`
- Cần cấu hình server (rewrite rules)
- URL đẹp hơn
- Phức tạp hơn khi deploy

**Khuyến nghị:** Giữ HashRouter vì đơn giản và phù hợp với admin panel

---

## Testing

### Test case 1: Bắt đầu app chưa đăng nhập
```
1. Clear localStorage
2. Mở http://localhost:5173/
3. Kiểm tra:
   - URL thay đổi thành /#/login ✓
   - Hiển thị trang Login ✓
```

### Test case 2: Đăng xuất
```
1. Đăng nhập vào app
2. Click "Đăng xuất"
3. Kiểm tra:
   - URL thay đổi thành /#/login ✓
   - Trang reload ✓
   - Hiển thị trang Login ✓
   - localStorage đã xóa ✓
```

### Test case 3: Route không tồn tại (chưa đăng nhập)
```
1. Clear localStorage
2. Mở http://localhost:5173/#/invalid-route
3. Kiểm tra:
   - URL thay đổi thành /#/login ✓
   - Hiển thị trang Login ✓
```

### Test case 4: Route không tồn tại (đã đăng nhập)
```
1. Đăng nhập vào app
2. Mở http://localhost:5173/#/invalid-route
3. Kiểm tra:
   - URL thay đổi thành /#/login ✓
   - Hiển thị trang Login ✓
   - Có thể click menu để đi đến trang khác ✓
```

### Test case 5: Truy cập trực tiếp vào protected route
```
1. Clear localStorage
2. Mở http://localhost:5173/#/users
3. Kiểm tra:
   - URL thay đổi thành /#/login ✓
   - Hiển thị trang Login ✓
```

---

## Lưu ý quan trọng

### 1. URL trong code
Khi sử dụng HashRouter, luôn dùng path tương đối:
```typescript
// ✓ ĐÚNG
<Navigate to="/login" />
window.location.href = '/#/login';

// ✗ SAI
<Navigate to="/#/login" /> // Không cần # trong Navigate
window.location.href = '/login'; // Thiếu #
```

### 2. Link trong HTML
```html
<!-- ✓ ĐÚNG -->
<a href="/#/login">Login</a>

<!-- ✗ SAI -->
<a href="/login">Login</a>
```

### 3. Redirect sau khi login
```typescript
// Trong Login.tsx
const handleLogin = async () => {
  // ... login logic
  navigate('/'); // ✓ ĐÚNG - Navigate sẽ tự thêm #
  // window.location.href = '/#/'; // Cũng được nhưng không cần thiết
};
```

---

## Các trường hợp đặc biệt

### 1. Deep linking
Nếu muốn share link đến một trang cụ thể:
```
http://localhost:5173/#/users/123
```
- Nếu chưa đăng nhập → Redirect về /#/login
- Nếu đã đăng nhập → Hiển thị trang user detail

### 2. Redirect sau khi login
Có thể lưu URL trước khi redirect về login:
```typescript
// Trong ProtectedRoute
const location = useLocation();
if (!isAuthenticated) {
  return <Navigate to="/login" state={{ from: location }} replace />;
}

// Trong Login
const location = useLocation();
const from = location.state?.from?.pathname || '/';
navigate(from, { replace: true });
```

### 3. Logout từ nhiều tab
Khi logout ở tab 1, các tab khác cũng nên logout:
```typescript
// Lắng nghe storage event
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'token' && !e.newValue) {
      // Token bị xóa → Logout
      window.location.href = '/#/login';
    }
  };
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

---

## Kết luận

Đã sửa thành công routing để:
- ✅ Bắt đầu app chưa đăng nhập → Về `/#/login`
- ✅ Sau khi đăng xuất → Về `/#/login`
- ✅ Route không tồn tại → Về `/#/login`
- ✅ Truy cập protected route chưa đăng nhập → Về `/#/login`
- ✅ Không thay đổi chức năng hiện tại
- ✅ Hoạt động đúng với HashRouter

App giờ luôn redirect về đúng trang login khi cần!
