"use client";

import Link from "next/link";
import Image from "next/image";
import { MobileHeaderProps } from "../types";
import CartIcon from "@/(client)/cart/components/CartIcon";
import SearchBar from "./SearchBar";

/**
 * MobileHeader — top bar trên mobile.
 * - Logo bên trái
 * - SearchBar luôn hiển thị (inline, full-width) — có suggestions như cũ
 * - CartIcon bên phải
 * Navigation đã chuyển sang MobileBottomNav (bottom tab bar).
 */
const MobileHeader = ({ isDarkMode }: Pick<MobileHeaderProps, "isDarkMode">) => {
  return (
    /* Single row: Logo | SearchBar (flex-1) | Cart */
    <div className="flex md:hidden items-center gap-2 py-2">
      <Link href="/" className="shrink-0">
        <Image src={isDarkMode ? "/logo-dark.png" : "/logo.png"} width={120} height={40} alt="Logo" className="h-8 w-auto" priority />
      </Link>

      {/* Search takes all remaining space — dropdown suggestions intact */}
      <div className="flex-1 min-w-0">
        <SearchBar isMobile />
      </div>

      <div className="shrink-0">
        <CartIcon />
      </div>
    </div>
  );
};

export default MobileHeader;
