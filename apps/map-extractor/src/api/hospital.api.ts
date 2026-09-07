import { request } from "./client";
import storage from "../utils/storage";
import {
  HospitalCreate,
  HospitalResponse,
  HospitalUpdate,
  BuildingCreate,
  BuildingResponse,
  FloorCreate,
  FloorResponse,
  RoomCreate,
  RoomResponse,
  DepartmentCreate,
  DepartmentResponse,
  EmergencyContactCreate,
  EmergencyContactResponse,
} from "./types";

const getAuthHeaders = async (
  token?: string,
): Promise<Record<string, string>> => {
  const activeToken = token || (await storage.getItem("access_token"));
  return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
};

export const hospitalApi = {
  // HOSPITAL  OPERATIONS
  listHospitals: (): Promise<HospitalResponse[]> => {
    return request<HospitalResponse[]>("/api/v1/hospitals/", "GET");
  },

  listMyHospitals: async (token?: string): Promise<HospitalResponse[]> => {
    const headers = await getAuthHeaders(token);
    return request<HospitalResponse[]>("/api/v1/hospitals/my", "GET", headers);
  },

  getHospital: (id: number): Promise<HospitalResponse> => {
    return request<HospitalResponse>(`/api/v1/hospitals/${id}`, "GET");
  },

  createHospital: async (
    data: HospitalCreate,
    token?: string,
  ): Promise<HospitalResponse> => {
    const headers = await getAuthHeaders(token);
    return request<HospitalResponse>(
      "/api/v1/hospitals/",
      "POST",
      headers,
      data,
    );
  },

  updateHospital: async (
    id: number,
    data: HospitalUpdate,
    token?: string,
  ): Promise<HospitalResponse> => {
    const headers = await getAuthHeaders(token);
    return request<HospitalResponse>(
      `/api/v1/hospitals/${id}`,
      "PUT",
      headers,
      data,
    );
  },

  deleteHospital: async (
    id: number,
    token?: string,
  ): Promise<HospitalResponse> => {
    const headers = await getAuthHeaders(token);
    return request<HospitalResponse>(
      `/api/v1/hospitals/${id}`,
      "DELETE",
      headers,
    );
  },

  // BUILDINGS OPERATIONS
  listBuildings: (hospitalId: number): Promise<BuildingResponse[]> => {
    return request<BuildingResponse[]>(
      `/api/v1/hospitals/${hospitalId}/buildings`,
      "GET",
    );
  },

  createBuilding: async (
    hospitalId: number,
    data: BuildingCreate,
    token?: string,
  ): Promise<BuildingResponse> => {
    const headers = await getAuthHeaders(token);
    return request<BuildingResponse>(
      `/api/v1/hospitals/${hospitalId}/buildings`,
      "POST",
      headers,
      data,
    );
  },

  // FLOOR OPERATIONS
  listFloors: (buildingId: number): Promise<FloorResponse[]> => {
    return request<FloorResponse[]>(
      `/api/v1/hospitals/buildings/${buildingId}/floors`,
      "GET",
    );
  },

  createFloor: async (
    buildingId: number,
    data: FloorCreate,
    token?: string,
  ): Promise<FloorResponse> => {
    const headers = await getAuthHeaders(token);
    return request<FloorResponse>(
      `/api/v1/hospitals/buildings/${buildingId}/floors`,
      "POST",
      headers,
      data,
    );
  },

  // ROOM OPERATIONS
  listRooms: (floorId: number): Promise<RoomResponse[]> => {
    return request<RoomResponse[]>(
      `/api/v1/hospitals/floors/${floorId}/rooms`,
      "GET",
    );
  },

  createRoom: async (
    floorId: number,
    data: RoomCreate,
    token?: string,
  ): Promise<RoomResponse> => {
    const headers = await getAuthHeaders(token);
    return request<RoomResponse>(
      `/api/v1/hospitals/floors/${floorId}/rooms`,
      "POST",
      headers,
      data,
    );
  },

  // DEPARTMENT OPERATIONS
  listDepartments: (hospitalId: number): Promise<DepartmentResponse[]> => {
    return request<DepartmentResponse[]>(
      `/api/v1/hospitals/${hospitalId}/departments`,
      "GET",
    );
  },

  createDepartment: async (
    hospitalId: number,
    data: DepartmentCreate,
    token?: string,
  ): Promise<DepartmentResponse> => {
    const headers = await getAuthHeaders(token);
    return request<DepartmentResponse>(
      `/api/v1/hospitals/${hospitalId}/departments`,
      "POST",
      headers,
      data,
    );
  },

  //  EMERGENCY CONTACT OPERATIONS
  listEmergencyContacts: (
    hospitalId: number,
  ): Promise<EmergencyContactResponse[]> => {
    return request<EmergencyContactResponse[]>(
      `/api/v1/hospitals/${hospitalId}/emergency-contacts`,
      "GET",
    );
  },

  createEmergencyContact: async (
    hospitalId: number,
    data: EmergencyContactCreate,
    token?: string,
  ): Promise<EmergencyContactResponse> => {
    const headers = await getAuthHeaders(token);
    return request<EmergencyContactResponse>(
      `/api/v1/hospitals/${hospitalId}/emergency-contacts`,
      "POST",
      headers,
      data,
    );
  },
};
