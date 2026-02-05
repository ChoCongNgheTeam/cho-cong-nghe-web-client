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
                  <X className="w-6 h-6 text-primary" />
               ) : (
                  <Menu className="w-6 h-6 text-primary" />
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
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
               </button>
               <Link
                  href="/cart"
                  className="p-2 hover:bg-accent-hover dark:hover:bg-neutral rounded-lg relative transition-colors"
               >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <span className="absolute -top-1 -right-1 bg-primary text-white dark:text-neutral-light font-semibold text-xs w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                     2
                  </span>
               </Link>
            </div>
         </div>
      </>
   );
};

export default MobileHeader;
