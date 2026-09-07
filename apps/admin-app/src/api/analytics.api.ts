import { request } from "./client";
import { DashboardStats, ActivityLog } from "./types";

export const AnalyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return request<DashboardStats>("/api/v1/admin/dashboard-stats", "GET");
  },

  getActivityLogs: async (): Promise<ActivityLog[]> => {
    return request<ActivityLog[]>("/api/v1/admin/activity-logs", "GET");
  },
};
