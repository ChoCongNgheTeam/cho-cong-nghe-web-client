import apiRequest from "@/lib/api";
import type { RecommendationAnalyticsResponse, GetAnalyticsParams } from "../recommendation.types";

export const getRecommendationAnalytics = (params?: GetAnalyticsParams): Promise<RecommendationAnalyticsResponse> =>
  apiRequest.get<RecommendationAnalyticsResponse>("/recommendation/admin/analytics", { params });
