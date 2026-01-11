"use client";
import { useState, useEffect, useRef } from "react";
import {
   Search,
   Heart,
   ShoppingCart,
   User,
   Menu,
   Truck,
   ShoppingBag,
   ChevronsLeftRight,
   GitCompareArrows,
   X,
   LogOut,
   UserPlus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
   const [searchQuery, setSearchQuery] = useState("");
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
   const [showUserMenu, setShowUserMenu] = useState(false);
   const [isDarkMode, setIsDarkMode] = useState(false);
   const { user, logout, isAuthenticated } = useAuth();
   const userMenuRef = useRef<HTMLDivElement>(null);

   const headerIconClass =
      "p-2 hover:bg-neutral-light dark:hover:bg-neutral rounded-lg relative cursor-pointer transition-colors";

   // Detect dark mode for logo
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

   // Close user menu when clicking outside
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
         {/* Top Bar - Hidden on mobile */}
         <div className="hidden md:block bg-neutral/40 border-b border-neutral-dark/50">
            <div className="container py-2">
               <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-darker py-1 gap-2">
                  <span className="shrink-0">
                     Chào mừng đến với Cửa hàng điện tử toàn cầu
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                     <Link
                        href="#"
                        className="flex items-center gap-1 hover:text-primary hover:underline whitespace-nowrap"
                     >
                        <Truck
                           strokeWidth={1}
                           className="h-4 w-4 sm:h-5 sm:w-5"
                        />
                        <span className="hidden lg:inline">
                           Theo dõi đơn hàng của bạn
                        </span>
                        <span className="lg:hidden">Đơn hàng</span>
                     </Link>
                     <span className="hidden sm:inline text-neutral-dark">
                        |
                     </span>
                     <Link
                        href="#"
                        className="flex items-center gap-1 hover:text-primary hover:underline whitespace-nowrap"
                     >
                        <ShoppingBag
                           strokeWidth={1}
                           className="h-4 w-4 sm:h-5 sm:w-5"
                        />
                        <span className="hidden lg:inline">Cửa hàng</span>
                        <span className="lg:hidden">Shop</span>
                     </Link>
                     <span className="hidden sm:inline text-neutral-dark">
                        |
                     </span>
                     <Link
                        href={isAuthenticated ? "/profile" : "/account"}
                        className="flex items-center gap-1 hover:text-primary hover:underline whitespace-nowrap"
                     >
                        <User
                           strokeWidth={1}
                           className="h-4 w-4 sm:h-5 sm:w-5"
                        />
                        <span className="hidden lg:inline">
                           Tài khoản của tôi
                        </span>
                        <span className="lg:hidden">Tài khoản</span>
                     </Link>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Header */}
         <div className="bg-accent md:bg-transparent">
            <div className="container py-3 md:py-4">
               {/* Mobile Header */}
               <div className="flex md:hidden items-center justify-between">
                  <button
                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                     className="p-2 hover:bg-accent-hover dark:hover:bg-neutral rounded-lg transition-colors"
                     aria-label="Menu"
                  >
                     {mobileMenuOpen ? (
                        <X className="w-6 h-6 text-primary-darker" />
                     ) : (
                        <Menu className="w-6 h-6 text-primary-darker" />
                     )}
                  </button>

                  <Link href={"/"} className="flex-shrink-0">
                     <Image
                        src={isDarkMode ? "/logo-dark.png" : "/logo.png"}
                        width={150}
                        height={50}
                        alt="Logo"
                        className="h-10 sm:h-12 w-auto"
                        priority
                     />
                  </Link>

                  <div className="flex items-center gap-1 sm:gap-2">
                     <button
                        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                        className="p-2 hover:bg-accent-hover dark:hover:bg-neutral rounded-lg transition-colors"
                        aria-label="Tìm kiếm"
                     >
                        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-primary-darker" />
                     </button>
                     <Link
                        href="/cart"
                        className="p-2 hover:bg-accent-hover dark:hover:bg-neutral rounded-lg relative transition-colors"
                     >
                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary-darker" />
                        <span className="absolute -top-1 -right-1 bg-primary text-white dark:text-neutral-light font-semibold text-xs w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                           2
                        </span>
                     </Link>
                  </div>
               </div>

               {/* Desktop Header */}
               <div className="hidden md:flex items-center justify-between gap-4 lg:gap-4">
                  {/* Logo */}
                  <Link href="/" className="shrink-0">
                     <Image
                        src={isDarkMode ? "/logo-dark.png" : "/logo.png"}
                        width={180}
                        height={60}
                        alt="Logo"
                        className="h-12 lg:h-14 w-auto hover:opacity-90 transition-opacity"
                        priority
                     />
                  </Link>

                  {/* Menu Button */}
                  <button className="p-2 hover:bg-neutral-light dark:hover:bg-neutral rounded-lg cursor-pointer flex items-center gap-1 text-primary transition-colors">
                     <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
                     <span className="hidden lg:inline">Danh mục</span>
                  </button>

                  {/* Search Bar */}
                  <div className="flex-1 max-w-2xl">
                     <div className="relative">
                        <input
                           type="text"
                           placeholder="Tìm kiếm sản phẩm..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full pl-4 pr-48 lg:pr-60 py-2.5 lg:py-3 border-2 border-accent rounded-full focus:outline-none focus:border-accent-hover text-sm lg:text-base bg-neutral-light text-primary placeholder:text-neutral-dark"
                        />

                        <div className="absolute right-0 top-0 bottom-0 flex items-stretch overflow-hidden border-2 border-accent border-l-0 rounded-r-full">
                           <button className="hidden lg:flex items-center gap-1 px-3 lg:px-4 text-xs lg:text-sm text-neutral-darker hover:text-primary border-r border-neutral-dark cursor-pointer bg-neutral-light transition-colors">
                              <span className="hidden xl:inline">
                                 Tất cả các danh mục
                              </span>
                              <span className="xl:hidden">Danh mục</span>
                              <ChevronsLeftRight
                                 strokeWidth={2}
                                 className="w-4 h-4 lg:w-5 lg:h-5 rotate-90"
                              />
                           </button>
                           <button className="flex items-center justify-center px-3 lg:px-4 bg-accent hover:bg-accent-hover transition-colors cursor-pointer">
                              <Search className="w-4 h-4 lg:w-5 lg:h-5 text-primary-darker" />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-3 lg:gap-4">
                     <button
                        className={`hidden lg:flex ${headerIconClass}`}
                        title="So sánh"
                     >
                        <GitCompareArrows className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                     </button>
                     <button className={headerIconClass} title="Yêu thích">
                        <Heart className="lg:w-6 lg:h-6 text-primary" />
                     </button>
                     <Link
                        href={"/cart"}
                        className={headerIconClass}
                        title="Giỏ hàng"
                     >
                        <ShoppingCart className="lg:w-6 lg:h-6 text-primary" />
                        <span className="absolute bottom-0 -right-1 bg-accent text-primary-darker font-semibold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                           2
                        </span>
                     </Link>

                     {/* User Menu */}
                     <div className="relative" ref={userMenuRef}>
                        <Link
                           href={"/account"}
                           className={headerIconClass}
                           title="Tài khoản"
                        >
                           <User className="lg:w-6 lg:h-6 text-primary" />
                        </Link>
                     </div>
                  </div>
               </div>

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
                     {isAuthenticated && (
                        <>
                           <div className="px-3 py-2 border-b border-neutral-dark">
                              <p className="text-sm font-medium text-primary">
                                 {user?.fullName}
                              </p>
                              <p className="text-xs text-neutral-darker">
                                 {user?.email}
                              </p>
                           </div>
                           <Link
                              href="/profile"
                              className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                           >
                              <User className="h-5 w-5" />
                              <span>Tài khoản của tôi</span>
                           </Link>
                           <Link
                              href="/orders"
                              className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                           >
                              <Truck className="h-5 w-5" />
                              <span>Đơn hàng của tôi</span>
                           </Link>
                           <Link
                              href="/wishlist"
                              className="flex items-center gap-2 py-2 text-primary hover:text-primary-hover hover:bg-neutral rounded-lg px-3 transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                           >
                              <Heart className="h-5 w-5" />
                              <span>Danh sách yêu thích</span>
                           </Link>
                           <button
                              onClick={() => {
                                 logout();
                                 setMobileMenuOpen(false);
                              }}
                              className="flex items-center gap-2 py-2 text-promotion hover:text-promotion-hover hover:bg-promotion-light rounded-lg px-3 border-t border-neutral-dark transition-colors"
                           >
                              <LogOut className="h-5 w-5" />
                              <span>Đăng xuất</span>
                           </button>
                        </>
                     )}
                     {!isAuthenticated && (
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
