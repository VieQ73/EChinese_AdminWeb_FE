# Debug Notification Issues

## Vấn đề hiện tại
- Listener đã setup thành công
- FCM token đã đăng ký
- Nhưng khi backend gửi notification, callback không được gọi

## Các bước debug

### 1. Kiểm tra trong Console
Sau khi login, bạn sẽ thấy các log:
```
✅ Setting up foreground listener...
✅ Foreground listener setup successfully
```

### 2. Test notification thủ công
Trong browser console, chạy:
```javascript
window.testNotification()
```

Nếu popup hiện ra → Code frontend hoạt động tốt
Nếu không hiện → Có lỗi trong code

### 3. Kiểm tra format notification từ backend

Backend PHẢI gửi notification với format:
```json
{
  "notification": {
    "title": "Tiêu đề",
    "body": "Nội dung"
  },
  "data": {
    "type": "community",
    "redirect_url": "app://post/123",
    "notification_id": "abc123"
  },
  "token": "FCM_TOKEN_CỦA_USER"
}
```

### 4. Kiểm tra Firebase Console

Vào Firebase Console → Cloud Messaging → Send test message:
- Nhập FCM token (copy từ console log)
- Nhập title và body
- Thêm custom data nếu cần
- Click Send

Nếu nhận được notification → Firebase hoạt động tốt
Nếu không → Có vấn đề với Firebase config

### 5. Kiểm tra Service Worker

Trong Chrome DevTools:
- Application tab → Service Workers
- Kiểm tra xem `firebase-messaging-sw.js` có đang active không
- Click "Update" để reload service worker

### 6. Kiểm tra Permission

```javascript
// Trong console
Notification.permission
// Phải trả về "granted"
```

### 7. Kiểm tra Network

- Mở Network tab
- Filter: `fcm`
- Xem có request nào đến Firebase không khi backend gửi notification

## Các lỗi thường gặp

### Lỗi 1: Backend gửi sai format
Backend gửi:
```json
{
  "title": "Test",  // ❌ SAI
  "body": "Test"
}
```

Phải gửi:
```json
{
  "notification": {  // ✅ ĐÚNG
    "title": "Test",
    "body": "Test"
  }
}
```

### Lỗi 2: Backend gửi data-only message
Nếu backend chỉ gửi `data` mà không có `notification`:
```json
{
  "data": {
    "title": "Test",
    "body": "Test"
  }
}
```

→ onMessage() sẽ KHÔNG trigger khi app đang foreground!

### Lỗi 3: Service Worker chặn message
Nếu Service Worker xử lý message trước, có thể nó không đến onMessage()

### Lỗi 4: Token không đúng
Backend gửi đến token cũ hoặc token của device khác

## Giải pháp

### Nếu backend gửi data-only message:

Sửa `setupForegroundListener` để lắng nghe cả data message:

```typescript
// Thêm vào firebase-messaging-sw.js
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'FCM_MESSAGE') {
    // Forward to app
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage(event.data);
      });
    });
  }
});
```

### Nếu muốn test ngay:

1. Mở Console
2. Chạy:
```javascript
// Giả lập nhận notification từ Firebase
const testPayload = {
  notification: {
    title: 'Test từ Console',
    body: 'Đây là test notification'
  },
  data: {
    type: 'system',
    redirect_url: 'app://home'
  }
};

// Trigger callback trực tiếp
window.testNotification();
```

## Log cần xem

Khi backend gửi notification, bạn PHẢI thấy log:
```
🎉🎉🎉 [setupForegroundListener] ===== FOREGROUND MESSAGE RECEIVED! =====
📩 [setupForegroundListener] Full payload: {...}
```

Nếu KHÔNG thấy log này → Notification không đến được onMessage()

Nguyên nhân có thể:
1. Backend gửi sai format (chỉ có data, không có notification)
2. Backend gửi đến sai token
3. Service Worker chặn message
4. Firebase config sai
5. App đang ở background (không phải foreground)

## Cách kiểm tra backend

Yêu cầu backend log:
1. Token đang gửi đến
2. Payload đang gửi
3. Response từ Firebase

So sánh token backend gửi với token trong console log:
```
📱 FCM Token: dcJp0BOR4FAt_PvKi4EqRF:APA91bF...
```

Phải GIỐNG NHAU 100%!
