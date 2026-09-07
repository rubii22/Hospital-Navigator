import { request } from "./client";
import {
  LoginRequest,
  RefreshTokenRequest,
  Token,
  UserCreate,
  UserResponse,
} from "./types";

export const authApi = {
  register: (data: UserCreate): Promise<UserResponse> => {
    return request<UserResponse>("/api/v1/auth/register", "POST", {}, data);
  },

  login: (data: LoginRequest): Promise<Token> => {
    return request<Token>("/api/v1/auth/login/json", "POST", {}, data);
  },

  refresh: (data: RefreshTokenRequest): Promise<Token> => {
    return request<Token>("/api/v1/auth/refresh", "POST", {}, data);
  },

  logout: (): Promise<{ detail: string }> => {
    return request<{ detail: string }>("/api/v1/auth/logout", "POST");
  },

  getMe: (token: string): Promise<UserResponse> => {
    return request<UserResponse>("/api/v1/auth/me", "GET", {
      Authorization: `Bearer ${token}`,
    });
  },
};
