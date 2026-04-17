import { OrderStatus, PaymentStatus } from "../order.types";

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; pill: string; dot: string }> = {
  UNPAID: {
    label: "Chưa thanh toán",
    pill: "bg-neutral-light-active border-neutral text-neutral-darker",
    dot: "bg-neutral-dark",
  },
  PAID: {
    label: "Đã thanh toán",
    pill: "bg-accent-light border-accent-light-active text-accent-dark",
    dot: "bg-accent",
  },
  REFUNDED_PENDING: {
    label: "Chờ hoàn tiền",
    pill: "bg-neutral-light-active border-neutral text-neutral-darker",
    dot: "bg-neutral-darker",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    pill: "bg-promotion-light border-promotion-light-active text-promotion",
    dot: "bg-promotion",
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
    pill: "bg-accent-light text-accent border border-accent-light-active",
    pillSelected: "bg-accent-light text-accent",
    dropdownHover: "hover:bg-accent-light",
  },
  PROCESSING: {
    label: "Đang xử lý",
    dot: "bg-accent-dark",
    pill: "bg-accent-light text-accent-dark border border-accent-light-active",
    pillSelected: "bg-accent-light text-accent-dark",
    dropdownHover: "hover:bg-accent-light",
  },
  SHIPPED: {
    label: "Đang giao hàng",
    dot: "bg-neutral-darker",
    pill: "bg-neutral-light-active text-neutral-darker border border-neutral",
    pillSelected: "bg-neutral-light-active text-neutral-darker",
    dropdownHover: "hover:bg-neutral-light-active",
  },
  DELIVERED: {
    label: "Hoàn tất",
    dot: "bg-accent",
    pill: "bg-accent-light text-accent-dark border border-accent-light-active",
    pillSelected: "bg-accent-light text-accent-dark",
    dropdownHover: "hover:bg-accent-light",
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
