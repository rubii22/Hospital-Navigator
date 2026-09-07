<<<<<<< HEAD
import { Platform } from 'react-native';
import type { OfflineHospitalPackage } from '@/types/navigator.types';

const STORAGE_KEYS = {
  OFFLINE_PACKAGES: 'hn_offline_packages_v1',
  ACTIVE_HOSPITAL_ID: 'hn_active_hospital_id',
  RECENT_SEARCHES: 'hn_recent_searches',
  ROUTE_PREFS: 'hn_route_preferences',
};

// In-memory fallback cache for environments without persistent web storage
const memoryStore = new Map<string, string>();

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      memoryStore.set(key, value);
    }
  } catch (e) {
    memoryStore.set(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStore.get(key) || null;
  } catch (e) {
    return memoryStore.get(key) || null;
  }
}

export const OfflineStorageService = {
  /** Save a full offline hospital package */
  async saveHospitalPackage(pkg: OfflineHospitalPackage): Promise<void> {
    const existingRaw = await getItem(STORAGE_KEYS.OFFLINE_PACKAGES);
    const packages: Record<string, OfflineHospitalPackage> = existingRaw ? JSON.parse(existingRaw) : {};
    packages[String(pkg.hospital.id)] = pkg;
    await setItem(STORAGE_KEYS.OFFLINE_PACKAGES, JSON.stringify(packages));
  },

  /** Get a saved offline hospital package */
  async getHospitalPackage(hospitalId: number | string): Promise<OfflineHospitalPackage | null> {
    const existingRaw = await getItem(STORAGE_KEYS.OFFLINE_PACKAGES);
    if (!existingRaw) return null;
    const packages: Record<string, OfflineHospitalPackage> = JSON.parse(existingRaw);
    return packages[String(hospitalId)] || null;
  },

  /** Get list of all downloaded hospital IDs */
  async getDownloadedHospitalIds(): Promise<number[]> {
    const existingRaw = await getItem(STORAGE_KEYS.OFFLINE_PACKAGES);
    if (!existingRaw) return [];
    const packages: Record<string, OfflineHospitalPackage> = JSON.parse(existingRaw);
    return Object.keys(packages).map((id) => Number(id));
  },

  /** Save recent search terms */
  async saveRecentSearches(searches: string[]): Promise<void> {
    await setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
  },

  /** Get recent search terms */
  async getRecentSearches(): Promise<string[]> {
    const raw = await getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return raw ? JSON.parse(raw) : ['Cardiology Department', 'Radiology Department', 'Emergency OPD'];
  },

  /** Save route preferences */
  async saveRoutePreferences(prefs: { wheelchair: boolean; noStairs: boolean; nearestElevator: boolean }): Promise<void> {
    await setItem(STORAGE_KEYS.ROUTE_PREFS, JSON.stringify(prefs));
  },

  /** Get route preferences */
  async getRoutePreferences(): Promise<{ wheelchair: boolean; noStairs: boolean; nearestElevator: boolean }> {
    const raw = await getItem(STORAGE_KEYS.ROUTE_PREFS);
    return raw ? JSON.parse(raw) : { wheelchair: true, noStairs: true, nearestElevator: true };
=======
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OfflinePackage, Hospital } from "@/api/navigator-api";

const STORAGE_KEYS = {
  HOSPITALS_CACHE: "@hn_cached_hospitals",
  ACTIVE_HOSPITAL_ID: "@hn_active_hospital_id",
  PACKAGE_PREFIX: "@hn_pkg_",
  RECENT_SEARCHES: "@hn_recent_searches",
};

export const offlineStorageService = {
  // Save full offline package to persistent storage
  savePackage: async (hospitalId: number, pkg: OfflinePackage): Promise<boolean> => {
    try {
      const key = `${STORAGE_KEYS.PACKAGE_PREFIX}${hospitalId}`;
      await AsyncStorage.setItem(key, JSON.stringify(pkg));
      return true;
    } catch (e) {
      console.warn(`Failed to persist offline package for hospital ${hospitalId}:`, e);
      return false;
    }
  },

  // Load offline package from persistent storage
  loadPackage: async (hospitalId: number): Promise<OfflinePackage | null> => {
    try {
      const key = `${STORAGE_KEYS.PACKAGE_PREFIX}${hospitalId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as OfflinePackage;
      }
      return null;
    } catch (e) {
      console.warn(`Failed to read offline package for hospital ${hospitalId}:`, e);
      return null;
    }
  },

  // Cache hospitals list
  saveHospitals: async (hospitals: Hospital[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HOSPITALS_CACHE, JSON.stringify(hospitals));
    } catch (e) {
      console.warn("Failed to cache hospitals list:", e);
    }
  },

  // Load cached hospitals
  loadHospitals: async (): Promise<Hospital[] | null> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HOSPITALS_CACHE);
      if (data) {
        return JSON.parse(data) as Hospital[];
      }
      return null;
    } catch (e) {
      console.warn("Failed to load cached hospitals:", e);
      return null;
    }
  },

  // Save active hospital ID
  saveActiveHospitalId: async (id: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_HOSPITAL_ID, String(id));
    } catch (e) {
      console.warn("Failed to save active hospital ID:", e);
    }
  },

  // Load active hospital ID
  loadActiveHospitalId: async (): Promise<number | null> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_HOSPITAL_ID);
      return data ? parseInt(data, 10) : null;
    } catch {
      return null;
    }
  },

  // Clear package
  removePackage: async (hospitalId: number): Promise<void> => {
    try {
      await AsyncStorage.removeItem(`${STORAGE_KEYS.PACKAGE_PREFIX}${hospitalId}`);
    } catch (e) {
      console.warn(`Failed to remove package for ${hospitalId}:`, e);
    }
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
  },
};
