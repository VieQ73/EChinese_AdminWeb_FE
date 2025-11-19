# 🔥 Hướng Dẫn Setup Firebase cho Push Notification

## ⚠️ QUAN TRỌNG: Bạn cần hoàn thành các bước sau để hệ thống notification hoạt động

### 📋 Checklist

- [ ] Lấy Firebase Config từ Firebase Console
- [ ] Lấy VAPID Key từ Firebase Console
- [ ] Cập nhật file `firebase/config.ts`
- [ ] Cập nhật file `public/firebase-messaging-sw.js`
- [ ] Test notification

---

## 🔧 Bước 1: Lấy Firebase Config

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn (hoặc tạo project mới)
3. Vào **Project Settings** (⚙️) → **General**
4. Scroll xuống phần **Your apps**
5. Click vào **Web app** (</>) hoặc **Add app** nếu chưa có
6. Copy **Firebase configuration**

Bạn sẽ nhận được config như này:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## 🔑 Bước 2: Lấy VAPID Key

1. Vẫn ở **Firebase Console** → **Project Settings**
2. Chọn tab **Cloud Messaging**
3. Scroll xuống phần **Web configuration**
4. Click **Generate key pair** (nếu chưa có)
5. Copy **Key pair** (VAPID key)

```
Key pair: BPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx
```

---

## 📝 Bước 3: Cập Nhật Config Files

### 3.1. Cập nhật `firebase/config.ts`

Mở file `firebase/config.ts` và thay thế các giá trị sau:

```typescript
// firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ✏️ THAY THẾ CONFIG NÀY BẰNG CONFIG CỦA BẠN
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // ← Thay bằng apiKey của bạn
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // ← Thay bằng authDomain của bạn
  projectId: "YOUR_PROJECT_ID",        // ← Thay bằng projectId của bạn
  storageBucket: "YOUR_PROJECT_ID.appspot.com",   // ← Thay bằng storageBucket của bạn
  messagingSenderId: "YOUR_SENDER_ID", // ← Thay bằng messagingSenderId của bạn
  appId: "YOUR_APP_ID"                 // ← Thay bằng appId của bạn
};

// ✏️ THAY THẾ VAPID KEY NÀY BẰNG KEY CỦA BẠN
const VAPID_KEY = "YOUR_VAPID_KEY";    // ← Thay bằng VAPID key của bạn

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage, VAPID_KEY };
```

### 3.2. Cập nhật `public/firebase-messaging-sw.js`

Mở file `public/firebase-messaging-sw.js` và thay thế config (phải giống với config ở trên):

```javascript
// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ✏️ THAY THẾ CONFIG NÀY BẰNG CONFIG CỦA BẠN (GIỐNG VỚI firebase/config.ts)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ... rest of the file
```

---

## 🧪 Bước 4: Test Notification

### 4.1. Test Permission Request

1. Chạy ứng dụng: `npm run dev`
2. Đăng nhập vào hệ thống
3. Mở Browser Console (F12)
4. Kiểm tra log:
   - `✅ Notification permission granted`
   - `📱 FCM Token: ...`
   - `✅ Device token registered successfully`

### 4.2. Test Gửi Notification Từ Firebase Console

1. Vào Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Nhập:
   - **Notification title**: "Test Notification"
   - **Notification text**: "This is a test message"
4. Click "Send test message"
5. Paste FCM token (lấy từ console.log)
6. Click "Test"

### 4.3. Test Gửi Từ Backend

Nếu backend đã setup, test bằng API:

```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "user-uuid",
    "audience": "user",
    "type": "system",
    "title": "Test từ Backend",
    "content": { "message": "Đây là test notification" },
    "redirect_url": "app://home"
  }'
```

---

## 🔍 Troubleshooting

### ❌ Lỗi: "Messaging: We are unable to register the default service worker"

**Nguyên nhân**: File `firebase-messaging-sw.js` không nằm trong thư mục `public/`

**Giải pháp**: Đảm bảo file nằm đúng vị trí: `public/firebase-messaging-sw.js`

### ❌ Lỗi: "This browser doesn't support the API's required"

**Nguyên nhân**: Browser không hỗ trợ FCM

**Giải pháp**: Dùng Chrome, Firefox, hoặc Edge. Safari không hỗ trợ FCM.

### ❌ Không nhận được notification

**Kiểm tra:**

1. Permission đã được cấp chưa?
```javascript
console.log('Permission:', Notification.permission);
```

2. Service Worker đã đăng ký chưa?
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

3. FCM token đã được lấy chưa?
```javascript
const token = localStorage.getItem('fcm_token');
console.log('FCM Token:', token);
```

4. Token đã được gửi lên server chưa?
```sql
-- Check trong database
SELECT * FROM "DeviceTokens" WHERE platform = 'web';
```

### ❌ Notification không hiển thị khi tab đang mở

**Nguyên nhân**: Foreground listener chưa được setup đúng

**Giải pháp**: Kiểm tra trong `App.tsx` đã có `setupForegroundListener()` chưa

---

## 📚 API Endpoints Cần Có Ở Backend

Backend cần implement các endpoints sau:

### 1. Lưu Device Token
```http
POST /api/users/device-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "fcm-token-string",
  "platform": "web",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "language": "vi"
  }
}
```

### 2. Xóa Device Token
```http
DELETE /api/users/device-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "fcm-token-string"
}
```

### 3. Gửi Notification
```http
POST /api/notifications
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "recipient_id": "user-uuid",
  "audience": "user",
  "type": "system",
  "title": "Tiêu đề thông báo",
  "content": {
    "message": "Nội dung thông báo"
  },
  "redirect_url": "app://home"
}
```

---

## ✅ Hoàn Thành!

Sau khi hoàn thành các bước trên, hệ thống push notification sẽ hoạt động:

- ✅ Tự động đăng ký FCM token khi login
- ✅ Tự động xóa FCM token khi logout
- ✅ Nhận notification khi app đang mở (foreground)
- ✅ Nhận notification khi app đóng (background)
- ✅ Click notification để navigate đến trang tương ứng

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Browser console có lỗi không?
2. Network tab có request đến Firebase không?
3. Service Worker có đăng ký thành công không?
4. Backend có nhận được device token không?

**Chúc bạn thành công! 🚀**
