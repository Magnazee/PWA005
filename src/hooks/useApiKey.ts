import { useState, useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'claude-api-key';

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Try to load the API key from localStorage on component mount
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const updateApiKey = (newKey: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, newKey);
    setApiKey(newKey);
  };

  return { apiKey, setApiKey: updateApiKey };
}