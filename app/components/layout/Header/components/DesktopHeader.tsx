"use client";

import { Heart, User, ChevronDown, Package, MapPin, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, memo, useState, useCallback } from "react";
import UserAvatar from "@/components/ui/UserAvatar";
import { CartIcon } from "@/(client)/cart/components/CartIcon";
import CategoryMegaMenu from "./CategoryMegaMenu";
import SearchBar from "./SearchBar";
import NotificationBell from "@/components/ui/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import HeaderLogo from "@/components/HeaderLogo";
import { CompareButton } from "./CompareButton";

const DesktopHeader = memo(() => {
  const { user, logout, isAuthenticated, loading } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => setShowUserMenu((v) => !v), []);
  const handleClose = useCallback(() => setShowUserMenu(false), []);

  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu]);

  const iconBtn = "p-2 rounded-lg relative cursor-pointer transition-colors duration-150 text-white hover:bg-white/10 active:bg-white/20";

  return (
    <div className="desktop-header-row hidden md:flex items-center justify-between gap-4 lg:gap-4 relative">
      <HeaderLogo />

      <CategoryMegaMenu />

      <div className="flex-1 max-w-2xl relative">
        <SearchBar />
      </div>

      {/* Icons */}
      <div className="flex items-center gap-1">
        <CompareButton />

        <NotificationBell variant="user" />

        <CartIcon />

        {/* User */}
        {loading ? (
          <div className="w-11 h-9 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/15 animate-pulse" />
          </div>
        ) : isAuthenticated && user ? (
          <div className="relative" ref={userMenuRef}>
            <button onClick={handleToggle} className="flex items-center gap-1 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors cursor-pointer p-2">
              <UserAvatar avatarImage={user.avatarImage || "/images/avatar.png"} fullName={user.fullName} size={30} />
              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown — nền trắng/neutral, không navy */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-neutral-light border border-neutral rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="py-2">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={handleClose}>
                    <User className="w-5 h-5 text-neutral-darker" />
                    <span className="text-sm">Thông tin cá nhân</span>
                  </Link>
                  <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={handleClose}>
                    <Package className="w-5 h-5 text-neutral-darker" />
                    <span className="text-sm">Đơn hàng của tôi</span>
                  </Link>
                  <Link href="/profile/wishlist" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={handleClose}>
                    <Heart className="w-5 h-5 text-neutral-darker" />
                    <span className="text-sm">Sản phẩm yêu thích</span>
                  </Link>
                  <Link href="/profile/addresses" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={handleClose}>
                    <MapPin className="w-5 h-5 text-neutral-darker" />
                    <span className="text-sm">Sổ địa chỉ nhận hàng</span>
                  </Link>
                </div>
                <div className="border-t border-neutral">
                  <button
                    onClick={() => {
                      logout();
                      handleClose();
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
});

DesktopHeader.displayName = "DesktopHeader";

export default DesktopHeader;
