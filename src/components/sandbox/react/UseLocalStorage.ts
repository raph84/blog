import * as React from 'react';

const useLocalStorage = <T>(storageKey: string, fallbackState: T) => {
  const [value, setValue] = React.useState<T>(() => {
    const storedValue = localStorage.getItem(storageKey);
    return storedValue ? JSON.parse(storedValue) : fallbackState;
  });

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [value, storageKey]);

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey && event.storageArea === localStorage) {
        try {
          const newValue = event.newValue
            ? JSON.parse(event.newValue)
            : fallbackState;
          setValue(newValue);
        } catch (error) {
          console.error('Error parsing localStorage value:', error);
          setValue(fallbackState);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey, fallbackState]);

  return [value, setValue] as const;
};

export default useLocalStorage;
