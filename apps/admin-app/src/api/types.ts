export interface Hospital {
  id: number;
  stable_uuid: string;
  name: string;
  code: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  owner_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: number;
  stable_uuid: string;
  hospital_id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  floors_count?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Floor {
  id: number;
  stable_uuid: string;
  building_id: number;
  name: string;
  floor_number: number;
  display_name?: string | null;
  level_index?: number;
  elevation_meters?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  stable_uuid: string;
  hospital_id: number;
  building_id?: number | null;
  floor_id?: number | null;
  name: string;
  code?: string | null;
  description?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: number;
  stable_uuid: string;
  floor_id: number;
  department_id?: number | null;
  map_version_id?: number | null;
  name: string;
  display_name?: string | null;
  room_number?: string | null;
  room_type: string;
  category?: string | null;
  aliases_json?: string | null;
  geometry_json?: string | null;
  entrance_node_id?: number | null;
  is_public: boolean;
  review_state: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface POICategory {
  id: number;
  name: string;
  code: string;
  icon?: string | null;
  color?: string | null;
}

export interface PointOfInterest {
  id: number;
  stable_uuid: string;
  hospital_id: number;
  building_id?: number | null;
  floor_id: number;
  department_id?: number | null;
  room_id?: number | null;
  category_id: number;
  map_version_id?: number | null;
  name: string;
  code?: string | null;
  description?: string | null;
  poi_type: string;
  location_geometry?: string | null;
  aliases_json?: string | null;
  entrance_node_id?: number | null;
  is_accessible: boolean;
  review_state: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NavigationNode {
  id: string;
  label?: string;
  type: string;
  subtype?: string;
  x: number;
  y: number;
  z?: number;
  accessible?: boolean;
}

export interface NavigationEdge {
  id: string;
  from_node: string;
  to_node: string;
  distance: number;
  accessible?: boolean;
  edge_type?: string;
}

export interface VectorMapData {
  schema_version: string;
  session_id: number;
  floor_id: number;
  nodes: NavigationNode[];
  edges: NavigationEdge[];
  rooms: any[];
  doors: any[];
}

export interface MapVersion {
  id: number;
  building_id: number;
  version_number: string;
  schema_version: string;
  parent_version_id?: number | null;
  status: string;
  reviewer_id?: number | null;
  release_notes?: string | null;
  changelog?: string | null;
  validation_report_json?: string | null;
  size_bytes?: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NavPack {
  id: number;
  map_version_id: number;
  schema_version: string;
  archive_uri: string;
  archive_path?: string | null;
  checksum_sha256: string;
  total_size_bytes: number;
  signature_key_id?: string | null;
  min_app_version?: string;
  generated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MappingJob {
  id: string;
  raw_id: number;
  floor_id: number;
  status: string;
  pipeline_stage: string;
  progress: number;
  created_at: string;
}

export interface MappingSession {
  id: number;
  floor_id: number;
  uploaded_by: number;
  status: string;
  capture_type: string;
  total_frames: number;
  created_at: string;
  updated_at: string;
}

export interface UserDetail {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  roles: string[];
}

export interface DashboardStats {
  active_hospitals: number;
  published_versions: number;
  navpacks_generated: number;
  running_jobs: number;
  publish_breakdown: {
    published: number;
    in_review: number;
    draft: number;
    total: number;
  };
  recent_jobs: MappingJob[];
  recent_activities: {
    id: number;
    action: string;
    entity: string;
    timestamp: string;
  }[];
}

export interface ActivityLog {
  id: number;
  user_id?: number | null;
  action: string;
  entity_name: string;
  entity_id?: number | null;
  created_at: string;
}
