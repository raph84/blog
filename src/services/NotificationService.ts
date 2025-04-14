// src/services/NotificationService.ts
import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
} from 'firebase/messaging';
import { getFirebaseApp, firebaseConfig } from '../firebase/firebaseApp';

// Define notification data interface
interface NotificationData {
  url?: string;
  type?: string;
  [key: string]: unknown; // Allow any additional properties
}

/**
 * Service to handle both browser notifications and Firebase Cloud Messaging
 */
export class NotificationService {
  private static instance: NotificationService;
  private messaging: Messaging | null = null;
  private vapidKey = firebaseConfig.apiKey;
  private notificationPermission: NotificationPermission = 'default';
  private fcmToken: string | null = null;
  private notificationCallbacks: ((_payload: unknown) => void)[] = [];

  private constructor() {
    // Initialize only if in browser context and notification API is available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.notificationPermission = Notification.permission;

      try {
        // Only initialize Firebase messaging if service workers are supported
        if ('serviceWorker' in navigator) {
          this.initializeMessaging();
        }
      } catch (error) {
        console.error('Error initializing Firebase messaging:', error);
      }
    }
  }

  /**
   * Gets the singleton instance of the NotificationService
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize Firebase Cloud Messaging
   */
  private async initializeMessaging(): Promise<void> {
    try {
      const app = getFirebaseApp();
      this.messaging = getMessaging(app);

      // Set up foreground message handler
      if (this.messaging) {
        onMessage(this.messaging, (payload) => {
          console.log('Message received in foreground:', payload);

          // Create a notification for foreground messages
          this.showLocalNotification(
            payload.notification?.title || 'New Message',
            payload.notification?.body || '',
            payload.data || {},
          );

          // Trigger callbacks
          this.notificationCallbacks.forEach((callback) => callback(payload));
        });
      }
    } catch (error) {
      console.error('Error setting up messaging:', error);
    }
  }

  /**
   * Request permission for notifications
   */
  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;

      if (permission === 'granted') {
        // After permission is granted, get FCM token
        await this.getFCMToken();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get the current notification permission status
   */
  public getPermissionStatus(): NotificationPermission {
    return this.notificationPermission;
  }

  /**
   * Get Firebase Cloud Messaging token for the current user
   */
  public async getFCMToken(): Promise<string | null> {
    if (!this.messaging || this.notificationPermission !== 'granted') {
      return null;
    }

    try {
      const serviceWorkerRegistration =
        await navigator.serviceWorker.getRegistration();

      this.fcmToken = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
        serviceWorkerRegistration,
      });

      console.log('FCM Token:', this.fcmToken);

      // Here you would typically send this token to your server
      if (this.fcmToken) {
        // this.saveTokenToServer(this.fcmToken);
      }

      return this.fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Show a local notification using the Browser Notifications API
   */
  public showLocalNotification(
    title: string,
    body: string,
    data: NotificationData = {},
    icon = '/logo_192x192.png',
  ): boolean {
    if (this.notificationPermission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      // Detect mobile & PWA mode
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;
      const isMobile =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      // Log platform info for debugging
      console.log('Platform detection:', { isPWA, isMobile, isIOS });

      // iOS in PWA mode doesn't support notifications at all
      if (isIOS && isPWA) {
        console.warn('iOS PWA mode does not support Web Notifications API');
        return false;
      }

      // For Android PWA, use service worker if available
      if (isPWA && isMobile && !isIOS && 'serviceWorker' in navigator) {
        console.log('Using service worker for notification in Android PWA');
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon,
            data,
            requireInteraction: true,
            actions: data.url ? [{ action: 'open', title: 'Open' }] : [],
          });
        });
        return true;
      } else {
        // Standard browser notification for desktop or non-PWA mobile
        console.log('Using standard browser notification API');
        const notification = new Notification(title, {
          body,
          icon,
          data,
        });

        notification.onclick = () => {
          console.log('Notification clicked', data);
          window.focus();
          notification.close();

          if (data.url) {
            window.location.href = data.url;
          }
        };
        return true;
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  /**
   * Register a callback to be called when a notification is received
   */
  public onNotificationReceived(
    callback: (_payload: unknown) => void,
  ): () => void {
    this.notificationCallbacks.push(callback);

    // Return a function to unregister the callback
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }
}

// Export a convenient singleton instance
export const notificationService = NotificationService.getInstance();
