import apiRequest from "@/lib/api";
import type { DashboardResponse, DashboardQuery } from "../dashboard.types";

export const getDashboard = async (params?: DashboardQuery): Promise<DashboardResponse> => apiRequest.get<DashboardResponse>("/analytics/dashboard", { params });
