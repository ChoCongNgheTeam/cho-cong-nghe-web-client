"use client";

import React from "react";
import { X, ChevronRight } from "lucide-react";
import { formatVND } from "@/helpers";

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
  onCheckout: () => void;
  // Props cho Checkout page
  isCheckoutPage?: boolean;
  showTerms?: boolean;
  agreedToTerms?: boolean;
  onTermsChange?: (checked: boolean) => void;
  // Props cho Points
  usePoints?: boolean;
  onTogglePoints?: (checked: boolean) => void;
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
  onCheckout,
  isCheckoutPage = false,
  showTerms = false,
  agreedToTerms = false,
  onTermsChange,
  usePoints = false,
  onTogglePoints,
}: CartSidebarProps) {
  const finalTotalWithVoucher = Math.max(0, finalTotal - appliedVoucherValue);

  const handleCheckout = () => {
    if (selectedItemsCount === 0) return;

    if (showTerms && !agreedToTerms) {
      const toastDiv = document.createElement("div");
      toastDiv.className = "fixed top-5 right-5 bg-promotion text-white px-5 py-3 rounded-lg shadow-lg z-[9999] text-sm font-medium";
      toastDiv.textContent = "⚠️ Vui lòng đồng ý với điều khoản dịch vụ";
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);
      return;
    }

    onClose();
    onCheckout();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-primary-darker/50 backdrop-blur-sm z-70 lg:hidden" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed inset-x-0 bottom-0 z-70 lg:hidden">
        <div className="bg-neutral-light rounded-t-2xl shadow-2xl flex flex-col animate-slide-up" style={{ maxHeight: "calc(100vh - 120px)" }}>
          {/* Header - Compact */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral bg-linear-to-r from-accent/5 to-accent/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎁</span>
              <span className="text-sm font-semibold text-primary">{isCheckoutPage ? "Thông tin đơn hàng" : "0 quà tặng"}</span>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-neutral-light rounded-lg transition-colors" aria-label="Đóng">
              <X className="h-5 w-5 text-neutral-darker" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Voucher Button */}
            {onOpenVoucherModal && (
              <div className="border-b border-neutral">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                    onOpenVoucherModal();
                  }}
                  className="flex w-full items-center justify-between p-3 transition hover:bg-accent/5 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <span className="text-lg">🏷️</span>
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-primary">Chọn hoặc nhập ưu đãi</span>
                      {appliedVoucherCode ? (
                        <span className="text-xs text-accent-dark font-semibold truncate w-full">
                          {appliedVoucherCode} • -{formatVND(appliedVoucherValue)}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-dark">Chưa áp dụng</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-dark group-hover:text-accent transition-colors shrink-0" />
                </button>
              </div>
            )}

            {/* Points Toggle - Show on both Cart and Checkout */}
            <div className="px-4 py-3 border-b border-neutral">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="text-base">🪙</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary">Đổi 0 điểm</span>
                    <span className="text-xs text-neutral-dark">(≈0₫)</span>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" checked={usePoints} onChange={(e) => onTogglePoints?.(e.target.checked)} className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-neutral-dark/30 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent/50 shadow-inner"></div>
                </label>
              </div>
            </div>

            {/* Summary Section */}
            <div className="px-4 py-4 space-y-2.5">
              <h3 className="text-sm font-semibold text-primary mb-3">Chi tiết thanh toán</h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-darker">Tổng tiền</span>
                  <span className="font-medium text-primary">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-darker">Tổng khuyến mãi</span>
                  <span className="font-medium text-primary">
                    -{formatVND(totalDiscount + appliedVoucherValue)} {/* chỉ dùng để tính tổng hiển thị */}
                  </span>
                </div>

                <div className="flex justify-between pl-4">
                  <span className="text-neutral-dark text-xs">Giảm giá sản phẩm</span>
                  <span className="text-primary text-sm">-{formatVND(totalDiscount)}</span>
                </div>

                <div className="flex justify-between pl-4">
                  <span className="text-neutral-dark text-xs">Voucher</span>
                  <span className="text-primary text-sm font-medium">{appliedVoucherValue > 0 ? `-${formatVND(appliedVoucherValue)}` : "0₫"}</span>
                </div>

                {isCheckoutPage && (
                  <div className="flex justify-between">
                    <span className="text-neutral-darker">Phí vận chuyển</span>
                    <span className="font-medium text-accent-dark">Miễn phí</span>
                  </div>
                )}

                <div className="border-t border-neutral pt-2.5 mt-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary text-sm">Cần thanh toán</span>
                    <span className="text-xl font-bold text-promotion">{formatVND(finalTotalWithVoucher)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 pt-2">
                  <span className="text-xs text-neutral-darker">Điểm thưởng</span>
                  <span className="text-sm">🪙</span>
                  <span className="text-sm font-medium text-accent-dark">+{rewardPoints.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="border-t border-neutral bg-neutral-light">
            {/* Terms Checkbox - Only show on Checkout page */}
            {showTerms && (
              <div className="px-4 pt-3 pb-2">
                <label className="flex gap-2 text-xs cursor-pointer items-start">
                  <input type="checkbox" checked={agreedToTerms} onChange={(e) => onTermsChange?.(e.target.checked)} className="mt-1 cursor-pointer shrink-0 w-4 h-4 accent-accent" />
                  <p className="text-neutral-darker leading-relaxed">
                    Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{" "}
                    <a className="underline font-medium hover:text-promotion cursor-pointer text-primary" href="#">
                      Điều khoản dịch vụ
                    </a>{" "}
                    và{" "}
                    <a className="underline font-medium hover:text-promotion cursor-pointer text-primary" href="#">
                      Chính sách xử lý dữ liệu cá nhân
                    </a>{" "}
                    của ChoCongNghe.
                  </p>
                </label>
              </div>
            )}

            {/* Checkout Button */}
            <div className="p-3">
              <button
                onClick={handleCheckout}
                disabled={selectedItemsCount === 0 || (showTerms && !agreedToTerms)}
                className={`block w-full rounded-lg py-3.5 text-center text-base font-semibold transition shadow-lg ${
                  selectedItemsCount === 0 || (showTerms && !agreedToTerms)
                    ? "cursor-not-allowed bg-neutral text-neutral-dark opacity-50"
                    : "bg-accent text-primary hover:bg-accent-hover active:scale-[0.98]"
                }`}
              >
                {isCheckoutPage ? "Đặt hàng" : `Xác nhận đơn (${selectedItemsCount} sản phẩm)`}
              </button>
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
