"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import CartVariantSelector from "./CartVariantSelector";
import QuantityStepper from "./QuantityStepper";
import { CartItemWithDetails } from "@/store/cart/cart.types";
import { formatVND } from "../../../../helpers";

interface CartItemRowProps {
  item: CartItemWithDetails;
  quantityInputValue: string | number;
  onToggleSelect: (id: string) => void;
  onRemoveClick: (item: CartItemWithDetails) => void;
  onQuantityChange: (id: string, value: string) => void;
  onQuantityBlur: (id: string) => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onVariantSuccess: () => void;
  onUpdateItem: (id: string, patch: Partial<CartItemWithDetails>) => void;
}

export default function CartItemRow({
  item,
  quantityInputValue,
  onToggleSelect,
  onRemoveClick,
  onQuantityChange,
  onQuantityBlur,
  onIncrease,
  onDecrease,
  onVariantSuccess,
  onUpdateItem,
}: CartItemRowProps) {
  const stepperProps = {
    value: quantityInputValue,
    quantity: item.quantity,
    availableQuantity: item.availableQuantity,
    onChange: (value: string) => onQuantityChange(item.id, value),
    onBlur: () => onQuantityBlur(item.id),
    onIncrease: () => onIncrease(item.id),
    onDecrease: () => onDecrease(item.id),
  };

  return (
    <div className="rounded-lg bg-neutral-light p-2 sm:p-4 border border-neutral">
      <div className="flex gap-2 sm:gap-3 min-w-0">
        {/* Checkbox */}
        <div className="flex items-start shrink-0 pt-1">
          <input type="checkbox" checked={item.selected} onChange={() => onToggleSelect(item.id)} style={{ accentColor: "rgb(var(--accent-active))" }} className="h-5 w-5 cursor-pointer rounded" />
        </div>

        {/* Image */}
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-neutral bg-neutral-light">
          {item.image ? (
            <Image src={item.image} alt={item.productName} fill sizes="(max-width: 640px) 64px, 80px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-neutral-dark" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-medium text-primary line-clamp-2 min-w-0 flex-1">{item.productName}</h3>
            <button onClick={() => onRemoveClick(item)} className="xl:hidden shrink-0 text-neutral-darker transition hover:text-primary cursor-pointer" aria-label="Xóa sản phẩm">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-1.5">
            <CartVariantSelector
              cartItemId={item.id}
              productSlug={item.productSlug}
              currentVariantId={item.productVariantId}
              productName={item.productName}
              colorLabel={item.colorLabel}
              storageLabel={item.storageLabel}
              storageValue={item.storageLabel.toLowerCase().replace(/\s+/g, "")}
              variantCode={item.variantCode}
              currentQuantity={item.quantity}
              onSuccess={onVariantSuccess}
              onUpdateItem={(patch) => onUpdateItem(item.id, patch)}
            />
          </div>

          {/* Mobile layout */}
          <div className="xl:hidden flex items-center gap-1 sm:gap-3 flex-wrap">
            <div className="flex flex-col shrink-0">
              <span className="text-sm font-semibold text-promotion whitespace-nowrap">{formatVND(item.unitPrice)}</span>
              {item.originalPrice && item.originalPrice > item.unitPrice && <span className="text-xs text-neutral-dark line-through whitespace-nowrap">{formatVND(item.originalPrice)}</span>}
            </div>
            <QuantityStepper size="md" {...stepperProps} />
            <span className="text-sm font-bold text-promotion whitespace-nowrap shrink-0 ml-auto">{formatVND(item.unitPrice * item.quantity)}</span>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden xl:flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-end w-28 shrink-0">
            <span className="text-base font-semibold text-promotion whitespace-nowrap">{formatVND(item.unitPrice)}</span>
            {item.originalPrice && item.originalPrice > item.unitPrice && <span className="text-xs text-neutral-dark line-through whitespace-nowrap">{formatVND(item.originalPrice)}</span>}
          </div>
          <QuantityStepper size="sm" {...stepperProps} />
          <div className="w-28 text-right shrink-0">
            <span className="text-base font-semibold text-promotion whitespace-nowrap">{formatVND(item.unitPrice * item.quantity)}</span>
          </div>
          <button onClick={() => onRemoveClick(item)} className="text-neutral-darker transition hover:text-primary cursor-pointer shrink-0" aria-label="Xóa sản phẩm">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
