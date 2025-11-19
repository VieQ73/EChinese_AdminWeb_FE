// utils/notificationHelper.ts
import { messaging, getToken, onMessage, VAPID_KEY } from '../firebase/config';
import { apiClient } from '../services/apiClient';

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.log('❌ Notification permission denied');
      return false;
    } else {
      console.log('⚠️ Notification permission dismissed');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Get FCM token
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    if (!messaging) {
      console.error('❌ Messaging not initialized');
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY
    });

    if (currentToken) {
      console.log('📱 FCM Token:', currentToken);
      return currentToken;
    } else {
      console.log('⚠️ No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Register device token with backend
 */
export async function registerDeviceToken(): Promise<string | null> {
  try {
    // 1. Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('No notification permission');
      return null;
    }

    // 2. Get FCM token
    const fcmToken = await getFCMToken();
    if (!fcmToken) {
      console.log('Failed to get FCM token');
      return null;
    }

    // 3. Check if token already saved
    const savedToken = localStorage.getItem('fcm_token');
    if (savedToken === fcmToken) {
      console.log('✅ Token already registered');
      return fcmToken;
    }

    // 4. Send token to backend
    const response = await apiClient.post<{ success: boolean }>(
      '/users/device-token',
      {
        token: fcmToken,
        platform: 'web',
        deviceInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
        }
      }
    );

    if (response.success) {
      // 5. Save token to localStorage
      localStorage.setItem('fcm_token', fcmToken);
      console.log('✅ Device token registered successfully');
      return fcmToken;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error registering device token:', error);
    return null;
  }
}

/**
 * Unregister device token (call on logout)
 */
export async function unregisterDeviceToken(): Promise<void> {
  try {
    const fcmToken = localStorage.getItem('fcm_token');

    if (fcmToken) {
      await apiClient.delete(
        '/users/device-token',
        { token: fcmToken }
      );

      localStorage.removeItem('fcm_token');
      console.log('✅ Device token unregistered');
    }
  } catch (error) {
    console.error('❌ Error unregistering token:', error);
  }
}

/**
 * Setup foreground message listener
 */
export function setupForegroundListener(callback?: (payload: any) => void): (() => void) | undefined {
  try {
    console.log('🔧 [setupForegroundListener] Starting setup...');
    console.log('🔧 [setupForegroundListener] Messaging object:', messaging);
    console.log('🔧 [setupForegroundListener] Callback provided:', !!callback);
    
    if (!messaging) {
      console.error('❌ [setupForegroundListener] Messaging not initialized, cannot setup listener');
      return undefined;
    }

    console.log('✅ [setupForegroundListener] Messaging is initialized, setting up onMessage...');
    console.log('✅ [setupForegroundListener] onMessage function:', onMessage);

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('🎉🎉🎉 [setupForegroundListener] ===== FOREGROUND MESSAGE RECEIVED! =====');
      console.log('📩 [setupForegroundListener] Full payload:', JSON.stringify(payload, null, 2));
      console.log('📩 [setupForegroundListener] Notification:', payload.notification);
      console.log('📩 [setupForegroundListener] Data:', payload.data);
      console.log('📩 [setupForegroundListener] Message ID:', payload.messageId);
      console.log('📩 [setupForegroundListener] From:', payload.from);
      
      // Call callback function to show popup
      if (callback) {
        console.log('✅ [setupForegroundListener] Calling callback with payload...');
        try {
          callback(payload);
          console.log('✅ [setupForegroundListener] Callback called successfully');
        } catch (error) {
          console.error('❌ [setupForegroundListener] Error in callback:', error);
        }
      } else {
        console.warn('⚠️ [setupForegroundListener] No callback provided!');
      }
    });

    console.log('✅ [setupForegroundListener] Listener registered successfully');
    console.log('✅ [setupForegroundListener] Unsubscribe function:', unsubscribe);
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ [setupForegroundListener] Error setting up foreground listener:', error);
    return undefined;
  }
}

/**
 * Handle notification click navigation
 */
export function parseNotificationUrl(payload: any): string {
  const { redirect_url, type, post_id } = payload.data || {};

  if (redirect_url) {
    // Parse URL: app://post/123 → /post/123
    return redirect_url.replace('app:/', '');
  } else if (type === 'community' && post_id) {
    return `/community?post=${post_id}`;
  } else {
    return '/';
  }
}
