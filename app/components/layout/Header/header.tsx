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
   X,
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

   const headerRef = useRef<HTMLDivElement>(null);
   const placeholderRef = useRef<HTMLDivElement>(null);
   const lastScrollY = useRef(0);
   const ticking = useRef(false);
   const scrollAccum = useRef(0);
   const isPastTopRef = useRef(false);
   const isVisibleRef = useRef(true);

   const { user, logout, isAuthenticated, loading } = useAuth();
   const { showUserMenu, setShowUserMenu, userMenuRef } = useUserMenu();
   const { isDark } = useTheme();

   // Khoá scroll body khi menu mobile mở
   useEffect(() => {
      if (mobileMenuOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "";
      }
      return () => {
         document.body.style.overflow = "";
      };
   }, [mobileMenuOpen]);

   // ResizeObserver cập nhật placeholder height
   useEffect(() => {
      if (!headerRef.current) return;

      const updateHeight = () => {
         const h = headerRef.current?.offsetHeight;
         if (!h) return;
         if (placeholderRef.current) {
            placeholderRef.current.style.height = `${h}px`;
         }
         document.documentElement.style.setProperty(
            "--header-height",
            `${h}px`,
         );
      };

      updateHeight();

      const observer = new ResizeObserver(updateHeight);
      observer.observe(headerRef.current);

      return () => observer.disconnect();
   }, []);

   // Sync --header-visible CSS variable
   useEffect(() => {
      document.documentElement.style.setProperty(
         "--header-visible",
         isVisible ? "1" : "0",
      );
   }, [isVisible]);

   useEffect(() => {
      const HIDE_THRESHOLD = 80;
      const SHOW_THRESHOLD = 30;
      const MIN_SCROLL_Y = 120;

      const handleScroll = () => {
         if (ticking.current) return;
         ticking.current = true;

         requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            const diff = currentScrollY - lastScrollY.current;
            lastScrollY.current = currentScrollY;

            const headerH = headerRef.current?.offsetHeight || 60;
            const nextIsPastTop = currentScrollY > headerH;
            if (nextIsPastTop !== isPastTopRef.current) {
               isPastTopRef.current = nextIsPastTop;
               setIsPastTop(nextIsPastTop);
            }

            if (currentScrollY < MIN_SCROLL_Y) {
               if (!isVisibleRef.current) {
                  isVisibleRef.current = true;
                  setIsVisible(true);
               }
               scrollAccum.current = 0;
               ticking.current = false;
               return;
            }

            scrollAccum.current += diff;

            if (scrollAccum.current > HIDE_THRESHOLD && isVisibleRef.current) {
               isVisibleRef.current = false;
               setIsVisible(false);
               scrollAccum.current = 0;
            } else if (
               scrollAccum.current < -SHOW_THRESHOLD &&
               !isVisibleRef.current
            ) {
               isVisibleRef.current = true;
               setIsVisible(true);
               scrollAccum.current = 0;
            } else if (
               scrollAccum.current > HIDE_THRESHOLD ||
               scrollAccum.current < -SHOW_THRESHOLD
            ) {
               scrollAccum.current = 0;
            }

            ticking.current = false;
         });
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

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
         <div ref={placeholderRef} aria-hidden="true" />

         {/* ── Fixed Header ─────────────────────────────────────── */}
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
            <div
               className={[
                  "transition-all duration-300",
                  "overflow-hidden",
                  isPastTop
                     ? "opacity-0 pointer-events-none max-h-0"
                     : "opacity-100 pointer-events-auto max-h-[200px]",
               ].join(" ")}
               aria-hidden={isPastTop}
            >
               <HeaderTop isAuthenticated={isAuthenticated} />
            </div>

            <div>
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
         </div>

         {/* ── Mobile Menu Overlay ───────────────────────────────── */}
         {/* Backdrop */}
         <div
            className={[
               "md:hidden fixed inset-0 z-[60] bg-black/50",
               "transition-opacity duration-300",
               mobileMenuOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none",
            ].join(" ")}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
         />

         {/* Drawer — slide in từ trái */}
         <div
            className={[
               "md:hidden fixed top-0 left-0 bottom-0 z-[70]",
               "w-[80%] max-w-sm bg-neutral-light ",
               "transition-transform duration-300 ease-in-out",
               "flex flex-col overflow-hidden",
               mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
         >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral shrink-0">
               <span className="font-semibold text-primary text-base">
                  Menu
               </span>
               <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral transition-colors text-primary cursor-pointer"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Drawer content — scrollable */}
            <div className="flex-1 overflow-y-auto py-3 px-2">
               <nav className="flex flex-col gap-1">
                  {loading ? (
                     <div className="px-3 py-3 bg-neutral/50 rounded-lg animate-pulse mx-1">
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
                        {/* User info card */}
                        <Link href="/profile" className="block" onClick={() => setMobileMenuOpen(false)}>
                           <div className="
                              mx-1 mb-2 px-3 py-3 
                              bg-accent/10 rounded-xl

                              cursor-pointer
                              transition-all duration-200

                              hover:bg-accent/20
                              hover:shadow-md

                              active:scale-95
                           ">
                              <div className="flex items-center gap-3">
                                 <UserAvatar
                                    avatarImage={user.avatarImage || "/images/avatar.png"}
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
                     </Link>

                        <MenuItem
                           href="/profile/info"
                           icon={<User className="h-5 w-5" />}
                           label="Thông tin cá nhân"
                           onClick={() => setMobileMenuOpen(false)}
                        />
                        <MenuItem
                           href="/profile/orders"
                           icon={<Package className="h-5 w-5" />}
                           label="Đơn hàng của tôi"
                           onClick={() => setMobileMenuOpen(false)}
                        />
                        <MenuItem
                           href="/wishlist"
                           icon={<Heart className="h-5 w-5" />}
                           label="Khách hàng thân thiết"
                           onClick={() => setMobileMenuOpen(false)}
                        />
                        <MenuItem
                           href="/profile/addresses"
                           icon={<MapPin className="h-5 w-5" />}
                           label="Sổ địa chỉ nhận hàng"
                           onClick={() => setMobileMenuOpen(false)}
                        />
                        <MenuItem
                           href="/profile/warranty"
                           icon={<Shield className="h-5 w-5" />}
                           label="Thông tin bảo hành"
                           onClick={() => setMobileMenuOpen(false)}
                        />

                        <div className="mx-1 my-1 border-t border-neutral" />

                     </>
                  ) : (
                     <>
                        <MenuItem
                           href="/account?tab=login"
                           icon={<User className="h-5 w-5" />}
                           label="Đăng nhập"
                           onClick={() => setMobileMenuOpen(false)}
                        />
                        <MenuItem
                           href="/account?tab=register"
                           icon={<UserPlus className="h-5 w-5" />}
                           label="Đăng ký"
                           onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="mx-1 my-1 border-t border-neutral" />
                     </>
                  )}

                  <MenuItem
                     href="#"
                     icon={<Truck className="h-5 w-5" />}
                     label="Theo dõi đơn hàng"
                     onClick={() => setMobileMenuOpen(false)}
                  />
                  <MenuItem
                     href="/cart"
                     icon={<ShoppingBag className="h-5 w-5" />}
                     label="Cửa hàng"
                     onClick={() => setMobileMenuOpen(false)}
                  />
                  <MenuItem
                     href="#"
                     icon={<GitCompareArrows className="h-5 w-5" />}
                     label="So sánh sản phẩm"
                     onClick={() => setMobileMenuOpen(false)}
                  />
                       <button
                           onClick={() => {
                              logout();
                              setMobileMenuOpen(false);
                           }}
                           className="flex items-center gap-3 py-2.5 px-3 mx-1 rounded-xl text-promotion hover:bg-promotion/10 transition-colors cursor-pointer"
                        >
                           <LogOut className="h-5 w-5" />
                           <span className="text-sm font-medium">Đăng xuất</span>
                        </button>
               </nav>
            </div>
         </div>
      </>
   );
};

// ── Helper component ──────────────────────────────────────────────
function MenuItem({
   href,
   icon,
   label,
   onClick,
}: {
   href: string;
   icon: React.ReactNode;
   label: string;
   onClick: () => void;
}) {
   return (
      <Link
         href={href}
         onClick={onClick}
         className="flex items-center gap-3 py-2.5 px-3 mx-1 rounded-xl text-primary hover:bg-neutral transition-colors"
      >
         <span className="text-accent shrink-0">{icon}</span>
         <span className="text-sm font-medium">{label}</span>
      </Link>
   );
}

export default Header;