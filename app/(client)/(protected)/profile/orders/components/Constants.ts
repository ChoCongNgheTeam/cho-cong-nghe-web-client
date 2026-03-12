export const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "PENDING", label: "Đang xử lý" },
  { id: "PROCESSING", label: "Đã xác nhận" },
  { id: "SHIPPED", label: "Đang giao" },
  { id: "DELIVERED", label: "Hoàn tất" },
  { id: "CANCELLED", label: "Đã hủy" },
];

export const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  PROCESSING: {
    label: "Đã xác nhận",
    color: "text-accent",
    bgColor: "bg-accent-light",
  },
  SHIPPED: {
    label: "Đang giao",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  DELIVERED: {
    label: "Hoàn tất",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-promotion",
    bgColor: "bg-promotion-light",
  },
};