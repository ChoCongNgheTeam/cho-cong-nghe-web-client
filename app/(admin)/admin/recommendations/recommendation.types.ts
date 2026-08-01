export interface AlgorithmStat {
  algorithm: string;
  shown: number;
  clicked: number;
  ctr: number;
}

export interface DailyStat {
  date: string;
  shown: number;
  clicked: number;
}

export interface RecommendationAnalytics {
  totalShown: number;
  totalClicked: number;
  ctr: number;
  byAlgorithm: AlgorithmStat[];
  daily: DailyStat[];
}

export interface RecommendationAnalyticsResponse {
  data: RecommendationAnalytics;
  message: string;
}

export interface GetAnalyticsParams {
  days?: number;
}
