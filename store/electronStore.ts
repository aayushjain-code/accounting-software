import { create } from "zustand";
import { persist } from "zustand/middleware";

// Check if running in Electron
const isElectron =
  typeof window !== "undefined" && window.electronAPI?.isElectron;

// Electron storage adapter
const electronStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (!isElectron || !window.electronAPI) {
      // Fallback to localStorage for web
      return localStorage.getItem(name);
    }

    try {
      // For now, return null as we're using SQLite directly
      return null;
    } catch (error) {
      console.error("Error reading from Electron store:", error);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (!isElectron || !window.electronAPI) {
      // Fallback to localStorage for web
      localStorage.setItem(name, value);
      return;
    }

    try {
      // For now, do nothing as we're using SQLite directly
    } catch (error) {
      console.error("Error writing to Electron store:", error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    if (!isElectron || !window.electronAPI) {
      // Fallback to localStorage for web
      localStorage.removeItem(name);
      return;
    }

    try {
      // For now, do nothing as we're using SQLite directly
    } catch (error) {
      console.error("Error removing from Electron store:", error);
    }
  },
};

// Synchronous wrapper for compatibility with Zustand persist
const syncStorage = {
  getItem: (name: string): string | null => {
    // For Electron, we'll use a synchronous approach with localStorage as cache
    if (isElectron) {
      const cached = localStorage.getItem(`electron-cache-${name}`);
      if (cached) {
        return cached;
      }
      // Return null and let the async handler deal with it
      return null;
    }
    return localStorage.getItem(name);
  },

  setItem: (name: string, value: string): void => {
    if (isElectron) {
      // Cache in localStorage for immediate access
      localStorage.setItem(`electron-cache-${name}`, value);
      // Async write to Electron store
      electronStorage.setItem(name, value);
    } else {
      localStorage.setItem(name, value);
    }
  },

  removeItem: (name: string): void => {
    if (isElectron) {
      localStorage.removeItem(`electron-cache-${name}`);
      electronStorage.removeItem(name);
    } else {
      localStorage.removeItem(name);
    }
  },
} as const;

// Initialize data from Electron store on app start
if (isElectron && window.electronAPI) {
  // For now, do nothing as we're using SQLite directly
  // Data will be loaded through the new SQLite API
}

export { syncStorage as electronStore, isElectron };
