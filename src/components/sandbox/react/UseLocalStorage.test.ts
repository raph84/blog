// src/components/sandbox/react/UseLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './UseLocalStorage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Create a mock implementation of localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock window object to include our localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useLocalStorage hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with the initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue'),
    );

    // We need to wait for the useEffect to run
    // Initial value should be set immediately
    expect(result.current[0]).toBe('initialValue');
  });

  it('should update the stored value when setValue is called', () => {
    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue'),
    );

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'testKey',
      JSON.stringify('newValue'),
    );
  });

  it('should retrieve value from localStorage if available', () => {
    // Preset a value in localStorage
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify('storedValue'));

    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue'),
    );

    // Force re-render to run the useEffect
    act(() => {});

    expect(result.current[0]).toBe('storedValue');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
  });

  it('should handle non-string values with JSON serialization', () => {
    const complexValue = { nested: { data: [1, 2, 3] } };

    const { result } = renderHook(() =>
      useLocalStorage('testKey', complexValue),
    );

    act(() => {
      result.current[1]({ nested: { data: [4, 5, 6] } });
    });

    expect(result.current[0]).toEqual({ nested: { data: [4, 5, 6] } });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'testKey',
      JSON.stringify({ nested: { data: [4, 5, 6] } }),
    );
  });

  it('should accept a function to update the state', () => {
    const { result } = renderHook(() => useLocalStorage<number>('testKey', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });
});
