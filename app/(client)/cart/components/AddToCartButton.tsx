"use client";

import React, { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";

interface AddToCartButtonProps {
  productVariantId: string; // UUID string từ backend
  quantity?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
}

/**
 * Drop-in button cho Product Detail Page.
 * Usage: <AddToCartButton productVariantId={variant.id} quantity={qty} />
 */
export default function AddToCartButton({
  productVariantId,
  quantity = 1,
  disabled = false,
  className = "",
  label = "Thêm vào giỏ",
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || disabled || !productVariantId) return;
    setLoading(true);
    await addToCart(productVariantId, quantity);
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading || !productVariantId}
      className={`flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-primary transition
        hover:bg-accent-hover
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <ShoppingCart className="h-5 w-5" />
      )}
      {label}
    </button>
  );
}