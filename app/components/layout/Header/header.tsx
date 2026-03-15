"use client";
import { useState, useEffect, useRef } from "react";
import {
   Search,
   Heart,
   User,
   Truck,
   ShoppingBag,
   GitCompareArrows,
   LogOut,
   UserPlus,
   Package,
   MapPin,
   Shield,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import HeaderTop from "./components/HeaderTop";
import MobileHeader from "./components/MobileHeader";
import DesktopHeader from "./components/DesktopHeader";
import { useUserMenu } from "@/hooks/useUserMenu";
import { useTheme } from "@/hooks/useTheme";
import UserAvatar from "@/components/ui/UserAvatar";

const Header = () => {
   const [searchQuery, setSearchQuery] = useState("");
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
   const [isVisible, setIsVisible] = useState(true);
   const [isPastTop, setIsPastTop] = useState(false);
   const [headerHeight, setHeaderHeight] = useState(0);
   const headerRef = useRef<HTMLDivElement>(null);
   const lastScrollY = useRef(0);
   const ticking = useRef(false);

   const { user, logout, isAuthenticated, loading } = useAuth();
   const { showUserMenu, setShowUserMenu, userMenuRef } = useUserMenu();
   const { isDark } = useTheme();

   // Đo chiều cao header thực tế
   useEffect(() => {
      if (!headerRef.current) return;
      const observer = new ResizeObserver(() => {
         if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
         }
      });
      observer.observe(headerRef.current);
      setHeaderHeight(headerRef.current.offsetHeight);
      return () => observer.disconnect();
   }, []);

   // Scroll logic
   useEffect(() => {
      const handleScroll = () => {
         if (ticking.current) return;
         ticking.current = true;

         requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            const diff = currentScrollY - lastScrollY.current;

            setIsPastTop(currentScrollY > headerHeight);

            if (Math.abs(diff) > 4) {
               if (diff > 0 && currentScrollY > headerHeight) {
                  setIsVisible(false);
               } else {
                  setIsVisible(true);
               }
               lastScrollY.current = currentScrollY;
            }

            ticking.current = false;
         });
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
   }, [headerHeight]);

   // Click outside user menu
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            userMenuRef.current &&
            !userMenuRef.current.contains(event.target as Node)
         ) {
            setShowUserMenu(false);
         }
      };

      if (showUserMenu) {
         document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [showUserMenu, userMenuRef, setShowUserMenu]);

   return (
      <>
         {/* Placeholder đúng chiều cao thực tế của header */}
         <div style={{ height: headerHeight }} />

         <div
            ref={headerRef}
            className={[
               "fixed top-0 left-0 right-0 z-50",
               "w-full bg-neutral-light border-b border-neutral",
               "transition-transform duration-300 ease-in-out",
               isPastTop ? "shadow-md" : "",
               isVisible ? "translate-y-0" : "-translate-y-full",
            ].join(" ")}
         >
            {/* HeaderTop - ẩn khi đã scroll qua */}
            <div
               className={[
                  "overflow-hidden transition-all duration-300",
                  isPastTop ? "max-h-0 opacity-0" : "max-h-20 opacity-100",
               ].join(" ")}
            >
               <HeaderTop isAuthenticated={isAuthenticated} />
            </div>

            {/* Main Header */}
            <div className="bg-accent md:bg-transparent">
               <div className="container py-1 md:py-2">
                  <MobileHeader
                     mobileMenuOpen={mobileMenuOpen}
                     mobileSearchOpen={mobileSearchOpen}
                     searchQuery={searchQuery}
                     isDarkMode={isDark}
                     onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                     onSearchToggle={() =>
                        setMobileSearchOpen(!mobileSearchOpen)
                     }
                     onSearchChange={setSearchQuery}
                  />
                  <DesktopHeader
                     isDarkMode={isDark}
                     isAuthenticated={isAuthenticated}
                     isLoading={loading}
                     user={user}
                     showUserMenu={showUserMenu}
                     userMenuRef={userMenuRef}
                     onUserMenuToggle={() => setShowUserMenu(!showUserMenu)}
                     onUserMenuClose={() => setShowUserMenu(false)}
                     onLogout={logout}
                  />
               </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
               <div className="md:hidden bg-neutral-light border-b border-neutral-dark shadow-lg">
                  <div className="container py-4">
                     <nav className="flex flex-col gap-3">
                        {/* Khi đang loading: hiển thị skeleton thay vì nhảy về "chưa đăng nhập" */}
                        {loading ? (
                           <div className="px-3 py-3 bg-neutral/50 rounded-lg animate-pulse">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-12 rounded-full bg-neutral-dark/20" />
                                 <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-neutral-dark/20 rounded w-3/4" />
                                    <div className="h-3 bg-neutral-dark/20 rounded w-1/2" />
                                 </div>
                              </div>
                           </div>
                        ) : isAuthenticated && user ? (
                           <>
                              <div className="px-3 py-3 bg-accent/10 rounded-lg">
                                 <div className="flex items-center gap-3">
                                    <UserAvatar
                                       avatarImage={
                                          user.avatarImage ||
                                          "/images/avatar.png"
                                       }
                                       fullName={user.fullName}
                                       size={48}
                                    />
                                    <div className="flex-1 min-w-0">
                                       <p className="text-sm font-semibold text-primary truncate">
                                          {user.fullName}
                                       </p>
                                       <p className="text-xs text-neutral-darker truncate">
                                          {user.email}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                              <Link
                                 href="/profile"
                                 className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                                 onClick={() => setMobileMenuOpen(false)}
                              >
                                 <User className="h-5 w-5" />
                                 <span>Thông tin cá nhân</span>
                              </Link>
                              <Link
                                 href="/profile/orders"
                                 className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                                 onClick={() => setMobileMenuOpen(false)}
                              >
                                 <Package className="h-5 w-5" />
                                 <span>Đơn hàng của tôi</span>
                              </Link>
                              <Link
                                 href="/wishlist"
                                 className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                                 onClick={() => setMobileMenuOpen(false)}
                              >
                                 <Heart className="h-5 w-5" />
                                 <span>Khách hàng thân thiết</span>
                              </Link>
                              <Link
                                 href="/addresses"
                                 className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                                 onClick={() => setMobileMenuOpen(false)}
                              >
                                 <MapPin className="h-5 w-5" />
                                 <span>Sổ địa chỉ nhận hàng</span>
                              </Link>
                              <Link
                                 href="/warranty"
                                 className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                                 onClick={() => setMobileMenuOpen(false)}
                              >
                                 <Shield className="h-5 w-5" />
                                 <span>Thông tin bảo hành</span>
                              </Link>
                              <button
                                 onClick={() => {
                                    logout();
                                    setMobileMenuOpen(false);
                                 }}
                                 className="flex items-center gap-2 py-2 text-promotion hover:text-promotion-hover hover:bg-promotion-light rounded-lg px-3 border-t border-neutral-dark transition-colors cursor-pointer"
                              >
                                 <LogOut className="h-5 w-5" />
                                 <span>Đăng xuất</span>
                              </button>
                           </>
                        ) : (
                           <>
                              <Link
                                 href="/account?tab=login"
                                 className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                                 onClick={() => setMobileMenuOpen(false)}
                              >
                                 <User className="h-5 w-5" />
                                 <span>Đăng nhập</span>
                              </Link>
                              <Link
                                 href="/account?tab=register"
                                 className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                                 onClick={() => setMobileMenuOpen(false)}
                              >
                                 <UserPlus className="h-5 w-5" />
                                 <span>Đăng ký</span>
                              </Link>
                              <div className="border-t border-neutral-dark my-2"></div>
                           </>
                        )}
                        <Link
                           href="#"
                           className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                           onClick={() => setMobileMenuOpen(false)}
                        >
                           <Truck className="h-5 w-5" />
                           <span>Theo dõi đơn hàng</span>
                        </Link>
                        <Link
                           href="/cart"
                           className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                           onClick={() => setMobileMenuOpen(false)}
                        >
                           <ShoppingBag className="h-5 w-5" />
                           <span>Cửa hàng</span>
                        </Link>
                        <Link
                           href="#"
                           className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                           onClick={() => setMobileMenuOpen(false)}
                        >
                           <GitCompareArrows className="h-5 w-5" />
                           <span>So sánh sản phẩm</span>
                        </Link>
                     </nav>
                  </div>
               </div>
            )}
         </div>
      </>
   );
};

export default Header;
