"use client";
import { ShoppingCart, Star, MessageSquare, Bell, LayoutDashboard } from "lucide-react";
import { SidebarShell, NavGroup } from "./AdminSidebar";

const staffNavGroups: NavGroup[] = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    items: [{ title: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Đơn hàng",
    icon: ShoppingCart,
    items: [{ title: "Danh sách đơn hàng", href: "/staff/orders", icon: ShoppingCart }],
  },
  {
    label: "Nội dung",
    icon: Star,
    items: [
      { title: "Đánh giá sản phẩm", href: "/staff/reviews", icon: Star },
      { title: "Bình luận", href: "/staff/comments", icon: MessageSquare },
    ],
  },
  {
    label: "Thông báo",
    icon: Bell,
    items: [{ title: "Thông báo", href: "/staff/notifications", icon: Bell }],
  },
];

const allStaffHrefs = new Set(staffNavGroups.flatMap((g) => g.items.map((i) => i.href)));

export default function StaffSidebar() {
  return <SidebarShell navGroups={staffNavGroups} allHrefs={allStaffHrefs} homeHref="/staff/dashboard" />;
}
