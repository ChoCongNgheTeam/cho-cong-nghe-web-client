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
  Key,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";

const menuItems = [
  { icon: Package, label: "Đơn hàng của tôi", href: "/profile/orders" },
  { icon: Bell, label: "Thông báo của tôi", href: "/profile/notifications" },
  { icon: Heart, label: "Sản phẩm yêu thích", href: "/profile/wishlist" },
  { icon: MapPin, label: "Địa chỉ nhận hàng", href: "/profile/addresses" },
  { icon: Shield, label: "Thông tin bảo hành", href: "/profile/warranty" },
  { icon: Key, label: "Đổi mật khẩu", href: "/profile/change-password" },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-primary">Đang tải...</div>
      </div>
    );
  }

  const breadcrumbLabel =
    menuItems.find((item) => pathname === item.href)?.label || "Tài khoản";

  return (
    <>
      <div className="min-h-screen bg-neutral-light">
        <div className="container py-6">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Hồ sơ cá nhân", href: "/profile" },
              { label: breadcrumbLabel },
            ]}
          />
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="w-full lg:w-80 shrink-0 space-y-4">
              {/* User Profile Card */}
              <div className="bg-neutral-light-active rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-xl" />
                    <div className="relative w-12 h-12 rounded-full bg-neutral-light p-1 shadow-lg">
                      <img
                        src={user?.avatarImage || "/images/avatar.png"}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">
                      {user?.fullName || "Người dùng"}
                    </h3>
                    <p className="text-sm text-primary opacity-80">
                      {user?.phone}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
                  >
                    Xem hồ sơ
                  </Link>
                </div>

                {/* Membership Card */}
                <div className="bg-accent  rounded-lg p-4 text-white relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-20">
                    <div className="w-24 h-24 bg-white/30 rounded-full" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm mb-0.5">Quý khách chưa là</p>
                    <p className="font-bold text-base mb-0.5">
                      thành viên tại ChoCongNghe
                    </p>
                    <p className="text-xs mb-3 opacity-90">
                      Quét tầm Zalo ChoCongNghe Shop để kích hoạt điểm thưởng
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
              <div className="bg-neutral-light-active rounded-lg shadow-sm overflow-hidden py-3">
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
                        className={`flex items-center gap-3 px-4 py-3 transition-all border-l-4 ${
                          isActive
                            ? "bg-accent-light border-accent text-primary font-medium"
                            : "hover:bg-neutral-light border-transparent text-primary"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    );
                  })}

                  {/* Đăng xuất*/}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all border-l-4 border-transparent hover:bg-neutral-light text-primary hover:text-promotion cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">Đăng xuất</span>
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </div>
    </>
  );
}
