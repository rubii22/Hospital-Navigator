/* eslint-disable @typescript-eslint/no-explicit-any */
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
  }
}

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
};

const BASE_URL = getBaseUrl();

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("admin_token", token);
    } else {
      localStorage.removeItem("admin_token");
    }
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_token");
  }
  return null;
};

export const request = async <T = any>(
  url: string,
  method: RequestMethod = "GET",
  headers?: Record<string, string>,
  data?: any,
  isFormData?: boolean,
): Promise<T> => {
  const raw = `${BASE_URL}${url}`;
  const token = getAuthToken();

  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(headers ?? {}),
    },
    body:
      data !== undefined && method.toUpperCase() !== "GET"
        ? isFormData
          ? (data as FormData)
          : JSON.stringify(data)
        : undefined,
  };

  if (isFormData && fetchOptions.headers) {
    delete (fetchOptions.headers as Record<string, string>)["Content-Type"];
  }

  const response = await fetch(raw, fetchOptions);
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
      "Something went wrong";
    throw new ApiError(message, response.status, responseBody);
  }

  return responseBody as T;
};
