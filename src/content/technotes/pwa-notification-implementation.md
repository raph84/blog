---
title: PWA Notifications Implementation Guide
description: Implementation of PWA notifications using Firebase Cloud Messaging and local browser notifications
pubDate: '2025-04-10'
author: Raph
---

# PWA Notifications Implementation Guide

This guide explains how to implement and configure notifications in your Astro PWA application, including both local browser notifications and Firebase Cloud Messaging (FCM) for push notifications.

## Table of Contents

1. [Overview](#overview)
2. [Implementation Components](#implementation-components)
3. [Setup Instructions](#setup-instructions)
4. [Usage Examples](#usage-examples)
5. [Authentication Integration](#authentication-integration)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Configuration](#advanced-configuration)

## Overview

The notification system in this PWA provides:

- **Local Browser Notifications**: For in-app generated alerts
- **Push Notifications**: Using Firebase Cloud Messaging for server-sent alerts
- **User Control**: Interface for users to manage notification permissions

## Implementation Components

The complete notification system consists of:

1. **Core Services**:

   - `NotificationService`: A singleton class managing notification permissions and display
   - `firebase/firebaseMessaging.ts`: Firebase Cloud Messaging setup

2. **Service Worker**:

   - Push event handling for background notifications
   - Notification click handling for navigation

3. **UI Components**:

   - `NotificationButton`: Header button for quick notification access
   - `NotificationTest`: Component for testing notification functionality
   - `FirebaseMessagingExample`: Component demonstrating FCM capabilities

4. **Pages**:
   - `/notifications`: A dedicated page for notification management

## Setup Instructions

### 1. Install Required Dependencies

The implementation leverages Firebase Cloud Messaging:

```bash
# If not already installed
npm install firebase
# or
pnpm add firebase
```

### 2. Firebase Project Configuration

1. **Enable Firebase Cloud Messaging**:

   - Go to Firebase Console -> Your Project -> Build -> Cloud Messaging
   - Enable the Cloud Messaging API

2. **Generate VAPID Key**:

   - In Firebase Console -> Project Settings -> Cloud Messaging
   - Scroll to "Web Push certificates"
   - Click "Generate Key Pair"
   - Copy the generated key

3. **Update the NotificationService**:
   - Open `src/services/NotificationService.ts`
   - Replace `'YOUR_VAPID_KEY'` with your generated key:
   ```typescript
   private vapidKey: string = 'YOUR_ACTUAL_VAPID_KEY';
   ```

### 3. Service Worker Configuration

The service worker is already configured for both local and push notifications using the Vite PWA plugin.

1. **Verify PWA Configuration**:
   - Check `astro.config.mjs` to ensure the PWA plugin is properly configured
   - Make sure service worker registration is enabled

### 4. Integration with Authentication

The notification components are configured to only appear for authenticated users:

1. **Update Header Component**:
   - Notification-related UI elements are wrapped in containers with authentication checks
   - The auth state listener controls visibility

## Usage Examples

### Basic Notification Display

```typescript
import { notificationService } from '../services/NotificationService';

// Request permission and show a notification
async function showNotification() {
  const granted = await notificationService.requestPermission();
  if (granted) {
    notificationService.showLocalNotification(
      'Hello!',
      'This is a test notification',
      { url: '/webapp' }, // Optional data with navigation URL
    );
  }
}
```

### Listening for Notification Events

```typescript
// Register a callback for notification events
const unsubscribe = notificationService.onNotificationReceived((payload) => {
  console.log('Notification received:', payload);
  // Handle the notification data
});

// Unregister when no longer needed
unsubscribe();
```

### Server-Side Push Notifications

For server-side implementation (Node.js example):

```javascript
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Send a notification to a specific device
async function sendPushNotification(fcmToken, title, body, data = {}) {
  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data,
    webpush: {
      fcmOptions: {
        link: data.url,
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
```

## Troubleshooting

### Notifications Not Showing

1. **Check Permissions**:

   - Verify browser permissions: `Notification.permission` should be `"granted"`
   - Check browser settings for blocked notifications

2. **Service Worker Issues**:

   - Ensure service worker is registered: Check DevTools > Application > Service Workers
   - Verify service worker activation: Should be in "activated" state

3. **Firebase Configuration**:
   - Ensure Firebase is properly initialized
   - Check for FCM errors in console
   - Verify VAPID key is correctly set

### Push Notifications Not Working

1. **Token Issues**:

   - Verify FCM token is generated and valid
   - Check server logs for FCM API errors

2. **HTTPS Requirement**:
   - Ensure app is served over HTTPS (required for service workers and notifications)
   - Localhost is allowed during development

## Advanced Configuration

### Custom Notification Actions

Add custom actions to notifications:

```typescript
notificationService.showLocalNotification(
  'New Message',
  'You have a new message',
  {
    url: '/messages',
    messageId: '12345',
  },
  '/logo_192x192.png', // Icon
);
```

### Notification Categories

Implement notification categories for different types of alerts:

```typescript
// In your application code
const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  REMINDER: 'reminder',
  UPDATE: 'update',
};

// When sending notification
notificationService.showLocalNotification(
  'System Update',
  'A new version is available',
  {
    type: NOTIFICATION_TYPES.UPDATE,
    version: '2.0.0',
  },
);
```

### Storing User Preferences

For more advanced notification preferences:

1. Create a user preferences interface:

   ```typescript
   interface NotificationPreferences {
     enableAll: boolean;
     categories: {
       messages: boolean;
       updates: boolean;
       promotions: boolean;
     };
   }
   ```

2. Store preferences in Firestore or another database
3. Check preferences before sending notifications

---

This documentation provides a comprehensive guide to understanding, implementing, and extending the notification system in your Astro PWA application.
