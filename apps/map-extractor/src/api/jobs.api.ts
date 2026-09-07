import { request } from "./client";
import storage from "../utils/storage";
import { JobStatusResponse } from "./types";

const getAuthHeaders = async (
  token?: string,
): Promise<Record<string, string>> => {
  const activeToken = token || (await storage.getItem("access_token"));
  return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
};

export const jobsApi = {
  getJobDetails: async (
    jobId: number,
    token?: string,
  ): Promise<JobStatusResponse> => {
    const headers = await getAuthHeaders(token);
    return request<JobStatusResponse>(`/api/v1/jobs/${jobId}`, "GET", headers);
  },

  retryStage: async (
    jobId: number,
    stageName: string,
    token?: string,
  ): Promise<JobStatusResponse> => {
    const headers = await getAuthHeaders(token);
    return request<JobStatusResponse>(
      `/api/v1/jobs/${jobId}/retry`,
      "POST",
      headers,
      { stage_name: stageName },
    );
  },
};
