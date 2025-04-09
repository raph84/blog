// src/components/sandbox/react/UseLocalStorage.ts
import { useState, useEffect, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Use a ref to store the initialValue to ensure it doesn't change between renders
  const initialValueRef = useRef(initialValue);

  // State to store our value
  // Pass a function to useState so the logic only runs once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((_val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  // Update local storage if the key changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        // Only update state if the localStorage value is different than current state
        // and only if localStorage has this key
        if (item) {
          const parsedItem = JSON.parse(item);
          // Use JSON stringify for deep comparison
          if (JSON.stringify(parsedItem) !== JSON.stringify(storedValue)) {
            setStoredValue(parsedItem);
          }
        } else {
          // If key doesn't exist in localStorage, initialize it
          window.localStorage.setItem(
            key,
            JSON.stringify(initialValueRef.current),
          );
        }
      } catch (error) {
        console.error('Error synchronizing with localStorage:', error);
      }
    }
  }, [key]); // Only re-run if key changes

  return [storedValue, setValue] as const;
}
