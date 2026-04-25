"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
  Settings,
  LogOut,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Layers,
  SlidersHorizontal,
  FileText,
  Image as ImageIcon,
  Ticket,
  Megaphone,
  ChevronDown,
  ChevronRight,
  Wallet,
  BarChart3,
  BookOpen,
  Boxes,
  Bell,
  Trash2,
  Link2,
  Truck,
} from "lucide-react";
import UserAvatar from "../ui/UserAvatar";
import { useTheme } from "@/hooks/useTheme";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

export type NavGroup = {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
};

export const adminNavGroups: NavGroup[] = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
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

// Tập hợp tất cả hrefs để dùng trong isItemActive
const allAdminHrefs = new Set(adminNavGroups.flatMap((g) => g.items.map((i) => i.href)));

export function isItemActive(pathname: string, href: string, allHrefs: Set<string>): boolean {
  if (pathname === href) return true;
  if (pathname.startsWith(href + "/")) {
    const hasMoreSpecificMatch = [...allHrefs].some((other) => other !== href && other.startsWith(href) && pathname.startsWith(other));
    return !hasMoreSpecificMatch;
  }
  return false;
}

// ── Flyout (collapsed mode) ───────────────────────────────────────────────────
export function CollapsedFlyout({ group, anchorY, pathname, allHrefs, onClose }: { group: NavGroup; anchorY: number; pathname: string; allHrefs: Set<string>; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const flyoutHeight = group.items.length * 36 + 48;
  const maxTop = typeof window !== "undefined" ? window.innerHeight - flyoutHeight - 8 : anchorY;
  const top = Math.min(anchorY, maxTop);

  return (
    <div ref={ref} style={{ top, left: 56 }} className="fixed z-50 w-52 border border-neutral rounded-xl shadow-lg py-1.5 overflow-hidden bg-neutral">
      <div className="px-3 py-2 text-[11px] font-bold text-primary uppercase tracking-widest border-b border-neutral mb-1">{group.label}</div>
      {group.items.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(pathname, item.href, allHrefs);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-2.5 mx-1.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 ${
              active ? "bg-accent text-white font-medium" : "text-primary hover:bg-neutral-light-active"
            }`}
          >
            <Icon size={15} className={active ? "text-white" : "text-primary"} />
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}

// ── Sidebar shell (shared render logic) ──────────────────────────────────────
export function SidebarShell({ navGroups, allHrefs, homeHref, storeHref }: { navGroups: NavGroup[]; allHrefs: Set<string>; homeHref: string; storeHref?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isDark } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      if (g.items.some((i) => isItemActive(pathname, i.href, allHrefs))) {
        init[g.label] = true;
      }
    });
    return init;
  });
  const [flyout, setFlyout] = useState<{ group: NavGroup; anchorY: number } | null>(null);

  const toggleGroup = (label: string) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleIconClick = (e: React.MouseEvent<HTMLButtonElement>, group: NavGroup) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFlyout((prev) => (prev?.group.label === group.label ? null : { group, anchorY: rect.top }));
  };

  const handleLogout = async () => {
    await logout?.();
    router.replace("/account");
  };

  const isGroupActive = (group: NavGroup) => group.items.some((i) => isItemActive(pathname, i.href, allHrefs));

  return (
    <>
      <div className={`${collapsed ? "w-14" : "w-64"} bg-neutral-light border-r border-neutral h-full flex flex-col transition-all duration-300 relative z-40`}>
        {/* Logo */}
        <div className={`border-b border-neutral flex items-center justify-between ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}>
          {!collapsed && (
            <Link href={homeHref} className="flex-1 min-w-0">
              <Image src={isDark ? "/logo-dark.png" : "/logo.png"} alt="Logo" width={140} height={40} className="h-9 w-auto object-contain" priority />
            </Link>
          )}
          {collapsed && (
            <Link href={homeHref} className="mx-auto">
              <Image src={isDark ? "/logo-dark.png" : "/logo.png"} alt="Logo" width={32} height={32} className="h-7 w-auto object-contain" priority />
            </Link>
          )}
          <button
            onClick={() => {
              setCollapsed(true);
              setFlyout(null);
            }}
            className={`text-primary hover:text-primary transition-colors p-1 rounded-md hover:bg-neutral-light-active cursor-pointer shrink-0 ${collapsed ? "hidden" : "ml-1"}`}
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {collapsed && (
          <button
            onClick={() => {
              setCollapsed(false);
              setFlyout(null);
            }}
            className="mx-auto mt-1.5 mb-0.5 text-primary hover:text-primary transition-colors p-1.5 rounded-md hover:bg-neutral-light-active cursor-pointer"
          >
            <PanelLeftOpen size={15} />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2 space-y-0.5">
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = openGroups[group.label] ?? false;
            const groupActive = isGroupActive(group);
            const isFlyoutOpen = flyout?.group.label === group.label;

            if (collapsed) {
              return (
                <button
                  key={group.label}
                  onClick={(e) => handleIconClick(e, group)}
                  title={group.label}
                  className={`w-full flex justify-center items-center py-2.5 px-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    groupActive || isFlyoutOpen ? "bg-accent text-white shadow-sm" : "text-primary hover:bg-neutral-light-active hover:text-primary"
                  }`}
                >
                  <GroupIcon size={20} />
                </button>
              );
            }

            return (
              <div key={group.label} className="mb-0.5">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                    groupActive && !isOpen ? "bg-accent/10 text-accent font-semibold" : "text-primary hover:bg-neutral-light-active"
                  }`}
                >
                  <GroupIcon size={16} className={groupActive && !isOpen ? "text-accent" : "text-primary"} />
                  <span className="flex-1 text-[12px] font-semibold uppercase tracking-wider">{group.label}</span>
                  {isOpen ? <ChevronDown size={13} className="text-primary" /> : <ChevronRight size={13} className="text-primary" />}
                </button>

                {isOpen && (
                  <div className="ml-2 pl-2 border-l border-neutral mt-0.5 space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isItemActive(pathname, item.href, allHrefs);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-150 ${
                            active ? "bg-accent text-white font-medium shadow-sm" : "text-primary hover:bg-neutral-light-active"
                          }`}
                        >
                          <Icon size={15} className={active ? "text-white" : "text-primary"} />
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
                    <div className="text-[11px] text-primary truncate">{user.email}</div>
                  </div>
                  <button onClick={handleLogout} title="Đăng xuất" className="text-primary hover:text-promotion transition-colors shrink-0 cursor-pointer">
                    <LogOut size={15} />
                  </button>
                </>
              )}
            </div>

            {!collapsed && storeHref && (
              <Link href={storeHref} className="flex items-center gap-2.5 px-2 py-2 text-[13px] text-primary hover:text-primary rounded-lg hover:bg-neutral-light-active transition-all duration-150">
                <Store size={15} className="text-primary" />
                <span>Cửa hàng của tôi</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {collapsed && flyout && <CollapsedFlyout group={flyout.group} anchorY={flyout.anchorY} pathname={pathname} allHrefs={allHrefs} onClose={() => setFlyout(null)} />}
    </>
  );
}

// ── Admin Sidebar (default export) ───────────────────────────────────────────
export default function AdminSidebar() {
  return <SidebarShell navGroups={adminNavGroups} allHrefs={allAdminHrefs} homeHref="/admin/dashboard" storeHref="/" />;
}
