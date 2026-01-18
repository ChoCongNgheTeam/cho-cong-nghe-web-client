import {
   Menu,
   Search,
   ChevronsLeftRight,
   GitCompareArrows,
   Heart,
   ShoppingCart,
   User,
   ChevronDown,
   Package,
   MapPin,
   Shield,
   LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DesktopHeaderProps } from "../types";
import { headerIconClass } from "../ui/headerIconClass";
const DesktopHeader = ({
   searchQuery,
   isDarkMode,
   isAuthenticated,
   user,
   showUserMenu,
   userMenuRef,
   onSearchChange,
   onUserMenuToggle,
   onUserMenuClose,
   onLogout,
}: DesktopHeaderProps) => {
   return (
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
                  onChange={(e) => onSearchChange(e.target.value)}
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
            <Link href={"/cart"} className={headerIconClass} title="Giỏ hàng">
               <ShoppingCart className="lg:w-6 lg:h-6 text-primary" />
               <span className="absolute bottom-0 -right-1 bg-accent text-primary-darker font-semibold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  2
               </span>
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
               {isAuthenticated && user ? (
                  <>
                     <button
                        onClick={onUserMenuToggle}
                        className="flex items-center gap-1 p-2 hover:bg-neutral-light dark:hover:bg-neutral rounded-lg transition-colors cursor-pointer"
                     >
                        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full overflow-hidden bg-neutral border-2 border-accent">
                           <Image
                              src={`/imgs/${user.avatarImage}`}
                              alt={user.fullName}
                              width={36}
                              height={36}
                              className="w-full h-full object-cover"
                           />
                        </div>
                        <ChevronDown
                           className={`w-4 h-4 text-primary transition-transform ${
                              showUserMenu ? "rotate-180" : ""
                           }`}
                        />
                     </button>

                     {/* Dropdown Menu */}
                     {showUserMenu && (
                        <div className="absolute -right-15 mt-2 w-64 bg-neutral-light border border-neutral rounded-lg shadow-xl z-50 overflow-hidden">
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
                                 href="/orders"
                                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary"
                                 onClick={onUserMenuClose}
                              >
                                 <Package className="w-5 h-5 text-neutral-darker" />
                                 <span className="text-sm">
                                    Đơn hàng của tôi
                                 </span>
                              </Link>
                              <Link
                                 href="/wishlist"
                                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral transition-colors text-primary"
                                 onClick={onUserMenuClose}
                              >
                                 <Heart className="w-5 h-5 text-neutral-darker" />
                                 <span className="text-sm">
                                    Khách hàng thân thiết
                                 </span>
                              </Link>
                              <Link
                                 href="/addresses"
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
                  </>
               ) : (
                  <Link
                     href={"/account"}
                     className={headerIconClass}
                     title="Tài khoản"
                  >
                     <User className="lg:w-6 lg:h-6 text-primary" />
                  </Link>
               )}
            </div>
         </div>
      </div>
   );
};
export default DesktopHeader;
