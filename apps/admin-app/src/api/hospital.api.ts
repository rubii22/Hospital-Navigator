import { request } from "./client";
import { Hospital, Building, Floor, Department, Room } from "./types";

export const HospitalApi = {
  getHospitals: async (skip = 0, limit = 100): Promise<Hospital[]> => {
    return request<Hospital[]>(
      `/api/v1/hospitals/?skip=${skip}&limit=${limit}`,
      "GET",
    );
  },

  getHospitalById: async (id: number): Promise<Hospital> => {
    return request<Hospital>(`/api/v1/hospitals/${id}`, "GET");
  },

  createHospital: async (data: Partial<Hospital>): Promise<Hospital> => {
    return request<Hospital>("/api/v1/hospitals/", "POST", undefined, data);
  },

  updateHospital: async (
    id: number,
    data: Partial<Hospital>,
  ): Promise<Hospital> => {
    return request<Hospital>(`/api/v1/hospitals/${id}`, "PUT", undefined, data);
  },

  deleteHospital: async (id: number): Promise<Hospital> => {
    return request<Hospital>(`/api/v1/hospitals/${id}`, "DELETE");
  },

  getBuildings: async (hospitalId: number): Promise<Building[]> => {
    return request<Building[]>(
      `/api/v1/hospitals/${hospitalId}/buildings`,
      "GET",
    );
  },

  createBuilding: async (
    hospitalId: number,
    data: Partial<Building>,
  ): Promise<Building> => {
    return request<Building>(
      `/api/v1/hospitals/${hospitalId}/buildings`,
      "POST",
      undefined,
      data,
    );
  },

  getFloors: async (buildingId: number): Promise<Floor[]> => {
    return request<Floor[]>(
      `/api/v1/hospitals/buildings/${buildingId}/floors`,
      "GET",
    );
  },

  createFloor: async (
    buildingId: number,
    data: Partial<Floor>,
  ): Promise<Floor> => {
    return request<Floor>(
      `/api/v1/hospitals/buildings/${buildingId}/floors`,
      "POST",
      undefined,
      data,
    );
  },

  getRooms: async (floorId: number): Promise<Room[]> => {
    return request<Room[]>(`/api/v1/hospitals/floors/${floorId}/rooms`, "GET");
  },

  createRoom: async (floorId: number, data: Partial<Room>): Promise<Room> => {
    return request<Room>(
      `/api/v1/hospitals/floors/${floorId}/rooms`,
      "POST",
      undefined,
      data,
    );
  },

  getDepartments: async (hospitalId: number): Promise<Department[]> => {
    return request<Department[]>(
      `/api/v1/hospitals/${hospitalId}/departments`,
      "GET",
    );
  },

  createDepartment: async (
    hospitalId: number,
    data: Partial<Department>,
  ): Promise<Department> => {
    return request<Department>(
      `/api/v1/hospitals/${hospitalId}/departments`,
      "POST",
      undefined,
      data,
    );
  },
};
