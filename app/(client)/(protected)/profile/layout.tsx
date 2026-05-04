"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Bell, Heart, MapPin, Shield, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";

const menuItems = [
  { icon: Package, label: "Đơn hàng của tôi", shortLabel: "Đơn hàng", href: "/profile/orders" },
  { icon: Bell, label: "Thông báo của tôi", shortLabel: "Thông báo", href: "/profile/notifications" },
  { icon: Heart, label: "Sản phẩm yêu thích", shortLabel: "Yêu thích", href: "/profile/wishlist" },
  { icon: MapPin, label: "Địa chỉ nhận hàng", shortLabel: "Địa chỉ", href: "/profile/addresses" },
  { icon: Shield, label: "Cài đặt", shortLabel: "Cài đặt", href: "/profile/settings" },
];

// Mobile bottom nav: replace "Cài đặt" (Shield) with "Tài khoản" (User) → /profile
const mobileBottomNavItems = [...menuItems.slice(0, 4), { icon: User, label: "Tài khoản", shortLabel: "Tài khoản", href: "/profile" }];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-primary">Đang tải...</div>
      </div>
    );
  }

  const breadcrumbLabel = menuItems.find((item) => pathname === item.href)?.label || "Tài khoản";
  const isProfileHome = pathname === "/profile";

  return (
    <div className="bg-neutral-light">
      <div className="container py-4 sm:py-6 pb-20 lg:pb-6">
        <div className="hidden sm:block">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Thông tin cá nhân", href: "/profile" }, { label: breadcrumbLabel }]} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* ── Sidebar (desktop only) ───────────────────────── */}
          <aside className="hidden lg:block w-80 shrink-0 space-y-4 sticky top-6 self-start">
            <div className="bg-neutral-light-active rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-neutral-light p-1 shadow-lg">
                    <img src={user?.avatarImage || "/images/avatar.png"} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary">{user?.fullName || "Người dùng"}</h3>
                  <p className="text-sm text-primary opacity-80">{user?.phone}</p>
                </div>
                <Link href="/profile" className="text-sm text-accent hover:text-accent-hover font-medium transition-colors underline">
                  Xem hồ sơ
                </Link>
              </div>

              <div className="bg-accent rounded-lg p-4 text-white relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-20">
                  <div className="w-24 h-24 bg-white/30 rounded-full" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm mb-0.5">Quý khách chưa là</p>
                  <p className="font-bold text-base mb-0.5">thành viên tại ChoCongNghe</p>
                  <p className="text-xs mb-3 opacity-90">Quét mã Zalo ChoCongNghe Shop để kích hoạt điểm thưởng</p>
                  {/* <Link href="/membership" className="text-white text-sm hover:underline flex items-center gap-1">
                    Xem thể lệ <span className="text-xs">›</span>
                  </Link> */}
                </div>
              </div>
            </div>

            {/* Desktop menu — dùng menuItems gốc, đủ 5 item */}
            <div className="bg-neutral-light-active rounded-lg shadow-sm overflow-hidden py-3">
              <nav>
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 transition-all border-l-4 ${
                        isActive ? "bg-accent-light border-accent text-primary font-medium" : "hover:bg-neutral-light border-transparent text-primary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 transition-all border-l-4 border-transparent hover:bg-neutral-light text-primary cursor-pointer">
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Đăng xuất</span>
                </button>
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {/* ── Mobile bottom tab bar — dùng mobileBottomNavItems ── */}
      {!isProfileHome && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-light-active border-t border-neutral shadow-lg">
          <div className="flex items-center justify-around px-1 py-1">
            {mobileBottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/profile" ? pathname === "/profile" : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-lg flex-1 transition-colors ${isActive ? "text-accent" : "text-primary opacity-60"}`}
                >
                  <Icon style={{ width: "clamp(16px, 4.5vw, 20px)", height: "clamp(16px, 4.5vw, 20px)" }} className={isActive ? "stroke-[2.5]" : ""} />
                  <span style={{ fontSize: "clamp(8px, 2.8vw, 11px)" }} className="font-medium leading-tight text-center">
                    {item.shortLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
