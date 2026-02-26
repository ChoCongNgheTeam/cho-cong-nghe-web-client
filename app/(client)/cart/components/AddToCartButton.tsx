"use client";

import React, { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { CartItemMeta } from "@/contexts/CartContext";

interface AddToCartButtonProps {
   productVariantId: string;
   quantity?: number;
   disabled?: boolean;
   className?: string;
   label?: string;
   iconOnly?: boolean;
   iconSize?: number;
   meta?: CartItemMeta; // ← thêm
}

/**
 * Drop-in button cho Product Detail Page.
 * Usage:
 * - With text: <AddToCartButton productVariantId={variant.id} quantity={qty} />
 * - Icon only: <AddToCartButton productVariantId={variant.id} quantity={qty} label="" iconOnly />
 */
export default function AddToCartButton({
   productVariantId,
   quantity = 1,
   disabled = false,
   className = "",
   label = "Thêm vào giỏ",
   iconOnly = false,
   iconSize = 24,
   meta,
}: AddToCartButtonProps) {
   const { addToCart } = useCart();
   const [loading, setLoading] = useState(false);

   const handleClick = async () => {
      if (loading || disabled || !productVariantId) return;
      setLoading(true);
      await addToCart(productVariantId, quantity, meta);
      setLoading(false);
   };

   // Nếu label rỗng, tự động bật iconOnly mode
   const isIconOnly = iconOnly || label === "";

   return (
      <button
         onClick={handleClick}
         disabled={disabled || loading || !productVariantId}
         className={`flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-primary transition
            cursor-pointer
        hover:bg-accent-hover
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}`}
      >
         {loading ? (
            <Loader2
               className="h-5 w-5 animate-spin"
               style={{ width: iconSize, height: iconSize }}
            />
         ) : (
            <ShoppingCart
               className="h-5 w-5"
               style={{ width: iconSize, height: iconSize }}
            />
         )}
         {!isIconOnly && <span>{label}</span>}
      </button>
   );
}
