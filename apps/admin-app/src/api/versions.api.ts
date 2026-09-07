import { request } from "./client";
import { MapVersion, NavPack } from "./types";

export const VersionsApi = {
  getVersions: async (buildingId?: number): Promise<MapVersion[]> => {
    const url = buildingId ? `/api/v1/versions/?building_id=${buildingId}` : "/api/v1/versions/";
    return request<MapVersion[]>(url, "GET");
  },

  createVersion: async (data: Partial<MapVersion>): Promise<MapVersion> => {
    return request<MapVersion>("/api/v1/versions/", "POST", undefined, data);
  },

  publishVersion: async (id: number): Promise<MapVersion> => {
    return request<MapVersion>(`/api/v1/versions/${id}/publish`, "POST");
  },

  getNavPacks: async (mapVersionId?: number): Promise<NavPack[]> => {
    const url = mapVersionId
      ? `/api/v1/versions/navpacks/all?map_version_id=${mapVersionId}`
      : "/api/v1/versions/navpacks/all";
    return request<NavPack[]>(url, "GET");
  },

  generateNavPack: async (data: Partial<NavPack>): Promise<NavPack> => {
    return request<NavPack>("/api/v1/versions/navpacks/generate", "POST", undefined, data);
  },
};
