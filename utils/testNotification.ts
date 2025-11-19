// utils/testNotification.ts
// Helper để test notification

/**
 * Test notification bằng cách gọi backend API
 */
export async function sendTestNotification(token: string) {
  try {
    console.log('🧪 Sending test notification to token:', token);
    
    // Gọi backend API để gửi test notification
    const response = await fetch('http://localhost:5000/api/notifications/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        token: token,
        notification: {
          title: 'Test Notification',
          body: 'Đây là test notification từ frontend'
        },
        data: {
          type: 'system',
          redirect_url: 'app://home'
        }
      })
    });

    const result = await response.json();
    console.log('✅ Test notification sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    return null;
  }
}

/**
 * Kiểm tra xem có nhận được message từ Service Worker không
 */
export function setupServiceWorkerMessageListener() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 [ServiceWorker] Message received in app:', event.data);
      console.log('📨 [ServiceWorker] Message type:', event.data?.type);
      console.log('📨 [ServiceWorker] Message payload:', event.data?.payload);
    });
    console.log('✅ Service Worker message listener setup');
  }
}

/**
 * Log tất cả thông tin về notification setup
 */
export async function debugNotificationSetup() {
  console.log('🔍 ===== NOTIFICATION DEBUG INFO =====');
  
  // 1. Permission
  console.log('1️⃣ Notification Permission:', Notification.permission);
  
  // 2. Service Worker
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    console.log('2️⃣ Service Worker Registration:', registration);
    console.log('2️⃣ Service Worker Active:', registration?.active);
    console.log('2️⃣ Service Worker State:', registration?.active?.state);
  } else {
    console.log('2️⃣ Service Worker: Not supported');
  }
  
  // 3. FCM Token
  const fcmToken = localStorage.getItem('fcm_token');
  console.log('3️⃣ FCM Token:', fcmToken);
  
  // 4. Auth Token
  const authToken = localStorage.getItem('auth_token');
  console.log('4️⃣ Auth Token:', authToken ? 'Present' : 'Missing');
  
  // 5. Firebase Messaging
  console.log('5️⃣ Firebase Messaging:', typeof window !== 'undefined' ? 'Available' : 'Not available');
  
  console.log('🔍 ===== END DEBUG INFO =====');
}

// Expose functions to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).sendTestNotification = sendTestNotification;
  (window as any).debugNotificationSetup = debugNotificationSetup;
  (window as any).setupServiceWorkerMessageListener = setupServiceWorkerMessageListener;
}
