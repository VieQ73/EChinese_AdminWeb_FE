// public/firebase-messaging-sw.js

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (giống với config ở firebase/config.ts)
const firebaseConfig = {
  apiKey: "AIzaSyCJ6hT8kjwgFZfXnpRP17hd0rO4qsWgv7I",
  authDomain: "notification-4a444.firebaseapp.com",
  projectId: "notification-4a444",
  storageBucket: "notification-4a444.firebasestorage.app",
  messagingSenderId: "297952994832",
  appId: "1:297952994832:web:49baf0ee7ef1c58ecb0c95",
  measurementId: "G-EKPEW65PHB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'Thông báo mới';
  const notificationOptions = {
    body: payload.notification?.body || 'Bạn có một thông báo mới',
    icon: '/logo192.png', // Icon của app
    badge: '/badge.png',
    data: payload.data,
    tag: payload.data?.notification_id || 'default',
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  
  event.notification.close();

  // Lấy URL từ notification data
  const urlToOpen = event.notification.data?.redirect_url || '/';
  
  // Parse URL: app://post/123 → /#/post/123 (HashRouter)
  const path = urlToOpen.replace('app:/', '/#');
  
  // Mở hoặc focus vào tab
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Nếu đã có tab mở, focus vào tab đó
        for (const client of clientList) {
          if (client.url.includes(path) && 'focus' in client) {
            return client.focus();
          }
        }
        // Nếu chưa có, mở tab mới
        if (clients.openWindow) {
          return clients.openWindow(path);
        }
      })
  );
});
