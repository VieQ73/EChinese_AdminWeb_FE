# 📋 Dữ Liệu Cần Thiết Để Config React Native Push Notification

## 🎯 TÓM TẮT NHANH


#### A. File `google-services.json`

**Đặt ở đâu:**
```
android/app/google-services.json
```

**Nội dung file (tự động generate):**
```json
{
  "project_info": {
    "project_number": "297952994832",
    "project_id": "notification-4a444",
    "storage_bucket": "notification-4a444.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:297952994832:android:b7dde17d8723e88ecb0c95",
        "android_client_info": {
          "package_name": "app.notification"
        }
      },
      "oauth_client": [],
      "api_key": [
        {
          "current_key": "AIzaSyAeW8KP_6tdrIkk_xg0IrMBu_LCkqcAmvI"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": []
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

#### B. Package Name

**Lấy từ đâu:**
- File `android/app/build.gradle`
- Tìm dòng `applicationId`

```gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.yourapp"  // ← Đây
    }
}
```

**Phải khớp với:**
- Firebase Console Android app Package name
- File `google-services.json` → `package_name`

---

## 🔑 DỮ LIỆU TỪ HỆ THỐNG HIỆN TẠI

### Firebase Project Info (Đã Có)

```javascript
Project ID: notification-4a444
API Key: AIzaSyCJ6hT8kjwgFZfXnpRP17hd0rO4qsWgv7I
Auth Domain: notification-4a444.firebaseapp.com
Storage Bucket: notification-4a444.firebasestorage.app
Messaging Sender ID: 297952994832
App ID (Web): 1:297952994832:web:49baf0ee7ef1c58ecb0c95
```

### React Native CHỈ CẦN:

 `google-services.json`
✅ Native code setup (AppDelegate, AndroidManifest)
✅ JavaScript code để xử lý notification

---



---

## ✅ XÁC NHẬN DỮ LIỆU ĐÚNG



### Android

```bash
# Kiểm tra file tồn tại
ls -la android/app/google-services.json

# Kiểm tra Package Name trong file
cat android/app/google-services.json | grep package_name

# Kiểm tra Package Name trong build.gradle
cat android/app/build.gradle | grep applicationId
```

---
