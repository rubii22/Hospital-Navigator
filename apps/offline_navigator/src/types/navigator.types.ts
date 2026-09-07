/**
 * TypeScript definitions matching backend-fastapi Pydantic schemas and DB models
 */

export interface Hospital {
  id: number | string;
  name: string;
  code?: string;
  description?: string | null;
  address?: string | null;
  location?: string;
  distance?: string;
  floors?: string[];
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  status?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export type Destination = DestinationItem;

export interface Building {
  id: number;
  hospital_id: number;
  name: string;
  code: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
}

export interface Floor {
  id: number;
  building_id: number;
  name: string;
  floor_number: number;
  display_name?: string | null;
  description?: string | null;
  map_width?: number | null;
  map_height?: number | null;
  elevation?: number | null;
  status: string;
}

export interface Department {
  id: number;
  hospital_id: number;
  building_id?: number | null;
  floor_id?: number | null;
  parent_department_id?: number | null;
  name: string;
  code?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  status: string;
}

export interface Room {
  id: number;
  floor_id: number;
  department_id?: number | null;
  name: string;
  room_number?: string | null;
  room_type: string;
  status: string;
}

export interface EmergencyContact {
  id: number;
  hospital_id: number;
  title: string;
  phone_number: string;
  is_active: boolean;
}

export interface NavigationNode {
  id: string;
  label: string;
  type: string; // room_entrance, corridor, intersection, stair, elevator, landmark
  x: number;
  y: number;
  z?: number;
  accessible: boolean;
  metadata?: Record<string, any>;
}

export interface NavigationEdge {
  id: string;
  from_node: string;
  to_node: string;
  distance: number;
  accessible: boolean;
  edge_type: string; // corridor, door, stair, elevator
}

export interface MapPackageManifest {
  package_name: string;
  version: string;
  created_at: string;
  building_name: string;
  floors_count: number;
  nodes_count: number;
  edges_count: number;
  download_url: string;
}

/** Unified Destination type for search & navigation UI */
export interface DestinationItem {
  id: string;
  numericId?: number;
  name: string;
  detail: string;
  icon: string;
  category: 'Department' | 'Room' | 'Service';
  floorNumber?: string | number;
  buildingName?: string;
  phone?: string;
}

/** Complete downloaded package for a Hospital stored locally for Offline Mode */
export interface OfflineHospitalPackage {
  hospital: Hospital;
  buildings: Building[];
  floors: Floor[];
  departments: Department[];
  rooms: Room[];
  emergencyContacts: EmergencyContact[];
  destinations: DestinationItem[];
  nodes: NavigationNode[];
  edges: NavigationEdge[];
  mapMetadata: {
    version: string;
    size: string;
    updated: string;
    floorsCount: number;
  };
}
