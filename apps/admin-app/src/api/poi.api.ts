import { request } from "./client";
import { PointOfInterest, POICategory } from "./types";

export const POIApi = {
  getCategories: async (): Promise<POICategory[]> => {
    return request<POICategory[]>("/api/v1/pois/categories", "GET");
  },

  createCategory: async (data: Partial<POICategory>): Promise<POICategory> => {
    return request<POICategory>("/api/v1/pois/categories", "POST", undefined, data);
  },

  getPOIsByFloor: async (floorId: number, categoryId?: number): Promise<PointOfInterest[]> => {
    const url = categoryId
      ? `/api/v1/pois/floors/${floorId}?category_id=${categoryId}`
      : `/api/v1/pois/floors/${floorId}`;
    return request<PointOfInterest[]>(url, "GET");
  },

  getPOIsByHospital: async (hospitalId: number): Promise<PointOfInterest[]> => {
    return request<PointOfInterest[]>(`/api/v1/pois/hospitals/${hospitalId}`, "GET");
  },

  createPOI: async (data: Partial<PointOfInterest>): Promise<PointOfInterest> => {
    return request<PointOfInterest>("/api/v1/pois/", "POST", undefined, data);
  },

  updatePOI: async (id: number, data: Partial<PointOfInterest>): Promise<PointOfInterest> => {
    return request<PointOfInterest>(`/api/v1/pois/${id}`, "PUT", undefined, data);
  },

  deletePOI: async (id: number): Promise<PointOfInterest> => {
    return request<PointOfInterest>(`/api/v1/pois/${id}`, "DELETE");
  },
};
