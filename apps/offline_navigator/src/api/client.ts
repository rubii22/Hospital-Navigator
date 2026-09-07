/* eslint-disable @typescript-eslint/no-explicit-any */
import Constants from "expo-constants";

export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  detail?: string;
  errors?: any[];
  [key: string]: any;
}

export class ApiError extends Error {
  statusCode: number;
  response: ApiErrorResponse;

  constructor(message: string, statusCode: number, response: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.response = response;
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, ApiError);
    }
  }
}

export const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8000`;
  }

  return "http://localhost:8000";
};

export const request = async <T = any>(
  url: string,
  method: RequestMethod = "GET",
  headers?: Record<string, string>,
  data?: any,
): Promise<T> => {
  const baseUrl = getBaseUrl();
  const fullUrl = `${baseUrl}${url}`;

  const fetchOptions: any = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body:
      data !== undefined && method.toUpperCase() !== "GET"
        ? JSON.stringify(data)
        : undefined,
  };

  const response = await fetch(fullUrl, fetchOptions);
  const responseText = await response.text();

  let responseBody: any = {};
  try {
    responseBody = responseText ? JSON.parse(responseText) : {};
  } catch {
    const errorMsg = responseText || `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(errorMsg, response.status, { detail: errorMsg });
  }

  if (!response.ok) {
    const message =
      responseBody?.message ||
      responseBody?.detail ||
      response.statusText ||
      "Request failed";
    throw new ApiError(message, response.status, responseBody);
  }

  return responseBody as T;
};
