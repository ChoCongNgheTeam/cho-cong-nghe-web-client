"use client";

import { usePathname } from "next/navigation";
import AdminHeader from "./AdminHeader";

const ROUTE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Tổng quan hệ thống",
  "/admin/orders": "Đơn hàng",
  "/admin/users": "Người dùng",
  "/admin/promotions": "Khuyến mãi",
  "/admin/categories": "Danh mục",
  "/admin/payment": "Cổng thanh toán",
  "/admin/brands": "Thương hiệu",
  "/admin/blogs": "Bài viết",
  "/admin/products": "Danh sách sản phẩm",
  "/admin/products/create": "Thêm mới sản phẩm",
  "/admin/reviews": "Đánh giá sản phẩm",
  "/admin/roles": "Vai trò quản trị",
  "/admin/settings": "Cài đặt hệ thống",
};

export default function AdminHeaderAuto() {
  const pathname = usePathname();

  const sortedRoutes = Object.keys(ROUTE_TITLES).sort((a, b) => b.length - a.length);
  const matchedRoute = sortedRoutes.find((route) => pathname.startsWith(route));

  if (!matchedRoute) {
    return <AdminHeader title="Admin" />;
  }

  let title = ROUTE_TITLES[matchedRoute];
  if (pathname !== matchedRoute) {
    title += " chi tiết";
  }

  return <AdminHeader title={title} />;
}
