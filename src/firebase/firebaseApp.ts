// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
} from 'firebase/auth';
import { getPerformance, type FirebasePerformance } from 'firebase/performance';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: 'AIzaSyDpI-f2z1raVgj0Z4iYyUqJjPW03kYlQOo',
  authDomain: 'raphberubecom.firebaseapp.com',
  databaseURL: 'https://raphberubecom.firebaseio.com',
  projectId: 'raphberubecom',
  storageBucket: 'raphberubecom.firebasestorage.app',
  messagingSenderId: '280954286553',
  appId: '1:280954286553:web:8b00cefde954a3a80329c8',
  measurementId: 'G-MX4F1PTVGH',
};

// Module-level singleton pattern
// Private instance variables
let firebaseAppInstance: FirebaseApp | null = null;
let firebasePerfInstance: FirebasePerformance | null = null;

// Private initialization function
const initializeFirebaseApp = (): FirebaseApp => {
  console.log('Initializing new Firebase app instance');
  const app = initializeApp(firebaseConfig);

  // Connect to the Firebase Auth emulator if in development mode
  if (import.meta.env.MODE === 'development') {
    const auth = getAuth(app);
    const authHost =
      import.meta.env.PUBLIC_EMULATOR_HOST || 'http://127.0.0.1:9099';
    connectAuthEmulator(auth, authHost);
  }

  // Initialize Performance monitoring
  try {
    firebasePerfInstance = getPerformance(app);
    console.log('Firebase Performance monitoring initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase Performance:', error);
  }

  return app;
};

// Public function to get the Firebase app instance
export const getFirebaseApp = (): FirebaseApp => {
  if (!firebaseAppInstance) {
    firebaseAppInstance = initializeFirebaseApp();
  }
  return firebaseAppInstance;
};

// Initialize auth provider
export const googleAuthProvider = new GoogleAuthProvider();

// Export auth instance
export const auth = getAuth(getFirebaseApp());

// Public function to get the Firebase Performance instance
export const getFirebasePerf = (): FirebasePerformance | null => {
  // Ensure Firebase app is initialized first
  const app = getFirebaseApp();

  // If Performance failed to initialize, try again
  if (!firebasePerfInstance) {
    try {
      firebasePerfInstance = getPerformance(app);
    } catch (error) {
      console.error('Failed to get Firebase Performance instance:', error);
    }
  }

  return firebasePerfInstance;
};
