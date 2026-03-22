"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { formatVND } from "@/helpers";

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
   shippingFee?: number;
   taxAmount?: number;
   computedTotal?: number; // ← thêm: tổng đã tính sẵn
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
   isCheckoutPage = false,
   shippingFee,
   taxAmount,
   computedTotal,
}: OrderSummaryProps) {
   const router = useRouter();
   const { user } = useAuth();

   const formatPrice = (price: number) =>
      new Intl.NumberFormat("vi-VN").format(price) + "₫";

   const totalDiscountWithVoucher = totalDiscount + appliedVoucherValue;
   const finalTotalWithVoucher =
      computedTotal ?? Math.max(0, subtotal - totalDiscountWithVoucher);

   const handleCheckoutClick = () => {
      if (isCheckoutPage && !user) {
         router.push("/account?returnUrl=/cart");
         return;
      }

      if (showTerms && !agreedToTerms) {
         const toastDiv = document.createElement("div");
         toastDiv.className =
            "fixed top-5 right-5 bg-promotion text-white px-5 py-3 rounded-lg shadow-lg z-[9999] text-sm font-medium ";
         toastDiv.textContent = "⚠️ Vui lòng đồng ý với điều khoản dịch vụ";
         document.body.appendChild(toastDiv);
         setTimeout(() => toastDiv.remove(), 3000);
         return;
      }
      onCheckout();
   };

   return (
      <div className="rounded-lg bg-neutral-light sticky top-4 ">
         <div className="pt-0 space-y-3">
            {/* Gifts Box */}
            {/* <div className="rounded-lg bg-neutral-light shadow-sm overflow-hidden">
          <button className="flex w-full items-center justify-between p-3 transition hover:bg-accent-light border-b border-neutral cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-lg">🎁</span>
              <span className="text-sm font-medium text-primary">Quà tặng</span>
            </div>
            <span className="text-sm text-neutral-dark">Xem quà ({selectedPromotions.length})</span>
          </button>
        </div> */}

            {/* Voucher */}
            {onOpenVoucherModal && (
               <div className="rounded-lg bg-neutral-light overflow-hidden border border-neutral">
                  <button
                     onClick={onOpenVoucherModal}
                     className="flex w-full items-center justify-between px-4 py-3 transition hover:bg-accent-light group cursor-pointer min-h-13"
                  >
                     <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-lg shrink-0">🏷️</span>
                        <div className="flex flex-col items-start min-w-0">
                           <span className="text-sm font-medium text-primary">
                              Chọn hoặc nhập ưu đãi
                           </span>
                           {appliedVoucherCode && (
                              <span className="text-xs text-accent-dark font-semibold truncate w-full">
                                 {appliedVoucherCode} • -
                                 {formatPrice(appliedVoucherValue)}
                              </span>
                           )}
                        </div>
                     </div>
                     <ChevronRight className="h-5 w-5 text-neutral-dark group-hover:text-primary transition-colors shrink-0" />
                  </button>
               </div>
            )}

            {/* Order Summary */}
            <div className="rounded-lg bg-neutral-light">
               <div className="p-3 border border-neutral rounded-t-lg">
                  <h3 className="mb-3 text-sm font-semibold text-primary">
                     Thông tin đơn hàng
                  </h3>

                  <div className="space-y-2.5 text-sm">
                     <div className="flex justify-between">
                        <span className="text-neutral-darker">Tổng tiền</span>
                        <span className="font-medium text-primary">
                           {formatPrice(subtotal)}
                        </span>
                     </div>

                     <div className="flex justify-between">
                        <span className="text-neutral-darker">
                           Tổng khuyến mãi
                        </span>
                        <span className="font-medium text-primary">
                           -{formatPrice(totalDiscountWithVoucher)}
                        </span>
                     </div>

                     <div className="flex justify-between pl-4">
                        <span className="text-neutral-dark text-xs">
                           Giảm giá sản phẩm
                        </span>
                        <span className="text-primary text-sm">
                           -{formatPrice(totalDiscount)}
                        </span>
                     </div>

                     <div className="flex justify-between pl-4">
                        <span className="text-neutral-dark text-xs">
                           Voucher
                        </span>
                        <span className="text-primary text-sm font-medium">
                           {appliedVoucherValue > 0
                              ? `-${formatPrice(appliedVoucherValue)}`
                              : "0₫"}
                        </span>
                     </div>

                     {isCheckoutPage && shippingFee !== undefined && (
                        <div className="flex justify-between">
                           <span className="text-neutral-darker">
                              Phí vận chuyển
                           </span>
                           <span className="font-medium text-accent-dark">
                              {shippingFee === 0
                                 ? "Miễn phí"
                                 : formatVND(shippingFee)}
                           </span>
                        </div>
                     )}

                     {isCheckoutPage &&
                        taxAmount !== undefined &&
                        taxAmount > 0 && (
                           <div className="flex justify-between pl-4">
                              <span className="text-neutral-dark text-xs">
                                 Phí VAT (10%)
                              </span>
                              <span className="text-primary text-sm font-medium">
                                 +{formatPrice(taxAmount)}
                              </span>
                           </div>
                        )}

                     <div className="border-t border-neutral pt-2.5 mt-2.5">
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
               </div>

               {/* Checkout Button */}
               <button
                  onClick={handleCheckoutClick}
                  disabled={
                     selectedItemsCount === 0 || (showTerms && !agreedToTerms)
                  }
                  className={`block w-full py-3.5 text-center text-base font-semibold transition ${showTerms ? "" : "rounded-b-lg"} ${
                     selectedItemsCount === 0 || (showTerms && !agreedToTerms)
                        ? "cursor-not-allowed bg-primary text-neutral-light opacity-50"
                        : "bg-primary text-neutral-light hover:bg-primary-hover shadow-lg cursor-pointer"
                  }`}
               >
                  {buttonText}
               </button>

               {/* Terms + VAT/Shipping info (Checkout only) - Below button */}
               {showTerms && (
                  <>
                     <div className="px-3 pb-3 pt-3 bg-accent-light">
                        <label className="flex gap-2 text-xs cursor-pointer items-start">
                           <input
                              type="checkbox"
                              checked={agreedToTerms}
                              onChange={(e) =>
                                 onTermsChange?.(e.target.checked)
                              }
                              className="mt-1 cursor-pointer shrink-0 w-4 h-4 accent-accent"
                           />
                           <p className="text-neutral-darker leading-relaxed">
                              Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{" "}
                              <a
                                 className="underline font-medium hover:text-promotion cursor-pointer text-primary"
                                 href="policies/TermsOfService"
                              >
                                 Điều khoản dịch vụ
                              </a>{" "}
                              và{" "}
                              <a
                                 className="underline font-medium hover:text-promotion cursor-pointer text-primary"
                                 href="policies/DataPrivacy"
                              >
                                 Chính sách xử lý dữ liệu cá nhân
                              </a>{" "}
                              của ChoCongNghe.
                           </p>
                        </label>
                     </div>

                     {/* {taxAmount !== undefined && (
                        <div className="px-4 pb-4 pt-3 text-xs text-neutral-darker border-t border-neutral rounded-b-lg bg-neutral-light">
                           <div className="flex justify-between">
                              <span>Thuế VAT (10%)</span>
                              <span>{formatVND(taxAmount)}</span>
                           </div>
                        </div>
                     )} */}
                  </>
               )}
            </div>
         </div>
      </div>
   );
}
