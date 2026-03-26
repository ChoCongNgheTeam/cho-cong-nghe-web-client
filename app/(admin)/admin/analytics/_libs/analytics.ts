import apiRequest from "@/lib/api";
import type { AnalyticsResponse, AnalyticsQuery } from "../analytics.types";

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /analytics/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=day|week|month */
export const getAnalytics = async (params: AnalyticsQuery): Promise<AnalyticsResponse> => apiRequest.get<AnalyticsResponse>("/analytics/revenue", { params });
