import { Menu, X, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MobileHeaderProps } from "../types";
import CartIcon from "@/(client)/cart/components/CartIcon";
import SearchBar from "./SearchBar";
import NotificationBell from "@/components/ui/NotificationBell";

const MobileHeader = ({ mobileMenuOpen, mobileSearchOpen, isDarkMode, onMenuToggle, onSearchToggle }: MobileHeaderProps) => {
  return (
    <>
      <div className="flex md:hidden items-center justify-between">
        <button onClick={onMenuToggle} className="p-2 hover:bg-accent-hover dark:hover:bg-neutral rounded-lg transition-colors" aria-label="Menu">
          {mobileMenuOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
        </button>

        <Link href="/" className="shrink-0">
          <Image src={isDarkMode ? "/logo-dark.png" : "/logo.png"} width={150} height={50} alt="Logo" className="h-10 sm:h-12 w-auto" priority />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={onSearchToggle} className="p-2 hover:bg-accent-hover dark:hover:bg-neutral rounded-lg transition-colors" aria-label="Tìm kiếm">
            {mobileSearchOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> : <Search className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />}
          </button>
          <NotificationBell />
          <CartIcon />
        </div>
      </div>

      <div className={`md:hidden transition-all duration-200 ${mobileSearchOpen ? "max-h-screen opacity-100 mt-3 overflow-visible" : "max-h-0 opacity-0 overflow-hidden"}`}>
        <SearchBar isMobile />
      </div>
    </>
  );
};

export default MobileHeader;
