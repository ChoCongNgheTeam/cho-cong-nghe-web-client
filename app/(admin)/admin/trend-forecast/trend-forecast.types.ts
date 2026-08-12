export interface TrendForecastItem {
  keyword: string;
  forecastScore: number;
  suggestedAction: string;
  reasoning: string;
  period: string;
  generatedAt: string;
}

export interface TrendForecastListResponse {
  data: TrendForecastItem[];
  message: string;
}

export interface GenerateForecastPayload {
  days?: number;
}
