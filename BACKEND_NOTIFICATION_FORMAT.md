# Backend: Cách gửi Notification đúng format

## ⚠️ QUAN TRỌNG: Format notification

Để frontend nhận được notification khi app đang MỞ (foreground), backend PHẢI gửi với format:

```json
{
  "notification": {
    "title": "Tiêu đề thông báo",
    "body": "Nội dung thông báo"
  },
  "data": {
    "type": "community",
    "redirect_url": "app://post/123",
    "notification_id": "abc123",
    "post_id": "123"
  },
  "token": "FCM_TOKEN_CỦA_USER"
}
```

## ❌ SAI - Chỉ gửi data

```json
{
  "data": {
    "title": "Test",
    "body": "Test"
  },
  "token": "..."
}
```

→ **onMessage() sẽ KHÔNG trigger!** Chỉ Service Worker nhận được.

## ✅ ĐÚNG - Có cả notification và data

```json
{
  "notification": {
    "title": "Test",
    "body": "Test"
  },
  "data": {
    "type": "system"
  },
  "token": "..."
}
```

→ **onMessage() sẽ trigger!** Frontend nhận được và hiển thị popup.

## Code mẫu Backend (Node.js)

### Sử dụng Firebase Admin SDK

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Gửi notification
async function sendNotification(userToken, title, body, data = {}) {
  const message = {
    notification: {
      title: title,
      body: body
    },
    data: {
      ...data,
      // Đảm bảo tất cả values là string
      type: data.type || 'system',
      redirect_url: data.redirect_url || 'app://home',
      notification_id: data.notification_id || ''
    },
    token: userToken
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
}

// Ví dụ sử dụng
sendNotification(
  'dcJp0BOR4FAt_PvKi4EqRF:APA91bF...',
  'Bài viết mới',
  'Có người đã comment vào bài viết của bạn',
  {
    type: 'community',
    redirect_url: 'app://post/123',
    post_id: '123'
  }
);
```

## Các loại notification

### 1. Community (Bài viết, Comment)
```json
{
  "notification": {
    "title": "Bài viết mới",
    "body": "Có người đã comment vào bài viết của bạn"
  },
  "data": {
    "type": "community",
    "redirect_url": "app://post/123",
    "post_id": "123"
  }
}
```

### 2. Achievement (Thành tích)
```json
{
  "notification": {
    "title": "Thành tích mới",
    "body": "Bạn đã đạt được thành tích 'Người học chăm chỉ'"
  },
  "data": {
    "type": "achievement",
    "redirect_url": "app://achievements",
    "achievement_id": "456"
  }
}
```

### 3. Subscription (Gói đăng ký)
```json
{
  "notification": {
    "title": "Gói Premium",
    "body": "Gói Premium của bạn sắp hết hạn"
  },
  "data": {
    "type": "subscription",
    "redirect_url": "app://subscriptions"
  }
}
```

### 4. System (Hệ thống)
```json
{
  "notification": {
    "title": "Thông báo hệ thống",
    "body": "Hệ thống sẽ bảo trì vào 2h sáng mai"
  },
  "data": {
    "type": "system",
    "redirect_url": "app://home"
  }
}
```

## API Endpoint mẫu

```javascript
// POST /api/notifications/send
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { userId, title, body, type, redirectUrl } = req.body;

    // 1. Lấy FCM token của user từ database
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      return res.status(404).json({ error: 'User or FCM token not found' });
    }

    // 2. Tạo notification record trong database
    const notification = await Notification.create({
      userId,
      title,
      content: { message: body },
      type,
      redirect_url: redirectUrl,
      is_read: false
    });

    // 3. Gửi push notification qua Firebase
    const message = {
      notification: {
        title: title,
        body: body
      },
      data: {
        type: type,
        redirect_url: redirectUrl,
        notification_id: notification.id.toString()
      },
      token: user.fcmToken
    };

    await admin.messaging().send(message);

    res.json({ success: true, notificationId: notification.id });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});
```

## Test Endpoint

```javascript
// POST /api/notifications/test
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;

    const message = {
      notification: {
        title: 'Test Notification',
        body: 'Đây là test notification từ backend'
      },
      data: {
        type: 'system',
        redirect_url: 'app://home'
      },
      token: token
    };

    const response = await admin.messaging().send(message);
    
    res.json({ 
      success: true, 
      messageId: response,
      message: 'Test notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ 
      error: 'Failed to send test notification',
      details: error.message 
    });
  }
});
```

## Debugging

### Log cần có trong backend:

```javascript
console.log('📤 Sending notification to token:', userToken);
console.log('📤 Notification payload:', JSON.stringify(message, null, 2));

try {
  const response = await admin.messaging().send(message);
  console.log('✅ Firebase response:', response);
} catch (error) {
  console.error('❌ Firebase error:', error.code, error.message);
  console.error('❌ Error details:', error);
}
```

### Các lỗi thường gặp:

1. **Invalid token**: Token không đúng hoặc đã expire
2. **Invalid argument**: Format message sai
3. **Sender ID mismatch**: Firebase config không khớp
4. **Permission denied**: Service account không có quyền

## Kiểm tra

1. Copy FCM token từ frontend console:
```
📱 FCM Token: dcJp0BOR4FAt_PvKi4EqRF:APA91bF...
```

2. Gọi API test:
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "token": "dcJp0BOR4FAt_PvKi4EqRF:APA91bF..."
  }'
```

3. Kiểm tra frontend console, phải thấy:
```
🎉🎉🎉 [setupForegroundListener] ===== FOREGROUND MESSAGE RECEIVED! =====
```

Nếu không thấy → Backend gửi sai format!
