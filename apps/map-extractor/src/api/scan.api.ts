import { request } from "./client";
import storage from "../utils/storage";
import {
  MappingSessionCreate,
  MappingSessionResponse,
  ScanAssetCreate,
  ScanAssetResponse,
  AIJobResultResponse,
  MappingJobResponse,
  ObjectDetectionResponse,
  OCRDetectionResponse,
  PointCloudArtifact,
  VectorMapData,
} from "./types";

const getAuthHeaders = async (
  token?: string,
): Promise<Record<string, string>> => {
  const activeToken = token || (await storage.getItem("access_token"));
  return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
};

export const scanApi = {
  listSessions: async (token?: string): Promise<MappingSessionResponse[]> => {
    const headers = await getAuthHeaders(token);
    return request<MappingSessionResponse[]>("/api/v1/scans/", "GET", headers);
  },

  createSession: async (
    data: MappingSessionCreate,
    token?: string,
  ): Promise<MappingSessionResponse> => {
    const headers = await getAuthHeaders(token);
    return request<MappingSessionResponse>(
      "/api/v1/scans/",
      "POST",
      headers,
      data,
    );
  },

  getSession: async (
    id: number,
    token?: string,
  ): Promise<MappingSessionResponse> => {
    const headers = await getAuthHeaders(token);
    return request<MappingSessionResponse>(
      `/api/v1/scans/${id}`,
      "GET",
      headers,
    );
  },

  uploadAsset: async (
    sessionId: number,
    data: ScanAssetCreate,
    token?: string,
  ): Promise<ScanAssetResponse> => {
    const headers = await getAuthHeaders(token);
    return request<ScanAssetResponse>(
      `/api/v1/scans/${sessionId}/assets`,
      "POST",
      headers,
      data,
    );
  },

  uploadFrame: async (
    sessionId: number,
    imageBase64: string,
    frameIndex: number = 0,
    token?: string,
  ): Promise<ScanAssetResponse> => {
    const headers = await getAuthHeaders(token);
    return request<ScanAssetResponse>(
      `/api/v1/scans/${sessionId}/upload-frame`,
      "POST",
      headers,
      {
        image_base64: imageBase64,
        frame_index: frameIndex,
      },
    );
  },

  startProcessing: async (
    sessionId: number,
    token?: string,
  ): Promise<MappingJobResponse> => {
    const headers = await getAuthHeaders(token);
    return request<MappingJobResponse>(
      `/api/v1/scans/${sessionId}/process`,
      "POST",
      headers,
    );
  },

  getJobStatus: async (
    sessionId: number,
    token?: string,
  ): Promise<AIJobResultResponse[]> => {
    const headers = await getAuthHeaders(token);
    return request<AIJobResultResponse[]>(
      `/api/v1/scans/${sessionId}/job-status`,
      "GET",
      headers,
    );
  },

  getPointCloud: async (
    sessionId: number,
    token?: string,
  ): Promise<PointCloudArtifact> => {
    const headers = await getAuthHeaders(token);
    return request<PointCloudArtifact>(
      `/api/v1/scans/${sessionId}/artifacts/point-cloud`,
      "GET",
      headers,
    );
  },

  getObjectDetections: async (
    sessionId: number,
    token?: string,
  ): Promise<ObjectDetectionResponse[]> => {
    const headers = await getAuthHeaders(token);
    return request<ObjectDetectionResponse[]>(
      `/api/v1/scans/${sessionId}/artifacts/detections`,
      "GET",
      headers,
    );
  },

  getOCRDetections: async (
    sessionId: number,
    token?: string,
  ): Promise<OCRDetectionResponse[]> => {
    const headers = await getAuthHeaders(token);
    return request<OCRDetectionResponse[]>(
      `/api/v1/scans/${sessionId}/artifacts/ocr`,
      "GET",
      headers,
    );
  },

  updateOCRStatus: async (
    sessionId: number,
    ocrId: number,
    status: "accepted" | "rejected" | "pending",
    token?: string,
  ): Promise<OCRDetectionResponse> => {
    const headers = await getAuthHeaders(token);
    return request<OCRDetectionResponse>(
      `/api/v1/scans/${sessionId}/ocr/${ocrId}`,
      "PUT",
      headers,
      { status },
    );
  },

  acceptAllOCR: async (
    sessionId: number,
    token?: string,
  ): Promise<OCRDetectionResponse[]> => {
    const headers = await getAuthHeaders(token);
    return request<OCRDetectionResponse[]>(
      `/api/v1/scans/${sessionId}/ocr/accept-all`,
      "POST",
      headers,
    );
  },

  getMapData: async (
    sessionId: number,
    token?: string,
  ): Promise<VectorMapData> => {
    const headers = await getAuthHeaders(token);
    return request<VectorMapData>(
      `/api/v1/scans/${sessionId}/map-data`,
      "GET",
      headers,
    );
  },

  saveMapData: async (
    sessionId: number,
    data: VectorMapData,
    token?: string,
  ): Promise<VectorMapData> => {
    const headers = await getAuthHeaders(token);
    return request<VectorMapData>(
      `/api/v1/scans/${sessionId}/map-data`,
      "POST",
      headers,
      data,
    );
  },
};
