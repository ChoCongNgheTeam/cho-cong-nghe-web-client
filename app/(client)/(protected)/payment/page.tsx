"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
   CheckCircle2,
   Copy,
   ArrowLeft,
   ExternalLink,
   Package,
   ShoppingBag,
} from "lucide-react";
import apiRequest from "@/lib/api";

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

interface VariantAttribute {
   attributeOption: {
      value: string;
      attribute: { name: string };
   };
}

interface ProductImage {
   imageUrl: string;
   color: string;
}

interface OrderItem {
   id: string;
   quantity: number;
   unitPrice: string;
   productVariant: {
      id: string;
      code: string;
      price: string;
      product: {
         id: string;
         name: string;
         slug: string;
         img: ProductImage[];
      };
      variantAttributes: VariantAttribute[];
   };
}

interface OrderDetail {
   id: string;
   orderCode: string;
   orderStatus: string;
   paymentStatus: string;
   orderDate: string;
   subtotalAmount: string;
   shippingFee: string;
   voucherDiscount: string;
   totalAmount: string;
   shippingContactName: string;
   shippingPhone: string;
   shippingProvince: string;
   shippingWard: string;
   shippingDetail: string;
   paymentMethod: { name: string; description: string };
   orderItems: OrderItem[];
}

interface OrderDetailResponse {
   data: OrderDetail;
   message: string;
}

interface StripeElements {
   create(type: string): { mount(selector: string): void };
}

interface StripeInstance {
   elements(options: { clientSecret: string }): StripeElements;
   confirmPayment(options: {
      elements: StripeElements;
      confirmParams: { return_url: string };
   }): Promise<{ error?: { message?: string } }>;
}

interface WindowWithStripe extends Window {
   Stripe?: (key: string) => StripeInstance;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtVND = (v: string | number) =>
   new Intl.NumberFormat("vi-VN").format(Number(v)) + "₫";

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
   const [copied, setCopied] = useState(false);
   return (
      <button
         onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
         }}
         className="ml-2 p-1.5 rounded-md hover:bg-neutral-light-active transition-colors shrink-0"
         title="Sao chép"
      >
         {copied ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
         ) : (
            <Copy className="w-4 h-4 text-neutral-dark" />
         )}
      </button>
   );
}

// ─── Order Info Card ──────────────────────────────────────────────────────────

function OrderInfoCard({ order }: { order: OrderDetail }) {
   return (
      <div className="border border-neutral rounded-xl overflow-hidden">
         {/* Header */}
         <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-neutral-light-active border-b border-neutral">
            <div className="flex items-center gap-2">
               <ShoppingBag size={14} className="text-accent" />
               <span className="text-sm font-semibold text-primary">
                  Mã đơn: <span className="text-accent">{order.orderCode}</span>
               </span>
            </div>
            <span className="text-xs text-neutral-darker">
               {new Date(order.orderDate).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
               })}
            </span>
         </div>

         {/* Items */}
         <div className="divide-y divide-neutral">
            {order.orderItems.map((item) => {
               const product = item.productVariant.product;
               const img = product.img?.[0]?.imageUrl;
               const attrs = item.productVariant.variantAttributes;

               return (
                  <div
                     key={item.id}
                     className="flex items-center gap-3 px-4 py-3"
                  >
                     <div className="w-14 h-14 rounded-lg border border-neutral bg-neutral-light-active shrink-0 overflow-hidden">
                        {img ? (
                           <img
                              src={img}
                              alt={product.name}
                              className="w-full h-full object-cover"
                           />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center">
                              <Package
                                 size={18}
                                 className="text-neutral-dark"
                              />
                           </div>
                        )}
                     </div>

                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                           {product.name}
                        </p>
                        {attrs.length > 0 && (
                           <p className="text-xs text-neutral-darker mt-0.5">
                              {attrs
                                 .map((a) => a.attributeOption.value)
                                 .join(" · ")}
                           </p>
                        )}
                        <p className="text-xs text-neutral-dark mt-0.5">
                           SL: {item.quantity}
                        </p>
                     </div>

                     <p className="text-sm font-semibold text-primary shrink-0">
                        {fmtVND(Number(item.unitPrice) * item.quantity)}
                     </p>
                  </div>
               );
            })}
         </div>

         {/* Totals */}
         <div className="px-4 py-3 border-t border-neutral bg-neutral-light-active space-y-1.5">
            <div className="flex justify-between text-sm text-neutral-darker">
               <span>Tạm tính</span>
               <span>{fmtVND(order.subtotalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-darker">
               <span>Phí vận chuyển</span>
               <span
                  className={
                     Number(order.shippingFee) === 0
                        ? "text-green-600 font-medium"
                        : ""
                  }
               >
                  {Number(order.shippingFee) === 0
                     ? "Miễn phí"
                     : fmtVND(order.shippingFee)}
               </span>
            </div>
            {Number(order.voucherDiscount) > 0 && (
               <div className="flex justify-between text-sm text-neutral-darker">
                  <span>Giảm giá</span>
                  <span className="text-promotion font-medium">
                     -{fmtVND(order.voucherDiscount)}
                  </span>
               </div>
            )}
            <div className="flex justify-between text-base font-bold text-primary pt-1.5 border-t border-neutral">
               <span>Tổng cộng</span>
               <span className="text-accent">{fmtVND(order.totalAmount)}</span>
            </div>
         </div>

         {/* Shipping info */}
         <div className="px-4 py-3 border-t border-neutral text-xs text-neutral-darker space-y-1">
            <p className="font-medium text-primary text-sm mb-1">
               Địa chỉ giao hàng
            </p>
            <p>
               {order.shippingContactName} · {order.shippingPhone}
            </p>
            <p>
               {order.shippingDetail}, {order.shippingWard},{" "}
               {order.shippingProvince}
            </p>
         </div>
      </div>
   );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrderSkeleton() {
   return (
      <div className="space-y-3 p-4">
         {[1, 2].map((i) => (
            <div
               key={i}
               className="h-16 rounded-lg bg-neutral-light-active animate-pulse"
            />
         ))}
      </div>
   );
}

// ─── Bank Transfer ────────────────────────────────────────────────────────────

function BankTransferSection({
   info,
}: {
   info: Extract<PaymentInfo, { type: "BANK_TRANSFER" }>;
}) {
   const rows = [
      { label: "Ngân hàng", value: info.bankName },
      { label: "Số tài khoản", value: info.accountNumber },
      { label: "Chủ tài khoản", value: info.accountName },
      {
         label: "Số tiền",
         value: new Intl.NumberFormat("vi-VN").format(info.amount) + " VND",
      },
      { label: "Nội dung CK", value: info.content },
   ];

   return (
      <div className="space-y-5">
         <h2 className="text-base font-bold text-primary text-center">
            --- Thông tin chuyển khoản ---
         </h2>

         {info.qrCode && (
            <div className="flex flex-col items-center gap-2">
               <div className="border border-neutral rounded-2xl overflow-hidden shadow-sm p-2 bg-white">
                  <img
                     src={info.qrCode}
                     alt="QR Code thanh toán"
                     className="w-56 h-56 object-contain"
                  />
               </div>
               <p className="text-xs text-neutral-darker">
                  Quét mã QR để chuyển khoản nhanh
               </p>
            </div>
         )}

         <div className="border border-neutral rounded-xl overflow-hidden">
            {rows.map((row, i) => (
               <div
                  key={row.label}
                  className={`flex items-center justify-between px-4 py-3 ${
                     i < rows.length - 1 ? "border-b border-neutral" : ""
                  } ${i % 2 === 0 ? "bg-neutral-light" : "bg-neutral-light-active"}`}
               >
                  <span className="text-sm text-neutral-darker shrink-0 w-36">
                     {row.label}
                  </span>
                  <div className="flex items-center justify-end flex-1">
                     <span className="text-sm font-semibold text-primary text-right break-all">
                        {row.value}
                     </span>
                     <CopyBtn text={row.value} />
                  </div>
               </div>
            ))}
         </div>

         <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-xs text-yellow-700">
               ⚠️ Vui lòng ghi{" "}
               <span className="font-bold">đúng nội dung chuyển khoản</span> để
               đơn hàng được xử lý tự động.
            </p>
         </div>
      </div>
   );
}

// ─── Redirect (MoMo / VNPay / ZaloPay) ───────────────────────────────────────

const REDIRECT_CONFIGS = {
   MOMO: { label: "Thanh toán với MoMo", color: "#ae2070" },
   VNPAY: { label: "Thanh toán với VNPay", color: "#0066cc" },
   ZALOPAY: { label: "Thanh toán với ZaloPay", color: "#0068ff" },
} as const;

function RedirectSection({
   type,
   paymentUrl,
}: {
   type: keyof typeof REDIRECT_CONFIGS;
   paymentUrl: string;
}) {
   const cfg = REDIRECT_CONFIGS[type];
   return (
      <div className="text-center space-y-4">
         <p className="text-sm text-neutral-darker">
            Nhấn nút bên dưới để chuyển sang cổng thanh toán
         </p>
         <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: cfg.color }}
         >
            {cfg.label} <ExternalLink size={15} />
         </a>
         <p className="text-xs text-neutral-dark">
            Sau khi thanh toán xong, quay lại để xem đơn hàng
         </p>
      </div>
   );
}

// ─── Stripe ───────────────────────────────────────────────────────────────────

function StripeSection({
   info,
}: {
   info: Extract<PaymentInfo, { type: "STRIPE" }>;
}) {
   const mountedRef = useRef(false);
   const stripeRef = useRef<StripeInstance | null>(null);
   const elementsRef = useRef<StripeElements | null>(null);
   const [stripeError, setStripeError] = useState("");
   const [isConfirming, setIsConfirming] = useState(false);

   useEffect(() => {
      if (mountedRef.current) return;
      mountedRef.current = true;

      const init = async () => {
         const win = window as WindowWithStripe;
         if (!win.Stripe) {
            await new Promise<void>((res, rej) => {
               const s = document.createElement("script");
               s.src = "https://js.stripe.com/v3/";
               s.onload = () => res();
               s.onerror = () => rej(new Error("Failed to load Stripe.js"));
               document.head.appendChild(s);
            });
         }
         const stripe = (window as WindowWithStripe).Stripe!(
            info.publishableKey,
         );
         stripeRef.current = stripe;
         const elements = stripe.elements({ clientSecret: info.clientSecret });
         elementsRef.current = elements;
         elements.create("payment").mount("#stripe-payment-element");
      };

      init().catch((e: Error) => setStripeError(e.message));
   }, [info.clientSecret, info.publishableKey]);

   const handleConfirm = async () => {
      if (!stripeRef.current || !elementsRef.current) return;
      setIsConfirming(true);
      setStripeError("");
      const { error } = await stripeRef.current.confirmPayment({
         elements: elementsRef.current,
         confirmParams: { return_url: `${window.location.origin}/thanks` },
      });
      if (error) {
         setStripeError(error.message ?? "Có lỗi xảy ra");
         setIsConfirming(false);
      }
   };

   return (
      <div className="space-y-4">
         <p className="text-sm text-neutral-darker">
            Nhập thông tin thẻ bên dưới để hoàn tất thanh toán
         </p>
         <div id="stripe-payment-element" className="min-h-[160px]" />
         {stripeError && (
            <p className="text-sm text-promotion bg-promotion-light border border-promotion-light-active rounded-xl px-4 py-3">
               {stripeError}
            </p>
         )}
         <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full bg-[#635bff] text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
         >
            {isConfirming ? "Đang xử lý..." : "Xác nhận thanh toán"}
         </button>
      </div>
   );
}

// ─── COD ──────────────────────────────────────────────────────────────────────

function CodSection() {
   return (
      <div className="text-center space-y-2 py-2">
         <p className="text-sm text-neutral-darker">
            Bạn sẽ thanh toán khi nhận hàng. Cảm ơn bạn đã đặt hàng!
         </p>
      </div>
   );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentPage() {
   const router = useRouter();

   const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
   const [orderId, setOrderId] = useState("");
   const [orderCode, setOrderCode] = useState("");
   const [order, setOrder] = useState<OrderDetail | null>(null);
   const [loadingOrder, setLoadingOrder] = useState(false);
   const [orderError, setOrderError] = useState(false);

   // Đọc sessionStorage
   useEffect(() => {
      const rawPayment = sessionStorage.getItem("paymentInfo");
      const id = sessionStorage.getItem("pendingOrderId") ?? "";
      const code = sessionStorage.getItem("pendingOrderCode") ?? "";

      if (!rawPayment) {
         router.replace("/");
         return;
      }
      try {
         setPaymentInfo(JSON.parse(rawPayment) as PaymentInfo);
         setOrderId(id);
         setOrderCode(code);
      } catch {
         router.replace("/");
      }
   }, [router]);

   // Fetch order detail
   useEffect(() => {
      if (!orderId) return;
      setLoadingOrder(true);
      setOrderError(false);
      apiRequest
         .get<OrderDetailResponse>(`/orders/my/${orderId}`)
         .then((res) => {
            if (res?.data) setOrder(res.data);
            else setOrderError(true);
         })
         .catch(() => setOrderError(true))
         .finally(() => setLoadingOrder(false));
   }, [orderId]);

   if (!paymentInfo) return null;

   const isCOD = paymentInfo.type === "COD";

   const renderPaymentSection = () => {
      switch (paymentInfo.type) {
         case "COD":
            return <CodSection />;
         case "BANK_TRANSFER":
            return <BankTransferSection info={paymentInfo} />;
         case "MOMO":
            return (
               <RedirectSection
                  type="MOMO"
                  paymentUrl={paymentInfo.paymentUrl}
               />
            );
         case "VNPAY":
            return (
               <RedirectSection
                  type="VNPAY"
                  paymentUrl={paymentInfo.paymentUrl}
               />
            );
         case "ZALOPAY":
            return (
               <RedirectSection
                  type="ZALOPAY"
                  paymentUrl={paymentInfo.paymentUrl}
               />
            );
         case "STRIPE":
            return <StripeSection info={paymentInfo} />;
      }
   };

   return (
      <div className="min-h-screen bg-neutral-light-active">
         <div className="container max-w-xl py-8 px-4 space-y-5">
            {/* ── Success header ── */}
            <div className="bg-neutral-light border border-neutral rounded-2xl p-6 text-center space-y-3">
               <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
               </div>
               <div>
                  <h1 className="text-xl font-bold text-primary">
                     Đặt hàng thành công!
                  </h1>
                  {orderCode && (
                     <p className="text-sm text-neutral-darker mt-1">
                        Mã đơn hàng:{" "}
                        <span className="font-semibold text-accent">
                           {orderCode}
                        </span>
                     </p>
                  )}
               </div>
               {!isCOD && (
                  <p className="text-xs text-neutral-darker">
                     Vui lòng hoàn tất thanh toán để đơn hàng được xử lý
                  </p>
               )}
            </div>

            {/* ── Payment section (ẩn với COD) ── */}
            {!isCOD && (
               <div className="bg-neutral-light border border-neutral rounded-2xl p-5">
                  {renderPaymentSection()}
               </div>
            )}

            {/* ── Order detail ── */}
            <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden">
               <div className="px-4 py-3 border-b border-neutral bg-neutral-light-active">
                  <h2 className="text-sm font-semibold text-primary">
                     Chi tiết đơn hàng
                  </h2>
               </div>

               {loadingOrder ? (
                  <OrderSkeleton />
               ) : order ? (
                  <div className="p-4">
                     <OrderInfoCard order={order} />
                  </div>
               ) : orderError ? (
                  <p className="text-sm text-neutral-darker text-center py-6">
                     Không thể tải thông tin đơn hàng.{" "}
                     <Link
                        href={orderId ? `/orders/${orderId}` : "/orders"}
                        className="text-accent hover:underline"
                     >
                        Xem tại đây
                     </Link>
                  </p>
               ) : null}
            </div>

            <div className="flex items-center justify-between pb-4">
               <Link
                  href="/"
                  className="flex items-center gap-1.5 text-sm text-neutral-darker hover:text-primary transition-colors"
               >
                  <ArrowLeft size={14} /> Tiếp tục mua sắm
               </Link>
               <Link
                  href={orderId ? `/orders/${orderId}` : "/orders"}
                  className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
               >
                  Xem đơn hàng của tôi <ExternalLink size={13} />
               </Link>
            </div>
         </div>
      </div>
   );
}
