<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { navigatorApi } from '@/api/navigator-api';
import { OfflineStorageService } from '@/services/storage.service';
import type {
  Hospital,
  Floor,
  EmergencyContact,
  DestinationItem,
  OfflineHospitalPackage,
} from '@/types/navigator.types';

export type RoutePreferences = {
  wheelchair: boolean;
  noStairs: boolean;
  nearestElevator: boolean;
  highContrast: boolean;
  voiceGuidance: boolean;
  language: string;
};

type AppData = {
  hospitals: Hospital[];
  destinations: DestinationItem[];
  facilities: string[];
  recentSearches: string[];
  map: { version: string; size: string; updated: string; floorsCount: number };
  activePackage?: OfflineHospitalPackage;
};

type AppContextType = {
  // Core state
  data: AppData | null;
=======
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  navigatorApi,
  type Hospital,
  type Destination,
  type HospitalBootstrapData,
  type VectorMapData,
  type OfflinePackage,
  type EmergencyContact,
} from "@/api/navigator-api";
import { offlineStorageService } from "@/services/storage.service";

interface AppContextType {
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
  hospitals: Hospital[];
  hospital: Hospital | null;
  selectedHospital: Hospital | null;
  setHospital: (hospital: Hospital) => void;
<<<<<<< HEAD
  selectHospital: (hospital: Hospital) => Promise<void>;

  // Offline map package state
  hospitalPackage: OfflineHospitalPackage | null;
  downloadedHospitalIds: number[];
  isDownloadingMap: boolean;
  downloadProgress: number;
  downloadMap: (hospitalId?: number | string) => Promise<void>;

  // Destinations & routing
  destinations: DestinationItem[];
  destination: DestinationItem | null;
  selectedDestination: DestinationItem | null;
  setDestination: (destination: DestinationItem) => void;
  selectDestination: (destination: DestinationItem) => void;

  // Floors & Contacts
  floors: Floor[];
  selectedFloor: Floor | null;
  selectFloor: (floor: Floor) => void;
  emergencyContacts: EmergencyContact[];

  // Navigation / QR Indoor positioning
  userLocation: { name: string; detail: string; floorNumber: number | string; nodeId?: string };
  setUserLocation: (loc: { name: string; detail: string; floorNumber: number | string; nodeId?: string }) => void;

  // Search & Preferences
=======
  bootstrapData: HospitalBootstrapData | null;
  destinations: Destination[];
  destination: Destination | null;
  setDestination: (destination: Destination | null) => void;
  currentFloorId: number | null;
  setCurrentFloorId: (floorId: number) => void;
  currentFloorMap: VectorMapData | null;
  facilities: string[];
  emergencyContacts: EmergencyContact[];
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
  query: string;
  setQuery: (query: string) => void;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  preferences: RoutePreferences;
  updatePreferences: (prefs: Partial<RoutePreferences>) => void;

  // App UI state
  menu: boolean;
  setMenu: (menu: boolean) => void;
  isLoading: boolean;
<<<<<<< HEAD
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
};
=======
  isDownloading: boolean;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  offlinePackage: OfflinePackage | null;
  downloadMap: () => Promise<boolean>;
  refreshHospitalData: () => Promise<void>;
  searchResults: Destination[];
  searchDestinations: (term: string) => Promise<void>;
}
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
<<<<<<< HEAD
  const [data, setData] = useState<AppData | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospital, setHospitalState] = useState<Hospital | null>(null);
  const [hospitalPackage, setHospitalPackage] = useState<OfflineHospitalPackage | null>(null);
  const [downloadedHospitalIds, setDownloadedHospitalIds] = useState<number[]>([]);
  const [isDownloadingMap, setIsDownloadingMap] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [destination, setDestinationState] = useState<DestinationItem | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  const [userLocation, setUserLocation] = useState<{
    name: string;
    detail: string;
    floorNumber: number | string;
    nodeId?: string;
  }>({
    name: 'Main Entrance QR',
    detail: 'Ground Floor, Main Wing',
    floorNumber: 0,
    nodeId: 'n1',
  });

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<RoutePreferences>({
    wheelchair: true,
    noStairs: true,
    nearestElevator: true,
    highContrast: false,
    voiceGuidance: true,
    language: 'English (US)',
  });

  const [menu, setMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Initialize Bootstrap Data
  useEffect(() => {
    async function initApp() {
      try {
        const [bootstrap, downloadedIds, savedSearches, savedPrefs] = await Promise.all([
          navigatorApi.getBootstrap(),
          OfflineStorageService.getDownloadedHospitalIds(),
          OfflineStorageService.getRecentSearches(),
          OfflineStorageService.getRoutePreferences(),
        ]);

        setData(bootstrap);
        setHospitals(bootstrap.hospitals);
        setDownloadedHospitalIds(downloadedIds);
        setRecentSearches(savedSearches);
        if (savedPrefs) {
          setPreferences((prev) => ({ ...prev, ...savedPrefs }));
        }

        const activeHosp = bootstrap.hospitals[0] || null;
        setHospitalState(activeHosp);

        if (bootstrap.activePackage) {
          setHospitalPackage(bootstrap.activePackage);
          setDestinations(bootstrap.activePackage.destinations);
          setDestinationState(bootstrap.activePackage.destinations[0] || null);
          setFloors(bootstrap.activePackage.floors);
          setSelectedFloor(bootstrap.activePackage.floors[0] || null);
          setEmergencyContacts(bootstrap.activePackage.emergencyContacts);
        }
      } catch (err) {
        console.warn('[AppContext] Init failed, running in fallback mode:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initApp();
  }, []);

  // Select hospital and load its package (from storage if offline, or from API)
  const selectHospital = useCallback(async (hosp: Hospital) => {
    setHospitalState(hosp);
    setIsLoading(true);

    try {
      // 1. Check if stored offline locally
      const cachedPkg = await OfflineStorageService.getHospitalPackage(hosp.id);
      if (cachedPkg) {
        setHospitalPackage(cachedPkg);
        setDestinations(cachedPkg.destinations);
        setDestinationState(cachedPkg.destinations[0] || null);
        setFloors(cachedPkg.floors);
        setSelectedFloor(cachedPkg.floors[0] || null);
        setEmergencyContacts(cachedPkg.emergencyContacts);
      } else {
        // 2. Fetch from backend API
        const pkg = await navigatorApi.downloadHospitalPackage(hosp.id);
        setHospitalPackage(pkg);
        setDestinations(pkg.destinations);
        setDestinationState(pkg.destinations[0] || null);
        setFloors(pkg.floors);
        setSelectedFloor(pkg.floors[0] || null);
        setEmergencyContacts(pkg.emergencyContacts);
      }
    } catch (e) {
      console.warn('[AppContext] Failed to load hospital package:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Download Map package locally
  const downloadMap = useCallback(async (targetHospitalId?: number | string) => {
    const id = targetHospitalId || hospital?.id;
    if (!id) return;

    setIsDownloadingMap(true);
    setDownloadProgress(10);

    try {
      setDownloadProgress(35);
      const pkg = await navigatorApi.downloadHospitalPackage(id);
      setDownloadProgress(75);

      await OfflineStorageService.saveHospitalPackage(pkg);
      setHospitalPackage(pkg);
      setDestinations(pkg.destinations);
      setFloors(pkg.floors);
      setEmergencyContacts(pkg.emergencyContacts);

      const downloaded = await OfflineStorageService.getDownloadedHospitalIds();
      setDownloadedHospitalIds(downloaded);
      setDownloadProgress(100);
    } catch (e) {
      console.warn('[AppContext] Download map failed:', e);
    } finally {
      setTimeout(() => {
        setIsDownloadingMap(false);
        setDownloadProgress(0);
      }, 400);
    }
  }, [hospital]);

  const selectDestination = useCallback((dest: DestinationItem) => {
    setDestinationState(dest);
    addRecentSearch(dest.name);
  }, []);

  const addRecentSearch = useCallback(async (term: string) => {
    if (!term || term.trim() === '') return;
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 6);
      OfflineStorageService.saveRecentSearches(updated);
      return updated;
    });
  }, []);

  const updatePreferences = useCallback(async (newPrefs: Partial<RoutePreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      OfflineStorageService.saveRoutePreferences(updated);
      return updated;
    });
=======
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [bootstrapData, setBootstrapData] = useState<HospitalBootstrapData | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [currentFloorId, setCurrentFloorId] = useState<number | null>(null);
  const [currentFloorMap, setCurrentFloorMap] = useState<VectorMapData | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [menu, setMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlinePackage, setOfflinePackage] = useState<OfflinePackage | null>(null);

  // Initialize and load persistent cache + backend sync
  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      setIsLoading(true);
      try {
        // 1. Try to fetch live hospitals from API
        const hospitalList = await navigatorApi.getHospitals();
        if (isMounted) {
          setHospitals(hospitalList);
          await offlineStorageService.saveHospitals(hospitalList);

          if (hospitalList.length > 0) {
            // Check if there was a saved active hospital ID
            const savedId = await offlineStorageService.loadActiveHospitalId();
            const chosen = hospitalList.find((h) => h.id === savedId) || hospitalList[0];
            setSelectedHospital(chosen);
            await loadHospitalBootstrap(chosen.id);
          }
        }
      } catch (err) {
        console.warn("Backend unavailable, loading persistent offline cache...", err);
        const cachedHospitals = await offlineStorageService.loadHospitals();
        if (cachedHospitals && isMounted) {
          setHospitals(cachedHospitals);
          const savedId = await offlineStorageService.loadActiveHospitalId();
          const chosen = cachedHospitals.find((h) => h.id === savedId) || cachedHospitals[0];
          setSelectedHospital(chosen);
          await loadHospitalBootstrap(chosen.id);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
  }, []);

  const loadHospitalBootstrap = async (hospitalId: number) => {
    try {
      // Check persistent storage for pre-downloaded offline package first
      const storedPkg = await offlineStorageService.loadPackage(hospitalId);
      if (storedPkg) {
        setOfflinePackage(storedPkg);
      }

      if (!isOfflineMode) {
        const data = await navigatorApi.getBootstrap(hospitalId);
        setBootstrapData(data);
        setDestinations(data.destinations || []);

        if (data.destinations && data.destinations.length > 0 && !destination) {
          setDestination(data.destinations[0]);
        }

        if (data.buildings && data.buildings.length > 0 && data.buildings[0].floors.length > 0) {
          const firstFloor = data.buildings[0].floors[0];
          setCurrentFloorId(firstFloor.id);
          loadFloorMap(hospitalId, firstFloor.id);
        }
      } else if (storedPkg) {
        setBootstrapData(storedPkg.bootstrap);
        setDestinations(storedPkg.bootstrap.destinations || []);
        if (storedPkg.floors && storedPkg.floors.length > 0) {
          setCurrentFloorId(storedPkg.floors[0].floor_id);
          setCurrentFloorMap(storedPkg.floors[0].vector_map);
        }
      }
    } catch (err) {
      console.warn("Bootstrap sync failed, falling back to persistent local package...", err);
      const storedPkg = await offlineStorageService.loadPackage(hospitalId);
      if (storedPkg) {
        setBootstrapData(storedPkg.bootstrap);
        setDestinations(storedPkg.bootstrap.destinations || []);
        setOfflinePackage(storedPkg);
        if (storedPkg.floors && storedPkg.floors.length > 0) {
          setCurrentFloorId(storedPkg.floors[0].floor_id);
          setCurrentFloorMap(storedPkg.floors[0].vector_map);
        }
      }
    }
  };

  const loadFloorMap = async (hospitalId: number, floorId: number) => {
    try {
      if (isOfflineMode && offlinePackage) {
        const fEntry = offlinePackage.floors.find((f) => f.floor_id === floorId);
        if (fEntry) {
          setCurrentFloorMap(fEntry.vector_map);
          return;
        }
      }
      const map = await navigatorApi.getFloorMap(hospitalId, floorId);
      setCurrentFloorMap(map);
    } catch (err) {
      console.warn(`Could not load map for floor ${floorId}:`, err);
      if (offlinePackage) {
        const fEntry = offlinePackage.floors.find((f) => f.floor_id === floorId);
        if (fEntry) {
          setCurrentFloorMap(fEntry.vector_map);
        }
      }
    }
  };

  const selectDestination = (dest: Destination | null) => {
    setDestination(dest);
    if (dest && dest.floor_id && hospital) {
      setCurrentFloorId(dest.floor_id);
      loadFloorMap(hospital.id, dest.floor_id);
    }
  };

  const setHospital = (h: Hospital) => {
    setSelectedHospital(h);
    offlineStorageService.saveActiveHospitalId(h.id);
    loadHospitalBootstrap(h.id);
  };

  const setFloor = (floorId: number) => {
    setCurrentFloorId(floorId);
    if (hospital) {
      loadFloorMap(hospital.id, floorId);
    }
  };

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev: string[]) => {
      const filtered = prev.filter((x: string) => x.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, 5);
    });
  };

  const searchDestinations = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        return;
      }
      if (!hospital) return;

      if (!isOfflineMode) {
        try {
          const results = await navigatorApi.search(hospital.id, term);
          setSearchResults(results);
          return;
        } catch {
          // fallback to local filter
        }
      }

      // Local filter from persistent bootstrap
      const t = term.toLowerCase();
      const local = (bootstrapData?.destinations || []).filter(
        (d: Destination) =>
          d.name.toLowerCase().includes(t) ||
          (d.detail && d.detail.toLowerCase().includes(t)) ||
          (d.room_number && d.room_number.toLowerCase().includes(t)),
      );
      setSearchResults(local);
    },
    [hospital, isOfflineMode, bootstrapData],
  );

  const downloadMap = async (): Promise<boolean> => {
    if (!hospital) return false;
    setIsDownloading(true);
    try {
      const pkg = await navigatorApi.downloadPackage(hospital.id);
      await offlineStorageService.savePackage(hospital.id, pkg);
      setOfflinePackage(pkg);
      return true;
    } catch (err) {
      console.error("Map package download error:", err);
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  const refreshHospitalData = async () => {
    if (hospital) {
      await loadHospitalBootstrap(hospital.id);
    }
  };

  const facilities = bootstrapData?.facilities || [
    "Accessible entrance & ramps",
    "Elevators to all floors",
    "Restrooms",
    "Emergency call stations",
  ];

  const emergencyContacts = bootstrapData?.emergency_contacts || [
    { id: 1, title: "Hospital Reception", phone_number: "+1-800-555-0199", icon: "phone", category: "phone" },
    { id: 2, title: "Ambulance Hotline", phone_number: "911", icon: "ambulance", category: "ambulance" },
    { id: 3, title: "Emergency Room Triage", phone_number: "+1-800-555-0120", icon: "location", category: "location" },
  ];

  return (
    <AppContext.Provider
      value={{
<<<<<<< HEAD
        data,
        hospitals,
        hospital,
        selectedHospital: hospital,
        setHospital: setHospitalState,
        selectHospital,

        hospitalPackage,
        downloadedHospitalIds,
        isDownloadingMap,
        downloadProgress,
        downloadMap,

        destinations,
        destination,
        selectedDestination: destination,
        setDestination: setDestinationState,
        selectDestination,

        floors,
        selectedFloor,
        selectFloor: setSelectedFloor,
        emergencyContacts,

        userLocation,
        setUserLocation,

        query,
        setQuery,
        recentSearches,
        addRecentSearch,
        preferences,
        updatePreferences,

        menu,
        setMenu,
        isLoading,
        isOffline,
        setIsOffline,
=======
        hospitals,
        hospital,
        setHospital,
        bootstrapData,
        destinations,
        destination,
        setDestination: selectDestination,
        currentFloorId,
        setCurrentFloorId: setFloor,
        currentFloorMap,
        facilities,
        emergencyContacts,
        recentSearches,
        addRecentSearch,
        query,
        setQuery,
        menu,
        setMenu,
        isLoading,
        isDownloading,
        isOfflineMode,
        setIsOfflineMode,
        offlinePackage,
        downloadMap,
        refreshHospitalData,
        searchResults,
        searchDestinations,
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
