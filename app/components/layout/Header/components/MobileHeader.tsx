"use client";

import Link from "next/link";
import Image from "next/image";
import { MobileHeaderProps } from "../types";
import CartIcon from "@/(client)/cart/components/CartIcon";
import SearchBar from "./SearchBar";
import { TrendingBar } from "./TrendingBar";
import { GitCompareArrows } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/(client)/compare/compareStore";

const MobileHeader = ({ isDarkMode }: MobileHeaderProps) => {
  const router = useRouter();
  const { items } = useCompareStore();

  return (
    <div className="flex md:hidden flex-col gap-2 py-2">
      {/* TrendingBar */}
      <TrendingBar className="!block mt-0" />

      {/* Row 1: Hamburger | Logo | Compare + Cart */}
      <div className="flex items-center justify-between px-1">
        {/* Hamburger */}
        <button className="p-1 shrink-0">
          <Image src="/images/Robot-mascot-v2.png" alt="Linh vật" width={36} height={36} className="object-contain drop-shadow-md" />
        </button>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Image src={isDarkMode ? "/logo-dark.png" : "/logo.png"} width={140} height={44} alt="Logo" className="h-9 w-auto" priority />
        </Link>

        {/* Compare + Cart */}
        <div className="flex items-center shrink-0">
          <button onClick={() => router.push("/compare")} className="p-2 hover:bg-neutral-light rounded-lg relative cursor-pointer transition-colors" title="So sánh">
            <GitCompareArrows className="w-5 h-5 text-primary" />
            {items.length > 0 && (
              <span className="absolute -right-0.5 -bottom-0.5 min-w-[18px] h-[18px] px-[3px] flex items-center justify-center rounded-full bg-accent text-[10px] font-bold text-neutral-light shadow-sm ring-2 ring-neutral-light">
                {items.length}
              </span>
            )}
          </button>
          <CartIcon />
        </div>
      </div>

      {/* Row 2: SearchBar full width */}
      <div className="px-1">
        <SearchBar isMobile />
      </div>
    </div>
  );
};

export default MobileHeader;
