# 🔧 Troubleshooting & Checklist

## ✅ CHECKLIST HOÀN CHỈNH

### Firebase Setup
- [ ] Tạo iOS app trên Firebase Console
- [ ] Download `GoogleService-Info.plist` và thêm vào Xcode
- [ ] Upload APNs Key (.p8) lên Firebase Console
- [ ] Tạo Android app trên Firebase Console
- [ ] Download `google-services.json` và đặt vào `android/app/`

### iOS Configuration
- [ ] Thêm `[FIRApp configure]` vào AppDelegate
- [ ] Thêm `center.delegate = self` vào AppDelegate
- [ ] Thêm method `willPresentNotification` vào AppDelegate
- [ ] Enable **Push Notifications** capability
- [ ] Enable **Background Modes** → Remote notifications

### Android Configuration
- [ ] Thêm `google-services` plugin vào `build.gradle`
- [ ] Thêm Firebase dependencies
- [ ] Thêm permission `POST_NOTIFICATIONS` vào AndroidManifest

### Code Implementation
- [ ] Cài đặt `@react-native-firebase/app` và `@react-native-firebase/messaging`
- [ ] Tạo `notificationHelper.ts`
- [ ] Implement `registerDeviceToken()`
- [ ] Implement `setupForegroundListener()`
- [ ] Implement `setupBackgroundHandler()`
- [ ] Implement `setupNotificationOpenedListener()`
- [ ] Gọi `registerDeviceToken()` sau khi login
- [ ] Gọi `unregisterDeviceToken()` khi logout

### Testing
- [ ] Test lấy FCM token
- [ ] Test gửi notification từ Firebase Console
- [ ] Test nhận notification khi app đang mở (foreground)
- [ ] Test nhận notification khi app đóng (background)
- [ ] Test click notification để navigate

---

## ❌ CÁC LỖI THƯỜNG GẶP

### 1. iOS Không Nhận Notification

**Nguyên nhân:**
- Chưa upload APNs Key lên Firebase
- Bundle ID không khớp
- Chưa enable Push Notifications capability
- Test trên simulator (simulator không nhận push)

**Giải pháp:**
```bash
# Kiểm tra Bundle ID
open ios/YourApp.xcworkspace
# Xcode → General → Bundle Identifier

# Kiểm tra APNs Key trên Firebase Console
# Project Settings → Cloud Messaging → Apple app configuration
```

**Test trên thiết bị thật:**
- Simulator KHÔNG nhận được push notification
- Phải test trên iPhone/iPad thật

### 2. Android Không Nhận Notification

**Nguyên nhân:**
- File `google-services.json` sai vị trí
- Package name không khớp
- Chưa request permission (Android 13+)

**Giải pháp:**
```bash
# Kiểm tra file google-services.json
ls -la android/app/google-services.json

# Kiểm tra package name
cat android/app/build.gradle | grep applicationId

# Request permission (Android 13+)
# Đã có trong requestNotificationPermission()
```

### 3. Không Lấy Được FCM Token

**Nguyên nhân:**
- Firebase chưa được khởi tạo đúng
- Chưa request permission
- Network issue

**Giải pháp:**
```typescript
// Kiểm tra permission
const authStatus = await messaging().requestPermission();
console.log('Permission status:', authStatus);

// Kiểm tra token
const token = await messaging().getToken();
console.log('FCM Token:', token);
```

### 4. Foreground Listener Không Trigger

**Nguyên nhân:**
- Backend gửi sai format (chỉ có `data`, không có `notification`)
- Listener chưa được setup

**Giải pháp:**
```typescript
// Backend PHẢI gửi với format:
{
  "notification": {  // ← BẮT BUỘC
    "title": "Tiêu đề",
    "body": "Nội dung"
  },
  "data": {
    "type": "system"
  }
}

// Setup listener trong App.tsx
useEffect(() => {
  const unsubscribe = setupForegroundListener((payload) => {
    console.log('Received:', payload);
  });
  return () => unsubscribe?.();
}, []);
```

### 5. Background Notification Không Hiển Thị

**Nguyên nhân:**
- iOS: Chưa enable Background Modes
- Android: App bị kill bởi battery optimization

**Giải pháp iOS:**
```
Xcode → Target → Signing & Capabilities
→ Background Modes → ✅ Remote notifications
```

**Giải pháp Android:**
```
Settings → Apps → Your App → Battery
→ Unrestricted (hoặc tắt battery optimization)
```

### 6. Token Không Được Lưu Lên Backend

**Nguyên nhân:**
- API endpoint sai
- Auth token không hợp lệ
- Network error

**Giải pháp:**
```typescript
// Kiểm tra API endpoint
console.log('API URL:', apiClient.defaults.baseURL);

// Kiểm tra auth token
const token = await AsyncStorage.getItem('auth_token');
console.log('Auth token:', token);

// Kiểm tra response
try {
  const response = await apiClient.post('/users/device-token', {
    token: fcmToken,
    platform: Platform.OS
  });
  console.log('Response:', response.data);
} catch (error) {
  console.error('Error:', error.response?.data);
}
```

---

## 🔍 DEBUG TIPS

### 1. Enable Debug Logging

```typescript
// Trong App.tsx
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📩 Background:', JSON.stringify(remoteMessage, null, 2));
});
```

### 2. Kiểm Tra Permission

```typescript
const checkPermission = async () => {
  const authStatus = await messaging().requestPermission();
  console.log('Permission:', authStatus);
  
  // iOS
  // 0 = NotDetermined
  // 1 = Denied
  // 2 = Authorized
  // 3 = Provisional
  
  // Android
  // 1 = Authorized
};
```

### 3. Kiểm Tra Token

```typescript
const checkToken = async () => {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  console.log('Token length:', token?.length);
};
```

### 4. Test Notification Format

```bash
# Gửi test từ backend
curl -X POST https://your-api.com/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_FCM_TOKEN"
  }'
```

---

## 📱 SO SÁNH VỚI REACTJS

| Feature | ReactJS | React Native |
|---------|---------|--------------|
| **Firebase SDK** | `firebase` | `@react-native-firebase/app` |
| **Messaging** | `firebase/messaging` | `@react-native-firebase/messaging` |
| **Service Worker** | `firebase-messaging-sw.js` | Không cần |
| **VAPID Key** | Cần | Không cần |
| **Permission** | `Notification.requestPermission()` | `messaging().requestPermission()` |
| **Get Token** | `getToken(messaging, {vapidKey})` | `messaging().getToken()` |
| **Foreground** | `onMessage(messaging, callback)` | `messaging().onMessage(callback)` |
| **Background** | Service Worker | `setBackgroundMessageHandler()` |
| **Notification Click** | Service Worker event | `onNotificationOpenedApp()` |

---

## 🎯 BEST PRACTICES

### 1. Request Permission Đúng Lúc

```typescript
// ❌ SAI: Request ngay khi app khởi động
useEffect(() => {
  requestNotificationPermission();
}, []);

// ✅ ĐÚNG: Request sau khi user login
const handleLogin = async () => {
  await login();
  await requestNotificationPermission();
};
```

### 2. Handle Token Refresh

```typescript
// Token có thể thay đổi
useEffect(() => {
  const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
    console.log('Token refreshed:', newToken);
    // Update backend
    await apiClient.post('/users/device-token', {
      token: newToken,
      platform: Platform.OS
    });
  });

  return () => unsubscribe();
}, []);
```

### 3. Cleanup Khi Unmount

```typescript
useEffect(() => {
  const unsubscribeForeground = setupForegroundListener(callback);
  const unsubscribeOpened = setupNotificationOpenedListener(callback);

  return () => {
    unsubscribeForeground?.();
    unsubscribeOpened?.();
  };
}, []);
```

### 4. Error Handling

```typescript
export async function registerDeviceToken(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      // Hiển thị dialog giải thích tại sao cần permission
      Alert.alert(
        'Cần quyền thông báo',
        'Để nhận thông báo về bài viết mới, vui lòng cấp quyền thông báo',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Cài đặt', onPress: () => Linking.openSettings() }
        ]
      );
      return null;
    }

    const fcmToken = await getFCMToken();
    // ... rest of code
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:

1. Kiểm tra logs trong console
2. Kiểm tra Firebase Console → Cloud Messaging
3. Test với Firebase Console test message
4. Kiểm tra backend logs
5. Đọc lại checklist ở trên

**Chúc bạn thành công! 🚀**
