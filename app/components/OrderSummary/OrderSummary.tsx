"use client";

import React, { useState } from "react";
import { ChevronRight, Truck, Tag, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { formatVND } from "@/helpers";

interface OrderSummaryProps {
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
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
  shippingFee?: number;
  computedTotal?: number;
  totalPromotionDiscount?: number;
}

export default function OrderSummary({
  subtotal,
  totalDiscount,
  finalTotal,
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
  isCheckoutPage = false,
  shippingFee,
  computedTotal,
  totalPromotionDiscount = 0,
}: OrderSummaryProps) {
  const router = useRouter();
  const { user } = useAuth();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  const totalSaved = totalPromotionDiscount + appliedVoucherValue;
  const finalTotalWithVoucher =
    computedTotal ?? Math.max(0, subtotal - totalPromotionDiscount - appliedVoucherValue);

  const handleCheckoutClick = () => {
    if (isCheckoutPage && !user) {
      router.push("/account?returnUrl=/cart");
      return;
    }
    if (showTerms && !agreedToTerms) {
      const toastDiv = document.createElement("div");
      toastDiv.className =
        "fixed top-5 right-5 bg-promotion text-neutral-light px-5 py-3 rounded-lg shadow-lg z-[9999] text-sm font-medium";
      toastDiv.textContent = "⚠️ Vui lòng đồng ý với điều khoản dịch vụ";
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);
      return;
    }
    onCheckout();
  };

  return (
    <div className="rounded-xl bg-neutral-light sticky top-4 overflow-hidden border border-neutral">
      {/* ── Voucher ─────────────────────────────────────────────────────── */}
      {onOpenVoucherModal && (
        <button
          onClick={onOpenVoucherModal}
          className="flex w-full items-center justify-between px-4 py-3 border-b border-neutral transition-colors hover:bg-neutral-light-active group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Tag
              size={15}
              className="shrink-0 text-accent"
            />
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium text-primary leading-tight">
                Chọn hoặc nhập ưu đãi
              </span>
              {appliedVoucherCode && (
                <span className="text-xs text-accent font-semibold truncate w-full mt-0.5">
                  {appliedVoucherCode} &bull; -{formatPrice(appliedVoucherValue)}
                </span>
              )}
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-neutral-dark group-hover:text-primary transition-colors shrink-0"
          />
        </button>
      )}

      {/* ── Order breakdown ──────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-0">
        <p className="text-sm font-semibold text-primary mb-3">
          Thông tin đơn hàng
        </p>

        <div className="space-y-2.5 text-sm">
          {/* Tổng tiền hàng */}
          <div className="flex justify-between items-center">
            <span className="text-neutral-darker">Tổng tiền hàng</span>
            <span className="font-medium text-primary">{formatPrice(subtotal)}</span>
          </div>

          {/* Giảm giá sản phẩm — từ promotion */}
          {totalPromotionDiscount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-neutral-darker flex items-center gap-1.5">
                <Gift size={13} className="text-neutral-dark shrink-0" />
                Giảm giá sản phẩm
              </span>
              <span className="font-medium text-neutral-darker">
                -{formatPrice(totalPromotionDiscount)}
              </span>
            </div>
          )}

          {/* Voucher */}
          {appliedVoucherValue > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-neutral-darker flex items-center gap-1.5">
                <Tag size={13} className="text-accent shrink-0" />
                Voucher
                {appliedVoucherCode && (
                  <span className="text-xs bg-accent-light text-accent-dark font-semibold px-1.5 py-0.5 rounded-full">
                    {appliedVoucherCode}
                  </span>
                )}
              </span>
              <span className="font-medium text-promotion">
                -{formatPrice(appliedVoucherValue)}
              </span>
            </div>
          )}

          {/* Phí vận chuyển */}
          <div className="flex justify-between items-center">
            <span className="text-neutral-darker flex items-center gap-1.5">
              <Truck size={13} className="text-neutral-dark shrink-0" />
              Phí vận chuyển
            </span>
            {shippingFee == null ? (
              <span className="text-xs italic text-neutral-dark">
                Chọn địa chỉ để tính
              </span>
            ) : shippingFee === 0 ? (
              <span className="font-medium text-neutral-darker">Miễn phí</span>
            ) : (
              <span className="font-medium text-neutral-darker">
                {formatPrice(shippingFee)}
              </span>
            )}
          </div>

          {/* Tổng tiết kiệm */}
          {totalSaved > 0 && (
            <div className="flex justify-between items-center bg-neutral-light-active rounded-lg px-3 py-2 mt-1">
              <span className="text-xs font-medium text-neutral-darker">
                🎉 Bạn đã tiết kiệm được
              </span>
              <span className="text-xs font-bold text-neutral-darker">
                -{formatPrice(totalSaved)}
              </span>
            </div>
          )}
        </div>

        {/* Divider + Cần thanh toán */}
        <div className="border-t border-neutral mt-3 pt-3 pb-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-primary text-sm">
              Cần thanh toán
            </span>
            <span className="text-xl font-bold text-promotion">
              {formatPrice(finalTotalWithVoucher)}
            </span>
          </div>
        </div>
      </div>

      {/* ── CTA Button ───────────────────────────────────────────────────── */}
      <button
        onClick={handleCheckoutClick}
        disabled={selectedItemsCount === 0 || (showTerms && !agreedToTerms)}
        className={`block w-full py-3.5 text-center text-base font-semibold transition-colors ${
          selectedItemsCount === 0 || (showTerms && !agreedToTerms)
            ? "bg-primary opacity-40 text-neutral-light cursor-not-allowed"
            : "bg-primary text-neutral-light hover:bg-primary-hover cursor-pointer"
        }`}
      >
        {buttonText}
      </button>

      {/* ── Terms ────────────────────────────────────────────────────────── */}
      {showTerms && (
        <div className="px-4 py-3 bg-accent-light border-t border-neutral">
          <label className="flex gap-2 text-xs cursor-pointer items-start">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => onTermsChange?.(e.target.checked)}
              className="mt-0.5 cursor-pointer shrink-0 w-4 h-4 accent-accent"
            />
            <p className="text-neutral-darker leading-relaxed">
              Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{" "}
              <a
                className="underline font-medium hover:text-promotion text-primary"
                href="/policies/TermsOfService"
              >
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a
                className="underline font-medium hover:text-promotion text-primary"
                href="/policies/DataPrivacy"
              >
                Chính sách xử lý dữ liệu cá nhân
              </a>{" "}
              của ChoCongNghe.
            </p>
          </label>
        </div>
      )}
    </div>
  );
}