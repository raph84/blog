// src/mocks/firebase.ts
import { vi } from 'vitest';

// Mock user object
export const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
};

// Mock Firebase app module functions
export const mockFirebaseApp = {
  googleAuthProvider: { providerId: 'google.com' },
  auth: {
    signOut: vi.fn().mockResolvedValue(undefined),
    currentUser: null,
    authStateReady: vi.fn().mockResolvedValue(undefined),
  },
  getFirebaseApp: vi.fn(),
};

// Mock Firebase auth functions
export const mockAuthFunctions = {
  signInWithPopup: vi.fn().mockResolvedValue({
    user: mockUser,
    credential: { accessToken: 'mock-token' },
  }),
  onAuthStateChanged: vi.fn().mockImplementation((auth, callback) => {
    // Initially call with null (unauthenticated)
    if (callback) callback(null);
    // Return unsubscribe function
    return vi.fn();
  }),
  signOut: vi.fn().mockResolvedValue(undefined),
  GoogleAuthProvider: {
    credentialFromResult: vi
      .fn()
      .mockReturnValue({ accessToken: 'mock-token' }),
    credentialFromError: vi.fn(),
  },
  getAuth: vi.fn().mockReturnValue({
    currentUser: null,
    signOut: vi.fn().mockResolvedValue(undefined),
  }),
};

// Helper to setup all firebase mocks
export function setupFirebaseMocks() {
  // Reset any previous mocks
  vi.clearAllMocks();

  // Configure mocks with expected behavior
  mockAuthFunctions.onAuthStateChanged.mockImplementation((auth, callback) => {
    // Execute callback with null (unauthenticated state)
    if (callback) callback(null);
    // Return a mock unsubscribe function
    return vi.fn();
  });

  mockAuthFunctions.signInWithPopup.mockResolvedValue({
    user: mockUser,
    credential: { accessToken: 'mock-token' },
  });

  // Apply the mocks to their modules
  vi.mock('firebase/auth', () => mockAuthFunctions);
  vi.mock('../firebase/firebaseApp', () => mockFirebaseApp);
}

// Helper to clear all firebase mocks
export function clearFirebaseMocks() {
  vi.clearAllMocks();
}

// Helper to restore all firebase mocks
export function restoreFirebaseMocks() {
  vi.restoreAllMocks();
}
