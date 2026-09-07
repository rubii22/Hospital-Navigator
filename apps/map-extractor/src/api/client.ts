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

const getBaseUrl = (): string => {
  if (process.env.NODE_ENV !== "development") {
    return process.env.NEXT_PUBLIC_API_PROD_BASE_URL || "http://localhost:8000";
  }

  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8000`;
  }

  return "http://localhost:8000";
};

const BASE_URL = getBaseUrl();

export const request = async <T = any>(
  url: string,
  method: RequestMethod,
  headers?: Record<string, string>,
  data?: any,
  isFormData?: boolean,
): Promise<T> => {
  const raw = `${BASE_URL}${url}`;

  const fetchOptions: any = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body:
      data !== undefined && method.toUpperCase() !== "GET"
        ? isFormData
          ? (data as FormData)
          : JSON.stringify(data)
        : undefined,
  };

  if (isFormData) {
    delete (fetchOptions.headers as Record<string, string>)["Content-Type"];
  }

  const response = await fetch(raw, fetchOptions);
  const responseText = await response.text();

  let responseBody: any = {};
  try {
    responseBody = responseText ? JSON.parse(responseText) : {};
  } catch (parseError) {
    const errorMsg =
      responseText || `HTTP ${response.status}: ${response.statusText}`;
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
