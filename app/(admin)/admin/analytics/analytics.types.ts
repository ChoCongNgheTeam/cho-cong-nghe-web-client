// ─── Query ────────────────────────────────────────────────────────────────────

export type TimeGranularity = "day" | "week" | "month";

export interface AnalyticsQuery {
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD"
  granularity?: TimeGranularity;
}

// ─── Data shapes ──────────────────────────────────────────────────────────────

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
  requested: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalDelivered: number;
  averageOrderValue: number;
  cancellationRate: number;
  deliveryRate: number;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  revenueOverTime: RevenueDataPoint[];
  revenueByPaymentMethod: RevenueByPaymentMethod[];
  revenueByCategory: RevenueByCategory[];
  topCustomers: TopCustomer[];
  conversionFunnel: ConversionFunnel;
  summary: AnalyticsSummary;
}

export interface AnalyticsResponse {
  data: AnalyticsData;
  message: string;
}
