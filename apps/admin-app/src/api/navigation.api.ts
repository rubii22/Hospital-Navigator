import { request } from "./client";
import { VectorMapData } from "./types";

export const NavigationApi = {
  getMapData: async (sessionId: number): Promise<VectorMapData> => {
    return request<VectorMapData>(`/api/v1/scans/${sessionId}/map-data`, "GET");
  },

  saveMapData: async (sessionId: number, data: VectorMapData): Promise<VectorMapData> => {
    return request<VectorMapData>(`/api/v1/scans/${sessionId}/map-data`, "POST", undefined, data);
  },
};
