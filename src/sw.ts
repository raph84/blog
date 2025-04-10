import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import type {
  RouteMatchCallbackOptions,
  RouteHandlerCallbackOptions,
} from 'workbox-core/types';

type MatchCbOptions = RouteMatchCallbackOptions;
type HandlerCbOptions = RouteHandlerCallbackOptions;

// Define the expected push notification payload structure
interface PushNotificationPayload {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
    tag?: string;
    actions?: {
      action: string;
      title: string;
      icon?: string;
    }[];
    requireInteraction?: boolean;
  };
  data?: Record<string, string> & {
    url?: string;
  };
}

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST, {
  directoryIndex: 'index.html',
  cleanURLs: true,
});

// Handle push events from Firebase Cloud Messaging
self.addEventListener('push', (event) => {
  let payload: PushNotificationPayload = {};
  try {
    payload = event.data?.json() || {};
  } catch (_e) {
    payload = {
      notification: {
        title: 'New Notification',
        body: event.data?.text() || 'No content',
      },
    };
  }

  // Extract notification data
  const title = payload.notification?.title || 'New Notification';
  const options = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/logo_192x192.png',
    badge: '/logo_192x192.png',
    data: payload.data || {},
    actions: payload.notification?.actions || [],
    vibrate: [100, 50, 100],
    tag: payload.notification?.tag || 'default',
    requireInteraction: payload.notification?.requireInteraction || false,
  };

  // Show notification
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Check if there's a specific URL to open
  const notificationData = event.notification.data as
    | { url?: string }
    | undefined;
  const url = notificationData?.url || '/';

  // Handle notification click - focus or open a window
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // If we have a client, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    }),
  );
});

// The original custom route handler
const matchCb = ({ url /*request, event*/ }: MatchCbOptions) => {
  return url.pathname === '/special/url';
};

const handlerCb = async ({
  /*url,*/ request: _request /*event, params*/,
}: HandlerCbOptions) => {
  //const response = await fetch(request);
  //const responseBody = await response.text();
  return new Response(`<!-- Look Ma. Added some Content. -->`, {});
};

registerRoute(matchCb, handlerCb);
