<<<<<<< HEAD
import { API_CONFIG } from '@/config/api.config';
import type {
  Hospital,
  Building,
  Floor,
  Department,
  Room,
  EmergencyContact,
  DestinationItem,
  OfflineHospitalPackage,
} from '@/types/navigator.types';
import { navigatorMockData } from '@/data/navigator.mock';

const BASE_URL = API_CONFIG.BASE_URL;

/** Helper fetcher with timeout and error handling */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error [${response.status}]: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn(`[NavigatorAPI] Request failed for ${endpoint}:`, error?.message || error);
    throw error;
  }
}

export const navigatorApi = {
  /** 1. Get list of all hospitals */
  async getHospitals(): Promise<Hospital[]> {
    try {
      const data = await apiFetch<Hospital[]>('/hospitals/');
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return fallbackHospitals();
    } catch {
      return fallbackHospitals();
    }
  },

  /** 2. Get specific hospital details */
  async getHospital(id: number | string): Promise<Hospital> {
    return await apiFetch<Hospital>(`/hospitals/${id}`);
  },

  /** 3. Get buildings for a hospital */
  async getBuildings(hospitalId: number | string): Promise<Building[]> {
    try {
      return await apiFetch<Building[]>(`/hospitals/${hospitalId}/buildings`);
    } catch {
      return [];
    }
  },

  /** 4. Get floors for a building */
  async getFloors(buildingId: number | string): Promise<Floor[]> {
    try {
      return await apiFetch<Floor[]>(`/hospitals/buildings/${buildingId}/floors`);
    } catch {
      return [];
    }
  },

  /** 5. Get rooms for a floor */
  async getRooms(floorId: number | string): Promise<Room[]> {
    try {
      return await apiFetch<Room[]>(`/hospitals/floors/${floorId}/rooms`);
    } catch {
      return [];
    }
  },

  /** 6. Get departments for a hospital */
  async getDepartments(hospitalId: number | string): Promise<Department[]> {
    try {
      return await apiFetch<Department[]>(`/hospitals/${hospitalId}/departments`);
    } catch {
      return [];
    }
  },

  /** 7. Get emergency contacts for a hospital */
  async getEmergencyContacts(hospitalId: number | string): Promise<EmergencyContact[]> {
    try {
      return await apiFetch<EmergencyContact[]>(`/hospitals/${hospitalId}/emergency-contacts`);
    } catch {
      return [];
    }
  },

  /**
   * 8. Download Complete Hospital Package for Full Offline Mode
   * Fetches all buildings, floors, departments, rooms, and emergency contacts in parallel
   */
  async downloadHospitalPackage(hospitalId: number | string): Promise<OfflineHospitalPackage> {
    const [hospital, buildings, departments, emergencyContacts] = await Promise.all([
      this.getHospital(hospitalId).catch(() => fallbackHospitals()[0]),
      this.getBuildings(hospitalId).catch(() => []),
      this.getDepartments(hospitalId).catch(() => []),
      this.getEmergencyContacts(hospitalId).catch(() => []),
    ]);

    // Fetch floors for all buildings
    const allFloors: Floor[] = [];
    for (const b of buildings) {
      const floors = await this.getFloors(b.id).catch(() => []);
      allFloors.push(...floors);
    }

    // Fetch rooms for all floors
    const allRooms: Room[] = [];
    for (const f of allFloors) {
      const rooms = await this.getRooms(f.id).catch(() => []);
      allRooms.push(...rooms);
    }

    // Convert departments and rooms into unified destinations list
    const destinations: DestinationItem[] = [
      ...departments.map((d) => ({
        id: `dept-${d.id}`,
        numericId: d.id,
        name: d.name,
        detail: d.description || `Hospital Department · Code: ${d.code || 'GEN'}`,
        icon: '♥',
        category: 'Department' as const,
        phone: d.phone || undefined,
      })),
      ...allRooms.map((r) => ({
        id: `room-${r.id}`,
        numericId: r.id,
        name: r.name || `Room ${r.room_number}`,
        detail: `Room ${r.room_number || ''} · ${r.room_type || 'General'}`,
        icon: '▣',
        category: 'Room' as const,
      })),
    ];

    // If backend has no destinations yet, supplement with mock items
    if (destinations.length === 0) {
      destinations.push(
        { id: 'cardiology', name: 'Cardiology Department', detail: 'Floor 2, Building A', icon: '♥', category: 'Department' },
        { id: 'radiology', name: 'Radiology Department', detail: 'Floor 1, Building B', icon: '◉', category: 'Department' },
        { id: 'pharmacy', name: 'Pharmacy', detail: 'Ground Floor, Building A', icon: '✚', category: 'Service' },
        { id: 'emergency', name: 'Emergency', detail: 'Ground Floor, Main Wing', icon: '!', category: 'Service' },
        { id: 'mri', name: 'MRI Room', detail: 'Floor 1, Building B', icon: '▣', category: 'Room' },
      );
    }

    return {
      hospital,
      buildings,
      floors: allFloors.length > 0 ? allFloors : [
        { id: 1, building_id: 1, name: 'Ground Floor', floor_number: 0, status: 'active' },
        { id: 2, building_id: 1, name: 'Floor 1', floor_number: 1, status: 'active' },
        { id: 3, building_id: 1, name: 'Floor 2', floor_number: 2, status: 'active' },
      ],
      departments,
      rooms: allRooms,
      emergencyContacts,
      destinations,
      nodes: [
        { id: 'n1', label: 'Entrance', type: 'room_entrance', x: 12.5, y: 10.0, accessible: true },
        { id: 'n2', label: 'Main Corridor 1', type: 'corridor', x: 25.0, y: 30.0, accessible: true },
        { id: 'n3', label: 'Cardiology Entrance', type: 'room_entrance', x: 45.0, y: 28.0, accessible: true },
      ],
      edges: [
        { id: 'e1', from_node: 'n1', to_node: 'n2', distance: 20.0, accessible: true, edge_type: 'corridor' },
        { id: 'e2', from_node: 'n2', to_node: 'n3', distance: 20.2, accessible: true, edge_type: 'door' },
      ],
      mapMetadata: {
        version: '1.0.0',
        size: '14.2 MB',
        updated: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        floorsCount: allFloors.length || 3,
      },
    };
  },

  /** 9. Bootstrap initial app data */
  async getBootstrap() {
    const hospitals = await this.getHospitals();
    const primaryHospital = hospitals[0] || fallbackHospitals()[0];
    const pkg = await this.downloadHospitalPackage(primaryHospital.id);

    return {
      hospitals,
      destinations: pkg.destinations,
      facilities: ['Accessible entrance', 'Wheelchair routes', 'Restrooms', 'Elevators', 'Emergency triage'],
      recentSearches: pkg.destinations.slice(0, 3).map((d) => d.name),
      map: pkg.mapMetadata,
      activePackage: pkg,
    };
  },
};

/** Helper for reliable fallback when backend is offline */
function fallbackHospitals(): Hospital[] {
  return [
    {
      id: 1,
      name: 'City General Hospital',
      code: 'CGH',
      address: 'Downtown, City Centre',
      phone: '+1 800 555 0199',
      status: 'active',
    },
    {
      id: 2,
      name: 'Green Valley Hospital',
      code: 'GVH',
      address: 'Westside Medical District',
      phone: '+1 800 555 0200',
      status: 'active',
    },
    {
      id: 3,
      name: 'Hope Medical Center',
      code: 'HMC',
      address: 'Northside Health Hub',
      phone: '+1 800 555 0201',
      status: 'active',
    },
  ];
}
=======
import { request } from "./client";

export interface Hospital {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  distance: string;
  latitude?: number;
  longitude?: number;
  floors: string[];
  floors_count: number;
  buildings_count: number;
}

export interface Destination {
  id: string;
  raw_id: number;
  name: string;
  detail: string;
  icon: string;
  category: "Department" | "Room" | "Service";
  floor_id?: number;
  floor_name?: string;
  building_name?: string;
  room_number?: string;
  type?: string;
}

export interface EmergencyContact {
  id: number;
  title: string;
  phone_number: string;
  icon: string;
  category: string;
}

export interface MapPackageInfo {
  version: string;
  size: string;
  updated: string;
  floors_count: number;
  nodes_count: number;
  edges_count: number;
  download_url: string;
}

export interface BuildingFloorInfo {
  id: number;
  name: string;
  floor_number: number;
  display_name: string;
  rooms_count: number;
}

export interface BuildingInfo {
  id: number;
  name: string;
  code: string;
  floors: BuildingFloorInfo[];
}

export interface HospitalBootstrapData {
  hospital: {
    id: number;
    name: string;
    code: string;
    address?: string;
    phone?: string;
    floors: string[];
  };
  buildings: BuildingInfo[];
  destinations: Destination[];
  facilities: string[];
  emergency_contacts: EmergencyContact[];
  map_package: MapPackageInfo;
}

export interface VectorMapRoom {
  id: string;
  room_id?: number;
  name: string;
  room_number?: string;
  type?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  center?: { x: number; y: number };
  bounds?: { x: number; y: number }[];
}

export interface VectorMapNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  z?: number;
  accessible?: boolean;
}

export interface VectorMapData {
  schema_version: string;
  floor_id: number;
  floor_name: string;
  floor_number: number;
  rooms: VectorMapRoom[];
  doors: any[];
  nodes: VectorMapNode[];
  edges: any[];
}

export interface OfflinePackage {
  manifest: {
    hospital_id: number;
    hospital_name: string;
    version: string;
    generated_at: string;
    floors_count: number;
    destinations_count: number;
  };
  bootstrap: HospitalBootstrapData;
  floors: {
    floor_id: number;
    building_id: number;
    floor_number: number;
    display_name: string;
    vector_map: VectorMapData;
  }[];
}

export const navigatorApi = {
  getHospitals: async (): Promise<Hospital[]> => {
    return request<Hospital[]>("/api/v1/navigator/hospitals", "GET");
  },

  getBootstrap: async (hospitalId: number): Promise<HospitalBootstrapData> => {
    return request<HospitalBootstrapData>(
      `/api/v1/navigator/hospitals/${hospitalId}/bootstrap`,
      "GET",
    );
  },

  search: async (hospitalId: number, query: string): Promise<Destination[]> => {
    return request<Destination[]>(
      `/api/v1/navigator/hospitals/${hospitalId}/search?q=${encodeURIComponent(query)}`,
      "GET",
    );
  },

  getFloorMap: async (
    hospitalId: number,
    floorId: number,
  ): Promise<VectorMapData> => {
    return request<VectorMapData>(
      `/api/v1/navigator/hospitals/${hospitalId}/floors/${floorId}/map`,
      "GET",
    );
  },

  downloadPackage: async (hospitalId: number): Promise<OfflinePackage> => {
    return request<OfflinePackage>(
      `/api/v1/navigator/hospitals/${hospitalId}/package`,
      "GET",
    );
  },
};
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
