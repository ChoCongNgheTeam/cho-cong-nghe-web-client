import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Tag,
  FolderOpen,
  Award,
  PlusCircle,
  List,
  Star,
  MessageSquare,
  Settings,
  SlidersHorizontal,
  FileText,
  Image as ImageIcon,
  Ticket,
  Megaphone,
  Wallet,
  BarChart3,
  BookOpen,
  Boxes,
  Bell,
  Trash2,
  Link2,
  Truck,
  Layers,
} from "lucide-react";
import type { NavGroup } from "./types";

export const adminNavGroups: NavGroup[] = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Thống kê doanh thu", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Vận hành",
    icon: Truck,
    items: [
      { title: "Danh sách đơn hàng", href: "/admin/orders", icon: ShoppingCart },
      { title: "Phương thức thanh toán", href: "/admin/payment-methods", icon: Wallet },
      { title: "Danh sách người dùng", href: "/admin/users", icon: Users },
    ],
  },
  {
    label: "Danh mục sản phẩm",
    icon: Boxes,
    items: [
      { title: "Danh sách sản phẩm", href: "/admin/products", icon: List },
      { title: "Thêm mới sản phẩm", href: "/admin/products/create", icon: PlusCircle },
      { title: "Thông số kỹ thuật", href: "/admin/specifications", icon: SlidersHorizontal },
      { title: "Thông số theo danh mục", href: "/admin/category-specifications", icon: Layers },
      { title: "Thuộc tính", href: "/admin/attributes", icon: Tag },
      { title: "Danh mục & Thuộc tính", href: "/admin/category-variant-attributes", icon: Link2 },
      { title: "Danh mục sản phẩm", href: "/admin/categories", icon: FolderOpen },
      { title: "Thương hiệu", href: "/admin/brands", icon: Award },
    ],
  },
  {
    label: "Khuyến mãi",
    icon: Ticket,
    items: [
      { title: "Khuyến mãi", href: "/admin/promotions", icon: Tag },
      { title: "Chiến dịch", href: "/admin/campaigns", icon: Megaphone },
      { title: "Voucher", href: "/admin/vouchers", icon: Ticket },
      { title: "Lịch sử dùng voucher", href: "/admin/vouchers/usages", icon: FileText },
      { title: "Voucher riêng tư", href: "/admin/vouchers/private-users", icon: Users },
    ],
  },
  {
    label: "Nội dung",
    icon: BookOpen,
    items: [
      { title: "Bài viết (Blog)", href: "/admin/blogs", icon: BookOpen },
      { title: "Bình luận", href: "/admin/comments", icon: MessageSquare },
      { title: "Đánh giá sản phẩm", href: "/admin/reviews", icon: Star },
      { title: "Media (Slider/Banner)", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    label: "Hệ thống",
    icon: Settings,
    items: [
      { title: "Thông báo", href: "/admin/notifications", icon: Bell },
      { title: "Cài đặt hệ thống", href: "/admin/settings", icon: Settings },
      { title: "Thùng rác", href: "/admin/trash", icon: Trash2 },
    ],
  },
];

export const allAdminHrefs = new Set(adminNavGroups.flatMap((g) => g.items.map((i) => i.href)));
