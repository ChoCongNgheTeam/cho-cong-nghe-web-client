import {
   GitCompareArrows,
   Heart,
   User,
   ChevronDown,
   Package,
   MapPin,
   Shield,
   LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, memo } from "react";
import { DesktopHeaderProps } from "../types";
import UserAvatar from "@/components/ui/UserAvatar";
import CartIcon from "@/(client)/cart/components/CartIcon";
import CategoryMegaMenu from "./CategoryMegaMenu";
import SearchBar from "./SearchBar"; // ✅ bỏ TOP_KEYWORDS
import WishlistIcon from "@/components/ui/HeartIcons";
import NotificationBell from "@/components/ui/NotificationBell";

const DesktopHeader = memo(
   ({
      isDarkMode,
      isAuthenticated,
      isLoading,
      user,
      showUserMenu,
      onUserMenuToggle,
      onUserMenuClose,
      onLogout,
   }: Omit<DesktopHeaderProps, "searchQuery" | "onSearchChange">) => {
      const userMenuRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
         if (!showUserMenu) return;
         const handler = (e: MouseEvent) => {
            if (
               userMenuRef.current &&
               !userMenuRef.current.contains(e.target as Node)
            ) {
               onUserMenuClose();
            }
         };
         document.addEventListener("mousedown", handler);
         return () => document.removeEventListener("mousedown", handler);
      }, [showUserMenu, onUserMenuClose]);

      return (
         <div className="hidden md:flex items-center justify-between gap-4 lg:gap-4 relative">
            {/* Logo */}
            <Link href="/" className="shrink-0 pr-10">
               <Image
                  src={isDarkMode ? "/logo-dark.png" : "/logo.png"}
                  width={180}
                  height={60}
                  alt="Logo"
                  className="h-15 lg:h-18 w-auto hover:opacity-90 transition-opacity"
                  priority
               />
            </Link>

            {/* Mega menu */}
            <CategoryMegaMenu />

            {/* Search + Keywords */}
            <div className="flex-1 max-w-2xl relative">
               <SearchBar />
            </div>

            <div className="flex items-center gap-2">
               {/* <button
                  className="hidden lg:flex p-2 hover:bg-neutral-light dark:hover:bg-neutral rounded-lg relative cursor-pointer transition-colors"
                  title="So sánh"
               >
                  <GitCompareArrows className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
               </button> */}
               <NotificationBell />
               <WishlistIcon />
               <CartIcon />

               {isLoading ? (
                  <div className="w-11.5 h-9.5 flex items-center justify-center">
                     <div className="w-8 h-8 rounded-full bg-neutral-dark/20 animate-pulse" />
                  </div>
               ) : isAuthenticated && user ? (
                  <div className="relative" ref={userMenuRef}>
                     <button
                        onClick={onUserMenuToggle}
                        className="flex items-center hover:bg-neutral/50 rounded-lg transition-colors cursor-pointer p-2"
                     >
                        <UserAvatar
                           avatarImage={
                              user.avatarImage || "/images/avatar.png"
                           }
                           fullName={user.fullName}
                           size={30}
                        />
                        <ChevronDown
                           className={`w-4 h-4 text-primary transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                        />
                     </button>

                     {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-neutral-light border border-neutral rounded-lg shadow-xl z-50 overflow-hidden">
                           <div className="py-2">
                              <Link
                                 href="/profile"
                                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary"
                                 onClick={onUserMenuClose}
                              >
                                 <User className="w-5 h-5 text-neutral-darker" />
                                 <span className="text-sm">
                                    Thông tin cá nhân
                                 </span>
                              </Link>
                              <Link
                                 href="/profile/orders"
                                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary"
                                 onClick={onUserMenuClose}
                              >
                                 <Package className="w-5 h-5 text-neutral-darker" />
                                 <span className="text-sm">
                                    Đơn hàng của tôi
                                 </span>
                              </Link>
                              <Link
                                 href="/profile/wishlist"
                                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary"
                                 onClick={onUserMenuClose}
                              >
                                 <Heart className="w-5 h-5 text-neutral-darker" />
                                 <span className="text-sm">
                                    Sản phẩm yêu thích
                                 </span>
                              </Link>
                              <Link
                                 href="/profile/addresses"
                                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary"
                                 onClick={onUserMenuClose}
                              >
                                 <MapPin className="w-5 h-5 text-neutral-darker" />
                                 <span className="text-sm">
                                    Sổ địa chỉ nhận hàng
                                 </span>
                              </Link>
                              <Link
                                 href="/warranty"
                                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary"
                                 onClick={onUserMenuClose}
                              >
                                 <Shield className="w-5 h-5 text-neutral-darker" />
                                 <span className="text-sm">
                                    Thông tin bảo hành
                                 </span>
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
                                 <span className="text-sm font-medium">
                                    Đăng xuất
                                 </span>
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               ) : (
                  <Link
                     href="/account"
                     className="p-2 hover:bg-neutral-light dark:hover:bg-neutral rounded-lg relative cursor-pointer transition-colors"
                     title="Tài khoản"
                  >
                     <User className="w-5 h-5 text-primary" />
                  </Link>
               )}
            </div>
         </div>
      );
   },
);

DesktopHeader.displayName = "DesktopHeader";
export default DesktopHeader;
