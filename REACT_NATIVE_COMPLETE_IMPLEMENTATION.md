# 📱 Hướng Dẫn Chi Tiết: Áp Dụng Hệ Thống Thông Báo Cho React Native

> **Dựa trên hệ thống ReactJS hiện tại của bạn**

## 📊 Phân Tích Hệ Thống Hiện Tại

### Hệ Thống ReactJS Của Bạn

**Firebase Config:**
```javascript
{
  apiKey: "AIzaSyCJ6hT8kjwgFZfXnpRP17hd0rO4qsWgv7I",
  authDomain: "notification-4a444.firebaseapp.com",
  projectId: "notification-4a444",
  storageBucket: "notification-4a444.firebasestorage.app",
  messagingSenderId: "297952994832",
  appId: "1:297952994832:web:49baf0ee7ef1c58ecb0c95",
  measurementId: "G-EKPEW65PHB"
}
```

**VAPID Key:** `BJlW0fZ8fxWt8fiJImLGrcx6YtaGscO84g-vq3jAPnEE1je1JZeeyKmgUv03XRNTNdaVy9SQzL-bkVZLKbETywo`

**Backend API:**
- Register token: `POST /users/device-token`
- Unregister token: `DELETE /users/device-token`
- Get notifications: `GET /notifications`
- Mark as read: `PUT /notifications/:id/read`

**Notification Format:**
```json
{
  "notification": {
    "title": "Tiêu đề",
    "body": "Nội dung"
  },
  "data": {
    "type": "community|achievement|subscription|system",
    "redirect_url": "app://post/123",
    "notification_id": "abc123",
    "post_id": "123"
  }
}
```

---

## 🚀 PHẦN 1: CÀI ĐẶT VÀ CẤU HÌNH

### Bước 1.1: Cài Đặt Dependencies

```bash
# Cài đặt React Native Firebase
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging

# Hoặc yarn
yarn add @react-native-firebase/app
yarn add @react-native-firebase/messaging
