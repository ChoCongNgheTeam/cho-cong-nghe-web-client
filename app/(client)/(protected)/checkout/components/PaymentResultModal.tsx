"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Copy, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentInfo =
   | { type: "COD" }
   | {
        type: "BANK_TRANSFER";
        bankName: string;
        accountNumber: string;
        accountName: string;
        content: string;
        amount: number;
        qrCode: string;
     }
   | { type: "MOMO"; momoOrderId: string; paymentUrl: string }
   | { type: "VNPAY"; txnRef: string; paymentUrl: string }
   | { type: "ZALOPAY"; appTransId: string; paymentUrl: string }
   | { type: "STRIPE"; clientSecret: string; publishableKey: string };

interface PaymentResultModalProps {
   isOpen: boolean;
   paymentInfo: PaymentInfo | null;
   onClose: () => void;
   /** Called after user confirms COD or bank transfer done */
   onDone: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
   const [copied, setCopied] = useState(false);
   const handleCopy = async () => {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };
   return (
      <button
         onClick={handleCopy}
         className="ml-2 p-1 rounded hover:bg-neutral transition-colors"
         title="Sao chép"
      >
         {copied ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
         ) : (
            <Copy className="w-4 h-4 text-neutral-darker" />
         )}
      </button>
   );
}

function InfoRow({ label, value }: { label: string; value: string }) {
   return (
      <div className="flex items-start justify-between py-2 border-b border-neutral last:border-0">
         <span className="text-sm text-neutral-darker shrink-0 w-32">
            {label}
         </span>
         <div className="flex items-center gap-1 text-right">
            <span className="text-sm font-medium text-primary break-all">
               {value}
            </span>
            <CopyButton text={value} />
         </div>
      </div>
   );
}

// ─── Payment Panels ───────────────────────────────────────────────────────────

function CodPanel({ onDone }: { onDone: () => void }) {
   return (
      <div className="text-center py-6 space-y-4">
         <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
         </div>
         <div>
            <h3 className="text-base font-semibold text-primary">
               Đặt hàng thành công!
            </h3>
            <p className="text-sm text-neutral-darker mt-1">
               Bạn sẽ thanh toán khi nhận hàng (COD).
            </p>
         </div>
         <button
            onClick={onDone}
            className="w-full bg-accent text-primary-darker font-semibold py-3 rounded-lg hover:bg-accent-dark transition-colors"
         >
            Xem đơn hàng
         </button>
      </div>
   );
}

function BankTransferPanel({
   info,
   onDone,
}: {
   info: Extract<PaymentInfo, { type: "BANK_TRANSFER" }>;
   onDone: () => void;
}) {
   return (
      <div className="space-y-4">
         <div className="flex flex-col items-center gap-3">
            {info.qrCode && (
               <img
                  src={info.qrCode}
                  alt="QR Code"
                  className="w-52 h-52 rounded-lg border border-neutral object-contain"
               />
            )}
            <p className="text-xs text-neutral-darker text-center">
               Quét mã QR để chuyển khoản nhanh
            </p>
         </div>

         <div className="bg-neutral rounded-lg p-3 space-y-0">
            <InfoRow label="Ngân hàng" value={info.bankName} />
            <InfoRow label="Số tài khoản" value={info.accountNumber} />
            <InfoRow label="Chủ tài khoản" value={info.accountName} />
            <InfoRow
               label="Số tiền"
               value={
                  new Intl.NumberFormat("vi-VN").format(info.amount) + " VND"
               }
            />
            <InfoRow label="Nội dung CK" value={info.content} />
         </div>

         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-700">
               ⚠️ Vui lòng ghi đúng nội dung chuyển khoản để đơn hàng được xử lý
               tự động.
            </p>
         </div>

         <button
            onClick={onDone}
            className="w-full bg-accent text-primary-darker font-semibold py-3 rounded-lg hover:bg-accent-dark transition-colors"
         >
            Tôi đã chuyển khoản
         </button>
      </div>
   );
}

function RedirectPanel({
   title,
   subtitle,
   buttonLabel,
   buttonColor,
   paymentUrl,
   onDone,
}: {
   title: string;
   subtitle: string;
   buttonLabel: string;
   buttonColor: string;
   paymentUrl: string;
   onDone: () => void;
}) {
   const handlePay = () => {
      window.open(paymentUrl, "_blank", "noopener,noreferrer");
   };

   return (
      <div className="text-center space-y-5 py-4">
         <div>
            <h3 className="text-base font-semibold text-primary">{title}</h3>
            <p className="text-sm text-neutral-darker mt-1">{subtitle}</p>
         </div>

         <button
            onClick={handlePay}
            className="w-full text-white font-semibold py-3 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonColor }}
         >
            {buttonLabel}
         </button>

         <button
            onClick={onDone}
            className="w-full border border-neutral text-neutral-darker text-sm py-2.5 rounded-lg hover:bg-neutral transition-colors"
         >
            Tôi đã thanh toán
         </button>
      </div>
   );
}

function StripePanel({
   info,
   onDone,
}: {
   info: Extract<PaymentInfo, { type: "STRIPE" }>;
   onDone: () => void;
}) {
   const mountedRef = useRef(false);
   const [stripeError, setStripeError] = useState("");
   const [isConfirming, setIsConfirming] = useState(false);
   const stripeRef = useRef<any>(null);
   const elementsRef = useRef<any>(null);

   useEffect(() => {
      if (mountedRef.current) return;
      mountedRef.current = true;

      const init = async () => {
         // Load Stripe.js dynamically if not already present
         if (!(window as any).Stripe) {
            await new Promise<void>((resolve, reject) => {
               const s = document.createElement("script");
               s.src = "https://js.stripe.com/v3/";
               s.onload = () => resolve();
               s.onerror = () => reject(new Error("Failed to load Stripe.js"));
               document.head.appendChild(s);
            });
         }

         const stripe = (window as any).Stripe(info.publishableKey);
         stripeRef.current = stripe;

         const elements = stripe.elements({ clientSecret: info.clientSecret });
         elementsRef.current = elements;

         const paymentElement = elements.create("payment");
         paymentElement.mount("#stripe-payment-element");
      };

      init().catch((err) => setStripeError(err.message));
   }, [info.clientSecret, info.publishableKey]);

   const handleConfirm = async () => {
      if (!stripeRef.current || !elementsRef.current) return;
      setIsConfirming(true);
      setStripeError("");

      const { error } = await stripeRef.current.confirmPayment({
         elements: elementsRef.current,
         confirmParams: {
            return_url: `${window.location.origin}/thanks`,
         },
      });

      if (error) {
         setStripeError(error.message ?? "Có lỗi xảy ra");
         setIsConfirming(false);
      }
      // On success → Stripe auto redirects
   };

   return (
      <div className="space-y-4">
         <div>
            <h3 className="text-base font-semibold text-primary">
               Thanh toán thẻ (Stripe)
            </h3>
            <p className="text-sm text-neutral-darker mt-0.5">
               Nhập thông tin thẻ bên dưới
            </p>
         </div>

         <div id="stripe-payment-element" className="min-h-[120px]" />

         {stripeError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
               {stripeError}
            </p>
         )}

         <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full bg-[#635bff] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
         >
            {isConfirming ? "Đang xử lý..." : "Thanh toán"}
         </button>
      </div>
   );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function PaymentResultModal({
   isOpen,
   paymentInfo,
   onClose,
   onDone,
}: PaymentResultModalProps) {
   if (!isOpen || !paymentInfo) return null;

   const REDIRECT_CONFIGS = {
      MOMO: {
         title: "Thanh toán qua MoMo",
         subtitle: "Nhấn nút bên dưới để chuyển sang ứng dụng MoMo",
         buttonLabel: "Thanh toán với MoMo",
         buttonColor: "#ae2070",
      },
      VNPAY: {
         title: "Thanh toán qua VNPay",
         subtitle: "Bạn sẽ được chuyển đến cổng thanh toán VNPay",
         buttonLabel: "Thanh toán với VNPay",
         buttonColor: "#0066cc",
      },
      ZALOPAY: {
         title: "Thanh toán qua ZaloPay",
         subtitle: "Bạn sẽ được chuyển đến cổng thanh toán ZaloPay",
         buttonLabel: "Thanh toán với ZaloPay",
         buttonColor: "#0068ff",
      },
   };

   const renderContent = () => {
      switch (paymentInfo.type) {
         case "COD":
            return <CodPanel onDone={onDone} />;

         case "BANK_TRANSFER":
            return <BankTransferPanel info={paymentInfo} onDone={onDone} />;

         case "MOMO":
            return (
               <RedirectPanel
                  {...REDIRECT_CONFIGS.MOMO}
                  paymentUrl={paymentInfo.paymentUrl}
                  onDone={onDone}
               />
            );

         case "VNPAY":
            return (
               <RedirectPanel
                  {...REDIRECT_CONFIGS.VNPAY}
                  paymentUrl={paymentInfo.paymentUrl}
                  onDone={onDone}
               />
            );

         case "ZALOPAY":
            return (
               <RedirectPanel
                  {...REDIRECT_CONFIGS.ZALOPAY}
                  paymentUrl={paymentInfo.paymentUrl}
                  onDone={onDone}
               />
            );

         case "STRIPE":
            return <StripePanel info={paymentInfo} onDone={onDone} />;

         default:
            return null;
      }
   };

   // Không cho đóng modal với MoMo/VNPay/ZaloPay/Stripe khi đang xử lý
   const canClose =
      paymentInfo.type === "COD" || paymentInfo.type === "BANK_TRANSFER";

   return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-black/50"
            onClick={canClose ? onClose : undefined}
         />

         {/* Panel */}
         <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90dvh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between px-4 py-3 border-b border-neutral z-10">
               <h2 className="text-sm font-semibold text-primary">
                  Hoàn tất thanh toán
               </h2>
               {canClose && (
                  <button
                     onClick={onClose}
                     className="p-1.5 rounded-full hover:bg-neutral transition-colors"
                  >
                     <X className="w-4 h-4 text-neutral-darker" />
                  </button>
               )}
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5">{renderContent()}</div>
         </div>
      </div>
   );
}
