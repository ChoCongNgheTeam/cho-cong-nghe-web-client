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
        <div className="bg-white rounded-t-2xl shadow-2xl flex flex-col animate-slide-up" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {/* Header - Compact */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral bg-gradient-to-r from-accent/5 to-accent/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎁</span>
              <span className="text-sm font-semibold text-primary-darker">
                0 quà tặng
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-light rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5 text-neutral-darker" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Voucher Button */}
            {onOpenVoucherModal && (
              <div className="border-b border-neutral">
                <button 
                  onClick={() => {
                    onClose();
                    onOpenVoucherModal();
                  }}
                  className="flex w-full items-center justify-between p-3 transition hover:bg-accent/5 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <span className="text-lg">🏷️</span>
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-primary-darker">
                        Chọn hoặc nhập ưu đãi
                      </span>
                      {appliedVoucherCode ? (
                        <span className="text-xs text-accent-dark font-semibold truncate w-full">
                          {appliedVoucherCode} • -{formatPrice(appliedVoucherValue)}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-dark">
                          1.040.000₫
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-dark group-hover:text-accent transition-colors flex-shrink-0" />
                </button>
              </div>
            )}

            {/* Points Toggle */}
            <div className="px-4 py-3 border-b border-neutral">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="text-base">🪙</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary-darker">
                      Đổi 0 điểm
                    </span>
                    <span className="text-xs text-neutral-dark">
                      (≈0₫)
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-neutral-dark/30 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent/50 shadow-inner"></div>
                </label>
              </div>
            </div>

            {/* Summary Section */}
            <div className="px-4 py-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-darker">Tổng tiền</span>
                <span className="font-medium text-primary-darker">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-neutral-darker">Tiết kiệm</span>
                <span className="font-medium text-promotion">
                  {formatPrice(totalDiscount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="border-t border-neutral bg-white">
            {/* Total Section */}
            <div className="px-4 py-3 bg-accent/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-darker">Cần thanh toán</span>
                <span className="text-xl font-bold text-promotion">
                  {formatPrice(finalTotal)}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-xs text-neutral-dark">Tích lũy</span>
                <span className="text-sm">🪙</span>
                <span className="text-sm font-semibold text-accent-dark">
                  +{rewardPoints.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="p-3">
              <Link
                href="/checkout"
                className={`block w-full rounded-lg py-3.5 text-center text-base font-semibold transition shadow-lg ${
                  selectedItemsCount === 0
                    ? "cursor-not-allowed bg-neutral text-neutral-dark"
                    : "bg-accent text-primary-darker hover:bg-accent-hover"
                }`}
                onClick={(e) => {
                  if (selectedItemsCount === 0) {
                    e.preventDefault();
                  }
                }}
              >
                Xác nhận đơn
              </Link>
            </div>
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