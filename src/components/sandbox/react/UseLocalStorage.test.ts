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
      // Use bracket notation to avoid ESLint error
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

describe('useLocalStorage hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    vi.clearAllMocks();

    // Mock the window.localStorage property
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  it('should initialize with the initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue'),
    );

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

  it('should handle errors when reading from localStorage', () => {
    // Mock an error when reading from localStorage
    const originalGetItem = localStorageMock.getItem;
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('Mock localStorage error');
    });

    // Spy on console.error to verify it's called
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {
        // Implementation intentionally left empty for mock
        return;
      });

    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue'),
    );

    // Initial value should be used when there's an error
    expect(result.current[0]).toBe('initialValue');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error reading from localStorage:',
      expect.any(Error),
    );

    // Restore the original implementation
    localStorageMock.getItem = originalGetItem;
    consoleErrorSpy.mockRestore();
  });

  it('should handle errors when writing to localStorage', () => {
    // Mock an error when writing to localStorage
    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Mock localStorage error');
    });

    // Spy on console.error to verify it's called
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {
        // Implementation intentionally left empty for mock
        return;
      });

    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue'),
    );

    act(() => {
      result.current[1]('newValue');
    });

    // Value should be updated in state but error logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error writing to localStorage:',
      expect.any(Error),
    );

    // Restore the original implementation
    localStorageMock.setItem = originalSetItem;
    consoleErrorSpy.mockRestore();
  });

  it('should handle invalid JSON in localStorage', () => {
    // Set invalid JSON in localStorage
    localStorageMock.getItem.mockReturnValueOnce('not valid json');

    // Spy on console.error to verify it's called
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {
        // Implementation intentionally left empty for mock
        return;
      });

    const { result } = renderHook(() =>
      useLocalStorage('testKey', 'initialValue'),
    );

    // Should use initial value when JSON is invalid
    expect(result.current[0]).toBe('initialValue');
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
