"use client";

import React, { useState } from "react";
import { ShoppingCart, Loader2, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { AddToCartMeta } from "@/contexts/CartContext";
import { useToasty } from "@/components/Toast";

interface AddToCartButtonProps {
   productVariantId: string;
   quantity?: number;
   disabled?: boolean;
   className?: string;
   label?: string;
   iconOnly?: boolean;
   iconSize?: number;
   meta?: AddToCartMeta;
}

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
   const toasty = useToasty();
   const [loading, setLoading] = useState(false);
   const handleClick = async () => {
      if (loading || disabled || !productVariantId) return;
      setLoading(true);
      try {
         await addToCart(productVariantId, quantity, meta);
         toasty.success(
            meta?.productName
               ? `Đã thêm "${meta.productName}" vào giỏ hàng`
               : "Đã thêm vào giỏ hàng",
         );
      } catch (err) {
         const message = err instanceof Error ? err.message : null;
         toasty.error(
            message ?? "Không thể thêm vào giỏ hàng, vui lòng thử lại",
         );
      } finally {
         setLoading(false);
      }
   };

   const isIconOnly = iconOnly || label === "";

   return (
      <button
         onClick={handleClick}
         disabled={disabled || loading || !productVariantId}
         className={`flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-primary transition
        cursor-pointer hover:bg-accent-hover
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}`}
      >
         {loading ? (
            <Loader2
               className="animate-spin"
               style={{ width: iconSize, height: iconSize }}
            />
         ) : (
            <div className="relative flex items-center justify-center">
               <ShoppingCart style={{ width: iconSize, height: iconSize }} />
               <Plus
                  className="absolute -right-1 -top-1 bg-white rounded-full stroke-[3px]"
                  style={{ width: iconSize / 2, height: iconSize / 2 }}
               />
            </div>
         )}
         {!isIconOnly && <span>{label}</span>}
      </button>
   );
}
