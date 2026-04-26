"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function CartIcon() {
  const { totalItemCount } = useCart();

  return (
    <Link href="/cart" className="inline-flex items-center relative p-2 rounded-lg transition-colors duration-150 cursor-pointer hover:bg-white/10 active:bg-white/20">
      <ShoppingCart className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
      {totalItemCount > 0 && (
        <span
          className="absolute -right-0.5 -bottom-0.5 min-w-[18px] h-[18px] px-[3px]
            flex items-center justify-center rounded-full
            bg-white text-[10px] font-bold
            shadow-sm"
          style={{ color: "#0f2050", boxShadow: "0 0 0 2px rgba(15,32,80,0.5)" }}
        >
          {totalItemCount > 99 ? "99+" : totalItemCount}
        </span>
      )}
    </Link>
  );
}
