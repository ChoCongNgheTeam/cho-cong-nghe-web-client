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
} from "lucide-react";
import UserAvatar from "../ui/UserAvatar";

const navGroups = [
   {
      label: "Thanh điều hướng",
      items: [
         {
            title: "Tổng quan hệ thống",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
         },
         { title: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
         { title: "Người dùng", href: "/admin/users", icon: Users },
         { title: "Khuyến mãi", href: "/admin/promotions", icon: Tag },
         { title: "Danh mục", href: "/admin/categories", icon: FolderOpen },
         { title: "Cổng thanh toán", href: "/admin/payment", icon: CreditCard },
         { title: "Thương hiệu", href: "/admin/brands", icon: Award },
         { title: "Bài viết", href: "/admin/blogs", icon: Award },
      ],
   },
   {
      label: "Sản phẩm",
      items: [
         { title: "Danh sách sản phẩm", href: "/admin/products", icon: List },
         {
            title: "Thêm mới sản phẩm",
            href: "/admin/products/create",
            icon: PlusCircle,
         },
         { title: "Đánh giá sản phẩm", href: "/admin/reviews", icon: Star },
         {
            title: "Danh sách bình luận",
            href: "/admin/comments",
            icon: MessageSquare,
         },
         {
            title: "Danh sách đánh giá",
            href: "/admin/ratings",
            icon: ThumbsUp,
         },
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
   const { user, logout } = useAuth();
   const router = useRouter();
   const [collapsed, setCollapsed] = useState(false);

   const handleLogout = async () => {
      await logout?.();
      router.replace("/account");
   };

   return (
      <div
         className={`${
            collapsed ? "w-14" : "w-60"
         } bg-neutral-light border-r border-neutral h-full flex flex-col transition-all duration-300`}
      >
         {/* Logo */}
         <div className="px-4 py-4 flex items-center justify-between">
            {!collapsed && (
               <span className="font-bold text-base text-primary leading-tight">
                  ChoCongNghe
               </span>
            )}
            <button
               onClick={() => setCollapsed((prev) => !prev)}
               className="text-neutral-dark hover:text-primary transition-colors p-1 rounded-md hover:bg-neutral-light-active cursor-pointer ml-auto"
            >
               {collapsed ? (
                  <PanelLeftOpen size={16} />
               ) : (
                  <PanelLeftClose size={16} />
               )}
            </button>
         </div>

         {/* Navigation */}
         <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-1">
            {navGroups.map((group) => (
               <div key={group.label} className="mb-3">
                  {!collapsed && (
                     <div className="px-2 py-1 text-[12px] font-semibold text-neutral-dark uppercase tracking-wider mb-1">
                        {group.label}
                     </div>
                  )}
                  {group.items.map((item) => {
                     const Icon = item.icon;
                     const isActive = pathname === item.href;
                     return (
                        <Link
                           key={item.href}
                           href={item.href}
                           title={collapsed ? item.title : undefined}
                           className={`flex items-center gap-2.5 rounded-lg mb-0.5 transition-all duration-150 ${
                              collapsed
                                 ? "justify-center px-1.5 py-2.5"
                                 : "px-2.5 py-2"
                           } ${
                              isActive
                                 ? "bg-accent text-white font-medium shadow-sm"
                                 : "text-primary hover:bg-neutral-light-active hover:text-primary"
                           }`}
                        >
                           <Icon
                              size={collapsed ? 22 : 18}
                              className={
                                 isActive ? "text-white" : "text-neutral-dark"
                              }
                           />
                           {!collapsed && (
                              <span className="text-[13px]">{item.title}</span>
                           )}
                        </Link>
                     );
                  })}
               </div>
            ))}
         </nav>

         {/* User profile */}
         {user && (
            <div className="border-t border-neutral px-3 py-3 space-y-0.5">
               <div
                  className={`flex items-center gap-2.5 px-2 py-2 rounded-lg ${
                     collapsed ? "justify-center" : ""
                  }`}
               >
                  <UserAvatar
                     avatarImage={user.avatarImage}
                     fullName={user.fullName}
                     size={32}
                     className="shrink-0"
                  />
                  {!collapsed && (
                     <>
                        <div className="flex-1 min-w-0">
                           <div className="text-[13px] font-semibold text-primary truncate">
                              {user.fullName}
                           </div>
                           <div className="text-[11px] text-neutral-dark truncate">
                              {user.email}
                           </div>
                        </div>
                        <button
                           onClick={handleLogout}
                           title="Đăng xuất"
                           className="text-neutral-dark hover:text-promotion transition-colors shrink-0 cursor-pointer"
                        >
                           <LogOut size={15} />
                        </button>
                     </>
                  )}
               </div>

               {!collapsed && (
                  <Link
                     href="/"
                     className="flex items-center gap-2.5 px-2 py-2 text-[13px] text-primary hover:text-primary rounded-lg hover:bg-neutral-light-active transition-all duration-150"
                  >
                     <Store size={15} className="text-neutral-dark" />
                     <span>Cửa hàng của tôi</span>
                  </Link>
               )}
            </div>
         )}
      </div>
   );
}
