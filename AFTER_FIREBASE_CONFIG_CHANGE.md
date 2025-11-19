# Sau khi đổi Firebase Config

## ✅ Đã cập nhật:

1. **firebase/config.ts** - Config mới
2. **public/firebase-messaging-sw.js** - Config mới

## 🔄 Các bước tiếp theo:

### 1. Clear cache và reload

**Trong browser:**
```
1. Mở DevTools (F12)
2. Application tab → Storage → Clear site data
3. Hoặc: Ctrl + Shift + Delete → Clear all
4. Hard reload: Ctrl + Shift + R
```

### 2. Unregister Service Worker cũ

**Trong Console:**
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
    console.log('Unregistered:', registration);
  });
});
```

Sau đó reload page (F5).

### 3. Clear localStorage

**Trong Console:**
```javascript
localStorage.removeItem('fcm_token');
console.log('FCM token cleared');
```

### 4. Logout và Login lại

Để đăng ký token mới với Firebase project mới.

### 5. Kiểm tra token mới

Sau khi login, trong console sẽ thấy:
```
📱 FCM Token: [TOKEN_MỚI_VỚI_PROJECT_MỚI]
```

Copy token này và gửi cho backend.

## ⚠️ Backend cũng phải đổi config!

Backend phải sử dụng **Service Account Key** của Firebase project mới:

### Lấy Service Account Key:

1. Vào Firebase Console: https://console.firebase.google.com/
2. Chọn project: **notification-4a444**
3. Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download file JSON
6. Đổi tên thành `serviceAccountKey.json`
7. Đặt vào thư mục backend

### Cập nhật backend code:

```javascript
// Backend - services/firebase.js hoặc tương tự
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging();
```

## 🧪 Test sau khi đổi:

### 1. Test frontend
```javascript
// Trong console
window.testNotification()
```

Popup phải hiện ra.

### 2. Test backend gửi notification

Tạo file `test-new-config.js`:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function testNewConfig() {
  // Paste token mới từ frontend console
  const token = 'PASTE_TOKEN_MỚI_VÀO_ĐÂY';
  
  const message = {
    notification: {
      title: 'Test Config Mới',
      body: 'Nếu nhận được, config đã đúng!'
    },
    data: {
      type: 'system',
      redirect_url: 'app://home'
    },
    token: token
  };

  console.log('📤 Testing new Firebase config...');
  console.log('Token:', token);

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ SUCCESS! Message ID:', response);
    console.log('✅ New Firebase config is working!');
  } catch (error) {
    console.error('❌ ERROR:', error.code);
    console.error('Message:', error.message);
    
    if (error.code === 'messaging/invalid-recipient') {
      console.error('→ Token không hợp lệ hoặc thuộc project khác');
    } else if (error.code === 'messaging/authentication-error') {
      console.error('→ Service Account Key không đúng');
    }
  }
}

testNewConfig();
```

Chạy:
```bash
node test-new-config.js
```

### 3. Test bằng Firebase Console

1. Vào: https://console.firebase.google.com/project/notification-4a444/messaging
2. Click "Send test message"
3. Paste FCM token mới
4. Nhập title: "Test từ Firebase Console"
5. Nhập body: "Testing new config"
6. Click "Test"

Nếu nhận được → Config đúng!

## 🔍 Debug nếu không hoạt động:

### Kiểm tra 1: Project ID
```javascript
// Frontend console
window.debugNotificationSetup()
```

Phải thấy project: **notification-4a444**

### Kiểm tra 2: Service Worker
```javascript
// Frontend console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
  console.log('Active:', reg?.active);
  console.log('Scope:', reg?.scope);
});
```

### Kiểm tra 3: Token format
Token mới phải bắt đầu với project ID mới:
```
[RANDOM_STRING]:APA91bF[...]
```

### Kiểm tra 4: Backend Service Account
```javascript
// Backend
console.log('Project ID:', admin.app().options.projectId);
// Phải là: notification-4a444
```

## ✅ Checklist:

- [ ] Frontend config đã đổi (firebase/config.ts)
- [ ] Service Worker config đã đổi (firebase-messaging-sw.js)
- [ ] Clear cache và reload
- [ ] Unregister Service Worker cũ
- [ ] Clear localStorage (fcm_token)
- [ ] Logout và login lại
- [ ] Có token mới
- [ ] Backend đã đổi Service Account Key
- [ ] Backend project ID đúng (notification-4a444)
- [ ] Test thành công

## 🎯 Kết quả mong đợi:

Sau khi hoàn tất, khi backend gửi notification, frontend console sẽ thấy:
```
🎉🎉🎉 [setupForegroundListener] ===== FOREGROUND MESSAGE RECEIVED! =====
📩 [setupForegroundListener] Full payload: {
  "notification": {
    "title": "...",
    "body": "..."
  },
  "data": { ... }
}
🎊🎊🎊 [NotificationHandler] ===== CALLBACK TRIGGERED! =====
```

Và popup notification sẽ hiện ra! 🎉
