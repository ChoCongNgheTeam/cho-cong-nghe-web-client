"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, Package, ExternalLink, Landmark, Clock } from "lucide-react";
import { Order } from "../../type/order";
import { orderStatusConfig, paymentStatusConfig, REDIRECT_PAYMENT_METHODS, BANK_TRANSFER_METHODS } from "./Constants";
import { formatDate, formatVND } from "@/helpers";

function getFirstValidImage(imgs: { imageUrl: string | null }[] | undefined): string {
  if (!imgs) return "";
  return imgs.find((i) => i.imageUrl !== null)?.imageUrl ?? "";
}

export default function OrderDetailModal({ order }: { order: Order }) {
  const router = useRouter();

  const orderStatus = orderStatusConfig[order.orderStatus] ?? {
    label: order.orderStatus,
    color: "text-neutral-darker",
    bgColor: "bg-neutral",
    dot: "bg-neutral-dark",
  };
  const paymentStatus = paymentStatusConfig[order.paymentStatus] ?? {
    label: order.paymentStatus,
    color: "text-neutral-darker",
    bgColor: "bg-neutral",
  };

  const methodUpper = (order.paymentMethod?.name ?? "").toUpperCase().replace(/\s+/g, "_");
  const isBankTransfer = BANK_TRANSFER_METHODS.some((m) => methodUpper.includes(m.replace(/\s+/g, "_")));
  const isRedirect = REDIRECT_PAYMENT_METHODS.some((m) => methodUpper.includes(m));
  const needsPayment = order.paymentStatus === "UNPAID";

  const subtotal = Number(order.subtotalAmount);
  const shipping = Number(order.shippingFee);
  const voucher = Number(order.voucherDiscount);
  const total = Number(order.totalAmount);
  const tax = Math.max(0, total - subtotal - shipping + voucher);

  return (
    <div className="max-h-[82vh] sm:max-h-[78vh] overflow-y-auto custom-scroll">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 bg-neutral-light px-4 sm:px-6 pt-4 sm:pt-5 pb-2.5 sm:pb-3 border-b border-neutral z-10">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-primary">Chi tiết đơn hàng</h2>
            <p className="text-[11px] sm:text-xs text-neutral-darker mt-0.5">#{order.orderCode}</p>
          </div>
          {/* Badges — wrap on small screens */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end max-w-[55%]">
            <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${orderStatus.color} ${orderStatus.bgColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${orderStatus.dot}`} />
              {orderStatus.label}
            </span>
            <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${paymentStatus.color} ${paymentStatus.bgColor}`}>
              {paymentStatus.label}
            </span>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-6 pb-5 sm:pb-6 space-y-4 sm:space-y-5 mt-3 sm:mt-4">
        {/* ── Payment Action Banner ── */}
        {needsPayment && (isBankTransfer || (isRedirect && order.paymentRedirectUrl)) && (
          <div className="rounded-xl border p-3 sm:p-4 flex flex-col gap-3" style={{ borderColor: "rgb(180 83 9 / 0.3)", background: "rgb(180 83 9 / 0.08)" }}>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "rgb(180 83 9)" }} />
              <div>
                <p className="text-xs sm:text-sm font-semibold" style={{ color: "rgb(180 83 9)" }}>
                  Đơn hàng chưa được thanh toán
                </p>
                {order.paymentExpiredAt && (
                  <p className="text-[11px] sm:text-xs mt-0.5" style={{ color: "rgb(180 83 9 / 0.8)" }}>
                    Hết hạn: {formatDate(order.paymentExpiredAt, { withTime: true })}
                  </p>
                )}
              </div>
            </div>
            {/* Button full-width on mobile */}
            {isBankTransfer ? (
              <button
                onClick={() => router.push(`/order/${order.orderCode}/payment`)}
                className="w-full sm:w-auto sm:self-start flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-neutral-light text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <Landmark className="w-3.5 h-3.5" />
                Xem thông tin chuyển khoản
              </button>
            ) : (
              <button
                onClick={() => window.open(order.paymentRedirectUrl!, "_blank", "noopener,noreferrer")}
                className="w-full sm:w-auto sm:self-start flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-neutral-light text-xs font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Thanh toán ngay
              </button>
            )}
          </div>
        )}

        {/* ── Order Info Grid ── */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-neutral-light-active rounded-xl p-2.5 sm:p-3.5">
            <p className="text-[10px] sm:text-xs text-neutral-darker mb-0.5 sm:mb-1">Ngày đặt hàng</p>
            <p className="font-semibold text-primary text-[10px] sm:text-xs leading-relaxed">{formatDate(order.orderDate, { withTime: true })}</p>
          </div>
          <div className="bg-neutral-light-active rounded-xl p-2.5 sm:p-3.5">
            <p className="text-[10px] sm:text-xs text-neutral-darker mb-0.5 sm:mb-1">Phương thức TT</p>
            <p className="font-semibold text-primary text-[10px] sm:text-xs leading-relaxed">{order.paymentMethod.description}</p>
          </div>
        </div>

        {/* ── Shipping Address ── */}
        <div>
          <p className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-promotion shrink-0" />
            Địa chỉ giao hàng
          </p>
          <div className="bg-neutral-light-active rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
            {/* Name + phone: inline on sm+, stack on mobile */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-0.5">
              <p className="text-xs sm:text-sm font-semibold text-primary">{order.shippingContactName}</p>
              <span className="hidden xs:inline text-neutral-darker text-xs">•</span>
              <p className="text-xs text-neutral-darker">{order.shippingPhone}</p>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-darker leading-relaxed">{[order.shippingDetail, order.shippingWard, order.shippingProvince].filter(Boolean).join(", ")}</p>
          </div>
        </div>

        {/* ── Products ── */}
        <div>
          <p className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-promotion shrink-0" />
            Sản phẩm ({order.orderItems.length})
          </p>
          <div className="rounded-xl border border-neutral overflow-hidden divide-y divide-neutral">
            {order.orderItems.map((item) => {
              const imageUrl = item.image ?? getFirstValidImage(item.productVariant?.product?.img);
              const attrs = item.productVariant?.variantAttributes?.map((a) => a.attributeOption.value).join(" · ");

              return (
                <div key={item.id} className="flex gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-light">
                  {/* Image */}
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-lg bg-neutral overflow-hidden">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={item.productVariant?.product?.name ?? ""} fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-light-active flex items-center justify-center text-neutral-darker text-[10px]">N/A</div>
                    )}
                  </div>

                  {/* Info + price */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-primary line-clamp-2">{item.productVariant?.product?.name}</p>
                      {attrs && <p className="text-[10px] sm:text-xs text-neutral-darker mt-0.5 line-clamp-1">{attrs}</p>}
                      <p className="text-[10px] sm:text-xs text-neutral-darker mt-0.5">x{item.quantity}</p>
                    </div>
                  </div>

                  {/* Price - right aligned, shrink-0 */}
                  <p className="text-xs sm:text-sm font-semibold text-primary shrink-0 self-start pt-0.5">{formatVND(Number(item.unitPrice))}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Breakdown */}
        <div>
          <p className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-promotion shrink-0" />
            Thanh toán
          </p>
          <div className="bg-neutral-light-active rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 space-y-1.5 sm:space-y-2">
            <div className="flex justify-between text-[11px] sm:text-sm text-neutral-darker">
              <span>Tạm tính</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[11px] sm:text-sm text-neutral-darker">
              <span>Phí vận chuyển</span>
              <span>{shipping === 0 ? <span className="text-green-600">Miễn phí</span> : formatVND(shipping)}</span>
            </div>
            {voucher > 0 && (
              <div className="flex justify-between text-[11px] sm:text-sm text-green-700">
                <span>Giảm giá voucher</span>
                <span>-{formatVND(voucher)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-[11px] sm:text-sm text-neutral-darker">
                <span>Thuế VAT (10%)</span>
                <span>{formatVND(tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-primary border-t border-neutral pt-2 mt-1">
              <span className="text-xs sm:text-sm">Tổng cộng</span>
              <span className="text-sm sm:text-base text-promotion">{formatVND(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
