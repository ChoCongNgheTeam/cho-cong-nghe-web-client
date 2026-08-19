import apiRequest from "@/lib/api";
import type { TrendForecastListResponse, GenerateForecastPayload } from "../trend-forecast.types";

// Không dùng createResourceApi vì đây không phải resource CRUD chuẩn
// (không có id/pagination/search — chỉ có "lấy danh sách mới nhất" + "trigger tạo lại bằng AI")

export const getTrendForecasts = (): Promise<TrendForecastListResponse> => apiRequest.get<TrendForecastListResponse>("/trend-forecast");

export const generateTrendForecast = (payload?: GenerateForecastPayload): Promise<TrendForecastListResponse> =>
  apiRequest.post<TrendForecastListResponse>("/trend-forecast/generate", payload);
