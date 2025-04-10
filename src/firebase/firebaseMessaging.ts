import { getMessaging } from 'firebase/messaging';
import { getFirebaseApp } from './firebaseApp';

// Initialize Firebase Messaging
let messaging: unknown = null;

// Only initialize in browser environment with service workers
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(getFirebaseApp());
    console.log('Firebase Messaging initialized');
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
  }
}

export const firebaseMessaging = messaging;
