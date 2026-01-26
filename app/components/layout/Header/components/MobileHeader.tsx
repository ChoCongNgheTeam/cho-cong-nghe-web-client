// components/MobileHeader.tsx
import { Menu, X, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MobileHeaderProps } from "../types";
const MobileHeader = ({
   mobileMenuOpen,
   mobileSearchOpen,
   searchQuery,
   isDarkMode,
   onMenuToggle,
   onSearchToggle,
   onSearchChange,
}: MobileHeaderProps) => {
   return (
      <>
         <div className="flex md:hidden items-center justify-between">
            <button
               onClick={onMenuToggle}
               className="p-2 hover:bg-accent-hover dark:hover:bg-neutral rounded-lg transition-colors"
               aria-label="Menu"
            >
               {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-primary-darker" />
               ) : (
                  <Menu className="w-6 h-6 text-primary-darker" />
               )}
            </button>
            <Link href={"/"} className="shrink-0">
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
                  onClick={onSearchToggle}
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
         {mobileSearchOpen && (
            <div className="md:hidden mt-3 pb-2">
               <div className="relative">
                  <input
                     type="text"
                     placeholder="Tìm kiếm sản phẩm..."
                     value={searchQuery}
                     onChange={(e) => onSearchChange(e.target.value)}
                     className="w-full pl-4 pr-12 py-2.5 border border-primary md:border-2 md:border-accent-hover rounded-full focus:outline-none bg-neutral-light text-primary placeholder:text-neutral-dark"
                  />
                  <button className="absolute right-0 top-0 bottom-0 px-4 bg-primary-dark hover:bg-accent-hover transition-colors rounded-r-full">
                     <Search className="w-5 h-5 text-white dark:text-neutral-dark" />
                  </button>
               </div>
            </div>
         )}
      </>
   );
};

export default MobileHeader;
