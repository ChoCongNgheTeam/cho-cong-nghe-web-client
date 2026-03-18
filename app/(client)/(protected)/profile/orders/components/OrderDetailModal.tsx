"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, Package, ExternalLink, Landmark, Clock } from "lucide-react";
import { Order } from "../../type/order";
import { orderStatusConfig, paymentStatusConfig, REDIRECT_PAYMENT_METHODS, BANK_TRANSFER_METHODS } from "./Constants";

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
    <div className="max-h-[78vh] overflow-y-auto custom-scroll">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 bg-white px-6 pt-5 pb-3 border-b border-neutral z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-primary">Chi tiết đơn hàng</h2>
            <p className="text-xs text-neutral-darker mt-0.5">#{order.orderCode}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${orderStatus.color} ${orderStatus.bgColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${orderStatus.dot}`} />
              {orderStatus.label}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${paymentStatus.color} ${paymentStatus.bgColor}`}>{paymentStatus.label}</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-5 mt-4">
        {/* ── Payment Action Banner ───────────────────────────────────────── */}
        {needsPayment && (isBankTransfer || (isRedirect && order.paymentRedirectUrl)) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Đơn hàng chưa được thanh toán</p>
                {order.paymentExpiredAt && <p className="text-xs text-amber-700 mt-0.5">Hết hạn: {new Date(order.paymentExpiredAt).toLocaleString("vi-VN")}</p>}
              </div>
            </div>
            {isBankTransfer ? (
              <button
                onClick={() => router.push(`/order/${order.orderCode}/payment`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors shrink-0 cursor-pointer"
              >
                <Landmark className="w-3.5 h-3.5" />
                Xem thông tin CK
              </button>
            ) : (
              <button
                onClick={() => window.open(order.paymentRedirectUrl!, "_blank", "noopener,noreferrer")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-dark transition-colors shrink-0 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Thanh toán ngay
              </button>
            )}
          </div>
        )}

        {/* ── Order Info ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-neutral-light rounded-xl p-3.5">
            <p className="text-xs text-neutral-darker mb-1">Ngày đặt hàng</p>
            <p className="font-semibold text-primary text-xs">{new Date(order.orderDate).toLocaleString("vi-VN")}</p>
          </div>
          <div className="bg-neutral-light rounded-xl p-3.5">
            <p className="text-xs text-neutral-darker mb-1">Phương thức TT</p>
            <p className="font-semibold text-primary text-xs">{order.paymentMethod.description}</p>
          </div>
        </div>

        {/* ── Shipping Address ────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-2">
            <MapPin className="w-4 h-4 text-promotion shrink-0" />
            Địa chỉ giao hàng
          </p>
          <div className="bg-neutral-light rounded-xl px-4 py-3 text-sm text-neutral-darker">
            <p className="font-semibold text-primary text-sm">
              {order.shippingContactName}
              <span className="font-normal text-neutral-darker mx-1.5">•</span>
              {order.shippingPhone}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed">{[order.shippingDetail, order.shippingWard, order.shippingProvince].filter(Boolean).join(", ")}</p>
          </div>
        </div>

        {/* ── Products ────────────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-2">
            <Package className="w-4 h-4 text-promotion shrink-0" />
            Sản phẩm ({order.orderItems.length})
          </p>
          <div className="rounded-xl border border-neutral overflow-hidden divide-y divide-neutral">
            {order.orderItems.map((item) => {
              const imageUrl = item.image ?? getFirstValidImage(item.productVariant?.product?.img);
              const attrs = item.productVariant?.variantAttributes?.map((a) => a.attributeOption.value).join(" · ");

              return (
                <div key={item.id} className="flex gap-3 px-4 py-3 bg-white">
                  <div className="relative w-12 h-12 shrink-0 rounded-lg bg-neutral overflow-hidden">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={item.productVariant?.product?.name ?? ""} fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-light flex items-center justify-center text-neutral-darker text-xs">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary line-clamp-2">{item.productVariant?.product?.name}</p>
                    {attrs && <p className="text-xs text-neutral-darker mt-0.5">{attrs}</p>}
                    <p className="text-xs text-neutral-darker mt-0.5">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary shrink-0">{Number(item.unitPrice).toLocaleString("vi-VN")}₫</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Price Breakdown ─────────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-2">
            <CreditCard className="w-4 h-4 text-promotion shrink-0" />
            Thanh toán
          </p>
          <div className="bg-neutral-light rounded-xl px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between text-neutral-darker">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="flex justify-between text-neutral-darker">
              <span>Phí vận chuyển</span>
              <span>{shipping === 0 ? <span className="text-green-600">Miễn phí</span> : `${shipping.toLocaleString("vi-VN")}₫`}</span>
            </div>
            {voucher > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Giảm giá voucher</span>
                <span>-{voucher.toLocaleString("vi-VN")}₫</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-neutral-darker">
                <span>Thuế VAT (10%)</span>
                <span>{tax.toLocaleString("vi-VN")}₫</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-primary border-t border-neutral pt-2 mt-1">
              <span>Tổng cộng</span>
              <span className="text-base text-promotion">{total.toLocaleString("vi-VN")}₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
