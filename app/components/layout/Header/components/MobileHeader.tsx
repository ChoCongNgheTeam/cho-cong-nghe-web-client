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

        <div className="shrink-0 flex items-center">
          <button onClick={() => router.push("/compare")} className="p-2 hover:bg-neutral-light dark:hover:bg-neutral rounded-lg relative cursor-pointer transition-colors" title="So sánh">
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
    </div>
  );
};

export default MobileHeader;
