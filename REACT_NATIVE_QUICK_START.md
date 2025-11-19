# 🚀 React Native Push Notification - Quick Start

> **Hướng dẫn nhanh để áp dụng hệ thống thông báo từ ReactJS sang React Native**

## 📋 TÓM TẮT HỆ THỐNG

### Firebase Config Của Bạn
```
Project: notification-4a444
API Key: AIzaSyCJ6hT8kjwgFZfXnpRP17hd0rO4qsWgv7I
Sender ID: 297952994832
```

### Backend API
- `POST /users/device-token` - Đăng ký token
- `DELETE /users/device-token` - Xóa token
- `GET /notifications` - Lấy danh sách
- `PUT /notifications/:id/read` - Đánh dấu đã đọc

---

## ⚡ 5 BƯỚC NHANH

### 1️⃣ Cài Đặt (2 phút)

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
cd ios && pod install && cd ..
```

### 2️⃣ Cấu Hình Firebase (5 phút)


**Android:**
1. Firebase Console → Add Android app
2. Download `google-services.json` → Copy vào `android/app/`
3. Thêm plugin vào `android/app/build.gradle`:
```gradle
apply plugin: "com.google.gms.google-services"
```

### 3️⃣ Cấu Hình Native (5 phút)

**iOS - AppDelegate.mm:**
```objc
#import <Firebase.h>
#import <UserNotifications/UserNotifications.h>

- (BOOL)application:(UIApplication *)application 
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  UNUserNotificationCenter.currentNotificationCenter.delegate = self;
  // ... rest
}
```

**Android - AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### 4️⃣ Copy Code (3 phút)

**File: `src/utils/notificationHelper.ts`**

```typescript
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { apiClient } from '../services/apiClient';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
           authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  } else if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

export async function getFCMToken(): Promise<string | null> {
  return await messaging().getToken();
}

export async function registerDeviceToken(): Promise<string | null> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return null;

  const fcmToken = await getFCMToken();
  if (!fcmToken) return null;

  await apiClient.post('/users/device-token', {
    token: fcmToken,
    platform: Platform.OS
  });

  return fcmToken;
}

export async function unregisterDeviceToken(): Promise<void> {
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
    await apiClient.delete('/users/device-token', { data: { token: fcmToken } });
    await messaging().deleteToken();
  }
}

export function setupForegroundListener(callback?: (payload: any) => void) {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('📩 Foreground:', remoteMessage);
    if (callback) callback(remoteMessage);
  });
}

export function setupBackgroundHandler(): void {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📩 Background:', remoteMessage);
  });
}

export function setupNotificationOpenedListener(callback?: (payload: any) => void) {
  messaging().getInitialNotification().then((remoteMessage) => {
    if (remoteMessage && callback) callback(remoteMessage);
  });

  return messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('📩 Opened:', remoteMessage);
    if (callback) callback(remoteMessage);
  });
}
```

### 5️⃣ Tích Hợp Vào App (5 phút)

**File: `App.tsx`**

```typescript
import React, { useEffect } from 'react';
import {
  registerDeviceToken,
  setupForegroundListener,
  setupBackgroundHandler,
  setupNotificationOpenedListener,
} from './utils/notificationHelper';

function App() {
  useEffect(() => {
    // Setup background handler
    setupBackgroundHandler();

    // Register token
    registerDeviceToken();

    // Setup listeners
    const unsubscribeForeground = setupForegroundListener((payload) => {
      console.log('Received:', payload);
      // Hiển thị popup
    });

    const unsubscribeOpened = setupNotificationOpenedListener((payload) => {
      console.log('Navigate to:', payload.data?.redirect_url);
      // Navigate
    });

    return () => {
      unsubscribeForeground?.();
      unsubscribeOpened?.();
    };
  }, []);

  return <YourApp />;
}
```

**Login Screen:**

```typescript
import { registerDeviceToken } from './utils/notificationHelper';

const handleLogin = async () => {
  await login(username, password);
  await registerDeviceToken(); // ← Thêm dòng này
  navigation.navigate('Home');
};
```

**Logout:**

```typescript
import { unregisterDeviceToken } from './utils/notificationHelper';

const handleLogout = async () => {
  await unregisterDeviceToken(); // ← Thêm dòng này
  await AsyncStorage.removeItem('auth_token');
  navigation.navigate('Login');
};
```

---

## ✅ CHECKLIST

- [ ] Cài đặt packages
- [ ] Thêm `GoogleService-Info.plist` (iOS)
- [ ] Thêm `google-services.json` (Android)
- [ ] Upload APNs Key lên Firebase (iOS)
- [ ] Cấu hình AppDelegate (iOS)
- [ ] Thêm permission (Android)
- [ ] Copy `notificationHelper.ts`
- [ ] Setup trong `App.tsx`
- [ ] Gọi `registerDeviceToken()` sau login
- [ ] Gọi `unregisterDeviceToken()` khi logout

---

## 🧪 TEST NHANH

### 1. Lấy FCM Token

```typescript
import { getFCMToken } from './utils/notificationHelper';

getFCMToken().then(token => {
  console.log('Token:', token);
});
```

### 2. Gửi Test Từ Firebase Console

1. Firebase Console → Cloud Messaging
2. Send test message
3. Paste token → Test

### 3. Kiểm Tra Log

**Foreground (app đang mở):**
```
📩 Foreground: {
  notification: { title: "Test", body: "Test" },
  data: { type: "system" }
}
```

**Background (app đóng):**
```
📩 Background: { ... }
```

**Opened (click notification):**
```
📩 Opened: { ... }
```

---



### Android 13+ Cần Request Permission

```typescript
// Đã có trong requestNotificationPermission()
if (Platform.Version >= 33) {
  await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
}
```

test 
 {{baseURL}}/api/notifications


  {
    "recipient_id": "cdca3dfb-49df-47e3-91ef-f04631782e55",
    "audience": "user",
    "type": "community",
    "title": "❤️ John Doe đã thích bài viết của bạn",
    "content": {
      "message": "John Doe đã thích bài viết \"Cách học tiếng Trung hiệu quả\""
    },
    "redirect_type": "achievement",
    "data": {
      "post_id": "660e8400-e29b-41d4-a716-446655440001",
      "post_title": "Cách học tiếng Trung hiệu quả",
      "liker_id": "770e8400-e29b-41d4-a716-446655440002",
      "liker_name": "John Doe",
      "liker_avatar": "https://example.com/avatar.jpg"
    },
    "priority": 1
  }

  app fe nhận được thông báo

      const unsubscribeForeground = setupForegroundListener((payload) => {
      console.log('Received:', payload);
      // Hiển thị popup
    });

    const unsubscribeOpened = setupNotificationOpenedListener((payload) => {
      console.log('Navigate to:', payload.data?.redirect_url);
      // Navigate
    });