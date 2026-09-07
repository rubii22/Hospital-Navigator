import { request } from "./client";
import { UserDetail } from "./types";

export const UsersApi = {
  getUsers: async (): Promise<UserDetail[]> => {
    return request<UserDetail[]>("/api/v1/users/", "GET");
  },

  createUser: async (data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role_name?: string;
  }): Promise<UserDetail> => {
    return request<UserDetail>("/api/v1/users/", "POST", undefined, data);
  },

  updateUser: async (id: number, data: Partial<UserDetail> & { password?: string }): Promise<UserDetail> => {
    return request<UserDetail>(`/api/v1/users/${id}`, "PUT", undefined, data);
  },

  deleteUser: async (id: number): Promise<{ ok: boolean }> => {
    return request<{ ok: boolean }>(`/api/v1/users/${id}`, "DELETE");
  },
};
