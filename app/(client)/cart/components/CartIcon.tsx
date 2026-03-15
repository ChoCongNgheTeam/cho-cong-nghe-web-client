"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
export default function CartIcon() {
   const { totalItemCount } = useCart();

   return (
      <Link href="/cart" className="relative inline-flex items-center">
         <ShoppingCart className="h-6 w-6 text-primary" />
         {totalItemCount > 0 && (
            <span className="absolute -right-2 -bottom-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white border border-neutral-light">
               {totalItemCount > 99 ? "99+" : totalItemCount}
            </span>
         )}
      </Link>
   );
}
