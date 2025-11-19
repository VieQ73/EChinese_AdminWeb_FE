# 🔥 Hướng Dẫn Setup Firebase Config

## ⚠️ QUAN TRỌNG

Trước khi chạy ứng dụng, bạn **BẮT BUỘC** phải thay thế các placeholder config trong 2 file sau:

1. `firebase/config.ts`
2. `public/firebase-messaging-sw.js`

---

## 📋 Các Bước Setup

### Bước 1: Lấy Firebase Config

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

### Bước 2: Lấy VAPID Key

1. Vẫn ở **Firebase Console** → **Project Settings**
2. Chọn tab **Cloud Messaging**
3. Scroll xuống phần **Web configuration**
4. Click **Generate key pair** (nếu chưa có)
5. Copy **Key pair** (VAPID key)

```
Key pair: BPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx
```


### Bước 3: Cập Nhật File `firebase/config.ts`

Mở file `firebase/config.ts` và thay thế:

```typescript
// TRƯỚC (placeholder)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const VAPID_KEY = "YOUR_VAPID_KEY";

// SAU (config thật)
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

const VAPID_KEY = "BPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx";
```

### Bước 4: Cập Nhật File `public/firebase-messaging-sw.js`

Mở file `public/firebase-messaging-sw.js` và thay thế config tương tự:

```javascript
// TRƯỚC (placeholder)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// SAU (config thật - PHẢI GIỐNG với firebase/config.ts)
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

## ✅ Checklist

- [ ] Đã tạo Firebase project
- [ ] Đã thêm Web app vào Firebase project
- [ ] Đã copy Firebase config
- [ ] Đã generate VAPID key
- [ ] Đã cập nhật `firebase/config.ts`
- [ ] Đã cập nhật `public/firebase-messaging-sw.js`
- [ ] Config ở 2 file phải **GIỐNG NHAU**

---

## 🧪 Test Setup

Sau khi setup xong, chạy app và mở browser console:

```bash
npm run dev
```

Kiểm tra:

1. Không có lỗi Firebase initialization
2. Service Worker đã được đăng ký
3. FCM token được tạo thành công

---

## 🔍 Troubleshooting

### Lỗi: "Firebase: Error (auth/invalid-api-key)"

→ API key không đúng, kiểm tra lại config

### Lỗi: "Messaging: We are unable to register the default service worker"

→ File `firebase-messaging-sw.js` phải nằm trong thư mục `public/`

### Lỗi: "Messaging: This browser doesn't support the API's required"

→ Dùng Chrome, Firefox hoặc Edge. Safari không hỗ trợ FCM.

---

## 📚 Tài Liệu Tham Khảo

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging/js/client)
- [VAPID Key Setup](https://firebase.google.com/docs/cloud-messaging/js/client#configure_web_credentials_with_fcm)

---

**Lưu ý:** Không commit file config có chứa API key thật lên Git! Nên sử dụng environment variables cho production.
