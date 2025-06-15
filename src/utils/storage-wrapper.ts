import { PersistStorage } from 'zustand/middleware';

// Custom storage object that safely handles SSR for Zustand persist
export const createSafeStorage = <T>(): PersistStorage<T> => ({
  getItem: (name: string): T | null | Promise<T | null> => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const value = localStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: T): void | Promise<void> => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
    }
  },
  removeItem: (name: string): void | Promise<void> => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  },
});
