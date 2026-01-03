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
   Moon,
   Sun,
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
      "p-2 hover:bg-gray-100 dark:hover:bg-neutral rounded-lg relative cursor-pointer";

   // Load dark mode preference
   useEffect(() => {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
         "(prefers-color-scheme: dark)"
      ).matches;
      const shouldBeDark =
         savedTheme === "dark" || (!savedTheme && prefersDark);

      setIsDarkMode(shouldBeDark);
      if (shouldBeDark) {
         document.documentElement.classList.add("dark");
      }
   }, []);

   // Toggle dark mode
   const toggleDarkMode = () => {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);

      if (newDarkMode) {
         document.documentElement.classList.add("dark");
         localStorage.setItem("theme", "dark");
      } else {
         document.documentElement.classList.remove("dark");
         localStorage.setItem("theme", "light");
      }
   };

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
      <div className="w-full bg-white dark:bg-neutral-light">
         {/* Top Bar - Hidden on mobile */}
         <div className="hidden md:block bg-gray-100/60 dark:bg-neutral/40 border-b border-gray-200/50 dark:border-neutral-dark/50">
            <div className="container py-2">
               <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-neutral-darker py-1 gap-2">
                  <span className="text-primary dark:text-neutral-darker shrink-0">
                     Chào mừng đến với Cửa hàng điện tử toàn cầu
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                     <Link
                        href="#"
                        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-primary hover:underline whitespace-nowrap"
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
                     <span className="hidden sm:inline">|</span>
                     <Link
                        href="#"
                        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-primary hover:underline whitespace-nowrap"
                     >
                        <ShoppingBag
                           strokeWidth={1}
                           className="h-4 w-4 sm:h-5 sm:w-5"
                        />
                        <span className="hidden lg:inline">Cửa hàng</span>
                        <span className="lg:hidden">Shop</span>
                     </Link>
                     <span className="hidden sm:inline">|</span>
                     <Link
                        href={isAuthenticated ? "/profile" : "/account"}
                        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-primary hover:underline whitespace-nowrap"
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
         <div className="border-b border-gray-200 dark:border-neutral-dark bg-accent md:bg-transparent">
            <div className="container py-3 md:py-4">
               {/* Mobile Header */}
               <div className="flex md:hidden items-center justify-between">
                  <button
                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                     className="p-2 hover:bg-gray-100 dark:hover:bg-neutral rounded-lg"
                  >
                     {mobileMenuOpen ? (
                        <X className="w-6 h-6 dark:text-neutral-darker" />
                     ) : (
                        <Menu className="w-6 h-6 dark:text-neutral-darker" />
                     )}
                  </button>

                  <Link href={"/"}>
                     <Image
                        src="/logo.png"
                        width={150}
                        height={50}
                        alt="Logo"
                        className="h-12 w-auto"
                        priority
                     />
                  </Link>

                  <div className="flex items-center gap-2">
                     <button
                        onClick={toggleDarkMode}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral rounded-lg"
                     >
                        {isDarkMode ? (
                           <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                        ) : (
                           <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                     </button>
                     <button
                        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral rounded-lg"
                     >
                        <Search className="w-5 h-5 sm:w-6 sm:h-6 dark:text-neutral-darker" />
                     </button>
                     <button className="p-2 hover:bg-gray-100 dark:hover:bg-neutral rounded-lg relative">
                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-neutral-darker" />
                        <span className="absolute bottom-0 right-0 sm:-bottom-1 sm:-right-1 bg-primary dark:bg-accent text-white dark:text-primary-darker font-semibold text-xs w-4 h-4 rounded-full flex items-center justify-center text-[10px] sm:w-6 sm:h-6 ">
                           2
                        </span>
                     </button>
                  </div>
               </div>

               {/* Desktop Header */}
               <div className="hidden md:flex items-center justify-between gap-4 lg:gap-6">
                  {/* Logo */}
                  <Link href="/" className="shrink-0">
                     <Image
                        src={isDarkMode ? "/logo-dark.png" : "/logo.png"}
                        width={180}
                        height={60}
                        alt="Logo"
                        className="h-14 w-auto hover:opacity-90 transition-opacity"
                        priority
                     />
                  </Link>
                  {/* Menu Button */}
                  <div>
                     <button className="p-2 hover:bg-gray-100 dark:hover:bg-neutral rounded-lg cursor-pointer flex gap-1 dark:text-neutral-darker">
                        <Menu className="w-6 h-6" />
                        Danh mục
                     </button>
                  </div>

                  {/* Search Bar */}
                  <div className="flex-1 max-w-2xl">
                     <div className="relative">
                        <input
                           type="text"
                           placeholder="Tìm kiếm sản phẩm..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full pl-4 pr-48 lg:pr-60  py-2.5 lg:py-3 border-2 border-accent rounded-full focus:outline-none dark:focus:border-accent text-sm lg:text-base dark:text-neutral-darker dark:placeholder:text-neutral-dark"
                        />

                        <div className="absolute right-0 top-0 bottom-0 flex items-stretch overflow-hidden border-2 border-accent border-l-0 rounded-r-full">
                           <button className="hidden lg:flex items-center gap-1 px-3 lg:px-4 text-xs lg:text-sm text-gray-600 dark:text-neutral-darker hover:text-gray-900 dark:hover:text-primary border-r dark:border-neutral-dark cursor-pointer">
                              <span className="hidden xl:inline">
                                 Tất cả các danh mục
                              </span>
                              <span className="xl:hidden">Danh mục</span>
                              <ChevronsLeftRight
                                 strokeWidth={2}
                                 className="w-4 h-4 lg:w-6 lg:h-6 rotate-90"
                              />
                           </button>
                           <button className="flex items-center justify-center px-3 lg:px-4 bg-accent hover:bg-accent-hover transition-colors cursor-pointer">
                              <Search className="w-4 h-4 lg:w-5 lg:h-5 text-gray-900 dark:text-primary-darker" />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-2 lg:gap-4">
                     <button
                        onClick={toggleDarkMode}
                        className={headerIconClass}
                        title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
                     >
                        {isDarkMode ? (
                           <Sun className="w-5 h-5 lg:w-6 lg:h-6 text-accent" />
                        ) : (
                           <Moon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
                        )}
                     </button>
                     <button className={`hidden lg:flex ${headerIconClass}`}>
                        <GitCompareArrows className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-neutral-darker" />
                     </button>
                     <button className={headerIconClass}>
                        <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-neutral-darker" />
                     </button>
                     <Link href={"/cart"} className={headerIconClass}>
                        <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-neutral-darker" />
                        <span className="absolute bottom-0 right-0 bg-accent text-primary dark:text-primary-darker font-semibold text-xs w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center text-[10px] lg:text-xs">
                           2
                        </span>
                     </Link>

                     {/* User Menu with Dropdown */}
                     <div className="relative" ref={userMenuRef}>
                        <Link
                           href={"/account"}
                           className="p-2 hover:bg-gray-100 dark:hover:bg-neutral rounded-lg cursor-pointer flex items-center gap-2"
                        >
                           <User className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-neutral-darker" />
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
                           className="w-full pl-4 pr-12 py-2.5 border-2 border-accent sm:border-accent-hover dark:border-neutral-dark rounded-full focus:outline-none focus:border-accent-hover dark:focus:border-accent dark:bg-neutral dark:text-neutral-darker dark:placeholder:text-neutral-dark"
                        />
                        <button className="absolute right-0 top-0 bottom-0 px-4 bg-accent sm:bg-accent-dark hover:bg-accent-hover transition-colors rounded-r-full">
                           <Search className="w-5 h-5 text-gray-900 dark:text-primary-darker" />
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Mobile Menu Dropdown */}
         {mobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-neutral-light border-b border-gray-200 dark:border-neutral-dark shadow-lg">
               <div className="container py-4">
                  <nav className="flex flex-col gap-3">
                     {isAuthenticated && (
                        <>
                           <div className="px-3 py-2 border-b border-gray-200 dark:border-neutral-dark">
                              <p className="text-sm font-medium text-gray-900 dark:text-primary">
                                 {user?.fullName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-neutral-darker">
                                 {user?.email}
                              </p>
                           </div>
                           <Link
                              href="/profile"
                              className="flex items-center gap-2 py-2 text-gray-700 dark:text-neutral-darker hover:text-gray-900 dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-neutral rounded-lg px-3"
                              onClick={() => setMobileMenuOpen(false)}
                           >
                              <User className="h-5 w-5" />
                              <span>Tài khoản của tôi</span>
                           </Link>
                           <Link
                              href="/orders"
                              className="flex items-center gap-2 py-2 text-gray-700 dark:text-neutral-darker hover:text-gray-900 dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-neutral rounded-lg px-3"
                              onClick={() => setMobileMenuOpen(false)}
                           >
                              <Truck className="h-5 w-5" />
                              <span>Đơn hàng của tôi</span>
                           </Link>
                           <Link
                              href="/wishlist"
                              className="flex items-center gap-2 py-2 text-gray-700 dark:text-neutral-darker hover:text-gray-900 dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-neutral rounded-lg px-3"
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
                              className="flex items-center gap-2 py-2 text-red-600 dark:text-promotion hover:text-red-700 dark:hover:text-promotion-hover hover:bg-red-50 dark:hover:bg-promotion-light rounded-lg px-3 border-t border-gray-200 dark:border-neutral-dark"
                           >
                              <LogOut className="h-5 w-5" />
                              <span>Đăng xuất</span>
                           </button>
                        </>
                     )}
                     <Link
                        href="#"
                        className="flex items-center gap-2 py-2 text-gray-700 dark:text-neutral-darker hover:text-gray-900 dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-neutral rounded-lg px-3"
                        onClick={() => setMobileMenuOpen(false)}
                     >
                        <Truck className="h-5 w-5" />
                        <span>Theo dõi đơn hàng</span>
                     </Link>
                     <Link
                        href="/cart"
                        className="flex items-center gap-2 py-2 text-gray-700 dark:text-neutral-darker hover:text-gray-900 dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-neutral rounded-lg px-3"
                        onClick={() => setMobileMenuOpen(false)}
                     >
                        <ShoppingBag className="h-5 w-5" />
                        <span>Cửa hàng</span>
                     </Link>
                     <Link
                        href="#"
                        className="flex items-center gap-2 py-2 text-gray-700 dark:text-neutral-darker hover:text-gray-900 dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-neutral rounded-lg px-3"
                        onClick={() => setMobileMenuOpen(false)}
                     >
                        <GitCompareArrows className="h-5 w-5" />
                        <span>So sánh sản phẩm</span>
                     </Link>

                     {/* Divider */}
                     <div className="border-t border-gray-200 dark:border-neutral-dark my-2"></div>

                     <Link
                        href="/account?tab=login"
                        className="flex items-center gap-2 py-2 text-gray-700 dark:text-neutral-darker hover:text-gray-900 dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-neutral rounded-lg px-3"
                        onClick={() => setMobileMenuOpen(false)}
                     >
                        <User className="h-5 w-5" />
                        <span>Đăng nhập</span>
                     </Link>
                     <Link
                        href="/account?tab=register"
                        className="flex items-center gap-2 py-2 text-gray-700 dark:text-neutral-darker hover:text-gray-900 dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-neutral rounded-lg px-3"
                        onClick={() => setMobileMenuOpen(false)}
                     >
                        <UserPlus className="h-5 w-5" />
                        <span>Đăng ký</span>
                     </Link>
                  </nav>
               </div>
            </div>
         )}
      </div>
   );
};

export default Header;
