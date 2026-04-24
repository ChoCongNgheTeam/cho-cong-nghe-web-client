"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StripePaymentInfo {
  type: "STRIPE";
  clientSecret: string;
  publishableKey: string;
  paymentIntentId: string;
}

interface PaymentResultModalProps {
  isOpen: boolean;
  paymentInfo: StripePaymentInfo | null;
  onClose: () => void;
  onDone: () => void;
}

// ─── Stripe Panel ─────────────────────────────────────────────────────────────

function StripePanel({ info }: { info: StripePaymentInfo }) {
  const mountedRef = useRef(false);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [stripeError, setStripeError] = useState("");

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const init = async () => {
      if (!(window as any).Stripe) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://js.stripe.com/v3/";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Không tải được Stripe.js"));
          document.head.appendChild(s);
        });
      }

      const stripe = (window as any).Stripe(info.publishableKey);
      stripeRef.current = stripe;

      const elements = stripe.elements({ clientSecret: info.clientSecret });
      elementsRef.current = elements;

      const paymentElement = elements.create("payment");
      paymentElement.on("ready", () => setIsReady(true));
      paymentElement.mount("#stripe-payment-element");
    };

    init().catch((err) => setStripeError(err.message));
  }, [info.clientSecret, info.publishableKey]);

  const handleConfirm = async () => {
    if (!stripeRef.current || !elementsRef.current) return;
    setIsConfirming(true);
    setStripeError("");

    // return_url trỏ về BE return handler
    // BE sẽ query DB theo payment_intent → tìm orderCode → redirect /order/{orderCode}/payment
    const returnUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/payments/stripe/return`;

    const { error } = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      confirmParams: { return_url: returnUrl },
    });

    // Chỉ vào đây nếu có lỗi — thành công Stripe auto redirect
    if (error) {
      setStripeError(error.message ?? "Có lỗi xảy ra khi thanh toán");
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-primary">Thanh toán thẻ</h3>
        <p className="text-sm text-neutral-darker mt-0.5">Nhập thông tin thẻ bên dưới để hoàn tất đơn hàng</p>
      </div>

      {/* Stripe Payment Element */}
      <div className="relative min-h-[140px]">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-neutral-darker animate-spin" />
          </div>
        )}
        <div id="stripe-payment-element" className={isReady ? "" : "invisible"} />
      </div>

      {/* Error */}
      {stripeError && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{stripeError}</span>
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={isConfirming || !isReady}
        className="w-full bg-[#635bff] text-white font-semibold py-3 rounded-xl hover:opacity-90
          transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isConfirming && <Loader2 className="w-4 h-4 animate-spin" />}
        {isConfirming ? "Đang xử lý..." : "Xác nhận thanh toán"}
      </button>

      <p className="text-xs text-neutral-darker text-center">🔒 Thanh toán được bảo mật bởi Stripe</p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function PaymentResultModal({ isOpen, paymentInfo, onClose }: PaymentResultModalProps) {
  if (!isOpen || !paymentInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop — không cho đóng khi đang xử lý Stripe */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-3.5 border-b border-neutral z-10">
          <h2 className="text-sm font-semibold text-primary">Hoàn tất thanh toán</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral transition-colors">
            <X className="w-4 h-4 text-neutral-darker" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <StripePanel info={paymentInfo} />
        </div>
      </div>
    </div>
  );
}
