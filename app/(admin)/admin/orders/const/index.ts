import { OrderStatus, PaymentStatus } from "../order.types";

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; dot: string; pill: string }> = {
  UNPAID: {
    label: "Chưa thanh toán",
    dot: "bg-orange-400",
    pill: "bg-orange-50 text-orange-600 border border-orange-200",
  },
  PAID: {
    label: "Đã thanh toán",
    dot: "bg-green-400",
    pill: "bg-green-50 text-green-600 border border-green-200",
  },
  REFUND_PENDING: {
    label: "Chờ hoàn tiền",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    dot: "bg-neutral-dark",
    pill: "bg-neutral-light-active text-neutral-darker border border-neutral",
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
    dot: "bg-accent",
    pill: "bg-accent-light text-accent border border-accent",
    pillSelected: "bg-accent-light text-accent",
    dropdownHover: "hover:bg-accent-light",
  },
  PROCESSING: {
    label: "Đang xử lý",
    dot: "bg-orange-400",
    pill: "bg-orange-50 text-orange-600 border border-orange-200",
    pillSelected: "bg-orange-50 text-orange-600",
    dropdownHover: "hover:bg-orange-50",
  },
  SHIPPED: {
    label: "Đang giao hàng",
    dot: "bg-purple-400",
    pill: "bg-purple-50 text-purple-600 border border-purple-200",
    pillSelected: "bg-purple-50 text-purple-600",
    dropdownHover: "hover:bg-purple-50",
  },
  DELIVERED: {
    label: "Hoàn tất",
    dot: "bg-green-400",
    pill: "bg-green-50 text-green-600 border border-green-200",
    pillSelected: "bg-green-50 text-green-600",
    dropdownHover: "hover:bg-green-50",
  },
  CANCELLED: {
    label: "Hủy đơn",
    dot: "bg-promotion",
    pill: "bg-promotion-light text-promotion border border-promotion-light-active",
    pillSelected: "bg-promotion-light text-promotion",
    dropdownHover: "hover:bg-promotion-light",
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
