"use client";

import { ShoppingCart, Star, MessageSquare, Bell, LayoutDashboard, Package, BarChart3, BookOpen, Image as ImageIcon, Ticket, Megaphone, Tag, Users, CreditCard, Wand2 } from "lucide-react";
import { SidebarShell, NavGroup } from "./AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { PermissionKey } from "@/(client)/staff-permissions.types";

// Mỗi item có thể gắn permission — nếu không có perm thì luôn hiển thị
interface NavItemDef {
  title: string;
  href: string;
  icon: React.ElementType;
  perm?: PermissionKey;
}

interface NavGroupDef {
  label: string;
  icon: React.ElementType;
  items: NavItemDef[];
}

const ALL_NAV_GROUPS: NavGroupDef[] = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    items: [{ title: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard, perm: "canAnalytics" }],
  },
  {
    label: "Đơn hàng",
    icon: ShoppingCart,
    items: [
      { title: "Danh sách đơn hàng", href: "/staff/orders", icon: ShoppingCart, perm: "canViewOrders" },
      { title: "Tạo đơn hàng", href: "/staff/orders/create", icon: Package, perm: "canCreateOrder" },
    ],
  },
  {
    label: "Sản phẩm",
    icon: Package,
    items: [{ title: "Danh sách sản phẩm", href: "/staff/products", icon: Package, perm: "canViewProducts" }],
  },
  {
    label: "Marketing",
    icon: Megaphone,
    items: [
      { title: "Bài viết (Blog)", href: "/staff/blogs", icon: BookOpen, perm: "canBlogs" },
      { title: "Media", href: "/staff/media", icon: ImageIcon, perm: "canMedia" },
      { title: "Chiến dịch", href: "/staff/campaigns", icon: Megaphone, perm: "canCampaigns" },
      { title: "Khuyến mãi", href: "/staff/promotions", icon: Tag, perm: "canPromotions" },
      { title: "Voucher", href: "/staff/vouchers", icon: Ticket, perm: "canVouchers" },
      // { title: "AI Content", href: "/staff/ai-content", icon: Wand2, perm: "canAiContent" },
    ],
  },
  {
    label: "Nội dung",
    icon: Star,
    items: [
      { title: "Đánh giá sản phẩm", href: "/staff/reviews", icon: Star, perm: "canReviews" },
      { title: "Bình luận", href: "/staff/comments", icon: MessageSquare, perm: "canComments" },
    ],
  },
  {
    label: "Khách hàng",
    icon: Users,
    items: [{ title: "Người dùng", href: "/staff/users", icon: Users, perm: "canViewUsers" }],
  },
  {
    label: "Báo cáo",
    icon: BarChart3,
    items: [
      { title: "Thống kê", href: "/staff/analytics", icon: BarChart3, perm: "canAnalytics" },
      { title: "Thanh toán", href: "/staff/payment-methods", icon: CreditCard, perm: "canPaymentView" },
    ],
  },
  {
    label: "Thông báo",
    icon: Bell,
    items: [{ title: "Thông báo", href: "/staff/notifications", icon: Bell, perm: "canNotifications" }],
  },
];

export default function StaffSidebar() {
  const { user } = useAuth();
  const perms = user?.permissions;

  // Filter: giữ item nếu không có perm (always show) hoặc có permission = true
  const filteredGroups: NavGroup[] = ALL_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.perm || perms?.[item.perm] === true),
  })).filter((group) => group.items.length > 0); // bỏ group rỗng

  const allHrefs = new Set(filteredGroups.flatMap((g) => g.items.map((i) => i.href)));

  return <SidebarShell navGroups={filteredGroups} allHrefs={allHrefs} homeHref="/staff/dashboard" />;
}
