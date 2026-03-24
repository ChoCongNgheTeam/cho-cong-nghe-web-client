"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
export default function CartIcon() {
   const { totalItemCount } = useCart();

   return (
      <Link
         href="/cart"
         className="inline-flex items-center relative p-2 rounded-xl transition-all duration-200 cursor-pointer
           hover:bg-neutral-light-active"
      >
         <ShoppingCart className="h-6 w-6 text-primary" />
         {totalItemCount > 0 && (
            <span
               className="absolute -right-0.5 -bottom-0.5 min-w-[18px] h-[18px] px-[3px]
                    flex items-center justify-center rounded-full
                    bg-accent text-[10px] font-bold text-neutral-light
                    shadow-sm ring-2 ring-neutral-light"
            >
               {totalItemCount > 99 ? "99+" : totalItemCount}
            </span>
         )}
      </Link>
   );
}
