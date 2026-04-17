export type TimeGranularity = "day" | "week" | "month";

export interface AnalyticsQuery {
  from: string;
  to: string;
  granularity?: TimeGranularity;
}

export interface RevenueDataPoint {
  period: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface RevenueByPaymentMethod {
  method: string;
  methodCode: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface RevenueByCategory {
  categoryId: string;
  categoryName: string;
  revenue: number;
  unitsSold: number;
  percentage: number;
}

export interface TopCustomer {
  userId: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface ConversionFunnel {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface HeatmapPoint {
  day: number;
  hour: number;
  count: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalDelivered: number;
  averageOrderValue: number;
  cancellationRate: number;
  deliveryRate: number;
  revenueChange?: number;
  ordersChange?: number;
}

export interface AnalyticsData {
  revenueOverTime: RevenueDataPoint[];
  comparisonOverTime?: RevenueDataPoint[];
  forecast?: RevenueDataPoint[];
  revenueByPaymentMethod: RevenueByPaymentMethod[];
  revenueByCategory: RevenueByCategory[];
  topCustomers: TopCustomer[];
  conversionFunnel: ConversionFunnel;
  heatmap?: HeatmapPoint[];
  summary: AnalyticsSummary;
}

export interface AnalyticsResponse {
  data: AnalyticsData;
  message: string;
}
