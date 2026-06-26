"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CartIcon } from "@/(client)/cart/components/CartIcon";
import { useCompareStore } from "@/store/compare/compare.store";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "./SearchBar";
import { TrendingBar } from "./TrendingBar";
import { GitCompareArrows } from "lucide-react";
import MobileLogo from "@/components/generalSettings/MobileHeader";

const MobileHeader = () => {
  const router = useRouter();
  const { items } = useCompareStore();
  const { user } = useAuth();

  const avatarSrc = user?.avatarImage || "/images/Robot-mascot-v2.png";
  const avatarAlt = user ? user.fullName || "Tài khoản" : "Linh vật";
  const avatarHref = user ? "/profile" : "/account";

  return (
    <div className="flex md:hidden flex-col gap-2 py-2">
      <TrendingBar className="!block mt-0" />

      <div className="flex items-center justify-between px-1">
        {/* Avatar / Mascot */}
        <Link href={avatarHref} className="p-1 shrink-0">
          {user ? (
            <div className="w-9 h-9 rounded-full ring-2 ring-white/40 overflow-hidden shrink-0 shadow-md">
              <Image src={avatarSrc} alt={avatarAlt} width={36} height={36} className="w-full h-full object-cover" />
            </div>
          ) : (
            <Image src={avatarSrc} alt={avatarAlt} width={36} height={36} className="object-contain drop-shadow-md" />
          )}
        </Link>

        <MobileLogo />

        {/* Compare + Cart */}
        <div className="flex items-center shrink-0">
          <button onClick={() => router.push("/compare")} className="p-2 hover:bg-white/15 rounded-lg relative cursor-pointer transition-colors" title="So sánh">
            <GitCompareArrows className="w-5 h-5 text-white" />
            {items.length > 0 && (
              <span className="absolute -right-0.5 -bottom-0.5 min-w-[18px] h-[18px] px-[3px] flex items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#4979E4] shadow-sm ring-2 ring-[#4979E4]">
                {items.length}
              </span>
            )}
          </button>
          <CartIcon />
        </div>
      </div>

      <div className="px-1">
        <SearchBar isMobile />
      </div>
    </div>
  );
};

export default MobileHeader;
