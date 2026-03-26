export type DashboardPeriod = "today" | "week" | "month" | "year";

export interface DashboardQuery {
  period?: DashboardPeriod;
}

export interface DashboardSummary {
  revenue: { total: number; change: number; sparkline?: number[] };
  orders: { total: number; change: number; pendingChatbot: number; sparkline?: number[] };
  customers: { total: number; newThisPeriod: number; change: number; sparkline?: number[] };
  products: { totalActive: number; lowStock: number; outOfStock: number };
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface OrderItem {
  productName: string;
  variantCode: string;
  quantity: number;
  unitPrice: number;
}

export interface RecentOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  orderDate: string;
  isChatbotRequest: boolean;
  items?: OrderItem[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  productSlug: string;
  variantCode: string | null;
  totalSold: number;
  totalRevenue: number;
  imageUrl: string | null;
  currentStock?: number;
  daysUntilStockout?: number;
}

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
