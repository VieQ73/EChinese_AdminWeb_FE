# 🐛 Debug Push Notification

## 🎯 Trang Test

Truy cập: `http://localhost:3000/#/test-push`

Trang này giúp bạn:
- ✅ Kiểm tra permission status
- ✅ Kiểm tra Service Worker registration
- ✅ Lấy FCM token
- ✅ Đăng ký token với backend
- ✅ Gửi test notification
- ✅ Xem logs real-time

---

## 📝 Các Bước Debug

### Bước 1: Kiểm Tra Browser Console

Mở DevTools (F12) và xem Console. Bạn sẽ thấy:

```
✅ Service Worker registered: ServiceWorkerRegistration {...}
✅ Firebase Messaging initialized
```

Nếu thấy lỗi, đọc phần Troubleshooting bên dưới.

### Bước 2: Kiểm Tra Service Worker

1. Mở DevTools → **Application** tab
2. Chọn **Service Workers** ở sidebar
3. Kiểm tra xem `firebase-messaging-sw.js` có được đăng ký không

**Nếu không thấy:**
- Clear cache và reload (Ctrl + Shift + R)
- Kiểm tra file `public/firebase-messaging-sw.js` có tồn tại không
- Kiểm tra console có lỗi không

### Bước 3: Request Permission

Trên trang test, click **"Request Permission"**

- Nếu browser hiện popup → Click **"Allow"**
- Nếu không hiện popup → Permission đã bị block trước đó

**Cách unblock permission:**
1. Click vào icon 🔒 bên trái URL bar
2. Tìm **Notifications**
3. Chọn **Allow**
4. Reload trang

### Bước 4: Get FCM Token

Click **"Get FCM Token"**

- Nếu thành công → Token sẽ hiển thị (dài ~150 ký tự)
- Nếu thất bại → Xem logs để biết lỗi

**Lỗi thường gặp:**
- `Messaging: We are unable to register the default service worker` → Service Worker chưa đăng ký
- `Messaging: This browser doesn't support the API's required` → Dùng Chrome/Firefox/Edge
- `Permission denied` → Chưa cấp quyền notification

### Bước 5: Register Token với Backend

Click **"Register Token"**

Kiểm tra Network tab:
- Request: `POST /api/users/device-token`
- Status: 200 OK
- Response: `{ "success": true }`

**Nếu lỗi:**
- 401 Unauthorized → Token auth không hợp lệ, login lại
- 500 Server Error → Backend có vấn đề, xem log server

### Bước 6: Test Local Notification

Click **"Test Notification"**

- Nếu thành công → Notification sẽ hiện ở góc màn hình
- Nếu không hiện → Permission chưa được cấp

### Bước 7: Test từ Backend

Copy FCM token và gửi request từ backend:

```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "YOUR_USER_ID",
    "audience": "user",
    "type": "system",
    "title": "Test từ Backend",
    "content": { "message": "Đây là test notification" },
    "redirect_url": "app://home"
  }'
```

**Kiểm tra:**
1. Backend log có gửi notification không
2. FCM có trả về success không
3. Browser có nhận được notification không

---

## 🔍 Troubleshooting

### ❌ Service Worker không đăng ký

**Nguyên nhân:**
- File `firebase-messaging-sw.js` không ở đúng vị trí
- Chỉ hoạt động trên HTTPS hoặc localhost
- Browser không hỗ trợ Service Worker

**Giải pháp:**
```bash
# Kiểm tra file tồn tại
ls public/firebase-messaging-sw.js

# Nếu không có, tạo lại file
# Copy nội dung từ REACTJS_PUSH_COMPLETE_GUIDE.md
```

### ❌ Firebase Messaging không khởi tạo

**Nguyên nhân:**
- Firebase config sai
- VAPID key sai
- Browser không hỗ trợ

**Giải pháp:**
1. Kiểm tra `firebase/config.ts`:
   - `apiKey` đúng chưa
   - `projectId` đúng chưa
   - `messagingSenderId` đúng chưa
   - `appId` đúng chưa

2. Kiểm tra VAPID key:
   - Vào Firebase Console → Cloud Messaging
   - Copy lại VAPID key
   - Paste vào `firebase/config.ts`

3. Config ở 2 file phải GIỐNG NHAU:
   - `firebase/config.ts`
   - `public/firebase-messaging-sw.js`

### ❌ Không nhận được notification

**Kiểm tra từng bước:**

1. **Permission granted?**
```javascript
console.log(Notification.permission); // phải là "granted"
```

2. **Service Worker active?**
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('SW:', regs.length); // phải > 0
});
```

3. **FCM Token có?**
```javascript
console.log(localStorage.getItem('fcm_token')); // phải có giá trị
```

4. **Token đã gửi lên server?**
- Xem Network tab
- Tìm request `POST /api/users/device-token`
- Status phải là 200

5. **Backend có gửi notification?**
- Xem log server
- Phải thấy: `Sending notification to token: ...`
- FCM response phải success

6. **Foreground listener đã setup?**
- Xem console khi app load
- Phải thấy: `✅ Firebase Messaging initialized`

### ❌ Notification chỉ hiện khi app đóng

**Nguyên nhân:** Foreground listener chưa setup

**Giải pháp:**
Kiểm tra `App.tsx`:
```typescript
useEffect(() => {
  if (!isAuthenticated) return;

  const unsubscribe = setupForegroundListener((payload) => {
    console.log('📩 Received notification:', payload);
  });

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [isAuthenticated]);
```

### ❌ Notification chỉ hiện khi app mở

**Nguyên nhân:** Service Worker không hoạt động

**Giải pháp:**
1. Kiểm tra `public/firebase-messaging-sw.js` có đúng không
2. Clear cache và reload
3. Kiểm tra DevTools → Application → Service Workers

---

## 📊 Checklist Debug

- [ ] Browser console không có lỗi
- [ ] Service Worker đã đăng ký (DevTools → Application)
- [ ] Permission = "granted"
- [ ] FCM Token đã được lấy
- [ ] Token đã gửi lên backend (200 OK)
- [ ] Backend log thấy token được lưu
- [ ] Test local notification → OK
- [ ] Test từ backend → OK
- [ ] Nhận được notification khi app mở
- [ ] Nhận được notification khi app đóng
- [ ] Click notification → navigate đúng trang

---

## 🎯 Test Cases

### Test 1: Foreground Notification (App đang mở)

1. Mở app và login
2. Giữ tab app đang active
3. Gửi notification từ backend
4. **Kết quả mong đợi:**
   - Console log: `📩 Foreground message received`
   - Notification hiện ở góc màn hình
   - Click notification → navigate đến trang tương ứng

### Test 2: Background Notification (App đóng)

1. Mở app và login
2. Đóng tab app (hoặc chuyển sang tab khác)
3. Gửi notification từ backend
4. **Kết quả mong đợi:**
   - Notification hiện ở góc màn hình
   - Click notification → mở lại app và navigate

### Test 3: Multiple Notifications

1. Gửi 3 notifications liên tiếp
2. **Kết quả mong đợi:**
   - Cả 3 notifications đều hiện
   - Badge count tăng lên 3
   - Click vào từng notification → navigate đúng

---

## 🔧 Useful Commands

### Clear All Data
```javascript
// Trong browser console
localStorage.clear();
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
location.reload();
```

### Check Service Worker Status
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => {
    console.log('SW:', reg.active?.scriptURL);
    console.log('State:', reg.active?.state);
  });
});
```

### Force Update Service Worker
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.update());
});
```

### Test Notification Permission
```javascript
Notification.requestPermission().then(permission => {
  console.log('Permission:', permission);
  if (permission === 'granted') {
    new Notification('Test', { body: 'This is a test' });
  }
});
```

---

## 📞 Cần Hỗ Trợ?

Nếu vẫn không hoạt động sau khi thử tất cả các bước trên:

1. Copy toàn bộ logs từ Console
2. Copy logs từ trang `/test-push`
3. Copy response từ Network tab
4. Gửi cho team backend để kiểm tra

---

**Good luck! 🚀**
