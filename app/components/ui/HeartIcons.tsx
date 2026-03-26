"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";

export default function WishlistIcon() {
   const { count } = useWishlist();

   return (
      <Link
         href="/profile/wishlist"
         className="inline-flex items-center relative p-2 rounded-xl transition-all duration-200 cursor-pointer
           hover:bg-neutral-light-active"
         title="Yêu thích"
      >
         <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
         {count > 0 && (
            <span
               className="absolute -right-0.5 -bottom-0.5 min-w-4.5 h-4.5 px-0.75
                    flex items-center justify-center rounded-full
                    bg-accent text-[10px] font-bold text-neutral-light
                    shadow-sm ring-2 ring-neutral-light"
            >
               {count > 99 ? "99+" : count}
            </span>
         )}
      </Link>
   );
}
