import apiRequest from "@/lib/api";
import type { DashboardResponse, DashboardQuery } from "../dashboard.types";

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

/** GET /analytics/dashboard?period=month — tổng quan hệ thống */
export const getDashboard = async (params?: DashboardQuery): Promise<DashboardResponse> => apiRequest.get<DashboardResponse>("/analytics/dashboard", { params });
