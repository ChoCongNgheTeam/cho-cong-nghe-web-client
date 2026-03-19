"use client";

import React from "react";
import { useVariantSelector } from "@/hooks/useVariantSelector";
import VariantDropdown from "./VariantDropdown";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";

interface CartVariantSelectorProps {
   cartItemId: string;
   productSlug: string;
   currentVariantId: string;
   colorLabel: string;
   storageLabel: string;
   storageValue?: string;
   colorValue?: string;
   currentQuantity: number;
   productName: string;
   onSuccess?: () => void;
   onUpdateItem?: (patch: Partial<CartItemWithDetails>) => void;
}

export default function CartVariantSelector({
   cartItemId,
   productSlug,
   currentVariantId,
   colorLabel,
   storageLabel,
   storageValue, // ← thêm
   colorValue,
   productName,
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
      handleRetry,
      handleSelect,
   } = useVariantSelector({
      cartItemId,
      productSlug,
      currentVariantId,
      colorLabel,
      storageLabel,
      storageValue, // ← truyền xuống hook
      colorValue,
      currentQuantity,
      onSuccess,
      onUpdateItem,
   });

   const displayLabel =
      [storageLabel, colorLabel].filter(Boolean).join(" / ") || "Mặc định";
   if (hasFetched && !isFetching && options.length <= 1) {
      return (
         <div className="text-xs text-neutral-darker mb-2 flex items-center gap-1">
            <span className="font-medium">{displayLabel}</span>
            <span className="text-neutral-dark">· Hiện chỉ có một màu</span>
         </div>
      );
   }

   return (
      <VariantDropdown
         triggerLabel={displayLabel}
         options={options}
         selectedId={currentVariantId}
         isOpen={isOpen}
         isFetching={isFetching}
         productName={productName}
         isChanging={isChanging}
         errorMessage={errorMessage}
         onToggle={handleToggle}
         onSelect={handleSelect}
         onRetry={handleRetry}
      />
   );
}
