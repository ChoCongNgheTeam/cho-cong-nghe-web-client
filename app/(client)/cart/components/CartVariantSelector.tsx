"use client";

import React, { useEffect, useRef } from "react";
import { useVariantSelector } from "@/hooks/useVariantSelector";
import VariantDropdown from "./VariantDropdown";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";

interface CartVariantSelectorProps {
  cartItemId: string;
  productSlug: string;
  currentVariantId: string;
  currentVariantCode: string;
  currentColorValue?: string;
  currentQuantity: number;
  onSuccess?: () => void;
  onUpdateItem?: (patch: Partial<CartItemWithDetails>) => void;
}

export default function CartVariantSelector({
  cartItemId,
  productSlug,
  currentVariantId,
  currentVariantCode,
  currentColorValue,
  currentQuantity,
  onSuccess,
  onUpdateItem,
}: CartVariantSelectorProps) {
  const {
    isOpen,
    options,
    isFetching,
    isChanging,
    errorMessage,
    hasFetched,
    handleToggle,
    handleClose,
    handleRetry,
    handleSelect,
  } = useVariantSelector({
    cartItemId,
    productSlug,
    currentVariantId,
    currentVariantCode,
    currentColorValue,
    currentQuantity,
    onSuccess,
    onUpdateItem,
  });

  // ── Plain text khi đã fetch xong mà chỉ có ≤1 option ──
  if (hasFetched && options.length <= 1) {
    return (
      <div className="text-xs text-neutral-darker mb-2">
        {currentVariantCode}
      </div>
    );
  }

  return (
    <VariantDropdown
      triggerLabel={currentVariantCode}
      options={options}
      selectedId={currentVariantId}
      isOpen={isOpen}
      isFetching={isFetching}
      isChanging={isChanging}
      errorMessage={errorMessage}
      onToggle={handleToggle}
      onSelect={handleSelect}
      onRetry={handleRetry}
      onClose={handleClose}
    />
  );
}