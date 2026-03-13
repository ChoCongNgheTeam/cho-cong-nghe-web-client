"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, ExternalLink, RefreshCcw, Landmark } from "lucide-react";
import { Order } from "../../type/order";
import { orderStatusConfig, paymentStatusConfig, REDIRECT_PAYMENT_METHODS, BANK_TRANSFER_METHODS } from "./Constants";
import CancelOrderButton from "./CancelOrderButton";
import ReorderButton from "./ReorderButton";
import Link from "next/link";

interface OrderCardProps {
  order: Order;
  onViewDetail: () => void;
  onCancelSuccess: () => void;
  onReorderSuccess: () => void;
  onBeforeNavigate: () => Promise<void> | void;
}

// Lấy ảnh đầu tiên khác null trong mảng img
function getFirstValidImage(imgs: { imageUrl: string | null }[] | undefined): string {
  if (!imgs) return "";
  return imgs.find((i) => i.imageUrl !== null)?.imageUrl ?? "";
}

// Xác định nút thanh toán lại dựa vào method + status
function getPaymentAction(order: Order): { type: "bank" | "redirect" | null; url?: string } {
  if (order.paymentStatus === "PAID") return { type: null };

  const methodUpper = (order.paymentMethod?.name ?? "").toUpperCase().replace(/\s+/g, "_");

  if (BANK_TRANSFER_METHODS.some((m) => methodUpper.includes(m.replace(/\s+/g, "_")))) {
    return { type: "bank" };
  }
  if (REDIRECT_PAYMENT_METHODS.some((m) => methodUpper.includes(m))) {
    return { type: "redirect", url: order.paymentRedirectUrl ?? undefined };
  }
  return { type: null };
}

export default function OrderCard({ order, onViewDetail, onCancelSuccess, onReorderSuccess, onBeforeNavigate }: OrderCardProps) {
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

  const showReorder = ["DELIVERED", "CANCELLED"].includes(order.orderStatus);
  const showCancel = ["PENDING", "PROCESSING"].includes(order.orderStatus);
  const paymentAction = getPaymentAction(order);

  const handlePaymentAction = () => {
    if (paymentAction.type === "bank") {
      router.push(`/order/${order.orderCode}/payment`);
    } else if (paymentAction.type === "redirect" && paymentAction.url) {
      window.open(paymentAction.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-5 py-3 bg-neutral-light border-b border-neutral">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-semibold text-sm text-primary">#{order.orderCode}</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${orderStatus.color} ${orderStatus.bgColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${orderStatus.dot}`} />
            {orderStatus.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-darker">
          <span>{new Date(order.orderDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
          <span className="text-neutral">•</span>
          <span>{order.paymentMethod.description}</span>
          <span className="text-neutral">•</span>
          <span>{order.orderItems.length} sản phẩm</span>
          <span className="text-neutral">•</span>
          {/* Payment status badge */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatus.color} ${paymentStatus.bgColor}`}>{paymentStatus.label}</span>
        </div>

        {/* Cảnh báo chưa thanh toán với deadline */}
        {order.paymentStatus === "UNPAID" && order.paymentExpiredAt && paymentAction.type !== null && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-200">
            <RefreshCcw className="w-3 h-3 shrink-0" />
            <span>
              Hết hạn thanh toán: <span className="font-semibold">{new Date(order.paymentExpiredAt).toLocaleString("vi-VN")}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Product List ────────────────────────────────────────────────────── */}
      <div className="divide-y divide-neutral">
        {order.orderItems.slice(0, 2).map((item) => {
          const imageUrl = item.image ?? getFirstValidImage(item.productVariant?.product?.img);
          const attrs = item.productVariant?.variantAttributes?.map((a) => a.attributeOption.value).join(" · ");

          const productSlug = item.productVariant?.product?.slug;

          return (
            <Link key={item.id} href={productSlug ? `/products/${productSlug}` : "#"} className="flex gap-3 px-5 py-3.5 hover:bg-neutral-light transition-colors">
              <div className="relative w-14 h-14 shrink-0 rounded-lg bg-neutral overflow-hidden">
                {imageUrl ? (
                  <Image src={imageUrl} alt={item.productVariant?.product?.name ?? ""} fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-light flex items-center justify-center text-neutral-darker text-xs">N/A</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary line-clamp-1">{item.productVariant?.product?.name}</p>

                {attrs && <p className="text-xs text-neutral-darker mt-0.5">{attrs}</p>}
                <p className="text-xs text-neutral-darker mt-0.5">x{item.quantity}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-primary">{Number(item.unitPrice).toLocaleString("vi-VN")}₫</p>
                {Number(item.productVariant?.price) > Number(item.unitPrice) && (
                  <p className="text-xs line-through text-neutral-darker">{Number(item.productVariant?.price).toLocaleString("vi-VN")}₫</p>
                )}
              </div>
            </Link>
          );
        })}

        {/* Collapsed items indicator */}
        {order.orderItems.length > 2 && <div className="px-5 py-2 text-xs text-neutral-darker text-center bg-neutral-light">+{order.orderItems.length - 2} sản phẩm khác</div>}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 bg-neutral-light border-t border-neutral">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Bên trái: các nút hành động + Xem chi tiết */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Xem chi tiết - luôn hiển thị */}
            <button
              onClick={onViewDetail}
              className="h-9 flex items-center gap-1.5 px-4 rounded-lg text-sm font-medium
                         border border-neutral hover:border-neutral-dark hover:bg-neutral
                         text-neutral-darker hover:text-primary transition-colors cursor-pointer"
            >
              Xem chi tiết
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Mua lại */}
            {showReorder && (
              <ReorderButton
                orderId={order.id}
                onReorderSuccess={onReorderSuccess}
                onBeforeNavigate={onBeforeNavigate}
                // Nếu ReorderButton hiện tại chưa có className prop, bạn có thể wrap hoặc chỉnh sửa component đó
              />
            )}

            {/* Hủy đơn */}
            {showCancel && (
              <CancelOrderButton
                orderId={order.id}
                onCancelSuccess={onCancelSuccess}
                // Tương tự, đảm bảo CancelOrderButton dùng style thống nhất
              />
            )}

            {/* Quay lại thanh toán — Bank Transfer */}
            {paymentAction.type === "bank" && (
              <button
                onClick={handlePaymentAction}
                className="h-9 flex items-center gap-1.5 px-4 rounded-lg text-sm font-medium
                           bg-primary text-white hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <Landmark className="w-4 h-4" />
                Xem thông tin CK
              </button>
            )}

            {/* Thanh toán ngay — Momo/VNPay/ZaloPay */}
            {paymentAction.type === "redirect" && paymentAction.url && (
              <button
                onClick={handlePaymentAction}
                className="h-9 flex items-center gap-1.5 px-4 rounded-lg text-sm font-medium
                           bg-accent text-primary-darker hover:bg-accent-dark transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Thanh toán ngay
              </button>
            )}
          </div>

          {/* Bên phải: Tổng tiền */}
          <div className="text-right sm:text-right">
            <span className="text-xs text-neutral-darker">Tổng: </span>
            <span className="text-base font-bold text-primary">{Number(order.totalAmount).toLocaleString("vi-VN")}₫</span>
          </div>
        </div>
      </div>
    </div>
  );
}
