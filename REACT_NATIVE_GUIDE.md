# 📱 Hướng Dẫn Áp Dụng Hệ Thống Thông Báo Cho React Native

## 📊 PHÂN TÍCH HỆ THỐNG HIỆN TẠI

### Firebase Configuration
```javascript
Project ID: notification-4a444
API Key: AIzaSyCJ6hT8kjwgFZfXnpRP17hd0rO4qsWgv7I
Messaging Sender ID: 297952994832
App ID: 1:297952994832:web:49baf0ee7ef1c58ecb0c95
```

### Backend API Endpoints
- `POST /users/device-token` - Đăng ký FCM token
- `DELETE /users/device-token` - Xóa FCM token (logout)
- `GET /notifications` - Lấy danh sách thông báo
- `PUT /notifications/:id/read` - Đánh dấu đã đọc

### Format Thông Báo
```json
{
  "notification": {
    "title": "Tiêu đề",
    "body": "Nội dung"
  },
  "data": {
    "type": "community|achievement|subscription|system",
    "redirect_url": "app://post/123",
    "notification_id": "abc123"
  }
}
```

---

## 🔧 PHẦN 1: CÀI ĐẶT

### Bước 1: Cài Dependencies

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
# hoặc
yarn add @react-native-firebase/app @react-native-firebase/messaging

# iOS only
cd ios && pod install && cd ..
```

---

## 📱 PHẦN 2: CẤU HÌNH iOS

### Bước 2.1: Tạo iOS App Trên Firebase

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project **notification-4a444**
3. Click **Add app** → Chọn **iOS**
4. Nhập **iOS bundle ID** (lấy từ Xcode: General → Bundle Identifier)
   - Ví dụ: `com.yourcompany.yourapp`
5. Download file `GoogleService-Info.plist`

### Bước 2.2: Thêm GoogleService-Info.plist

```bash
# Copy file vào thư mục ios
cp GoogleService-Info.plist ios/YourApp/
```

Hoặc dùng Xcode:
1. Mở `ios/YourApp.xcworkspace`
2. Kéo file `GoogleService-Info.plist` vào project
3. ✅ Check "Copy items if needed"
4. ✅ Chọn target YourApp

### Bước 2.3: Cấu Hình AppDelegate

**File: `ios/YourApp/AppDelegate.mm`**

```objc
#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <Firebase.h>  // ← THÊM
#import <UserNotifications/UserNotifications.h>  // ← THÊM

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application 
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Initialize Firebase
  [FIRApp configure];  // ← THÊM
  
  // Request notification permission
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;  // ← THÊM
  
  self.moduleName = @"YourApp";
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// ← THÊM: Hiển thị notification khi app đang mở
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | 
                    UNNotificationPresentationOptionAlert | 
                    UNNotificationPresentationOptionBadge);
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
```

### Bước 2.4: Cấu Hình Capabilities

1. Mở Xcode → Chọn project → Target **YourApp**
2. Tab **Signing & Capabilities**
3. Click **+ Capability**
4. Thêm **Push Notifications** ✅
5. Thêm **Background Modes** ✅
   - Check **Remote notifications** ✅

### Bước 2.5: Upload APNs Key Lên Firebase

1. Vào [Apple Developer](https://developer.apple.com/)
2. **Certificates, Identifiers & Profiles** → **Keys**
3. Click **+** tạo key mới
4. Đặt tên: "Push Notification Key"
5. ✅ Check **Apple Push Notifications service (APNs)**
6. Click **Continue** → **Register**
7. Download file `.p8` và **lưu Key ID** (vd: ABC123XYZ)

8. Quay lại Firebase Console:
   - **Project Settings** → **Cloud Messaging**
   - Scroll xuống **Apple app configuration**
   - Click **Upload** ở APNs Authentication Key
   - Upload file `.p8`
   - Nhập **Key ID** và **Team ID** (từ Apple Developer)

---

## 🤖 PHẦN 3: CẤU HÌNH ANDROID

### Bước 3.1: Tạo Android App Trên Firebase

1. Vào Firebase Console → Project **notification-4a444**
2. Click **Add app** → Chọn **Android**
3. Nhập **Android package name** (từ `android/app/build.gradle`)
   - Ví dụ: `com.yourcompany.yourapp`
4. Download file `google-services.json`

### Bước 3.2: Thêm google-services.json

```bash
# Copy file vào thư mục android/app
cp google-services.json android/app/
```

### Bước 3.3: Cấu Hình build.gradle

**File: `android/build.gradle`**

```gradle
buildscript {
    ext {
        buildToolsVersion = "33.0.0"
        minSdkVersion = 21
        compileSdkVersion = 33
        targetSdkVersion = 33
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("com.google.gms:google-services:4.4.0")  // ← THÊM
    }
}
```

**File: `android/app/build.gradle`**

```gradle
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"
apply plugin: "com.google.gms.google-services"  // ← THÊM (cuối file)

android {
    namespace "com.yourapp"
    compileSdkVersion rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.yourapp"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
    
    // Firebase
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

### Bước 3.4: Cấu Hình AndroidManifest.xml

**File: `android/app/src/main/AndroidManifest.xml`**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />  <!-- THÊM -->

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:allowBackup="false"
      android:theme="@style/AppTheme">
      
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>
```

---

## 💻 PHẦN 4: CODE IMPLEMENTATION

### Bước 4.1: Tạo API Client

**File: `src/services/apiClient.ts`**

```typescript
import axios from 'axios';

const API_URL = 'https://your-api.com/api'; // Thay bằng API của bạn

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken(); // Từ AsyncStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { apiClient };
```

### Bước 4.2: Tạo Notification Helper

**File: `src/utils/notificationHelper.ts`**

```typescript
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { apiClient } from '../services/apiClient';

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ iOS Permission granted:', authStatus);
        return true;
      } else {
        console.log('❌ iOS Permission denied');
        return false;
      }
    } else if (Platform.OS === 'android') {
      // Android 13+ cần request permission
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Android Permission granted');
          return true;
        } else {
          console.log('❌ Android Permission denied');
          return false;
        }
      }
      // Android < 13 không cần permission
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error requesting permission:', error);
    return false;
  }
}

/**
 * Get FCM token
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    console.log('📱 FCM Token:', token);
    return token;
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return null;
  }
}

/**
 * Register device token với backend
 * Giống như registerDeviceToken() trong ReactJS
 */
export async function registerDeviceToken(): Promise<string | null> {
  try {
    // 1. Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Thông báo',
        'Vui lòng cấp quyền thông báo để nhận tin tức mới nhất'
      );
      return null;
    }

    // 2. Get FCM token
    const fcmToken = await getFCMToken();
    if (!fcmToken) {
      console.log('❌ No FCM token available');
      return null;
    }

    // 3. Send to backend (giống ReactJS)
    const response = await apiClient.post('/users/device-token', {
      token: fcmToken,
      platform: Platform.OS, // 'ios' hoặc 'android'
      deviceInfo: {
        os: Platform.OS,
        version: Platform.Version,
      }
    });

    if (response.data.success) {
      console.log('✅ Token registered successfully');
      return fcmToken;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error registering token:', error);
    return null;
  }
}

/**
 * Unregister token (khi logout)
 * Giống như unregisterDeviceToken() trong ReactJS
 */
export async function unregisterDeviceToken(): Promise<void> {
  try {
    const fcmToken = await messaging().getToken();

    if (fcmToken) {
      await apiClient.delete('/users/device-token', {
        data: { token: fcmToken }
      });

      await messaging().deleteToken();
      console.log('✅ Token unregistered');
    }
  } catch (error) {
    console.error('❌ Error unregistering token:', error);
  }
}

/**
 * Setup foreground listener (app đang mở)
 * Giống như setupForegroundListener() trong ReactJS
 */
export function setupForegroundListener(
  callback?: (payload: any) => void
): (() => void) {
  console.log('🔧 Setting up foreground listener...');
  
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('🎉 FOREGROUND MESSAGE RECEIVED!');
    console.log('📩 Full payload:', JSON.stringify(remoteMessage, null, 2));
    console.log('📩 Notification:', remoteMessage.notification);
    console.log('📩 Data:', remoteMessage.data);
    
    if (callback) {
      console.log('✅ Calling callback...');
      callback(remoteMessage);
    }
  });

  console.log('✅ Foreground listener registered');
  return unsubscribe;
}

/**
 * Setup background handler (app đóng/background)
 */
export function setupBackgroundHandler(): void {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📩 Background notification:', remoteMessage);
  });
}

/**
 * Handle notification opened (user click vào notification)
 */
export function setupNotificationOpenedListener(
  callback?: (payload: any) => void
): (() => void) | undefined {
  // App opened from quit state
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('📩 Notification opened app from quit state:', remoteMessage);
        if (callback) callback(remoteMessage);
      }
    });

  // App opened from background state
  const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('📩 Notification opened app from background:', remoteMessage);
    if (callback) callback(remoteMessage);
  });

  return unsubscribe;
}

/**
 * Parse notification URL để navigate
 * Giống như parseNotificationUrl() trong ReactJS
 */
export function parseNotificationUrl(payload: any): string {
  const { redirect_url, type, post_id } = payload.data || {};

  if (redirect_url) {
    // Parse URL: app://post/123 → /post/123
    return redirect_url.replace('app://', '');
  } else if (type === 'community' && post_id) {
    return `/community?post=${post_id}`;
  } else {
    return '/';
  }
}
```

### Bước 4.3: Tích Hợp Vào App.tsx

**File: `App.tsx`**

```typescript
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  registerDeviceToken,
  setupForegroundListener,
  setupBackgroundHandler,
  setupNotificationOpenedListener,
  parseNotificationUrl,
} from './utils/notificationHelper';

const Stack = createNativeStackNavigator();

function App() {
  const [initialRoute, setInitialRoute] = useState<string>('Home');

  useEffect(() => {
    // Setup background handler
    setupBackgroundHandler();

    // Register device token khi app khởi động
    registerDeviceToken();

    // Setup foreground listener
    const unsubscribeForeground = setupForegroundListener((payload) => {
      console.log('Received notification:', payload);
      // Hiển thị popup hoặc alert
      // Alert.alert(
      //   payload.notification?.title || 'Thông báo',
      //   payload.notification?.body || ''
      // );
    });

    // Setup notification opened listener
    const unsubscribeOpened = setupNotificationOpenedListener((payload) => {
      const route = parseNotificationUrl(payload);
      console.log('Navigate to:', route);
      // Navigate to screen
      // navigation.navigate(route);
    });

    return () => {
      unsubscribeForeground?.();
      unsubscribeOpened?.();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
```

### Bước 4.4: Xử Lý Login

**File: `screens/LoginScreen.tsx`**

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/apiClient';
import { registerDeviceToken } from '../utils/notificationHelper';

function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });

      const { token } = response.data;
      
      // Save token
      await AsyncStorage.setItem('auth_token', token);

      // Register device token
      await registerDeviceToken();

      // Navigate to home
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Lỗi', 'Đăng nhập thất bại');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Đăng nhập" onPress={handleLogin} />
    </View>
  );
}

export default LoginScreen;
```

### Bước 4.5: Xử Lý Logout

```typescript
import { unregisterDeviceToken } from '../utils/notificationHelper';

const handleLogout = async () => {
  try {
    // Unregister device token
    await unregisterDeviceToken();
    
    // Clear auth token
    await AsyncStorage.removeItem('auth_token');
    
    // Navigate to login
    navigation.navigate('Login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

---

## 🧪 PHẦN 5: TESTING

### Test 1: Kiểm Tra FCM Token

```typescript
import { getFCMToken } from './utils/notificationHelper';

// Trong component
useEffect(() => {
  getFCMToken().then(token => {
    console.log('FCM Token:', token);
  });
}, []);
```

### Test 2: Gửi Test Notification Từ Firebase Console

1. Vào Firebase Console → **Cloud Messaging**
2. Click **Send your first message**
3. Nhập tiêu đề và nội dung
4. Click **Send test message**
5. Paste FCM token → Click **Test**

### Test 3: Gửi Từ Backend

```bash
curl -X POST https://your-api.com/api/notifications \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "user-id",
    "audience": "user",
    "type": "system",
    "title": "Test",
    "content": { "message": "Test message" }
  }'
```

---

## 🎯 PHẦN 6: KẾT NỐI VỚI BACKEND

### Backend Phải Gửi Đúng Format

**✅ ĐÚNG:**
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
  "token": "FCM_TOKEN"
}
```

**❌ SAI:**
```json
{
  "data": {
    "title": "Tiêu đề",
    "body": "Nội dung"
  },
  "token": "FCM_TOKEN"
}
```

### Backend Code (Node.js)

```javascript
const admin = require('firebase-admin');

async function sendNotification(userToken, title, body, data = {}) {
  const message = {
    notification: {
      title: title,
      body: body
    },
    data: {
      type: data.type || 'system',
      redirect_url: data.redirect_url || 'app://home',
      notification_id: data.notification_id || ''
    },
    token: userToken
  };

  const response = await admin.messaging().send(message);
  console.log('✅ Notification sent:', response);
  return response;
}
```
