"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";

export default function WishlistIcon() {
   const { count } = useWishlist();

   return (
      <Link
         href="/profile/wishlist"
         className="relative inline-flex items-center"
         title="Yêu thích"
      >
         <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
         {count > 0 && (
            <span className="absolute -right-2 -bottom-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
               {count > 99 ? "99+" : count}
            </span>
         )}
      </Link>
   );
}
