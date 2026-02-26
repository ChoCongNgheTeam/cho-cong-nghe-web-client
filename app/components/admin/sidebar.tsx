"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Users, Tag, FolderOpen, CreditCard, Award, PlusCircle, List, Star, MessageSquare, ThumbsUp, ShieldCheck, Settings, LogOut, Store } from "lucide-react";

const navGroups = [
  {
    label: "Thanh điều hướng",
    items: [
      { title: "Tổng quan hệ thống", href: "/admin", icon: LayoutDashboard },
      { title: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
      { title: "Người dùng", href: "/admin/users", icon: Users },
      { title: "Khuyến mãi", href: "/admin/promotions", icon: Tag },
      { title: "Danh mục", href: "/admin/categories", icon: FolderOpen },
      { title: "Công thanh toán", href: "/admin/payment", icon: CreditCard },
      { title: "Thương hiệu", href: "/admin/brands", icon: Award },
    ],
  },
  {
    label: "Sản phẩm",
    items: [
      { title: "Thêm mới sản phẩm", href: "/admin/products/create", icon: PlusCircle },
      { title: "Danh sách sản phẩm", href: "/admin/products", icon: List },
      { title: "Đánh giá sản phẩm", href: "/admin/reviews", icon: Star },
      { title: "Danh sách bình luận", href: "/admin/comments", icon: MessageSquare },
      { title: "Danh sách đánh giá", href: "/admin/ratings", icon: ThumbsUp },
    ],
  },
  {
    label: "Quản trị",
    items: [
      { title: "Vai trò quản trị", href: "/admin/roles", icon: ShieldCheck },
      { title: "Cài đặt hệ thống", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-full flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">ChoCongNghe</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{group.label}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors ${
                    isActive ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-blue-600" : "text-gray-400"} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
            <span className="text-orange-600 font-semibold text-sm">D</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">Dealport</div>
            <div className="text-xs text-gray-400 truncate">Mark@thedesigner...</div>
          </div>
          <LogOut size={16} className="text-gray-400 cursor-pointer hover:text-gray-600 flex-shrink-0" />
        </div>
        <Link href="/store" className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 mt-1">
          <Store size={16} className="text-gray-400" />
          <span>Cửa hàng của tôi</span>
        </Link>
      </div>
    </div>
  );
}
