// app/(client)/cart/components/VariantDropdown.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VariantOption {
  id: string;
  colorLabel: string;
  storageLabel: string;
  price: number;
  available: boolean;
}

interface VariantDropdownProps {
  /** Text hiển thị trên trigger button (thường là currentVariantCode) */
  triggerLabel: string;
  /** Danh sách variants để render */
  options: VariantOption[];
  /** ID variant đang được chọn */
  selectedId: string;
  /** Dropdown đang mở hay không */
  isOpen: boolean;
  /** Đang fetch variants từ API */
  isFetching: boolean;
  /** Đang gửi request đổi variant */
  isChanging: boolean;
  /** Message lỗi (nếu có) */
  errorMessage: string | null;
  /** Callback khi click trigger button */
  onToggle: () => void;
  /** Callback khi chọn 1 variant */
  onSelect: (variant: VariantOption) => void;
  /** Callback khi nhấn "Thử lại" */
  onRetry: () => void;
  /** Callback khi click ngoài dropdown */
  onClose: () => void;
}

function formatVND(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price) + "₫";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VariantDropdown({
  triggerLabel,
  options,
  selectedId,
  isOpen,
  isFetching,
  isChanging,
  errorMessage,
  onToggle,
  onSelect,
  onRetry,
  onClose,
}: VariantDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside để đóng
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const showList = !isFetching && !errorMessage && options.length > 0;
  const showEmpty = !isFetching && !errorMessage && options.length === 0;

  return (
    <div className="relative inline-block mb-2" ref={dropdownRef}>
      {/* ── Trigger Button ── */}
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
            <span className="text-neutral-darker truncate max-w-[180px]">
              Đang cập nhật...
            </span>
          </>
        ) : isFetching && options.length === 0 ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-neutral-dark shrink-0" />
            <span className="text-neutral-darker truncate max-w-[180px]">
              {triggerLabel}
            </span>
          </>
        ) : (
          <span className="font-medium text-neutral-darker truncate max-w-[180px]">
            {triggerLabel}
          </span>
        )}
        <ChevronDown
          className={`h-3 w-3 text-neutral-dark transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1 z-50
            bg-neutral-light border border-neutral rounded-lg shadow-lg
            min-w-[240px] max-w-[320px]
            animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {/* Loading */}
          {isFetching && (
            <div className="flex items-center justify-center gap-2 py-4 px-3">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span className="text-xs text-neutral-darker">Đang tải biến thể...</span>
            </div>
          )}

          {/* Error */}
          {errorMessage && !isFetching && (
            <div className="py-3 px-3 text-center">
              <p className="text-xs text-red-500 mb-2">{errorMessage}</p>
              <button
                type="button"
                onClick={onRetry}
                className="text-xs text-accent underline hover:text-accent-hover transition"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Empty */}
          {showEmpty && (
            <div className="py-4 px-3 text-center">
              <p className="text-xs text-neutral-dark">Không có biến thể khác</p>
            </div>
          )}

          {/* Options list */}
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
                        ${
                          isSelected
                            ? "bg-accent/10 text-primary"
                            : isOutOfStock
                            ? "text-neutral-dark cursor-not-allowed opacity-50"
                            : "hover:bg-neutral text-neutral-darker cursor-pointer"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium line-clamp-1">
                            {variant.colorLabel} / {variant.storageLabel}
                          </div>
                          <div className="text-xs text-neutral-dark mt-0.5 flex items-center gap-1.5">
                            <span>{formatVND(variant.price)}</span>
                            {isOutOfStock && (
                              <span className="text-red-500 font-medium">· Hết hàng</span>
                            )}
                          </div>
                        </div>
                        {isSelected && !isOutOfStock && (
                          <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        )}
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