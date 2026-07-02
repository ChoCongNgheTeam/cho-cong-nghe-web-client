import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "../../../hooks/useAuth";
import { Heart, LogOut, MapPin, Package, User } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ════════════════════════════════════════════════════════════
   PORTAL: Backdrop + Dropdown — render thẳng vào <body>
════════════════════════════════════════════════════════════ */
interface UserMenuPortalProps {
  isOpen: boolean;
  onClose: () => void;
  anchorTop: number;
  anchorRight: number;
  onLogout: () => void;
}

const UserMenuPortal = memo(({ isOpen, onClose, anchorTop, anchorRight, onLogout }: UserMenuPortalProps) => {
  const portalRoot = typeof document !== "undefined" ? document.body : null;
  if (!portalRoot) return null;

  return createPortal(
    <>
      {/* Backdrop — full viewport */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={["fixed inset-0 z-[60] transition-[opacity] duration-300", isOpen ? "opacity-100 pointer-events-auto bg-black/55 backdrop-blur-[2px]" : "opacity-0 pointer-events-none"].join(" ")}
      />

      {/* Dropdown panel */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          top: anchorTop,
          right: anchorRight,
          width: "256px",
          zIndex: 70,
          transformOrigin: "top right",
        }}
        className={[
          "bg-neutral-light border border-neutral rounded-lg shadow-xl overflow-hidden",
          "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-3 pointer-events-none",
        ].join(" ")}
      >
        <div className="py-2">
          <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={onClose}>
            <User className="w-5 h-5 text-neutral-darker" />
            <span className="text-sm">Thông tin cá nhân</span>
          </Link>
          <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={onClose}>
            <Package className="w-5 h-5 text-neutral-darker" />
            <span className="text-sm">Đơn hàng của tôi</span>
          </Link>
          <Link href="/profile/wishlist" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={onClose}>
            <Heart className="w-5 h-5 text-neutral-darker" />
            <span className="text-sm">Sản phẩm yêu thích</span>
          </Link>
          <Link href="/profile/addresses" className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary" onClick={onClose}>
            <MapPin className="w-5 h-5 text-neutral-darker" />
            <span className="text-sm">Sổ địa chỉ nhận hàng</span>
          </Link>
        </div>
        <div className="border-t border-neutral">
          <button onClick={onLogout} className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-promotion-light transition-colors text-promotion cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
});
UserMenuPortal.displayName = "UserMenuPortal";

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const UserMenuButton = memo(() => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [anchorTop, setAnchorTop] = useState(0);
  const [anchorRight, setAnchorRight] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* ESC để đóng */
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowUserMenu(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showUserMenu]);

  const handleToggle = useCallback(() => {
    setShowUserMenu((prev) => {
      if (!prev && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setAnchorTop(rect.bottom + 8);
        setAnchorRight(window.innerWidth - rect.right);
      }
      return !prev;
    });
  }, []);

  const handleClose = useCallback(() => setShowUserMenu(false), []);

  const handleLogout = useCallback(() => {
    logout();
    handleClose();
  }, [logout, handleClose]);

  if (loading)
    return (
      <div className="w-11 h-9 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-white/15 animate-pulse" />
      </div>
    );

  if (isAuthenticated && user)
    return (
      <>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          aria-expanded={showUserMenu}
          aria-haspopup="dialog"
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

        {/* Portal — backdrop + dropdown ra ngoài DOM tree */}
        <UserMenuPortal isOpen={showUserMenu} onClose={handleClose} anchorTop={anchorTop} anchorRight={anchorRight} onLogout={handleLogout} />
      </>
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

export default UserMenuButton;
