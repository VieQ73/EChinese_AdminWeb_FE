# 📦 Android Package Name - Giải Thích Chi Tiết

## 🎯 Package Name Là Gì?

**Package Name** (hay Application ID) là **định danh duy nhất** của ứng dụng Android trên toàn thế giới.

### Ví Dụ Thực Tế:

```
Facebook: com.facebook.katana
Instagram: com.instagram.android
WhatsApp: com.whatsapp
Zalo: com.zing.zalo
TikTok: com.zhiliaoapp.musically
```

### Giống Như:
- **Số CMND/CCCD** của con người
- **Biển số xe** của ô tô
- **Domain name** của website

**Không có 2 app nào trên Google Play Store có cùng Package Name!**

---

## 📍 Tìm Package Name Ở Đâu?

### Cách 1: Trong File `android/app/build.gradle`

```gradle
android {
    namespace "com.yourcompany.yourapp"
    compileSdkVersion rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.yourcompany.yourapp"  // ← ĐÂY LÀ PACKAGE NAME
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }
}
```

### Cách 2: Trong File `AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.yourcompany.yourapp">  <!-- ĐÂY LÀ PACKAGE NAME -->
    
    <application
        android:name=".MainApplication"
        android:label="@string/app_name">
        <!-- ... -->
    </application>
</manifest>
```

### Cách 3: Trong Android Studio

```
1. Mở Android Studio
2. Open project → Chọn thư mục android/
3. File → Project Structure → Modules → app
4. Xem "Application ID"
```

---

## 🏗️ Cấu Trúc Package Name

### Format Chuẩn:

```
com.company.appname
│   │       │
│   │       └─ Tên app (chữ thường, không dấu, không space)
│   └───────── Tên công ty/tổ chức
└───────────── Domain ngược (thường là com)
```

### Ví Dụ:

```
com.google.android.youtube
│   │      │       │
│   │      │       └─ youtube (tên app)
│   │      └───────── android (sub-domain)
│   └──────────────── google (công ty)
└──────────────────── com (domain)

com.facebook.katana
│   │        │
│   │        └─ katana (tên app)
│   └────────── facebook (công ty)
└────────────── com (domain)

vn.zalo.app
│  │    │
│  │    └─ app (tên app)
│  └────── zalo (công ty)
└───────── vn (domain Việt Nam)
```

---

## ✍️ Cách Đặt Tên Package Name

### Quy Tắc:

1. **Chữ thường** (lowercase)
2. **Không dấu** (no accents)
3. **Không space** (no spaces)
4. **Không ký tự đặc biệt** (chỉ chữ, số, dấu chấm)
5. **Phải bắt đầu bằng chữ** (không bắt đầu bằng số)
6. **Dùng dấu chấm** để phân cách

### ✅ ĐÚNG:

```
com.mycompany.myapp
com.example.helloworld
vn.company.appname
io.github.username
com.company123.app
```

### ❌ SAI:

```
MyCompany.MyApp           // ❌ Chữ hoa
com.my company.app        // ❌ Có space
com.công-ty.app           // ❌ Có dấu và ký tự đặc biệt
123.company.app           // ❌ Bắt đầu bằng số
com.my-company.app        // ❌ Có dấu gạch ngang
```

---

## 🎨 Ví Dụ Thực Tế Cho Dự Án Của Bạn

### Nếu Công Ty Tên "EChinese":

```gradle
// Ứng dụng học tiếng Trung
applicationId "com.echinese.learning"

// Ứng dụng admin
applicationId "com.echinese.admin"

// Ứng dụng cho học sinh
applicationId "com.echinese.student"

// Ứng dụng cho giáo viên
applicationId "com.echinese.teacher"
```

### Nếu Công Ty Việt Nam:

```gradle
// Dùng domain .vn
applicationId "vn.echinese.learning"
applicationId "vn.echinese.admin"
```

### Nếu Tên Công Ty Khác:

```gradle
// Công ty ABC
applicationId "com.abc.chineselearning"

// Startup XYZ
applicationId "com.xyz.hsk"

// Developer cá nhân
applicationId "io.github.yourname.app"
```

---

## 🔧 Cách Thay Đổi Package Name

### ⚠️ LƯU Ý: Chỉ thay đổi TRƯỚC KHI publish lên Google Play!

### Bước 1: Sửa `android/app/build.gradle`

```gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.yourapp"  // ← Sửa đây
    }
}
```

### Bước 2: Sửa `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.yourcompany.yourapp">  <!-- Sửa đây -->
```

### Bước 3: Đổi tên thư mục (nếu cần)

```bash
# Cấu trúc thư mục cũ
android/app/src/main/java/com/oldname/

# Đổi thành
android/app/src/main/java/com/yourcompany/yourapp/
```

### Bước 4: Sửa package trong các file Java/Kotlin

```java
// MainActivity.java
package com.yourcompany.yourapp;  // ← Sửa đây

import android.os.Bundle;
// ...
```

### Bước 5: Clean và Rebuild

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## 🔗 Package Name Dùng Ở Đâu?

### 1. Firebase Console

```
Khi tạo Android app trên Firebase:
"Android package name" = Package Name của bạn
```

### 2. Google Play Console

```
Khi upload app lên Google Play Store:
Package Name xác định app của bạn
```

### 3. Deep Links

```
// Deep link format
yourapp://screen

// Hoặc dùng package name
com.yourcompany.yourapp://screen
```

### 4. Google Services

```
// google-services.json
{
  "client": [{
    "client_info": {
      "android_client_info": {
        "package_name": "com.yourcompany.yourapp"  // ← Phải khớp
      }
    }
  }]
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Không Thể Thay Đổi Sau Khi Publish

```
❌ Đã publish lên Google Play → KHÔNG thể đổi Package Name
✅ Chưa publish → Có thể đổi thoải mái
```

Nếu muốn đổi sau khi publish → Phải tạo app mới (mất hết user, reviews, downloads)

### 2. Phải Khớp Với Firebase

```
Package Name trong build.gradle
=
Package Name trong Firebase Console
=
Package Name trong google-services.json
```

Nếu không khớp → Không nhận được notification!

### 3. Phải Duy Nhất

```
❌ Không thể dùng package name của app khác
❌ Không thể dùng package name đã có trên Google Play
✅ Phải tạo package name riêng cho app của bạn
```

---

## 🎯 CHECKLIST

### Khi Tạo Project Mới:

- [ ] Chọn Package Name phù hợp
- [ ] Kiểm tra chưa ai dùng (search trên Google Play)
- [ ] Đặt theo format chuẩn: `com.company.appname`
- [ ] Chữ thường, không dấu, không space
- [ ] Cập nhật trong `build.gradle`
- [ ] Cập nhật trong `AndroidManifest.xml`

### Khi Setup Firebase:

- [ ] Copy Package Name từ `build.gradle`
- [ ] Paste vào Firebase Console khi tạo Android app
- [ ] Download `google-services.json`
- [ ] Kiểm tra `package_name` trong file JSON khớp với `build.gradle`

---

## 💡 MẸO HAY

### 1. Dùng Domain Ngược

```
Website: echinese.com
→ Package: com.echinese.app
```

### 2. Phân Biệt Dev/Staging/Production

```
Production: com.echinese.app
Staging:    com.echinese.app.staging
Dev:        com.echinese.app.dev
```

### 3. Phân Biệt Các App Khác Nhau

```
App chính:  com.echinese.learning
App admin:  com.echinese.admin
App test:   com.echinese.test
```

---

## 📖 TÓM TẮT

**Package Name là:**
- ✅ Định danh duy nhất của app Android
- ✅ Giống như CMND/CCCD của app
- ✅ Không thể thay đổi sau khi publish
- ✅ Phải khớp với Firebase config
- ✅ Format: `com.company.appname`

**Tìm ở đâu:**
- ✅ File `android/app/build.gradle` → `applicationId`
- ✅ File `AndroidManifest.xml` → `package`

**Ví dụ:**
```gradle
applicationId "com.echinese.learning"
```

**Đơn giản thôi! 🎉**
