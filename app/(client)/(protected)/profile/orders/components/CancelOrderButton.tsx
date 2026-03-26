"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import apiRequest from "@/lib/api";
import { useToasty } from "@/components/Toast";
import { Popzy } from "@/components/Modal";

interface CancelOrderButtonProps {
  orderId: string;
  onCancelSuccess?: () => void;
}

export default function CancelOrderButton({
  orderId,
  onCancelSuccess,
}: CancelOrderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { success, error: toastError } = useToasty();

  const handleCancel = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await apiRequest.post(`/orders/my/${orderId}/cancel`);
      success("Hủy đơn hàng thành công!");
      onCancelSuccess?.();
    } catch {
      toastError("Đơn không thỏa điều kiện hủy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger button — compact trên mobile */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="h-8 sm:h-9 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 rounded-lg cursor-pointer
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          border border-promotion-light-active text-promotion
          hover:bg-promotion hover:text-white hover:border-promotion hover:shadow-sm
          active:scale-95"
      >
        {loading ? (
          <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-promotion border-t-transparent rounded-full animate-spin" />
        ) : (
          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        )}
        <span className="text-xs sm:text-sm font-medium">
          {loading ? "Đang hủy..." : "Hủy đơn"}
        </span>
      </button>

      {/* Confirm modal — full-width on mobile */}
      <Popzy
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        closeMethods={["button", "overlay", "escape"]}
        footer={false}
        cssClass="max-w-[400px] w-full mx-3 sm:mx-auto"
        content={
          <div className="flex flex-col items-center text-center px-1 sm:px-2 py-3 sm:py-4 gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <h3 className="text-sm sm:text-base font-semibold text-primary">
                Xác nhận hủy đơn hàng
              </h3>
              <p className="text-xs sm:text-sm text-primary-dark leading-relaxed">
                Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này
                không thể hoàn tác.
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3 w-full pt-0.5 sm:pt-1">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-9 sm:h-10 rounded-lg border border-neutral text-primary-dark text-xs sm:text-sm font-medium
                  hover:bg-neutral-light-active transition-colors cursor-pointer"
              >
                Giữ đơn
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 h-9 sm:h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium
                  transition-colors cursor-pointer"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        }
      />
    </>
  );
}
