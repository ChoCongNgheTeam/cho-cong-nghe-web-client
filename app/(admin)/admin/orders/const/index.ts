import { OrderStatus, PaymentStatus } from "../order.types";

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; pill: string; dot: string }> = {
  UNPAID: {
    label: "Chưa thanh toán",
    pill: "bg-neutral-light-active border-neutral text-neutral-darker",
    dot: "bg-neutral-dark",
  },
  PAID: {
    label: "Đã thanh toán",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-400",
  },
  REFUND_PENDING: {
    label: "Chờ hoàn tiền",
    pill: "bg-amber-50 text-amber-600 border border-amber-200",
    dot: "bg-amber-400",
  },

  REFUNDED: {
    label: "Đã hoàn tiền",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-400",
  },
};

export const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Tất cả đơn hàng", value: "ALL" },
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Đang xử lý", value: "PROCESSING" },
  { label: "Đang giao", value: "SHIPPED" },
  { label: "Hoàn thành", value: "DELIVERED" },
  { label: "Hủy đơn", value: "CANCELLED" },
];

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    dot: string;
    pill: string;
    pillSelected: string;
    dropdownHover: string;
  }
> = {
  PENDING: {
    label: "Đang chờ",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-600 border border-amber-200",
    pillSelected: "bg-amber-50 text-amber-600",
    dropdownHover: "hover:bg-amber-50",
  },
  PROCESSING: {
    label: "Đang xử lý",
    dot: "bg-blue-500",
    pill: "bg-blue-50 text-blue-600 border border-blue-200",
    pillSelected: "bg-blue-50 text-blue-600",
    dropdownHover: "hover:bg-blue-50",
  },
  SHIPPED: {
    label: "Đang giao hàng",
    dot: "bg-indigo-500",
    pill: "bg-indigo-50 text-indigo-600 border border-indigo-200",
    pillSelected: "bg-indigo-50 text-indigo-600",
    dropdownHover: "hover:bg-indigo-50",
  },
  DELIVERED: {
    label: "Hoàn tất",
    dot: "bg-emerald-400",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    pillSelected: "bg-emerald-50 text-emerald-700",
    dropdownHover: "hover:bg-emerald-50",
  },
  CANCELLED: {
    label: "Hủy đơn",
    dot: "bg-red-500",
    pill: "bg-red-50 text-red-600 border border-red-200",
    pillSelected: "bg-red-50 text-red-600",
    dropdownHover: "hover:bg-red-50",
  },
};

export const ALL_STATUSES: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
