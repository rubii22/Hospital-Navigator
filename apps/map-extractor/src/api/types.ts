export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Hospital Interface Types
export interface HospitalBase {
  name: string;
  code: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  status: string;
  owner_id?: number;
}


export interface HospitalCreate extends Omit<HospitalBase, "status"> {
  status?: string;
}

export interface HospitalUpdate extends Partial<HospitalCreate> {}

export interface HospitalResponse extends HospitalBase {
  id: number;
  created_at?: string;
  updated_at?: string;
}

// Building Interface Types
export interface BuildingBase {
  name: string;
  code: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: string;
}

export interface BuildingCreate extends Omit<BuildingBase, "status"> {
  status?: string;
}

export interface BuildingUpdate extends Partial<BuildingCreate> {}

export interface BuildingResponse extends BuildingBase {
  id: number;
  hospital_id: number;
  created_at?: string;
  updated_at?: string;
}

// Floor Interface Types
export interface FloorBase {
  name: string;
  floor_number: number;
  display_name?: string;
  description?: string;
  map_width?: number;
  map_height?: number;
  elevation?: number;
  status: string;
}

export interface FloorCreate extends Omit<FloorBase, "status"> {
  status?: string;
}

export interface FloorUpdate extends Partial<FloorCreate> {}

export interface FloorResponse extends FloorBase {
  id: number;
  building_id: number;
  created_at?: string;
  updated_at?: string;
}

// Room Interface Types
export interface RoomBase {
  name: string;
  room_number?: string;
  room_type: string;
  status: string;
}

export interface RoomCreate extends Omit<RoomBase, "status" | "room_type"> {
  room_type?: string;
  department_id?: number;
}

export interface RoomUpdate extends Partial<RoomCreate> {}

export interface RoomResponse extends RoomBase {
  id: number;
  floor_id: number;
  department_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Department Interface Types
export interface DepartmentBase {
  name: string;
  code?: string;
  description?: string;
  phone?: string;
  email?: string;
  status: string;
}

export interface DepartmentCreate extends Omit<DepartmentBase, "status"> {
  status?: string;
  building_id?: number;
  floor_id?: number;
  parent_department_id?: number;
}

export interface DepartmentUpdate extends Partial<DepartmentCreate> {}

export interface DepartmentResponse extends DepartmentBase {
  id: number;
  hospital_id: number;
  building_id?: number;
  floor_id?: number;
  parent_department_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Emergency Contact Interface Types
export interface EmergencyContactBase {
  title: string;
  phone_number: string;
  is_active: boolean;
}

export interface EmergencyContactCreate extends Omit<
  EmergencyContactBase,
  "is_active"
> {
  is_active?: boolean;
}

export interface EmergencyContactResponse extends EmergencyContactBase {
  id: number;
  hospital_id: number;
  created_at?: string;
  updated_at?: string;
}

// Mapping Session Interface Types
export interface MappingSessionBase {
  floor_id: number;
  distance_walked?: number;
  duration_seconds?: number;
  frames_count?: number;
  points_captured_count?: number;
  coverage_percentage?: number;
  quality_rating?: string;
}

export interface MappingSessionCreate extends MappingSessionBase {}

export interface MappingSessionUpdate {
  status?: string;
  distance_walked?: number;
  duration_seconds?: number;
  frames_count?: number;
  points_captured_count?: number;
  coverage_percentage?: number;
  quality_rating?: string;
}

export interface MappingSessionResponse extends MappingSessionBase {
  id: number;
  uploaded_by: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Scan Asset Interface Types
export interface ScanAssetBase {
  asset_type: string;
  file_url: string;
  size_bytes?: number;
}

export interface ScanAssetCreate extends ScanAssetBase {}

export interface ScanAssetResponse extends ScanAssetBase {
  id: number;
  session_id: number;
  created_at: string;
}

// AI Job Result Interface Types
export interface AIJobResultResponse {
  id: number;
  session_id: number;
  step:
    | "point_cloud"
    | "object_detection"
    | "ocr_recognition"
    | "geometry_extraction"
    | "map_generation";
  progress_percentage: number;
  status: "pending" | "in_progress" | "completed" | "failed";
  error_message?: string;
  created_at: string;
}

// Mapping Job Interface Types
export interface MappingJobResponse {
  id: number;
  session_id?: number;
  floor_id: number;
  uploaded_by: number;
  status: string;
  created_at: string;
}

export interface JobStatusResponse {
  job_id: number;
  session_id: number;
  status: string;
  current_stage?: string;
  overall_progress: number;
  stages: AIJobResultResponse[];
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface ObjectDetectionResponse {
  id: number;
  session_id: number;
  floor_id: number;
  class_name: string;
  confidence: number;
  centroid_x: number;
  centroid_y: number;
  centroid_z: number;
  bounding_box_json?: string;
  created_at?: string;
}

export interface OCRDetectionResponse {
  id: number;
  session_id: number;
  floor_id: number;
  detected_text: string;
  category: string;
  confidence: number;
  status: "pending" | "accepted" | "rejected";
  created_at?: string;
}

export interface PointCloudPoint {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
}

export interface PointCloudArtifact {
  schema_version: string;
  session_id: number;
  point_count: number;
  points: PointCloudPoint[];
}

export interface VectorMapNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  z?: number;
  accessible?: boolean;
  metadata?: any;
}

export interface VectorMapEdge {
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
  nodes: VectorMapNode[];
  edges: VectorMapEdge[];
  rooms?: any[];
  doors?: any[];
}
