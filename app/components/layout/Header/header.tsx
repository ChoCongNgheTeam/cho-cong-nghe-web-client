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
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import HeaderTop from "./components/HeaderTop";
import MobileHeader from "./components/MobileHeader";
import DesktopHeader from "./components/DesktopHeader";
import { useUserMenu } from "@/hooks/useUserMenu";
const Header = () => {
   const [searchQuery, setSearchQuery] = useState("");
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
   const [isDarkMode, setIsDarkMode] = useState(false);
   const { user, logout, isAuthenticated } = useAuth();
   const { showUserMenu, setShowUserMenu, userMenuRef } = useUserMenu();
   useEffect(() => {
      const checkDarkMode = () => {
         setIsDarkMode(document.documentElement.classList.contains("dark"));
      };
      checkDarkMode();
      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, {
         attributes: true,
         attributeFilter: ["class"],
      });

      return () => observer.disconnect();
   }, []);

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
   }, [showUserMenu]);

   return (
      <div className="w-full bg-neutral-light border-b border-neutral">
         <HeaderTop isAuthenticated={isAuthenticated} />
         {/* Main Header */}
         <div className="bg-accent md:bg-transparent">
            <div className="container py-3 md:py-4">
               <MobileHeader
                  mobileMenuOpen={mobileMenuOpen}
                  mobileSearchOpen={mobileSearchOpen}
                  searchQuery={searchQuery}
                  isDarkMode={isDarkMode}
                  onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                  onSearchToggle={() => setMobileSearchOpen(!mobileSearchOpen)}
                  onSearchChange={setSearchQuery}
               />
               <DesktopHeader
                  searchQuery={searchQuery}
                  isDarkMode={isDarkMode}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  showUserMenu={showUserMenu}
                  userMenuRef={userMenuRef}
                  onSearchChange={setSearchQuery}
                  onUserMenuToggle={() => setShowUserMenu(!showUserMenu)}
                  onUserMenuClose={() => setShowUserMenu(false)}
                  onLogout={logout}
               />

               {/* Mobile Search Bar */}
               {mobileSearchOpen && (
                  <div className="md:hidden mt-3 pb-2">
                     <div className="relative">
                        <input
                           type="text"
                           placeholder="Tìm kiếm sản phẩm..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full pl-4 pr-12 py-2.5 border border-primary md:border-2 md:border-accent-hover rounded-full focus:outline-none bg-neutral-light text-primary placeholder:text-neutral-dark"
                        />
                        <button className="absolute right-0 top-0 bottom-0 px-4 bg-primary-dark hover:bg-accent-hover transition-colors rounded-r-full">
                           <Search className="w-5 h-5 text-white dark:text-neutral-dark" />
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Mobile Menu Dropdown */}
         {mobileMenuOpen && (
            <div className="md:hidden bg-neutral-light border-b border-neutral-dark shadow-lg">
               <div className="container py-4">
                  <nav className="flex flex-col gap-3">
                     {isAuthenticated && user ? (
                        <>
                           <div className="px-3 py-3 bg-accent/10 rounded-lg">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral border-2 border-accent shrink-0">
                                    <Image
                                       src={`/imgs/${user.avatarImage}`}
                                       alt={user.fullName}
                                       width={36}
                                       height={36}
                                       className="w-full h-full object-cover"
                                    />
                                 </div>
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
                              href="/orders"
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
   );
};

export default Header;
