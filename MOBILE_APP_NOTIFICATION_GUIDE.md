# 📱 Hướng Dẫn Push Notification Cho Mobile App

## � Cấu Hìnht Firebase

### 1. Tạo Project Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → Nhập tên project
3. Tắt Google Analytics (không bắt buộc) → **Create project**

### 2. Lấy Config Cho Mobile

**iOS:**
1. Click **Add app** → Chọn **iOS**
2. Nhập **iOS bundle ID** (từ Xcode)
3. Download `GoogleService-Info.plist`

**Android:**
1. Click **Add app** → Chọn **Android**
2. Nhập **Android package name** (từ `build.gradle`)
3. Download `google-services.json`

### 3. Lấy VAPID Key (Cho Web)

1. **Project Settings** (⚙️) → **Cloud Messaging**
2. Scroll xuống **Web configuration**
3. Click **Generate key pair**
4. Copy VAPID key

### 4. Upload APNs Key (iOS)

1. Vào [Apple Developer](https://developer.apple.com/)
2. **Certificates, Identifiers & Profiles** → **Keys**
3. Click **+** → Enable **Apple Push Notifications service (APNs)**
4. Download `.p8` file
5. Quay lại Firebase Console → **Cloud Messaging** → **Apple app configuration**
6. Upload APNs Key (.p8) + nhập Key ID và Team ID

---

## 🚀 React Native

### 1. Cài Đặt

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
cd ios && pod install && cd ..
```

### 2. Cấu Hình Firebase

**iOS:**
- Download `GoogleService-Info.plist` → Thêm vào Xcode project
- Upload APNs Key lên Firebase Console (Cloud Messaging settings)

**Android:**
- Download `google-services.json` → Đặt vào `android/app/`
- Thêm vào `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 3. Code Nhận Thông Báo

**File: `utils/notificationHelper.js`**

```javascript
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

const API_URL = 'https://your-api.com/api';

// Request permission
export async function requestPermission() {
  const authStatus = await messaging().requestPermission();
  return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
}

// Get FCM token
export async function getFCMToken() {
  return await messaging().getToken();
}

// Register token
export async function registerToken(authToken) {
  const hasPermission = await requestPermission();
  if (!hasPermission) return null;

  const fcmToken = await getFCMToken();
  
  await axios.post(`${API_URL}/users/device-token`, {
    token: fcmToken,
    platform: Platform.OS
  }, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  return fcmToken;
}

// Setup listeners
export function setupNotifications(onReceive) {
  // Foreground
  messaging().onMessage(async (message) => {
    console.log('📩 Foreground:', message);
    if (onReceive) onReceive(message);
  });

  // Background
  messaging().setBackgroundMessageHandler(async (message) => {
    console.log('📩 Background:', message);
  });

  // Notification opened
  messaging().onNotificationOpenedApp((message) => {
    console.log('📩 Opened:', message);
    // Navigate to screen
  });
}
```

### 4. Tích Hợp Vào App

**File: `App.js`**

```javascript
import { useEffect } from 'react';
import { registerToken, setupNotifications } from './utils/notificationHelper';

function App() {
  useEffect(() => {
    const authToken = getAuthToken(); // Từ AsyncStorage
    
    if (authToken) {
      registerToken(authToken);
      setupNotifications((message) => {
        // Hiển thị notification
        console.log('Received:', message);
      });
    }
  }, []);

  return <YourApp />;
}
```

---

## 🎨 Flutter

### 1. Cài Đặt

**File: `pubspec.yaml`**

```yaml
dependencies:
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.0
```

```bash
flutter pub get
```

### 2. Cấu Hình Firebase

**iOS:**
- Download `GoogleService-Info.plist` → Thêm vào `ios/Runner/`
- Upload APNs Key lên Firebase Console

**Android:**
- Download `google-services.json` → Đặt vào `android/app/`

### 3. Code Nhận Thông Báo

**File: `lib/services/notification_service.dart`**

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class NotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  // Initialize
  static Future<void> initialize() async {
    // Request permission
    await _messaging.requestPermission();

    // Setup handlers
    FirebaseMessaging.onMessage.listen((message) {
      print('📩 Foreground: ${message.notification?.title}');
    });

    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      print('📩 Opened: ${message.data}');
      // Navigate to screen
    });
  }

  // Get token
  static Future<String?> getToken() async {
    return await _messaging.getToken();
  }

  // Register token
  static Future<void> registerToken(String authToken) async {
    String? fcmToken = await getToken();
    
    await http.post(
      Uri.parse('https://your-api.com/api/users/device-token'),
      headers: {
        'Authorization': 'Bearer $authToken',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'token': fcmToken, 'platform': 'mobile'}),
    );
  }
}
```

### 4. Tích Hợp Vào App

**File: `lib/main.dart`**

```dart
import 'package:firebase_core/firebase_core.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await NotificationService.initialize();
  runApp(MyApp());
}
```

---

## 🌐 Frontend Web (React)

### 1. Cài Đặt

```bash
npm install firebase
```

### 2. Cấu Hình Firebase

**File: `src/firebase/config.js`**

```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCJ6hT8kjwgFZfXnpRP17hd0rO4qsWgv7I",
  authDomain: "notification-4a444.firebaseapp.com",
  projectId: "notification-4a444",
  storageBucket: "notification-4a444.firebasestorage.app",
  messagingSenderId: "297952994832",
  appId: "1:297952994832:web:49baf0ee7ef1c58ecb0c95"
};

const VAPID_KEY = "BPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage, VAPID_KEY };
```

### 3. Service Worker

**File: `public/firebase-messaging-sw.js`**

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCJ6hT8kjwgFZfXnpRP17hd0rO4qsWgv7I",
  authDomain: "notification-4a444.firebaseapp.com",
  projectId: "notification-4a444",
  storageBucket: "notification-4a444.firebasestorage.app",
  messagingSenderId: "297952994832",
  appId: "1:297952994832:web:49baf0ee7ef1c58ecb0c95"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);
  
  const title = payload.notification?.title || 'Thông báo mới';
  const options = {
    body: payload.notification?.body || '',
    icon: '/logo192.png',
    data: payload.data
  };

  self.registration.showNotification(title, options);
});
```

### 4. Code Nhận Thông Báo

**File: `src/utils/notificationHelper.js`**

```javascript
import { messaging, getToken, onMessage, VAPID_KEY } from '../firebase/config';
import axios from 'axios';

// Request permission
export async function requestPermission() {
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Get FCM token
export async function getFCMToken() {
  const token = await getToken(messaging, { vapidKey: VAPID_KEY });
  return token;
}

// Register token
export async function registerToken(authToken) {
  const hasPermission = await requestPermission();
  if (!hasPermission) return null;

  const fcmToken = await getFCMToken();
  
  await axios.post('/api/users/device-token', {
    token: fcmToken,
    platform: 'web'
  }, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  return fcmToken;
}

// Setup foreground listener
export function setupForegroundListener(callback) {
  return onMessage(messaging, (payload) => {
    console.log('📩 Foreground:', payload);
    if (callback) callback(payload);
  });
}
```

### 5. Tích Hợp Vào App

**File: `src/App.js`**

```javascript
import { useEffect } from 'react';
import { registerToken, setupForegroundListener } from './utils/notificationHelper';

function App() {
  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    
    if (authToken) {
      registerToken(authToken);
      
      const unsubscribe = setupForegroundListener((payload) => {
        console.log('Received:', payload);
        // Hiển thị notification popup
      });

      return () => unsubscribe && unsubscribe();
    }
  }, []);

  return <YourApp />;
}
```

---

## 🧪 Testing

### 1. Kiểm tra token

```javascript
// Web
const token = await getFCMToken();
console.log('Token:', token);

// React Native
const token = await messaging().getToken();
console.log('Token:', token);

// Flutter
String? token = await FirebaseMessaging.instance.getToken();
print('Token: $token');
```

### 2. Gửi test notification từ Firebase Console

1. Vào **Firebase Console** → **Cloud Messaging**
2. Click **Send your first message**
3. Nhập tiêu đề và nội dung
4. Click **Send test message**
5. Paste FCM token → Click **Test**

---

## ✅ Checklist

**Firebase Setup:**
- [ ] Tạo Firebase project
- [ ] Download config files (GoogleService-Info.plist, google-services.json)
- [ ] Lấy VAPID key (cho web)
- [ ] Upload APNs key (cho iOS)

**Code Setup:**
- [ ] Cài đặt Firebase SDK
- [ ] Cấu hình Firebase config
- [ ] Request notification permission
- [ ] Get FCM token
- [ ] Register token với backend khi login
- [ ] Setup foreground listener
- [ ] Setup background handler

**Testing:**
- [ ] Test nhận notification (foreground)
- [ ] Test nhận notification (background)
- [ ] Test navigation từ notification

---

## 🔍 Troubleshooting

**Web không nhận notification:**
- Service Worker phải ở `public/firebase-messaging-sw.js`
- Chỉ hoạt động trên HTTPS hoặc localhost
- Kiểm tra permission: `Notification.permission === 'granted'`

**iOS không nhận notification:**
- Upload APNs Key lên Firebase Console
- Kiểm tra Bundle ID khớp với Firebase
- Test trên thiết bị thật (simulator không nhận push)

**Android không nhận notification:**
- Kiểm tra `google-services.json` đúng vị trí
- Request permission `POST_NOTIFICATIONS` (Android 13+)
- Kiểm tra package name khớp với Firebase

**Firebase config sai:**
- Config ở `firebase/config.js` và `firebase-messaging-sw.js` phải GIỐNG NHAU
- Kiểm tra `apiKey`, `projectId`, `messagingSenderId`, `appId`

---

**Chúc bạn thành công! 🚀**
