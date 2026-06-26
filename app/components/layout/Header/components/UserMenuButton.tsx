import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { ChevronDown, Heart, LogOut, MapPin, Package, User } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";

export const UserMenuButton = memo(() => {
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

  if (loading)
    return (
      <div className="w-11 h-9 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-white/15 animate-pulse" />
      </div>
    );

  if (isAuthenticated && user)
    return (
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={handleToggle}
          className={[
            "flex items-center gap-2 rounded-lg transition-colors duration-150 cursor-pointer p-2 px-3",
            "backdrop-blur-md border border-white/30",
            showUserMenu ? "bg-white/35" : "bg-white/20 hover:bg-white/30 active:bg-white/35",
          ].join(" ")}
        >
          <UserAvatar avatarImage={user.avatarImage || "/images/avatar.png"} fullName={user.fullName} size={30} />
          <span className="text-sm font-medium text-white whitespace-nowrap max-w-[80px] truncate">{user.fullName.split(" ").pop()}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={["transition-transform duration-200", showUserMenu ? "rotate-180" : "rotate-0"].join(" ")}
          >
            <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
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
    );

  return (
    <Link
      href="/account"
      className={[
        "flex items-center gap-2 rounded-lg transition-colors duration-150 cursor-pointer p-2 px-3",
        "backdrop-blur-md border border-white/20",
        "bg-white/10 hover:bg-white/20 active:bg-white/25",
      ].join(" ")}
      title="Tài khoản"
    >
      <span className="text-sm font-medium text-white whitespace-nowrap">Đăng Nhập</span>
      <User className="w-5 h-5 text-white" />
    </Link>
  );
});
UserMenuButton.displayName = "UserMenuButton";
