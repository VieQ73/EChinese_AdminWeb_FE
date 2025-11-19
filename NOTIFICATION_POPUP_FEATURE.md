# 🔔 Notification Popup Feature

## ✨ Tính Năng

Khi nhận được push notification (foreground - app đang mở), hệ thống sẽ hiển thị một popup đẹp mắt ở góc phải màn hình thay vì browser notification mặc định.

## 🎨 Giao Diện Popup

- **Header**: Gradient xanh với icon chuông và nút đóng
- **Content**: Icon emoji theo loại thông báo + tiêu đề + nội dung
- **Progress Bar**: Thanh tiến trình countdown 10 giây
- **Animation**: Slide in từ phải, tự động đóng sau 10 giây
- **Hover Effect**: Highlight khi hover để click xem chi tiết

## 📋 Các Loại Thông Báo

| Loại | Icon | Mô tả |
|------|------|-------|
| `community` | 💬 | Thông báo từ cộng đồng (bình luận, like, v.v.) |
| `achievement` | 🏆 | Thông báo về thành tích |
| `subscription` | 💎 | Thông báo về gói đăng ký |
| `system` | 🔔 | Thông báo hệ thống |
| Khác | 🔔 | Mặc định |

## 🔄 Luồng Hoạt Động

### 1. Foreground (App đang mở)
```
Backend gửi notification
    ↓
Firebase Cloud Messaging
    ↓
setupForegroundListener nhận payload
    ↓
setNotificationPayload(payload)
    ↓
NotificationPopup hiển thị
    ↓
Tự động đóng sau 10 giây (hoặc click đóng)
```

### 2. Background (App đóng/minimize)
```
Backend gửi notification
    ↓
Firebase Cloud Messaging
    ↓
Service Worker (firebase-messaging-sw.js)
    ↓
Browser notification hiển thị
    ↓
Click notification → Mở app và navigate
```

## 💻 Code Structure

### 1. NotificationPopup Component
**File**: `components/NotificationPopup.tsx`

**Props**:
- `payload`: Notification payload từ Firebase
- `onClose`: Callback khi đóng popup
- `onNavigate`: Callback để navigate đến trang

**Features**:
- Tự động đóng sau 10 giây
- Click vào popup để xem chi tiết
- Click nút X để đóng ngay
- Progress bar countdown
- Animation smooth

### 2. App Integration
**File**: `App.tsx`

```typescript
const [notificationPayload, setNotificationPayload] = useState<any>(null);

useEffect(() => {
  if (!isAuthenticated) return;

  const unsubscribe = setupForegroundListener((payload) => {
    setNotificationPayload(payload); // Hiển thị popup
  });

  return () => unsubscribe && unsubscribe();
}, [isAuthenticated]);
```

### 3. Notification Helper
**File**: `utils/notificationHelper.ts`

```typescript
export function setupForegroundListener(callback?: (payload: any) => void) {
  return onMessage(messaging, (payload) => {
    console.log('📩 Foreground message received:', payload);
    
    // Call callback to show popup
    if (callback) {
      callback(payload);
    }
  });
}
```

## 🎯 Payload Structure

Notification payload từ backend:

```json
{
  "notification": {
    "title": "Tiêu đề thông báo",
    "body": "Nội dung thông báo"
  },
  "data": {
    "type": "community",
    "redirect_url": "app://community?post=123",
    "post_id": "123",
    "notification_id": "uuid"
  }
}
```

## 🔗 Navigation

Khi click vào popup, hệ thống sẽ navigate theo thứ tự ưu tiên:

1. **redirect_url** (nếu có): `app://community?post=123` → `/community?post=123`
2. **type + post_id** (nếu có): `type=community, post_id=123` → `/community?post=123`
3. **Mặc định**: Không navigate

## 🎨 Styling

Popup sử dụng Tailwind CSS với:
- Fixed position ở góc phải trên
- Z-index 50 để luôn hiển thị trên cùng
- Responsive width (max-w-sm)
- Shadow và border để nổi bật
- Gradient header
- Smooth transitions

## 🧪 Testing

### Test Foreground Notification

1. Login vào app
2. Giữ tab app đang active
3. Gửi notification từ backend:

```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "user-id",
    "audience": "user",
    "type": "community",
    "title": "Test Popup",
    "content": { "message": "Đây là test popup notification" },
    "redirect_url": "app://community"
  }'
```

4. **Kết quả mong đợi:**
   - Popup hiện ở góc phải màn hình
   - Hiển thị icon 💬 (community)
   - Hiển thị tiêu đề "Test Popup"
   - Hiển thị nội dung
   - Progress bar countdown
   - Tự động đóng sau 10 giây

### Test Background Notification

1. Login vào app
2. Minimize hoặc chuyển sang tab khác
3. Gửi notification từ backend
4. **Kết quả mong đợi:**
   - Browser notification hiển thị (không phải popup)
   - Click notification → Mở app và navigate

## 🔧 Customization

### Thay đổi thời gian tự động đóng

**File**: `components/NotificationPopup.tsx`

```typescript
// Thay đổi từ 10000ms (10s) sang giá trị khác
const timer = setTimeout(() => {
  handleClose();
}, 10000); // ← Thay đổi ở đây
```

### Thay đổi vị trí popup

**File**: `components/NotificationPopup.tsx`

```typescript
// Hiện tại: góc phải trên
<div className="fixed inset-0 z-50 flex items-start justify-end p-4">

// Góc trái trên:
<div className="fixed inset-0 z-50 flex items-start justify-start p-4">

// Giữa màn hình:
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
```

### Thêm âm thanh

```typescript
useEffect(() => {
  if (payload) {
    // Play sound
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(err => console.log('Audio play failed:', err));
    
    setIsVisible(true);
    // ...
  }
}, [payload]);
```

### Thêm nhiều popup cùng lúc

Thay đổi từ single state sang array:

```typescript
// App.tsx
const [notifications, setNotifications] = useState<any[]>([]);

const unsubscribe = setupForegroundListener((payload) => {
  setNotifications(prev => [...prev, { id: Date.now(), payload }]);
});

// Render multiple popups
{notifications.map(notif => (
  <NotificationPopup
    key={notif.id}
    payload={notif.payload}
    onClose={() => setNotifications(prev => 
      prev.filter(n => n.id !== notif.id)
    )}
  />
))}
```

## ✅ Checklist

- [x] NotificationPopup component đã tạo
- [x] Tích hợp vào App.tsx
- [x] Setup foreground listener
- [x] Handle navigation khi click
- [x] Auto close sau 10 giây
- [x] Progress bar countdown
- [x] Animation smooth
- [x] Responsive design
- [x] Icon theo loại notification
- [x] Không hiển thị browser notification nữa (chỉ popup)

## 🎉 Kết Quả

Bây giờ khi nhận được notification:
- ✅ Popup đẹp mắt thay vì browser notification
- ✅ Hiển thị đầy đủ thông tin
- ✅ Click để xem chi tiết
- ✅ Tự động đóng
- ✅ UX tốt hơn nhiều!

---

**Enjoy your beautiful notification popup! 🚀**
