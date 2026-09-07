import { Platform } from "react-native";

class MemoryStorage {
  private data: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.data[key] || null;
  }

  setItem(key: string, value: string): void {
    this.data[key] = value;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }
}

let storage: {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
};

if (Platform.OS === "web") {
  storage = {
    getItem: (key) => {
      if (typeof window !== "undefined") {
        return window.localStorage.getItem(key);
      }
      return null;
    },
    setItem: (key, value) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, value);
      }
    },
    removeItem: (key) => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    },
  };
} else {
  // Safe in-memory fallback for Native environments when AsyncStorage is not explicitly linked
  storage = new MemoryStorage();
}

export default storage;
