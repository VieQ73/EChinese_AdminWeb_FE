// firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase configuration từ Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCJ6hT8kjwgFZfXnpRP17hd0rO4qsWgv7I",
  authDomain: "notification-4a444.firebaseapp.com",
  projectId: "notification-4a444",
  storageBucket: "notification-4a444.firebasestorage.app",
  messagingSenderId: "297952994832",
  appId: "1:297952994832:web:49baf0ee7ef1c58ecb0c95",
  measurementId: "G-EKPEW65PHB"
};

// VAPID key từ Firebase Console
const VAPID_KEY = "BJlW0fZ8fxWt8fiJImLGrcx6YtaGscO84g-vq3jAPnEE1je1JZeeyKmgUv03XRNTNdaVy9SQzL-bkVZLKbETywo";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging (only if supported)
let messaging: ReturnType<typeof getMessaging> | null = null;

try {
  // Check if messaging is supported in this browser
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging initialized');
  } else {
    console.warn('⚠️ Firebase Messaging not supported in this browser');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Messaging:', error);
}

export { messaging, getToken, onMessage, VAPID_KEY, isSupported };
