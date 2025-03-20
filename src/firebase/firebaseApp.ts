// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

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

// Initialize Firebase
export const getFirebaseApp = () => initializeApp(firebaseConfig);

// Initialize Firebase Analytics
export const analytics = getAnalytics(getFirebaseApp());

// Connect to the Firebase Auth emulator if in development mode
if (import.meta.env.MODE === 'development') {
  const auth = getAuth(getFirebaseApp());
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}
