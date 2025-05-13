// src/components/FirebaseAuth.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import FirebaseAuth from './FirebaseAuth.astro';

// Mock the firebase imports that are used in the component
const signInWithPopupMock = vi.fn();
const onAuthStateChangedMock = vi.fn();
const signOutMock = vi.fn().mockResolvedValue(undefined);

vi.mock('firebase/auth', () => {
  return {
    signInWithPopup: signInWithPopupMock,
    onAuthStateChanged: onAuthStateChangedMock,
    GoogleAuthProvider: {
      credentialFromResult: vi.fn(),
      credentialFromError: vi.fn(),
    },
    getAuth: vi.fn(),
  };
});

// Mock the local firebase app module
vi.mock('../firebase/firebaseApp', () => {
  return {
    googleAuthProvider: { providerId: 'google.com' },
    auth: {
      signOut: signOutMock,
      currentUser: null,
    },
    getFirebaseApp: vi.fn(),
  };
});

describe('FirebaseAuth Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    vi.restoreAllMocks();
  });

  test('renders the login button when user is not authenticated', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FirebaseAuth);

    // Check that the login button is visible
    expect(result).toContain('id="sign-in-button"');
    expect(result).toContain('aria-label="Sign in"');

    // Check that the user button is hidden
    expect(result).toContain('id="user" class="hidden"');
  });

  test('contains the expected UI elements with icons', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FirebaseAuth);

    // Check for the presence of buttons with SVG icons, not the specific SVG paths
    expect(result).toContain('id="sign-in-button"');
    expect(result).toContain('id="user-button"');

    // Check that SVG elements exist within the buttons
    expect(result).toMatch(/<button[^>]*id="sign-in-button"[^>]*>[\s\S]*?<svg/);
    expect(result).toMatch(/<button[^>]*id="user-button"[^>]*>[\s\S]*?<svg/);
  });

  test('includes script element for client-side functionality', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FirebaseAuth);

    // Verify that a script tag is included
    expect(result).toContain('<script');
  });

  test('adds correct accessibility labels', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FirebaseAuth);

    // Check for accessibility labels
    expect(result).toContain('aria-label="Sign in"');
    expect(result).toContain('aria-label="User profile"');
    expect(result).toContain('<title id="user-email">Not signed in</title>');
  });

  test('has the correct class structure for styling', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FirebaseAuth);

    // Check for the main container class
    expect(result).toContain(
      'class="firebase-auth inline-flex items-center justify-center"',
    );

    // Check for button styling classes
    expect(result).toContain(
      'class="flex h-8 w-8 items-center justify-center rounded-md text-black hover:bg-gray-100 focus:outline-none"',
    );
  });
});
