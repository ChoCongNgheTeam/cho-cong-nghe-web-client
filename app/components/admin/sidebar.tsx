"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
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
   ThumbsUp,
   ShieldCheck,
   Settings,
   LogOut,
   Store,
   PanelLeftClose,
} from "lucide-react";

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

function UserAvatar({
   user,
}: {
   user: { fullName: string; avatarImage?: string };
}) {
   const initials = user.fullName
      .split(" ")
      .map((w) => w[0])
      .slice(-2)
      .join("")
      .toUpperCase();

   if (user.avatarImage && !user.avatarImage.includes("avatar.png")) {
      return (
         <Image
            src={user.avatarImage}
            alt={user.fullName}
            width={32}
            height={32}
            className="w-full h-full object-cover"
         />
      );
   }
   return (
      <span className="text-white font-semibold text-sm ">
         {initials}
      </span>
   );
}

export default function AdminSidebar() {
   const pathname = usePathname();
   const { user, logout } = useAuth();
   const router = useRouter();

   const handleLogout = async () => {
      await logout?.();
      router.replace("/account");
   };

   return (
      <div className="w-60 bg-neutral-light border-r border-neutral h-full flex flex-col">
         {/* Logo */}
         <div className="px-4 py-4 flex items-center justify-between">
            <span className=" font-bold text-base text-primary leading-tight">
               ChoCongNghe
            </span>
            <button className="text-neutral-dark hover:text-primary transition-colors p-1 rounded-md hover:bg-neutral-light-active">
               <PanelLeftClose size={16} />
            </button>
         </div>

         {/* Navigation */}
         <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-1">
            {navGroups.map((group) => (
               <div key={group.label} className="mb-3">
                  <div className="px-2 py-1 text-[10px] font-semibold text-neutral-dark uppercase tracking-wider mb-1">
                     {group.label}
                  </div>
                  {group.items.map((item) => {
                     const Icon = item.icon;
                     const isActive = pathname === item.href;
                     return (
                        <Link
                           key={item.href}
                           href={item.href}
                           className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 transition-all duration-150 ${
                              isActive
                                 ? "bg-accent text-white font-medium shadow-sm"
                                 : "text-primary hover:bg-neutral-light-active hover:text-primary"
                           }`}
                        >
                           <Icon
                              size={15}
                              className={
                                 isActive ? "text-white" : "text-neutral-dark"
                              }
                           />
                           <span className=" text-[13px]">
                              {item.title}
                           </span>
                        </Link>
                     );
                  })}
               </div>
            ))}
         </nav>

         {/* User profile */}
         {user && (
            <div className="border-t border-neutral px-3 py-3 space-y-0.5">
               <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center overflow-hidden shrink-0">
                     <UserAvatar user={user} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className=" text-[13px] font-semibold text-primary truncate">
                        {user.fullName}
                     </div>
                     <div className=" text-[11px] text-neutral-dark truncate">
                        {user.email}
                     </div>
                  </div>
                  <button
                     onClick={handleLogout}
                     title="Đăng xuất"
                     className="text-neutral-dark hover:text-promotion transition-colors shrink-0"
                  >
                     <LogOut size={15} />
                  </button>
               </div>

               <Link
                  href="/"
                  className="flex items-center gap-2.5 px-2 py-2 text-[13px]  text-primary hover:text-primary rounded-lg hover:bg-neutral-light-active transition-all duration-150"
               >
                  <Store size={15} className="text-neutral-dark" />
                  <span>Cửa hàng của tôi</span>
               </Link>
            </div>
         )}
      </div>
   );
}
