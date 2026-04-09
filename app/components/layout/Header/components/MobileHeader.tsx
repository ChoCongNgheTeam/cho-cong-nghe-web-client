"use client";

import Link from "next/link";
import Image from "next/image";
import { MobileHeaderProps } from "../types";
import CartIcon from "@/(client)/cart/components/CartIcon";
import SearchBar from "./SearchBar";
import { TrendingBar } from "./TrendingBar";

const MobileHeader = ({ isDarkMode }: MobileHeaderProps) => {
  return (
    <div className="flex md:hidden flex-col">
      {/* TrendingBar — luôn ở top */}
      <TrendingBar className="!block mt-0" />

      {/* Row: Logo | SearchBar | Cart */}
      <div className="flex items-center gap-2 py-2">
        <Link href="/" className="shrink-0">
          <Image src={isDarkMode ? "/logo-dark.png" : "/logo.png"} width={120} height={40} alt="Logo" className="h-8 w-auto" priority />
        </Link>

        <div className="flex-1 min-w-0">
          <SearchBar isMobile />
        </div>

        <div className="shrink-0">
          <CartIcon />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
