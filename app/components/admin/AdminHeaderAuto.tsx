"use client";

import { usePathname } from "next/navigation";
import AdminHeader from "./AdminHeader";

// Map đầy đủ khớp với navGroups của cả AdminSidebar và StaffSidebar.
// Key là path tương đối (không có prefix /admin hay /staff).
const ROUTE_TITLES: Record<string, string> = {
  // Tổng quan
  "/dashboard": "Dashboard",
  "/analytics": "Thống kê doanh thu",

  // Vận hành
  "/orders": "Đơn hàng",
  "/payment-methods": "Phương thức thanh toán",
  "/users": "Người dùng",

  // Danh mục sản phẩm
  "/products/create": "Thêm mới sản phẩm",
  "/products": "Danh sách sản phẩm",
  "/specifications": "Thông số kỹ thuật",
  "/category-specifications": "Thông số theo danh mục",
  "/attributes": "Thuộc tính",
  "/category-variant-attributes": "Danh mục & Thuộc tính",
  "/categories": "Danh mục sản phẩm",
  "/brands": "Thương hiệu",

  // Khuyến mãi
  "/promotions": "Khuyến mãi",
  "/campaigns": "Chiến dịch",
  "/vouchers/usages": "Lịch sử dùng voucher",
  "/vouchers/private-users": "Voucher riêng tư",
  "/vouchers": "Voucher",

  // Nội dung
  "/blogs": "Bài viết (Blog)",
  "/comments": "Bình luận",
  "/reviews": "Đánh giá sản phẩm",
  "/media": "Media (Slider/Banner)",

  // Hệ thống
  "/notifications": "Thông báo",
  "/settings": "Cài đặt hệ thống",
  "/trash": "Thùng rác",
};

interface Props {
  /** prefix của layout hiện tại, mặc định "/admin" */
  routePrefix?: string;
}

export default function AdminHeaderAuto({ routePrefix = "/admin" }: Props) {
  const pathname = usePathname();

  // Cắt prefix để lấy relative path, ví dụ "/admin/orders/123" → "/orders/123"
  const relative = pathname.startsWith(routePrefix) ? pathname.slice(routePrefix.length) || "/" : pathname;

  // Match route dài nhất trước (products/create trước products)
  const sortedKeys = Object.keys(ROUTE_TITLES).sort((a, b) => b.length - a.length);
  const matchedKey = sortedKeys.find((key) => relative === key || relative.startsWith(key + "/"));

  if (!matchedKey) {
    return <AdminHeader title="Admin" />;
  }

  // Nếu có path con thêm thì ghi " chi tiết"
  const title = relative === matchedKey ? ROUTE_TITLES[matchedKey] : `${ROUTE_TITLES[matchedKey]} chi tiết`;

  return <AdminHeader title={title} />;
}
