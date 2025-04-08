import { renderHook, act } from '@testing-library/react';
import useLocalStorage from './UseLocalStorage';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return the fallback state when no value is stored', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('should return the stored value when it exists', () => {
    localStorage.setItem('testKey', JSON.stringify('storedValue'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'fallback'));
    expect(result.current[0]).toBe('storedValue');
  });

  it('should update the stored value when the setter is called', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'fallback'));
    act(() => {
      result.current[1]('newValue');
    });
    expect(result.current[0]).toBe('newValue');
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify('newValue'));
  });

  it('should handle different data types', () => {
    const { result: stringResult } = renderHook(() =>
      useLocalStorage('stringKey', ''),
    );
    act(() => {
      stringResult.current[1]('test');
    });
    expect(stringResult.current[0]).toBe('test');
    expect(localStorage.getItem('stringKey')).toBe(JSON.stringify('test'));

    const { result: numberResult } = renderHook(() =>
      useLocalStorage<number>('numberKey', 0),
    );
    act(() => {
      numberResult.current[1](123);
    });
    expect(numberResult.current[0]).toBe(123);
    expect(localStorage.getItem('numberKey')).toBe(JSON.stringify(123));

    const { result: booleanResult } = renderHook(() =>
      useLocalStorage<boolean>('booleanKey', false),
    );
    act(() => {
      booleanResult.current[1](true);
    });
    expect(booleanResult.current[0]).toBe(true);
    expect(localStorage.getItem('booleanKey')).toBe(JSON.stringify(true));

    const { result: objectResult } = renderHook(() =>
      useLocalStorage<{ a: number; b: number }>('objectKey', { a: 0, b: 0 }),
    );
    act(() => {
      objectResult.current[1]({ a: 1, b: 2 });
    });
    expect(objectResult.current[0]).toEqual({ a: 1, b: 2 });
    expect(localStorage.getItem('objectKey')).toBe(
      JSON.stringify({ a: 1, b: 2 }),
    );

    const { result: arrayResult } = renderHook(() =>
      useLocalStorage<number[]>('arrayKey', []),
    );
    act(() => {
      arrayResult.current[1]([1, 2, 3]);
    });
    expect(arrayResult.current[0]).toEqual([1, 2, 3]);
    expect(localStorage.getItem('arrayKey')).toBe(JSON.stringify([1, 2, 3]));
  });

  it('should update the state when the localStorage is updated from another tab', async () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage('testKey', 'initial'),
    );
    expect(result.current[0]).toBe('initial');

    // Ensure the listener is attached before dispatching the event
    await act(async () => {
      localStorage.setItem('testKey', JSON.stringify('updated'));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'testKey',
          newValue: JSON.stringify('updated'),
          storageArea: localStorage,
        }),
      );
      // Wait for the event to be processed.
      await new Promise((resolve) => setTimeout(resolve, 0));
      rerender();
    });

    expect(result.current[0]).toBe('updated');
  });
});
