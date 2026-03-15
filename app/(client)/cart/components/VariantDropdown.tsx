"use client";

import React from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";

export interface VariantOption {
  id: string;
  colorLabel: string;
  storageLabel: string;
  price: number;
  finalPrice?: number;
  imageUrl?: string;
  available: boolean;
  colorValue?: string;
}

interface VariantDropdownProps {
  triggerLabel: string;
  options: VariantOption[];
  selectedId: string;
  isOpen: boolean;
  isFetching: boolean;
  isChanging: boolean;
  errorMessage: string | null;
  onToggle: () => void;
  onSelect: (variant: VariantOption) => void;
  onRetry: () => void;
}

function formatVND(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price) + "₫";
}

export default function VariantDropdown({ triggerLabel, options, selectedId, isOpen, isFetching, isChanging, errorMessage, onToggle, onSelect, onRetry }: VariantDropdownProps) {
  const showList = !isFetching && !errorMessage && options.length > 0;
  const showEmpty = !isFetching && !errorMessage && options.length === 0;

  return (
    <div className="relative inline-block mb-2">
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={onToggle}
        disabled={isChanging}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs
          border border-neutral rounded bg-neutral-light
          hover:border-accent transition-colors duration-150
          disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isChanging ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-accent shrink-0" />
            <span className="text-neutral-darker truncate max-w-[180px]">Đang cập nhật...</span>
          </>
        ) : isFetching && options.length === 0 ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-neutral-dark shrink-0" />
            <span className="text-neutral-darker truncate max-w-[180px]">{triggerLabel}</span>
          </>
        ) : (
          <span className="font-medium text-neutral-darker truncate max-w-[180px]">{triggerLabel}</span>
        )}
        <ChevronDown className={`h-3 w-3 text-neutral-dark transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* ── Dropdown panel — z-50 nằm trên overlay z-40 ── */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1 z-50
            bg-neutral-light border border-neutral rounded-lg shadow-lg
            min-w-[240px] max-w-[320px]"
        >
          {isFetching && (
            <div className="flex items-center justify-center gap-2 py-4 px-3">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span className="text-xs text-neutral-darker">Đang tải biến thể...</span>
            </div>
          )}

          {errorMessage && !isFetching && (
            <div className="py-3 px-3 text-center">
              <p className="text-xs text-red-500 mb-2">{errorMessage}</p>
              <button type="button" onClick={onRetry} className="text-xs text-accent underline hover:text-accent-hover transition">
                Thử lại
              </button>
            </div>
          )}

          {showEmpty && (
            <div className="py-4 px-3 text-center">
              <p className="text-xs text-neutral-dark">Không có biến thể khác</p>
            </div>
          )}

          {showList && (
            <ul className="py-1 max-h-[300px] overflow-y-auto">
              {options.map((variant) => {
                const isSelected = variant.id === selectedId;
                const isOutOfStock = !variant.available;

                return (
                  <li key={variant.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => onSelect(variant)}
                      disabled={isOutOfStock}
                      className={`w-full px-3 py-2.5 text-left text-sm transition-colors
                        ${isSelected ? "bg-accent/10 text-primary" : isOutOfStock ? "text-neutral-dark cursor-not-allowed opacity-50" : "hover:bg-neutral text-neutral-darker cursor-pointer"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium line-clamp-1">
                            {variant.storageLabel} / {variant.colorLabel}
                          </div>
                          <div className="text-xs text-neutral-dark mt-0.5 flex items-center gap-1.5">
                            <span>{formatVND(variant.price)}</span>
                            {isOutOfStock && <span className="text-red-500 font-medium">· Hết hàng</span>}
                          </div>
                        </div>
                        {isSelected && !isOutOfStock && <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
