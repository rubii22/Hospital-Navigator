import { request } from "./client";
import { MappingJob, MappingSession } from "./types";

export const JobsApi = {
  getSessions: async (): Promise<MappingSession[]> => {
    return request<MappingSession[]>("/api/v1/scans/", "GET");
  },

  getSessionById: async (id: number): Promise<MappingSession> => {
    return request<MappingSession>(`/api/v1/scans/${id}`, "GET");
  },

  startProcessing: async (sessionId: number): Promise<MappingJob> => {
    return request<MappingJob>(`/api/v1/scans/${sessionId}/process`, "POST");
  },

  getJobStatus: async (sessionId: number): Promise<any[]> => {
    return request<any[]>(`/api/v1/scans/${sessionId}/job-status`, "GET");
  },

  getObjectDetections: async (sessionId: number): Promise<any[]> => {
    return request<any[]>(`/api/v1/scans/${sessionId}/artifacts/detections`, "GET");
  },

  getOCRDetections: async (sessionId: number): Promise<any[]> => {
    return request<any[]>(`/api/v1/scans/${sessionId}/artifacts/ocr`, "GET");
  },

  acceptAllOCR: async (sessionId: number): Promise<any[]> => {
    return request<any[]>(`/api/v1/scans/${sessionId}/ocr/accept-all`, "POST");
  },
};
