import { getRemoteConfig } from 'firebase/remote-config';
import { getFirebaseApp } from './firebaseApp';

// Initialize Firebase Remote Config
export const remoteConfig = getRemoteConfig(getFirebaseApp());
// Set default Remote Config settings
remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour (default is 12 hours)
// Set default Remote Config values while waiting for the first fetch
remoteConfig.defaultConfig = {
  login_show: false,
};
