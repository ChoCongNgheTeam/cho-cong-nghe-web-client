"use client";

import { GitCompareArrows, Heart, User, ChevronDown, Package, MapPin, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, memo } from "react";
import { DesktopHeaderProps } from "../types";
import UserAvatar from "@/components/ui/UserAvatar";
import CartIcon from "@/(client)/cart/components/CartIcon";
import CategoryMegaMenu from "./CategoryMegaMenu";
import SearchBar from "./SearchBar";
import NotificationBell from "@/components/ui/NotificationBell";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/(client)/compare/compareStore";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";

// Logo local làm fallback khi chưa load xong hoặc chưa có logo trong DB
const FALLBACK_LOGO = "/logo-dark-5.png";

const DesktopHeader = memo(
  ({ isDarkMode, isAuthenticated, isLoading, user, showUserMenu, onUserMenuToggle, onUserMenuClose, onLogout }: Omit<DesktopHeaderProps, "searchQuery" | "onSearchChange">) => {
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { items } = useCompareStore();
    const { logoUrl, siteName, isLoading: settingsLoading } = useGeneralSettings();

    // Dùng logo local khi đang load hoặc DB chưa có logo
    const resolvedLogo = !settingsLoading && logoUrl ? logoUrl : FALLBACK_LOGO;

    useEffect(() => {
      if (!showUserMenu) return;
      const handler = (e: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
          onUserMenuClose();
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [showUserMenu, onUserMenuClose]);

    const iconBtn = "p-2 rounded-lg relative cursor-pointer transition-colors duration-150 text-white hover:bg-white/10 active:bg-white/20";

    return (
      <div className="desktop-header-row hidden md:flex items-center justify-between gap-4 lg:gap-4 relative">
        {/* Logo */}
        <Link href="/" className="shrink-0 pr-10">
          <Image
            src={resolvedLogo}
            width={180}
            height={60}
            alt={siteName || "Logo"}
            className="h-12 lg:h-15 w-auto hover:opacity-80 transition-opacity"
            priority
            // Nếu Cloudinary URL lỗi thì fallback về logo local
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO;
            }}
          />
        </Link>

        {/* Mega menu */}
        <CategoryMegaMenu />

        {/* Search — glass style (xử lý trong SearchBar.tsx) */}
        <div className="flex-1 max-w-2xl relative">
          <SearchBar />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1">
          {/* Compare */}
          <button onClick={() => router.push("/compare")} className={iconBtn} title="So sánh">
            <GitCompareArrows className="w-5 h-5 lg:w-6 lg:h-6" />
            {items.length > 0 && (
              <span
                className="absolute -right-0.5 -bottom-0.5 min-w-[18px] h-[18px] px-[3px] flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm"
                style={{
                  background: "#fff",
                  color: "#0f2050",
                  // ring navy thay vì xanh sáng để match header
                  boxShadow: "0 0 0 2px rgba(15,32,80,0.5)",
                }}
              >
                {items.length}
              </span>
            )}
          </button>

          {/* Notification */}
          <NotificationBell variant="user" />

          {/* Cart */}
          <CartIcon />

          {/* User */}
          {isLoading ? (
            <div className="w-11 h-9 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/15 animate-pulse" />
            </div>
          ) : isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button onClick={onUserMenuToggle} className="flex items-center gap-1 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors cursor-pointer p-2">
                <UserAvatar avatarImage={user.avatarImage || "/images/avatar.png"} fullName={user.fullName} size={30} />
                <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown — nền trắng/neutral, không navy */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-neutral-light border border-neutral rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="py-2">
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={onUserMenuClose}>
                      <User className="w-5 h-5 text-neutral-darker" />
                      <span className="text-sm">Thông tin cá nhân</span>
                    </Link>
                    <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={onUserMenuClose}>
                      <Package className="w-5 h-5 text-neutral-darker" />
                      <span className="text-sm">Đơn hàng của tôi</span>
                    </Link>
                    <Link href="/profile/wishlist" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={onUserMenuClose}>
                      <Heart className="w-5 h-5 text-neutral-darker" />
                      <span className="text-sm">Sản phẩm yêu thích</span>
                    </Link>
                    <Link href="/profile/addresses" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={onUserMenuClose}>
                      <MapPin className="w-5 h-5 text-neutral-darker" />
                      <span className="text-sm">Sổ địa chỉ nhận hàng</span>
                    </Link>
                  </div>
                  <div className="border-t border-neutral">
                    <button
                      onClick={() => {
                        onLogout();
                        onUserMenuClose();
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-promotion-light transition-colors text-promotion cursor-pointer"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-medium">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/account" className={iconBtn} title="Tài khoản">
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    );
  },
);

DesktopHeader.displayName = "DesktopHeader";
export default DesktopHeader;
