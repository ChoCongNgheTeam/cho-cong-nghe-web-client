"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

/**
 * Navbar cart icon with live item-count badge.
 * Usage: <CartIcon />
 */
export default function CartIcon() {
  const { totalItemCount } = useCart();

  return (
    <Link href="/cart" className="relative inline-flex items-center">
      <ShoppingCart className="h-6 w-6 text-primary" />
      {totalItemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary">
          {totalItemCount > 99 ? "99+" : totalItemCount}
        </span>
      )}
    </Link>
  );
}