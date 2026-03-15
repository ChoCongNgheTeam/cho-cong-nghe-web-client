export const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "PENDING", label: "Chờ xác nhận" },
  { id: "PROCESSING", label: "Đã xác nhận" },
  { id: "SHIPPED", label: "Đang giao" },
  { id: "DELIVERED", label: "Hoàn tất" },
  { id: "CANCELLED", label: "Đã hủy" },
];

export const orderStatusConfig: Record<string, { label: string; color: string; bgColor: string; dot: string }> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    dot: "bg-amber-500",
  },
  PROCESSING: {
    label: "Đã xác nhận",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    dot: "bg-blue-500",
  },
  SHIPPED: {
    label: "Đang giao",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    dot: "bg-orange-500",
  },
  DELIVERED: {
    label: "Hoàn tất",
    color: "text-green-700",
    bgColor: "bg-green-50",
    dot: "bg-green-500",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-red-700",
    bgColor: "bg-red-50",
    dot: "bg-red-400",
  },
};

export const paymentStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  PAID: {
    label: "Đã thanh toán",
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  UNPAID: {
    label: "Chưa thanh toán",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
  },
};

// Các phương thức cần redirect để thanh toán lại
export const REDIRECT_PAYMENT_METHODS = ["MOMO", "VNPAY", "ZALOPAY"];
export const BANK_TRANSFER_METHODS = ["BANK_TRANSFER", "BANK TRANSFER"];
