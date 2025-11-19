# Tối ưu hóa Notification System

## Vấn đề cũ
- `NotificationBell` component polling API `/notifications/unread-count` mỗi 30 giây
- Tốn bandwidth và server resources
- Không real-time thật sự (độ trễ tối đa 30s)
- Dư thừa vì đã có Firebase push notification

## Giải pháp mới

### 1. NotificationContext (Global State)
Tạo context để quản lý `unreadCount` globally:

```typescript
// contexts/NotificationContext.tsx
- unreadCount: số thông báo chưa đọc
- incrementUnreadCount(): tăng count khi nhận notification mới
- decrementUnreadCount(): giảm count khi đọc notification
- setUnreadCount(count): set count trực tiếp
- refreshUnreadCount(): fetch lại từ API (chỉ khi cần)
```

### 2. Cập nhật unread count tự động

#### A. Khi nhận push notification (Foreground)
```typescript
// App.tsx - NotificationHandler
setupForegroundListener((payload) => {
  // Tăng unread count
  incrementUnreadCount();
  
  // Hiển thị popup
  setNotificationPayload(payload);
});
```

#### B. Khi user đọc notification
```typescript
// NotificationsPage.tsx
const markAsRead = async (notificationId: string) => {
  await apiClient.patch(`/notifications/${notificationId}/read`);
  decrementUnreadCount(); // Giảm count
};

const markAllAsRead = async () => {
  await apiClient.post('/notifications/mark-all-read');
  setUnreadCount(0); // Reset về 0
};
```

#### C. Khi user xóa notification chưa đọc
```typescript
const deleteNotification = async (notificationId: string) => {
  const notification = notifications.find(n => n.id === notificationId);
  await apiClient.delete(`/notifications/${notificationId}`);
  
  if (notification && !notification.is_read) {
    decrementUnreadCount(); // Giảm count nếu chưa đọc
  }
};
```

### 3. Fetch chỉ 1 lần khi mount
```typescript
// NotificationContext.tsx
useEffect(() => {
  if (isAuthenticated) {
    refreshUnreadCount(); // Chỉ fetch 1 lần khi login
  }
}, [isAuthenticated]);
```

### 4. NotificationBell đơn giản hơn
```typescript
// components/NotificationBell.tsx
const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotification(); // Chỉ đọc từ context
  
  return (
    <button>
      <Bell />
      {unreadCount > 0 && <span>{unreadCount}</span>}
    </button>
  );
};
```

## Lợi ích

✅ **Không còn polling**: Tiết kiệm bandwidth và server resources  
✅ **Real-time**: Cập nhật ngay lập tức khi nhận notification  
✅ **Chính xác**: Sync với các action của user (đọc, xóa)  
✅ **Đơn giản**: Code dễ maintain hơn  
✅ **Hiệu quả**: Chỉ fetch khi thực sự cần thiết  

## Flow hoạt động

```
1. User login
   └─> NotificationContext fetch unread count (1 lần)
   └─> NotificationBell hiển thị badge

2. Nhận push notification (foreground)
   └─> Firebase onMessage trigger
   └─> incrementUnreadCount()
   └─> Badge tự động tăng
   └─> Hiển thị popup

3. User click notification để đọc
   └─> markAsRead() API call
   └─> decrementUnreadCount()
   └─> Badge tự động giảm

4. User click "Đánh dấu tất cả đã đọc"
   └─> markAllAsRead() API call
   └─> setUnreadCount(0)
   └─> Badge biến mất
```

## Testing

Test notification popup và unread count:
```javascript
// Trong browser console
window.testNotification()
```

Hàm này sẽ:
- Hiển thị popup notification
- Tăng unread count
- Test toàn bộ flow
