"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
   Package,
   Bell,
   FileText,
   Heart,
   MapPin,
   Shield,
   LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
   {
      icon: Package,
      label: "Đơn hàng của tôi",
      href: "/profile/orders",
      color: "",
   },
   { icon: Bell, label: "Thông báo của tôi", href: "/profile/notifications" },
   {
      icon: FileText,
      label: "Dịch vụ thu hộ đã thanh toán",
      href: "/profile/payment",
   },
   { icon: Heart, label: "Sản phẩm yêu thích", href: "/profile/wishlist" },
   { icon: MapPin, label: "Sổ địa chỉ nhận hàng", href: "/profile/addresses" },
   { icon: Shield, label: "Thông tin bảo hành", href: "/profile/warranty" },
   { icon: LogOut, label: "Đăng xuất", href: "/logout" },
];

export default function ProfileLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const pathname = usePathname();
   const { user, loading } = useAuth();

   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-gray-500">Đang tải...</div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="container py-6">
            <div className="flex flex-col lg:flex-row gap-6">
               {/* Sidebar */}
               <aside className="w-full lg:w-80 shrink-0 space-y-4">
                  {/* User Profile Card */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                           <div className="absolute inset-0 rounded-full bg-orange-200/40 blur-xl" />
                           <div className="relative w-12 h-12 rounded-full bg-white p-1 shadow-lg">
                              <img
                                 src={user?.avatarImage || "/images/avatar.png"}
                                 alt="Avatar"
                                 className="w-full h-full rounded-full object-cover"
                              />
                           </div>
                        </div>
                        <div className="flex-1">
                           <h3 className="font-semibold text-gray-800">
                              {user?.fullName || "Người dùng"}
                           </h3>
                           <p className="text-sm text-gray-600">
                              {user?.phone}
                           </p>
                        </div>
                        <Link
                           href="/profile"
                           className="text-sm text-blue-600 hover:underline font-medium"
                        >
                           Xem hồ sơ
                        </Link>
                     </div>

                     {/* Membership Card */}
                     <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-lg p-4 text-white relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-20">
                           <div className="w-24 h-24 bg-white/30 rounded-full"></div>
                        </div>
                        <div className="relative z-10">
                           <p className="text-sm mb-0.5">Quý khách chưa là</p>
                           <p className="font-bold text-base mb-0.5">
                              thành viên tại ChoCongNghe
                           </p>
                           <p className="text-xs mb-3 opacity-90">
                              Quét tầm Zalo ChoCongNghe Shop để kích hoạt điểm
                              thưởng
                           </p>
                           <Link
                              href="/membership"
                              className="text-white text-sm hover:underline flex items-center gap-1"
                           >
                              Xem thể lệ
                              <span className="text-xs">›</span>
                           </Link>
                        </div>
                     </div>
                  </div>

                  {/* Menu Navigation */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden py-3">
                     <nav>
                        {menuItems.map((item, index) => {
                           const Icon = item.icon;
                           const isActive =
                              pathname === item.href ||
                              pathname.startsWith(item.href + "/");

                           return (
                              <Link
                                 key={index}
                                 href={item.href}
                                 className={`flex items-center gap-3 px-4 py-3 transition-all ${
                                    isActive
                                       ? "bg-red-50 border-l-4 border-red-600 text-red-600 font-medium"
                                       : "hover:bg-gray-50 text-gray-700 border-l-4 border-transparent"
                                 }`}
                              >
                                 <Icon
                                    className={`w-5 h-5 ${item.color || ""}`}
                                 />
                                 <span className="text-sm">{item.label}</span>
                              </Link>
                           );
                        })}
                     </nav>
                  </div>
               </aside>

               {/* Main Content */}
               <main className="flex-1">{children}</main>
            </div>
         </div>
      </div>
   );
}
