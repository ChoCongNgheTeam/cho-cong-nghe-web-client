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
   const { user, logout, isAuthenticated } = useAuth();
   const userMenuRef = useRef<HTMLDivElement>(null);

   const headerIconClass =
      "p-2 hover:bg-gray-100 rounded-lg relative cursor-pointer";

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
      <div className="w-full bg-white">
         {/* Top Bar - Hidden on mobile */}
         <div className="hidden md:block bg-gray-100 border-b border-gray-200">
            <div className="container py-2">
               <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 py-1 gap-2">
                  <span className="text-primary shrink-0">
                     Chào mừng đến với Cửa hàng điện tử toàn cầu
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                     <Link
                        href="#"
                        className="flex items-center gap-1 hover:text-gray-900 hover:underline whitespace-nowrap"
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
                        className="flex items-center gap-1 hover:text-gray-900 hover:underline whitespace-nowrap"
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
                        className="flex items-center gap-1 hover:text-gray-900 hover:underline whitespace-nowrap"
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
         <div className="border-b border-gray-200 bg-warning md:bg-transparent">
            <div className="container py-3 md:py-4">
               {/* Mobile Header */}
               <div className="flex md:hidden items-center justify-between">
                  <button
                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                     className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                     {mobileMenuOpen ? (
                        <X className="w-6 h-6" />
                     ) : (
                        <Menu className="w-6 h-6" />
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
                        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                     >
                        <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                     </button>
                     <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                        <span className="absolute bottom-0 right-0 sm:-bottom-1 sm:-right-1 bg-primary text-white font-semibold text-xs w-4 h-4 rounded-full flex items-center justify-center text-[10px] sm:w-6 sm:h-6 ">
                           2
                        </span>
                     </button>
                  </div>
               </div>

               {/* Desktop Header */}
               <div className="hidden md:flex items-center justify-between gap-4 lg:gap-6">
                  {/* Logo */}
                  <Link href={"/"} className="shrink-0">
                     <Image
                        src="/logo.png"
                        width={200}
                        height={60}
                        alt="Logo"
                        className="w-40 lg:w-50 h-auto"
                        priority
                     />
                  </Link>

                  {/* Menu Button */}
                  <div className="flex items-center">
                     <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                        <Menu className="w-6 h-6" />
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
                           className="w-full pl-4 pr-48 lg:pr-60  py-2.5 lg:py-3 border-2 border-warning rounded-full focus:outline-none focus:border-warning-hover text-sm lg:text-base"
                        />

                        <div className="absolute right-0 top-0 bottom-0 flex items-stretch overflow-hidden bg-white border-2 border-warning border-l-0 rounded-r-full">
                           <button className="hidden lg:flex items-center gap-1 px-3 lg:px-4 text-xs lg:text-sm text-gray-600 hover:text-gray-900 border-r border-gray-300 cursor-pointer">
                              <span className="hidden xl:inline">
                                 Tất cả các danh mục
                              </span>
                              <span className="xl:hidden">Danh mục</span>
                              <ChevronsLeftRight
                                 strokeWidth={2}
                                 className="w-4 h-4 lg:w-6 lg:h-6 rotate-90"
                              />
                           </button>
                           <button className="flex items-center justify-center px-3 lg:px-4 bg-warning hover:bg-warning-hover transition-colors cursor-pointer">
                              <Search className="w-4 h-4 lg:w-5 lg:h-5 text-gray-900" />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-2 lg:gap-4">
                     <button className={`hidden lg:flex ${headerIconClass}`}>
                        <GitCompareArrows className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
                     </button>
                     <button className={headerIconClass}>
                        <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
                     </button>
                     <Link href={"/cart"} className={headerIconClass}>
                        <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
                        <span className="absolute bottom-0 right-0 bg-warning text-primary font-semibold text-xs w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center text-[10px] lg:text-xs">
                           2
                        </span>
                     </Link>

                     {/* User Menu with Dropdown */}
                     <div className="relative" ref={userMenuRef}>
                        <Link
                           href={"/account"}
                           className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center gap-2"
                        >
                           <User className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
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
                           className="w-full pl-4 pr-12 py-2.5 border-2 border-warning sm:border-warning-hover rounded-full focus:outline-none focus:border-warning-hover"
                        />
                        <button className="absolute right-0 top-0 bottom-0 px-4 bg-warning sm:bg-warning-dark hover:bg-warning-hover transition-colors rounded-r-full">
                           <Search className="w-5 h-5 text-gray-900" />
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Mobile Menu Dropdown */}
         {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
               <div className="container py-4">
                  <nav className="flex flex-col gap-3">
                     {isAuthenticated && (
                        <>
                           <div className="px-3 py-2 border-b border-gray-200">
                              <p className="text-sm font-medium text-gray-900">
                                 {user?.fullName}
                              </p>
                              <p className="text-xs text-gray-500">
                                 {user?.email}
                              </p>
                           </div>
                           <Link
                              href="/profile"
                              className="flex items-center gap-2 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3"
                              onClick={() => setMobileMenuOpen(false)}
                           >
                              <User className="h-5 w-5" />
                              <span>Tài khoản của tôi</span>
                           </Link>
                           <Link
                              href="/orders"
                              className="flex items-center gap-2 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3"
                              onClick={() => setMobileMenuOpen(false)}
                           >
                              <Truck className="h-5 w-5" />
                              <span>Đơn hàng của tôi</span>
                           </Link>
                           <Link
                              href="/wishlist"
                              className="flex items-center gap-2 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3"
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
                              className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 border-t border-gray-200"
                           >
                              <LogOut className="h-5 w-5" />
                              <span>Đăng xuất</span>
                           </button>
                        </>
                     )}
                     <Link
                        href="#"
                        className="flex items-center gap-2 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3"
                        onClick={() => setMobileMenuOpen(false)}
                     >
                        <Truck className="h-5 w-5" />
                        <span>Theo dõi đơn hàng</span>
                     </Link>
                     <Link
                        href="/cart"
                        className="flex items-center gap-2 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3"
                        onClick={() => setMobileMenuOpen(false)}
                     >
                        <ShoppingBag className="h-5 w-5" />
                        <span>Cửa hàng</span>
                     </Link>
                     <Link
                        href="#"
                        className="flex items-center gap-2 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3"
                        onClick={() => setMobileMenuOpen(false)}
                     >
                        <GitCompareArrows className="h-5 w-5" />
                        <span>So sánh sản phẩm</span>
                     </Link>

                     {/* Divider */}
                     <div className="border-t border-gray-200 my-2"></div>

                     <Link
                        href="/account?tab=login"
                        className="flex items-center gap-2 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3"
                        onClick={() => setMobileMenuOpen(false)}
                     >
                        <User className="h-5 w-5" />
                        <span>Đăng nhập</span>
                     </Link>
                     <Link
                        href="/account?tab=register"
                        className="flex items-center gap-2 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3"
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
