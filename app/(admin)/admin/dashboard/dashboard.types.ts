// ─── Query Params ─────────────────────────────────────────────────────────────

export type DashboardPeriod = "today" | "week" | "month" | "year";

export interface DashboardQuery {
  period?: DashboardPeriod;
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  revenue: {
    total: number;
    change: number;
  };
  orders: {
    total: number;
    change: number;
    pendingChatbot: number;
  };
  customers: {
    total: number;
    newThisPeriod: number;
    change: number;
  };
  products: {
    totalActive: number;
    lowStock: number;
    outOfStock: number;
  };
}

// ─── Order Status Breakdown ───────────────────────────────────────────────────

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

// ─── Recent Order ─────────────────────────────────────────────────────────────

export interface RecentOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  orderDate: string;
  isChatbotRequest: boolean;
}

// ─── Top Product ──────────────────────────────────────────────────────────────

export interface TopProduct {
  productId: string;
  productName: string;
  productSlug: string;
  variantCode: string | null;
  totalSold: number;
  totalRevenue: number;
  imageUrl: string | null;
}

// ─── Dashboard Response ───────────────────────────────────────────────────────

export interface DashboardData {
  summary: DashboardSummary;
  orderStatusBreakdown: OrderStatusBreakdown[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  chatbotPendingOrders: RecentOrder[];
}

export interface DashboardResponse {
  data: DashboardData;
  message: string;
}
