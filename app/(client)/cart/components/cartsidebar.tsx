// components/cart/CartSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ShoppingCart, ChevronUp, ChevronDown, Gift } from "lucide-react";
import VoucherPromotionModal from "./VoucherPromotionModal";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  rewardPoints: number;
  selectedItemsCount: number;
}

export default function CartSidebar({
  isOpen,
  onClose,
  subtotal,
  totalDiscount,
  finalTotal,
  rewardPoints,
  selectedItemsCount,
}: CartSidebarProps) {
  const [showSummary, setShowSummary] = useState(true);
  const [usePoints, setUsePoints] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<string>("");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-primary-darker/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary-darker" />
            <h2 className="text-base font-semibold text-primary-darker">
              Thông tin đơn hàng
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-light rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <X className="h-5 w-5 text-neutral-darker" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-73px)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Gifts Box */}
            <div className="rounded-lg bg-white border border-neutral shadow-sm">
              <button className="flex w-full items-center justify-between p-3 transition hover:bg-neutral-light">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-neutral-darker" />
                  <span className="text-sm font-medium text-primary-darker">
                    Quà tặng
                  </span>
                </div>
                <span className="text-sm text-neutral-dark">Xem quà (0)</span>
              </button>
            </div>

            {/* Voucher - Click to open modal */}
            <div className="rounded-lg bg-white border border-neutral shadow-sm">
              <button 
                onClick={() => setShowVoucherModal(true)}
                className="flex w-full items-center justify-between p-3 transition hover:bg-accent-light group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center">
                    <span className="text-lg leading-none">🏷️</span>
                  </div>
                  <span className="text-sm font-medium text-primary-darker">
                    Chọn hoặc nhập ưu đãi
                  </span>
                </div>
                <svg className="h-5 w-5 text-neutral-dark group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Points */}
            <div className="rounded-lg bg-white border border-neutral shadow-sm p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🪙</span>
                  <span className="text-sm text-primary-darker">
                    Đổi <span className="font-semibold">0</span> điểm (≈<span className="font-semibold">0₫</span>)
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-neutral after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-dark after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent"></div>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg bg-white border border-neutral shadow-sm">
              <div className="p-3">
                <button
                  onClick={() => setShowSummary(!showSummary)}
                  className="flex w-full items-center justify-between mb-3"
                >
                  <h3 className="text-sm font-semibold text-primary-darker">
                    Thông tin đơn hàng
                  </h3>
                  {showSummary ? (
                    <ChevronUp className="h-4 w-4 text-neutral-darker" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-darker" />
                  )}
                </button>

                {showSummary && (
                  <div className="space-y-2.5 text-sm">
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

                    <div className="flex justify-between pl-4">
                      <span className="text-neutral-dark text-xs">Giảm giá sản phẩm</span>
                      <span className="text-primary-darker text-sm">
                        {formatPrice(totalDiscount)}
                      </span>
                    </div>

                    <div className="flex justify-between pl-4">
                      <span className="text-neutral-dark text-xs">Voucher</span>
                      <span className="text-primary-darker text-sm">0₫</span>
                    </div>
                  </div>
                )}

                <div className="border-t border-neutral pt-2.5 mt-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary-darker text-sm">
                      Cần thanh toán
                    </span>
                    <span className="text-xl font-bold text-accent-dark">
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
          </div>

          {/* Footer - Checkout Button */}
          <div className="border-t border-neutral p-4 bg-white">
            <Link
              href="/checkout"
              className={`block w-full rounded-lg py-3.5 text-center text-base font-semibold transition ${
                selectedItemsCount === 0
                  ? "cursor-not-allowed bg-neutral text-neutral-dark"
                  : "bg-promotion text-white hover:bg-promotion-hover shadow-lg"
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

      {/* Voucher Modal */}
      <VoucherPromotionModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        selectedPromotion={selectedPromotion}
        onSelectPromotion={setSelectedPromotion}
      />
    </>
  );
}