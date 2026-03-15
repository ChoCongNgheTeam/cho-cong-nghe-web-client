"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Tag,
  FolderOpen,
  CreditCard,
  Award,
  PlusCircle,
  List,
  Star,
  MessageSquare,
  ThumbsUp,
  ShieldCheck,
  Settings,
  LogOut,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
  Package,
  Palette,
  Layers,
  SlidersHorizontal,
  FileText,
  Image,
  Globe,
  Ticket,
  Megaphone,
  MapPin,
  ChevronDown,
  ChevronRight,
  Wallet,
  BarChart3,
  Heart,
  BookOpen,
  Boxes,
} from "lucide-react";
import UserAvatar from "../ui/UserAvatar";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

type NavGroup = {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Thống kê doanh thu",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Đơn hàng & Thanh toán",
    icon: ShoppingCart,
    items: [
      { title: "Danh sách đơn hàng", href: "/admin/orders", icon: ShoppingCart },
      // { title: "Chi tiết đơn hàng", href: "/admin/order-items", icon: Package },
      // { title: "Cổng thanh toán", href: "/admin/payment", icon: CreditCard },
      { title: "Phương thức thanh toán", href: "/admin/payment-methods", icon: Wallet },
      { title: "Lịch sử giao dịch", href: "/admin/payment-transactions", icon: FileText },
    ],
  },
  {
    label: "Sản phẩm",
    icon: Boxes,
    items: [
      { title: "Danh sách sản phẩm", href: "/admin/products", icon: List },
      { title: "Thêm mới sản phẩm", href: "/admin/products/create", icon: PlusCircle },
      // { title: "Biến thể sản phẩm", href: "/admin/products/variants", icon: Layers },
      // { title: "Hình ảnh màu sắc", href: "/admin/products/color-images", icon: Palette },
      { title: "Thông số kỹ thuật", href: "/admin/specifications", icon: SlidersHorizontal },
      { title: "Thuộc tính", href: "/admin/attributes", icon: Tag },
      // { title: "Tùy chọn thuộc tính", href: "/admin/attributes/options", icon: ChevronRight },
      // { title: "Thư viện ảnh", href: "/admin/media", icon: Image },
    ],
  },
  {
    label: "Danh mục & Thương hiệu",
    icon: FolderOpen,
    items: [
      { title: "Danh mục sản phẩm", href: "/admin/categories", icon: FolderOpen },
      // { title: "Thông số danh mục", href: "/admin/categories/specifications", icon: SlidersHorizontal },
      // { title: "Thuộc tính biến thể", href: "/admin/categories/variant-attributes", icon: Layers },
      { title: "Thương hiệu", href: "/admin/brands", icon: Award },
    ],
  },
  {
    label: "Khuyến mãi & Voucher",
    icon: Ticket,
    items: [
      { title: "Khuyến mãi", href: "/admin/promotions", icon: Tag },
      // { title: "Quy tắc khuyến mãi", href: "/admin/promotions/rules", icon: ShieldCheck },
      // { title: "Mục tiêu khuyến mãi", href: "/admin/promotions/targets", icon: Users },
      { title: "Chiến dịch", href: "/admin/campaigns", icon: Megaphone },
      // { title: "Danh mục chiến dịch", href: "/admin/campaigns/categories", icon: FolderOpen },
      { title: "Voucher", href: "/admin/vouchers", icon: Ticket },
      { title: "Lịch sử dùng voucher", href: "/admin/vouchers/usages", icon: FileText },
    ],
  },
  {
    label: "Người dùng",
    icon: Users,
    items: [
      { title: "Danh sách người dùng", href: "/admin/users", icon: Users },
      { title: "Địa chỉ người dùng", href: "/admin/users/addresses", icon: MapPin },
      { title: "Tài khoản OAuth", href: "/admin/users/oauth", icon: Globe },
      { title: "Danh sách yêu thích", href: "/admin/wishlists", icon: Heart },
      { title: "Giỏ hàng", href: "/admin/carts", icon: ShoppingCart },
    ],
  },
  {
    label: "Nội dung",
    icon: BookOpen,
    items: [
      { title: "Bài viết (Blog)", href: "/admin/blogs", icon: BookOpen },
      { title: "Trang tĩnh", href: "/admin/pages", icon: FileText },
      { title: "Bình luận", href: "/admin/comments", icon: MessageSquare },
      { title: "Đánh giá sản phẩm", href: "/admin/reviews", icon: Star },
      { title: "Ratings", href: "/admin/ratings", icon: ThumbsUp },
    ],
  },
  {
    label: "Địa lý",
    icon: MapPin,
    items: [
      { title: "Tỉnh / Thành phố", href: "/admin/provinces", icon: MapPin },
      { title: "Phường / Xã", href: "/admin/wards", icon: MapPin },
    ],
  },
  {
    label: "Hệ thống",
    icon: Settings,
    items: [
      { title: "Vai trò & Phân quyền", href: "/admin/roles", icon: ShieldCheck },
      { title: "Cài đặt hệ thống", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Auto-open group that contains the current active path
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      if (g.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"))) {
        initial[g.label] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    await logout?.();
    router.replace("/account");
  };

  const isGroupActive = (group: NavGroup) => group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <div className={`${collapsed ? "w-14" : "w-64"} bg-neutral-light border-r border-neutral h-full flex flex-col transition-all duration-300 relative`}>
      {/* Logo */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-neutral">
        {!collapsed && <span className="font-bold text-base text-primary leading-tight tracking-tight">ChoCongNghe</span>}
        <button onClick={() => setCollapsed((prev) => !prev)} className="text-neutral-dark hover:text-primary transition-colors p-1 rounded-md hover:bg-neutral-light-active cursor-pointer ml-auto">
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2 space-y-0.5">
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = openGroups[group.label] ?? false;
          const groupActive = isGroupActive(group);

          if (collapsed) {
            // Collapsed: show only icons with tooltips, no accordion
            return (
              <div key={group.label} className="mb-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.title}
                      className={`flex justify-center items-center py-2.5 px-1.5 rounded-lg mb-0.5 transition-all duration-150 ${
                        isActive ? "bg-accent text-white shadow-sm" : "text-neutral-dark hover:bg-neutral-light-active hover:text-primary"
                      }`}
                    >
                      <Icon size={20} />
                    </Link>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={group.label} className="mb-0.5">
              {/* Group Header — Accordion Toggle */}
              <button
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${
                  groupActive && !isOpen ? "bg-accent/10 text-accent font-semibold" : "text-primary hover:bg-neutral-light-active"
                }`}
              >
                <GroupIcon size={16} className={groupActive && !isOpen ? "text-accent" : "text-neutral-dark"} />
                <span className="flex-1 text-[12px] font-semibold uppercase tracking-wider">{group.label}</span>
                {isOpen ? <ChevronDown size={13} className="text-neutral-dark" /> : <ChevronRight size={13} className="text-neutral-dark" />}
              </button>

              {/* Group Items */}
              {isOpen && (
                <div className="ml-2 pl-2 border-l border-neutral mt-0.5 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-150 ${
                          isActive ? "bg-accent text-white font-medium shadow-sm" : "text-primary hover:bg-neutral-light-active hover:text-primary"
                        }`}
                      >
                        <Icon size={15} className={isActive ? "text-white" : "text-neutral-dark"} />
                        <span className="text-[13px]">{item.title}</span>
                        {item.badge && <span className="ml-auto text-[10px] bg-promotion text-white rounded-full px-1.5 py-0.5 font-semibold">{item.badge}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      {user && (
        <div className="border-t border-neutral px-3 py-3 space-y-0.5">
          <div className={`flex items-center gap-2.5 px-2 py-2 rounded-lg ${collapsed ? "justify-center" : ""}`}>
            <UserAvatar avatarImage={user.avatarImage} fullName={user.fullName} size={32} className="shrink-0" />
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-primary truncate">{user.fullName}</div>
                  <div className="text-[11px] text-neutral-dark truncate">{user.email}</div>
                </div>
                <button onClick={handleLogout} title="Đăng xuất" className="text-neutral-dark hover:text-promotion transition-colors shrink-0 cursor-pointer">
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>

          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5 px-2 py-2 text-[13px] text-primary hover:text-primary rounded-lg hover:bg-neutral-light-active transition-all duration-150">
              <Store size={15} className="text-neutral-dark" />
              <span>Cửa hàng của tôi</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
