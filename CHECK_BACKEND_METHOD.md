# Kiểm tra Backend Method

## Vấn đề phát hiện

Backend format đúng nhưng có thể đang dùng sai method hoặc có vấn đề khác.

## Các khả năng:

### 1. Backend gửi thành công nhưng frontend không nhận

**Nguyên nhân:**
- App đang ở background (không phải foreground)
- Service Worker đã xử lý message
- Browser tab không active
- onMessage() listener chưa được setup kịp

**Giải pháp:**
Đảm bảo:
- App đang mở và tab đang active
- Console đang mở để xem log
- Listener đã setup (thấy log "✅ Foreground listener setup successfully")

### 2. Backend gửi đến sai token

**Kiểm tra:**
```javascript
// Frontend console
console.log('FCM Token:', localStorage.getItem('fcm_token'));
```

Copy token này và yêu cầu backend log token đang gửi đến:
```javascript
// Backend
console.log('Sending to token:', userToken);
```

Phải GIỐNG NHAU 100%!

### 3. Backend gửi data-only message

Nếu backend chỉ gửi:
```javascript
{
  data: { ... }  // Không có notification
}
```

→ onMessage() sẽ KHÔNG trigger!

**Kiểm tra backend code:**
```javascript
// Phải có cả 2:
const message = {
  notification: {  // ✅ BẮT BUỘC
    title: "...",
    body: "..."
  },
  data: { ... }
};
```

### 4. Firebase config không khớp

**Kiểm tra:**
- `firebase/config.ts` (frontend)
- Backend Firebase Admin config
- Service Worker config

Tất cả phải dùng CÙNG 1 Firebase project!

### 5. Service Worker chặn message

Service Worker có thể xử lý message trước khi đến onMessage().

**Test:**
Tạm thời unregister Service Worker:
```javascript
// Frontend console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
    console.log('Unregistered:', registration);
  });
});
```

Reload page và test lại.

## Test Script cho Backend

Tạo file `test-send-notification.js`:

```javascript
const admin = require('firebase-admin');

// Initialize (nếu chưa)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json'))
  });
}

async function testSendNotification() {
  const token = 'PASTE_FCM_TOKEN_TỪ_FRONTEND_CONSOLE_VÀO_ĐÂY';
  
  const message = {
    notification: {
      title: 'Test từ Backend Script',
      body: 'Nếu nhận được message này, backend hoạt động tốt!'
    },
    data: {
      type: 'system',
      redirect_url: 'app://home',
      test: 'true'
    },
    token: token  // Single token
  };

  console.log('📤 Sending message:');
  console.log(JSON.stringify(message, null, 2));

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Success! Message ID:', response);
  } catch (error) {
    console.error('❌ Error:', error.code, error.message);
    console.error('Full error:', error);
  }
}

testSendNotification();
```

Chạy:
```bash
node test-send-notification.js
```

## Kết quả mong đợi:

### Backend console:
```
📤 Sending message:
{
  "notification": {
    "title": "Test từ Backend Script",
    "body": "Nếu nhận được message này, backend hoạt động tốt!"
  },
  "data": {
    "type": "system",
    "redirect_url": "app://home",
    "test": "true"
  },
  "token": "dcJp0BOR4FAt_PvKi4EqRF:APA91bF..."
}
✅ Success! Message ID: projects/notificationsfe/messages/0:1234567890
```

### Frontend console (PHẢI thấy):
```
🎉🎉🎉 [setupForegroundListener] ===== FOREGROUND MESSAGE RECEIVED! =====
📩 [setupForegroundListener] Full payload: {
  "notification": {
    "title": "Test từ Backend Script",
    "body": "Nếu nhận được message này, backend hoạt động tốt!"
  },
  "data": {
    "type": "system",
    "redirect_url": "app://home",
    "test": "true"
  }
}
```

## Nếu backend thành công nhưng frontend không nhận:

### Kiểm tra 1: Tab có active không?
```javascript
// Frontend console
document.visibilityState  // Phải là "visible"
document.hasFocus()       // Phải là true
```

### Kiểm tra 2: Listener có đang chạy không?
```javascript
// Frontend console
// Phải thấy log này khi vừa login:
"✅ Foreground listener setup successfully"
```

### Kiểm tra 3: Test trực tiếp onMessage
Thêm vào `firebase/config.ts`:
```typescript
// Test listener ngay sau khi init
if (messaging) {
  onMessage(messaging, (payload) => {
    console.log('🔥🔥🔥 DIRECT onMessage triggered!', payload);
    alert('Received notification: ' + payload.notification?.title);
  });
}
```

Nếu alert hiện ra → Listener hoạt động
Nếu không → Có vấn đề với Firebase setup

## Debug Checklist:

- [ ] Backend gửi thành công (có message ID)
- [ ] Token đúng (so sánh backend vs frontend)
- [ ] Format đúng (có cả notification và data)
- [ ] App đang foreground (tab active)
- [ ] Listener đã setup (thấy log)
- [ ] Service Worker không chặn
- [ ] Firebase config khớp
- [ ] Browser hỗ trợ (Chrome/Firefox/Edge)

## Lệnh debug nhanh:

```javascript
// Trong frontend console, chạy:
window.debugNotificationSetup()

// Sẽ hiển thị tất cả thông tin cần thiết
```

## Nếu vẫn không được:

1. Gửi cho tôi:
   - Backend log khi gửi notification
   - Frontend console log đầy đủ
   - FCM token từ frontend
   - Token backend đang gửi đến

2. Hoặc test bằng Firebase Console:
   - Vào Firebase Console → Cloud Messaging
   - Click "Send test message"
   - Paste FCM token
   - Nhập title và body
   - Click Send
   
   Nếu nhận được → Backend có vấn đề
   Nếu không → Frontend có vấn đề
