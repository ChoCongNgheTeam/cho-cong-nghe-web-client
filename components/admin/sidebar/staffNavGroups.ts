import { ShoppingCart, Star, MessageSquare, Bell, LayoutDashboard, Package, BarChart3, BookOpen, Image as ImageIcon, Ticket, Megaphone, Tag, Users, CreditCard } from "lucide-react";
import type { PermissionKey, StaffPermissions, UserRole } from "@/types/staff-permissions.types";
import type { NavGroup } from "./types";

interface StaffNavItemDef {
  title: string;
  href: string;
  icon: React.ElementType;
  perm?: PermissionKey;
  roles?: UserRole[];
}

interface StaffNavGroupDef {
  label: string;
  icon: React.ElementType;
  items: StaffNavItemDef[];
  defaultOpen?: boolean;
}

// Mỗi item có thể gắn permission — nếu không có perm thì luôn hiển thị
const ALL_STAFF_NAV_GROUPS: StaffNavGroupDef[] = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [{ title: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard }],
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
      // Trước đây roles ghi chữ thường ("admin","accounting") nên không bao giờ khớp
      // với user.role thực tế (luôn viết hoa) — mục này chưa từng hiển thị cho ai
      { title: "Thống kê", href: "/staff/analytics", icon: BarChart3, perm: "canAnalytics", roles: ["ADMIN", "ACCOUNTING"] },
      { title: "Thanh toán", href: "/staff/payment-methods", icon: CreditCard, perm: "canPaymentView" },
    ],
  },
  {
    label: "Thông báo",
    icon: Bell,
    items: [{ title: "Thông báo", href: "/staff/notifications", icon: Bell, perm: "canNotifications" }],
  },
];

interface FilterStaffNavGroupsParams {
  permissions?: StaffPermissions;
  role?: UserRole;
}

export function filterStaffNavGroups({ permissions, role }: FilterStaffNavGroupsParams): NavGroup[] {
  return ALL_STAFF_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const hasPermission = !item.perm || permissions?.[item.perm] === true;
      const hasRole = !item.roles || (!!role && item.roles.includes(role));
      return hasPermission && hasRole;
    }),
  })).filter((group) => group.items.length > 0);
}
