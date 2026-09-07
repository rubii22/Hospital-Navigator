import { request, setAuthToken } from "./client";

export const AuthApi = {
  login: async (email: string, password: string) => {
    const res = await request<{ access_token: string; token_type: string }>(
      "/api/v1/auth/login/json",
      "POST",
      undefined,
      { email, password }
    );
    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },

  getCurrentUser: async () => {
    return request<any>("/api/v1/auth/me", "GET");
  },

  logout: () => {
    setAuthToken(null);
  },
};
