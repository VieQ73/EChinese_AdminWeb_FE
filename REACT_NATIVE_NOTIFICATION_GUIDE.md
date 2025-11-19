# 📱 Hướng Dẫn Chi Tiết Push Notification - React Native

## 📋 Mục Lục
1. [Chuẩn Bị](#1-chuẩn-bị)
2. [Cài Đặt Dependencies](#2-cài-đặt-dependencies)
3. [Cấu Hình iOS](#3-cấu-hình-ios)
4. [Cấu Hình Android](#4-cấu-hình-android)
5. [Code Implementation](#5-code-implementation)
6. [Testing](#6-testing)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Chuẩn Bị

### Yêu Cầu
- React Native >= 0.60
- Node.js >= 14
- Xcode >= 13 (cho iOS)
- Android Studio (cho Android)
- Firebase project đã tạo

### Lấy Firebase Config

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn

**Cho iOS:**
- Click **Add app** → Chọn iOS
- Nhập **iOS bundle ID** (lấy từ Xcode: General → Bundle Identifier)
- Download `GoogleService-Info.plist`

**Cho Android:**
- Click **Add app** → Chọn Android
- Nhập **Android package name** (lấy từ `android/app/build.gradle`)
- Download `google-services.json`

---

## 2. Cài Đặt Dependencies

```bash
# Cài đặt React Native Firebase
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging

# Hoặc dùng yarn
yarn add @react-native-firebase/app
yarn add @react-native-firebase/messaging

# iOS only - Install pods
cd ios && pod install && cd ..
```

---

## 3. Cấu Hình iOS

### Bước 3.1: Thêm GoogleService-Info.plist

1. Mở Xcode: `open ios/YourApp.xcworkspace`
2. Kéo file `GoogleService-Info.plist` vào project (bên dưới folder YourApp)
3. Chọn **Copy items if needed** ✅
4. Chọn target **YourApp** ✅

### Bước 3.2: Cấu Hình AppDelegate

**File: `ios/YourApp/AppDelegate.mm`** (hoặc `.m`)

```objc
#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <Firebase.h>  // ← Thêm dòng này
#import <UserNotifications/UserNotifications.h>  // ← Thêm dòng này

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Initialize Firebase
  [FIRApp configure];  // ← Thêm dòng này
  
  // Request notification permission
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;  // ← Thêm dòng này
  
  self.moduleName = @"YourApp";
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// ← Thêm các methods này
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
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

### Bước 3.3: Cấu Hình Capabilities

1. Mở Xcode → Chọn project → Target **YourApp**
2. Tab **Signing & Capabilities**
3. Click **+ Capability**
4. Thêm:
   - **Push Notifications** ✅
   - **Background Modes** ✅
     - Check **Remote notifications** ✅

### Bước 3.4: Upload APNs Key lên Firebase

1. Vào [Apple Developer](https://developer.apple.com/)
2. **Certificates, Identifiers & Profiles** → **Keys**
3. Click **+** để tạo key mới
4. Đặt tên (vd: "Push Notification Key")
5. Check **Apple Push Notifications service (APNs)** ✅
6. Click **Continue** → **Register**
7. Download file `.p8`
8. **Lưu ý Key ID** (vd: ABC123XYZ)

9. Quay lại Firebase Console:
   - **Project Settings** → **Cloud Messaging**
   - Scroll xuống **Apple app configuration**
   - Click **Upload** ở APNs Authentication Key
   - Upload file `.p8`
   - Nhập **Key ID** và **Team ID** (lấy từ Apple Developer)

---

## 4. Cấu Hình Android

### Bước 4.1: Thêm google-services.json

Copy file `google-services.json` vào:
```
android/app/google-services.json
```

### Bước 4.2: Cấu Hình build.gradle

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
        classpath("com.google.gms:google-services:4.4.0")  // ← Thêm dòng này
    }
}
```

**File: `android/app/build.gradle`**

```gradle
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"
apply plugin: "com.google.gms.google-services"  // ← Thêm dòng này (ở cuối file)

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

### Bước 4.3: Cấu Hình AndroidManifest.xml

**File: `android/app/src/main/AndroidManifest.xml`**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />  <!-- ← Thêm -->

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:allowBackup="false"
      android:theme="@style/AppTheme">
      
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
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

## 5. Code Implementation

### Bước 5.1: Tạo Notification Helper

**File: `src/utils/notificationHelper.js`**

```javascript
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'https://your-api.com/api';

// Request permission
export async function requestNotificationPermission() {
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

// Get FCM token
export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('📱 FCM Token:', token);
    return token;
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return null;
  }
}

// Register token với backend
export async function registerDeviceToken(authToken) {
  try {
    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Thông báo',
        'Vui lòng cấp quyền thông báo để nhận tin tức mới nhất'
      );
      return null;
    }

    // Get FCM token
    const fcmToken = await getFCMToken();
    if (!fcmToken) {
      console.log('❌ No FCM token available');
      return null;
    }

    // Send to backend
    const response = await axios.post(
      `${API_URL}/users/device-token`,
      {
        token: fcmToken,
        platform: Platform.OS, // 'ios' hoặc 'android'
        deviceInfo: {
          os: Platform.OS,
          version: Platform.Version,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ Token registered successfully');
      return fcmToken;
    }
  } catch (error) {
    console.error('❌ Error registering token:', error);
    return null;
  }
}

// Unregister token (khi logout)
export async function unregisterDeviceToken(authToken) {
  try {
    const fcmToken = await messaging().getToken();

    if (fcmToken) {
      await axios.delete(
        `${API_URL}/users/device-token`,
        {
          data: { token: fcmToken },
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      await messaging().deleteToken();
      console.log('✅ Token unregistered');
    }
  } catch (error) {
    console.error('❌ Error unregistering token:', error);
  }
}

// Setup foreground listener (app đang mở)
export function setupForegroundListener(callback) {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('📩 Foreground notification:', remoteMessage);
    
    if (callback) {
      callback(remoteMessage);
    }
  });
}

// Setup background handler (app đóng/background)
export function setupBackgroundHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📩 Background notification:', remoteMessage);
  });
}

// Handle notification opened (user click vào notification)
export function setupNotificationOpenedListener(callback) {
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
  return messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('📩 Notification opened app from background:', remoteMessage);
    if (callback) callback(remoteMessage);
  });
}
```

