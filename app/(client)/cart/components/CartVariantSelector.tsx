// app/(client)/cart/components/CartVariantSelector.tsx
"use client";

import React from "react";
import { useVariantSelector } from "@/hooks/useVariantSelector";
import VariantDropdown from "./VariantDropdown";

interface CartVariantSelectorProps {
  cartItemId: string;
  productSlug: string;
  currentVariantId: string;
  currentVariantCode: string;
  currentQuantity: number;
  onSuccess?: () => void;
}

/**
 * Thin orchestrator: kết nối useVariantSelector (logic) với VariantDropdown (UI).
 * Không chứa logic API hay render markup trực tiếp.
 */
export default function CartVariantSelector({
  cartItemId,
  productSlug,
  currentVariantId,
  currentVariantCode,
  currentQuantity,
  onSuccess,
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
    currentQuantity,
    onSuccess,
  });

  // Fetch xong mà chỉ có ≤1 variant → hiện plain text, không cần dropdown
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