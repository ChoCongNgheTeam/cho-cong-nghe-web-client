import { Invoice, StatusConfig } from "./Invoice.types";

export const MOCK_INVOICES: Record<string, Invoice> = {
  "INV-2024-001234": {
    id: "INV-2024-001234",
    status: "paid",
    date: "15/03/2024",
    dueDate: "15/04/2024",
    paidDate: "12/03/2024",
    customer: "Nguyễn Minh Anh",
    email: "minhanh@email.com",
    phone: "0912 345 678",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    taxCode: "0123456789",
    items: [
      {
        name: "Dell XPS 13 9310",
        qty: 1,
        unit: "cái",
        price: 28500000,
      },
      {
        name: "Chuột không dây Logitech MX3",
        qty: 2,
        unit: "cái",
        price: 1250000,
      },
      {
        name: "Bàn phím cơ Keychron K2",
        qty: 1,
        unit: "cái",
        price: 2200000,
      },
    ],
    discount: 500000,
    tax: 10,
    serial: "VN-20240001",
    template: "01GTKT0/001",
  },
  "INV-2024-005678": {
    id: "INV-2024-005678",
    status: "pending",
    date: "28/03/2024",
    dueDate: "28/04/2024",
    paidDate: null,
    customer: "Công ty ABC Tech",
    email: "ketoan@abctech.vn",
    phone: "028 3822 9999",
    address: "45 Lê Lợi, Quận 1, TP.HCM",
    taxCode: "0312345678",
    items: [
      {
        name: "Màn hình LG 27UK850 4K",
        qty: 3,
        unit: "cái",
        price: 12800000,
      },
      {
        name: "Dịch vụ lắp đặt và cấu hình",
        qty: 1,
        unit: "dịch vụ",
        price: 1500000,
      },
    ],
    discount: 0,
    tax: 10,
    serial: "VN-20240078",
    template: "01GTKT0/001",
  },
  "INV-2024-009999": {
    id: "INV-2024-009999",
    status: "cancelled",
    date: "05/01/2024",
    dueDate: "05/02/2024",
    paidDate: null,
    customer: "Trần Thu Trang",
    email: "trang.tran@gmail.com",
    phone: "0987 654 321",
    address: "67 Trần Hưng Đạo, Quận 5, TP.HCM",
    taxCode: "",
    items: [
      {
        name: "iPad Pro 12.9 M2 WiFi 256GB",
        qty: 1,
        unit: "cái",
        price: 32900000,
      },
    ],
    discount: 900000,
    tax: 10,
    serial: "VN-20240012",
    template: "01GTKT0/001",
  },
};

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  paid: {
    label: "Đã thanh toán",
    icon: "✓",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  pending: {
    label: "Chờ thanh toán",
    icon: "●",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  cancelled: {
    label: "Đã hủy",
    icon: "✕",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
};

export const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";
export const subtotalOf = (items: Invoice["items"]) =>
  items.reduce((s, i) => s + i.price * i.qty, 0);
