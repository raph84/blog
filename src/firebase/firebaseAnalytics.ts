import { getAnalytics } from 'firebase/analytics';
import { getFirebaseApp } from './firebaseApp';

// Initialize Firebase Analytics
export const analytics = getAnalytics(getFirebaseApp());
