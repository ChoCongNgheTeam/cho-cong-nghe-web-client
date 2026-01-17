'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronUp } from 'lucide-react';

interface OrderSummaryProps {
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  rewardPoints: number;
  selectedItemsCount: number;
  appliedVoucherCode?: string;
  appliedVoucherValue?: number;
  selectedPromotions?: string[];
  promotionValue?: number;
  onOpenVoucherModal?: () => void;
  onCheckout: () => void;
  buttonText?: string;
  showTerms?: boolean;
  agreedToTerms?: boolean;
  onTermsChange?: (checked: boolean) => void;
  isCheckoutPage?: boolean;
}

export default function OrderSummary({
  subtotal,
  totalDiscount,
  finalTotal,
  rewardPoints,
  selectedItemsCount,
  appliedVoucherCode = "",
  appliedVoucherValue = 0,
  selectedPromotions = [],
  promotionValue = 0,
  onOpenVoucherModal,
  onCheckout,
  buttonText = "Xác nhận đơn",
  showTerms = false,
  agreedToTerms = false,
  onTermsChange,
  isCheckoutPage = false
}: OrderSummaryProps) {
  const [usePoints, setUsePoints] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  const totalDiscountWithVoucher = totalDiscount + appliedVoucherValue;
  const finalTotalWithVoucher = Math.max(0, finalTotal - appliedVoucherValue);

  const handleCheckoutClick = () => {
    if (showTerms && !agreedToTerms) {
      // Show toast message
      const toastDiv = document.createElement('div');
      toastDiv.className = 'fixed top-5 right-5 bg-promotion text-white px-5 py-3 rounded-lg shadow-lg z-[9999] text-sm font-medium font-poppins';
      toastDiv.textContent = '⚠️ Vui lòng đồng ý với điều khoản dịch vụ';
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);
      return;
    }
    onCheckout();
  };

  return (
    <div className="rounded-lg bg-white shadow-sm sticky top-4 font-poppins">
      <div className="p-4 space-y-3">
        {/* Gifts Box */}
        <div className="rounded-lg bg-white shadow-sm overflow-hidden">
          <button className="flex w-full items-center justify-between p-3 transition hover:bg-neutral-light border-b border-neutral cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-lg">🎁</span>
              <span className="text-sm font-medium text-primary-darker">
                Quà tặng
              </span>
            </div>
            <span className="text-sm text-neutral-dark">
              Xem quà ({selectedPromotions.length})
            </span>
          </button>
        </div>

        {/* Voucher */}
        {onOpenVoucherModal && (
          <div className="rounded-lg bg-white shadow-sm overflow-hidden">
            <button
              onClick={onOpenVoucherModal}
              className="flex w-full items-center justify-between p-3 transition hover:bg-accent-light group border-b border-neutral cursor-pointer"
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

        {/* Points */}
        <div className="rounded-lg bg-white shadow-sm p-3 border-b border-neutral">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🪙</span>
              <span className="text-sm text-primary-darker">
                Đổi <span className="font-semibold">0</span> điểm (≈
                <span className="font-semibold">0₫</span>)
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
        <div className="rounded-lg bg-white shadow-sm">
          <div className="p-3 border-b border-neutral">
            <h3 className="mb-3 text-sm font-semibold text-primary-darker">
              Thông tin đơn hàng
            </h3>

            {showDetails && (
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
                    -{formatPrice(totalDiscountWithVoucher)}
                  </span>
                </div>

                <div className="flex justify-between pl-4">
                  <span className="text-neutral-dark text-xs">
                    Giảm giá sản phẩm
                  </span>
                  <span className="text-primary-darker text-sm">
                    -{formatPrice(totalDiscount)}
                  </span>
                </div>

                <div className="flex justify-between pl-4">
                  <span className="text-neutral-dark text-xs">Voucher</span>
                  <span className="text-primary-darker text-sm font-medium">
                    {appliedVoucherValue > 0
                      ? `-${formatPrice(appliedVoucherValue)}`
                      : "0₫"}
                  </span>
                </div>

                {isCheckoutPage && (
                  <div className="flex justify-between">
                    <span className="text-neutral-darker">Phí vận chuyển</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                )}

                <div className="border-t border-neutral pt-2.5 mt-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary-darker text-sm">
                      Cần thanh toán
                    </span>
                    <span className="text-xl font-bold text-promotion">
                      {formatPrice(finalTotalWithVoucher)}
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
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
            >
              {showDetails ? 'Rút gọn' : 'Xem chi tiết'}
              <ChevronUp className={`h-4 w-4 transition-transform ${showDetails ? '' : 'rotate-180'}`} />
            </button>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckoutClick}
            disabled={selectedItemsCount === 0 || (showTerms && !agreedToTerms)}
            className={`block w-full rounded-b-lg py-3.5 text-center text-base font-semibold transition ${
              selectedItemsCount === 0 || (showTerms && !agreedToTerms)
                ? "cursor-not-allowed bg-neutral text-neutral-dark opacity-50"
                : "bg-accent text-primary-darker hover:bg-accent-hover shadow-lg cursor-pointer"
            }`}
          >
            {buttonText}
          </button>

          {/* Terms (Checkout only) - Below button */}
          {showTerms && (
            <div className="px-3 pb-3 pt-3 bg-neutral-light">
              <label className="flex gap-2 text-xs cursor-pointer items-start">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => onTermsChange?.(e.target.checked)}
                  className="mt-1 cursor-pointer flex-shrink-0 w-4 h-4 accent-accent"
                />
                <p className="text-neutral-darker leading-relaxed">
                  Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{' '}
                  <a className="underline font-medium hover:text-promotion cursor-pointer text-primary" href="#">
                    Điều khoản dịch vụ
                  </a>{' '}
                  và{' '}
                  <a className="underline font-medium hover:text-promotion cursor-pointer text-primary" href="#">
                    Chính sách xử lý dữ liệu cá nhân
                  </a>{' '}
                  của ChoCongNghe.
                </p>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}