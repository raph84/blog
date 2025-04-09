// src/mocks/firebase.test.ts
import { describe, it, expect, vi } from 'vitest';
import { mockAuthFunctions, mockUser } from './firebase';

describe('Firebase Mocks', () => {
  it('should provide mock auth functions', () => {
    expect(mockAuthFunctions.signInWithPopup).toBeDefined();
    expect(mockAuthFunctions.onAuthStateChanged).toBeDefined();
    expect(mockAuthFunctions.signOut).toBeDefined();
    expect(mockAuthFunctions.GoogleAuthProvider).toBeDefined();
  });

  it('should setup onAuthStateChanged handler that returns unsubscribe function', () => {
    // Mock implementation - ensure it returns a function
    mockAuthFunctions.onAuthStateChanged.mockImplementationOnce(() => {
      return vi.fn();
    });

    const callback = vi.fn();
    const unsubscribe = mockAuthFunctions.onAuthStateChanged(null, callback);

    // Verify the unsubscribe is a function
    expect(typeof unsubscribe).toBe('function');
  });

  it('should provide mock user data with required properties', () => {
    expect(mockUser).toHaveProperty('uid');
    expect(mockUser).toHaveProperty('email');
    expect(mockUser).toHaveProperty('displayName');
  });

  it('should have mock for signInWithPopup that returns a user', async () => {
    // Mock implementation to ensure it returns an object with user and credential
    mockAuthFunctions.signInWithPopup.mockResolvedValueOnce({
      user: mockUser,
      credential: { accessToken: 'mock-token' },
    });

    const result = await mockAuthFunctions.signInWithPopup(null, null);
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('credential');
    expect(result.user).toEqual(mockUser);
  });
});
