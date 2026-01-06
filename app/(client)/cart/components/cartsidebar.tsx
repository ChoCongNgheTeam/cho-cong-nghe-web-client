// components/cart/CartSidebar.tsx
"use client";

import React from "react";
import { X, ChevronRight } from "lucide-react";
import Link from "next/link";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  rewardPoints: number;
  selectedItemsCount: number;
  appliedVoucherCode?: string;
  appliedVoucherValue?: number;
  onOpenVoucherModal?: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  subtotal,
  totalDiscount,
  finalTotal,
  rewardPoints,
  selectedItemsCount,
  appliedVoucherCode = "",
  appliedVoucherValue = 0,
  onOpenVoucherModal,
}: CartSidebarProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary-darker/50 backdrop-blur-sm z-[70] lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-x-0 bottom-0 z-[70] lg:hidden">
        <div className="bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral">
            <h2 className="text-lg font-semibold text-primary-darker">
              Thông tin đơn hàng
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-light rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5 text-neutral-darker" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Voucher Button */}
            {onOpenVoucherModal && (
              <div className="rounded-lg bg-white border border-neutral shadow-sm">
                <button 
                  onClick={() => {
                    onClose();
                    onOpenVoucherModal();
                  }}
                  className="flex w-full items-center justify-between p-3 transition hover:bg-accent-light group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">🏷️</span>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-primary-darker">
                        Chọn hoặc nhập ưu đãi
                      </span>
                      {appliedVoucherCode && (
                        <span className="text-xs text-accent-dark font-semibold truncate w-full">
                          {appliedVoucherCode} • -{formatPrice(appliedVoucherValue)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-dark group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              </div>
            )}

            {/* Summary */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-darker">Tổng tiền</span>
                <span className="font-medium text-primary-darker">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-darker">Tổng khuyến mãi</span>
                <span className="font-medium text-primary-darker">
                  -{formatPrice(totalDiscount)}
                </span>
              </div>

              {appliedVoucherValue > 0 && (
                <div className="flex justify-between pl-4">
                  <span className="text-neutral-dark text-xs">Voucher</span>
                  <span className="text-primary-darker text-sm font-medium">
                    -{formatPrice(appliedVoucherValue)}
                  </span>
                </div>
              )}

              <div className="border-t border-neutral pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary-darker">
                    Cần thanh toán
                  </span>
                  <span className="text-xl font-bold text-promotion">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 pt-2">
                <span className="text-xs text-neutral-darker">Điểm thưởng</span>
                <span className="text-sm">🪙</span>
                <span className="text-sm font-medium text-accent-dark">
                  +{rewardPoints.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-neutral bg-white">
            <Link
              href="/checkout"
              className={`block w-full rounded-lg py-3.5 text-center text-base font-semibold transition ${
                selectedItemsCount === 0
                  ? "cursor-not-allowed bg-neutral text-neutral-dark"
                  : "bg-accent text-primary-darker hover:bg-accent-hover shadow-lg"
              }`}
              onClick={(e) => {
                if (selectedItemsCount === 0) {
                  e.preventDefault();
                }
              }}
            >
              Xác nhận đơn ({selectedItemsCount})
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}