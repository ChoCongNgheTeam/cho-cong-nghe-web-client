"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Loader2, Pencil, Ban, MapPin, User, CreditCard, Receipt, RefreshCw, ChevronRight, AlertCircle } from "lucide-react";
import { getOrderById, cancelOrder } from "../_libs/orders";
import { OrderStatusCell, PaymentStatusCell, PaymentBadge, OrderStatusBadge } from "../components";
import { Popzy } from "@/components/Modal";
import { formatDate, formatVND } from "@/helpers";
import type { Order, OrderStatus, PaymentStatus } from "../order.types";
import { useAdminPrefix } from "@/contexts/AdminPrefixContext";

// Chỉ cho hủy ở các trạng thái đầu — SHIPPED trở đi không hủy được
const CANCELLABLE: OrderStatus[] = ["PENDING", "PROCESSING"];

// ─────────────────────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-neutral/50 last:border-0">
      <span className="text-[12px] text-neutral-dark shrink-0">{label}</span>
      <span className="text-[13px] text-primary font-medium text-right">{value}</span>
    </div>
  );
}

function SectionCard({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral bg-neutral-light-active/50">
        <div className="flex items-center gap-2.5">
          <span className="text-accent">{icon}</span>
          <p className="text-[13px] font-semibold text-primary">{title}</p>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const prefix = useAdminPrefix();

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getOrderById(id);
      setOrder(res.data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusChange = useCallback((_: string, s: OrderStatus) => {
    setOrder((p) => (p ? { ...p, orderStatus: s } : p));
  }, []);

  const handlePaymentStatusChange = useCallback((s: PaymentStatus) => {
    setOrder((p) => (p ? { ...p, paymentStatus: s } : p));
  }, []);

  const handleCancelConfirm = async () => {
    if (!order) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelOrder(order.id);
      setOrder((p) => (p ? { ...p, orderStatus: "CANCELLED" } : p));
      setShowCancelModal(false);
    } catch (e: any) {
      setCancelError(e?.message ?? "Không thể hủy đơn hàng");
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );

  if (error || !order)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Package size={40} className="text-neutral-dark opacity-40" />
        <p className="text-sm text-neutral-dark">{error ?? "Không tìm thấy đơn hàng"}</p>
        <button onClick={loadOrder} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
          <RefreshCw size={13} /> Thử lại
        </button>
      </div>
    );

  const canEdit = order.orderStatus === "PENDING" || order.orderStatus === "PROCESSING";
  const canCancel = CANCELLABLE.includes(order.orderStatus as OrderStatus);
  const canUpdatePayment = order.orderStatus === "DELIVERED";

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
        >
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark text-[13px]">/</span>
        <Link href="/admin/orders" className="text-[13px] text-neutral-dark hover:text-accent">
          Đơn hàng
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium">#{order.orderCode}</span>
      </div>

      <div className="space-y-5 px-6 py-4">
        {/* Header */}
        <div className="bg-neutral-light border border-neutral rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[18px] font-bold text-primary">{order.orderCode}</h1>
              <OrderStatusCell orderId={order.id} status={order.orderStatus as OrderStatus} onStatusChange={handleStatusChange} onCancelRequest={() => setShowCancelModal(true)} />
              <PaymentStatusCell orderId={order.id} status={order.paymentStatus as PaymentStatus} onStatusChange={handlePaymentStatusChange} />
            </div>
            <p className="text-[12px] text-neutral-dark mt-1">
              Đặt ngày {formatDate(order.orderDate)} · Cập nhật {formatDate(order.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <OrderStatusBadge status={order.orderStatus as OrderStatus} />
            {canEdit && (
              <Link
                href={`${prefix}/orders/${order.id}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
              >
                <Pencil size={13} /> Chỉnh sửa
              </Link>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-promotion/30 rounded-lg text-[13px] text-promotion hover:bg-promotion-light transition-colors cursor-pointer"
              >
                <Ban size={13} /> Hủy đơn
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* LEFT 2/3 */}
          <div className="col-span-2 space-y-5">
            {/* Products */}
            <SectionCard title={`Sản phẩm (${order.orderItems?.length ?? 0})`} icon={<Package size={15} />}>
              <div className="space-y-1">
                {(order.orderItems ?? []).map((item) => {
                  const imgUrl = (item as any).image ?? item.productVariant?.product?.img?.[0]?.imageUrl ?? null;
                  const attrs = item.productVariant?.variantAttributes?.map((va) => va.attributeOption.value).join(" / ") || "";
                  return (
                    <div key={item.id} className="flex items-center gap-3 py-3 border-b border-neutral/50 last:border-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral bg-neutral-light-active shrink-0">
                        {imgUrl ? <Image src={imgUrl} alt="" width={48} height={48} className="object-contain w-full h-full" unoptimized /> : <Package size={16} className="text-neutral-dark m-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/admin/products/${item.productVariant?.product?.id}`} className="text-[13px] font-semibold text-primary hover:text-accent line-clamp-1">
                          {item.productVariant?.product?.name}
                        </Link>
                        <p className="text-[12px] text-neutral-dark mt-0.5">
                          {attrs}
                          {item.productVariant?.code && <span className="font-mono"> · {item.productVariant.code}</span>}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-semibold text-primary">{formatVND(Number(item.unitPrice))}</p>
                        <p className="text-[12px] text-primary font-medium">× {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0 w-24">
                        <p className="font-bold text-promotion">{formatVND(Number(item.unitPrice) * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="mt-3 pt-3 border-t border-neutral space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-neutral-dark">Tạm tính</span>
                  <span className="font-medium text-primary">{formatVND(Number(order.subtotalAmount))}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-neutral-dark">Phí vận chuyển</span>
                  <span>{Number(order.shippingFee) > 0 ? formatVND(Number(order.shippingFee)) : <span className="text-emerald-600 font-medium">Miễn phí</span>}</span>
                </div>
                {Number(order.voucherDiscount) > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-dark">Giảm voucher</span>
                    <span className="text-emerald-600 font-medium">- {formatVND(Number(order.voucherDiscount))}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-neutral">
                  <span className="text-[15px] font-bold text-primary">Tổng cộng</span>
                  <span className="text-[17px] font-bold text-promotion">{formatVND(Number(order.totalAmount))}</span>
                </div>
              </div>
            </SectionCard>

            {/* Shipping address */}
            <SectionCard
              title="Địa chỉ giao hàng"
              icon={<MapPin size={15} />}
              action={
                canEdit ? (
                  <Link href={`/admin/orders/${order.id}/edit`} className="flex items-center gap-1 text-[12px] text-accent hover:underline cursor-pointer">
                    <Pencil size={11} /> Sửa địa chỉ
                  </Link>
                ) : undefined
              }
            >
              <div className="space-y-1.5">
                <p className="text-[14px] font-semibold text-primary">{order.shippingContactName}</p>
                <p className="text-[13px] text-neutral-dark">{order.shippingPhone}</p>
                <p className="text-[13px] text-primary">{order.shippingDetail}</p>
                <p className="text-[13px] text-neutral-dark">
                  {order.shippingWard}, {order.shippingProvince}
                </p>
              </div>
            </SectionCard>
          </div>

          {/* RIGHT 1/3 */}
          <div className="space-y-5">
            {/* Customer */}
            <SectionCard title="Khách hàng" icon={<User size={15} />}>
              <InfoRow label="Tên" value={order.user?.fullName ?? "—"} />
              <InfoRow label="Email" value={order.user?.email ?? "—"} />
              <InfoRow label="SĐT" value={order.user?.phone ?? "—"} />
              <div className="pt-2">
                <Link href={`/admin/users/${order.userId}`} className="flex items-center gap-1 text-[12px] text-accent hover:underline cursor-pointer">
                  Xem hồ sơ <ChevronRight size={11} />
                </Link>
              </div>
            </SectionCard>

            {/* Payment */}
            <SectionCard title="Thanh toán" icon={<CreditCard size={15} />}>
              <InfoRow label="Phương thức" value={order.paymentMethod?.name ?? "—"} />
              <InfoRow
                label="Trạng thái"
                value={
                  canUpdatePayment ? (
                    <PaymentStatusCell orderId={order.id} status={order.paymentStatus as PaymentStatus} onStatusChange={handlePaymentStatusChange} />
                  ) : (
                    <PaymentBadge status={order.paymentStatus as PaymentStatus} />
                  )
                }
              />
              {/* Banner nhắc nhở — chỉ render khi REFUND_PENDING và không canUpdatePayment */}
              {order.paymentStatus === "REFUND_PENDING" && !canUpdatePayment && (
                <div className="mt-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                  <p className="text-[12px] text-amber-800 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    Cần xác nhận hoàn tiền thủ công
                  </p>
                  <PaymentStatusCell orderId={order.id} status={order.paymentStatus as PaymentStatus} onStatusChange={handlePaymentStatusChange} />
                </div>
              )}
              {order.voucher && <InfoRow label="Voucher" value={<span className="font-mono text-emerald-600">{order.voucher.code}</span>} />}
            </SectionCard>

            {/* Order info */}
            <SectionCard title="Thông tin đơn" icon={<Receipt size={15} />}>
              <InfoRow label="Mã đơn" value={<span className="font-mono text-accent">{order.orderCode}</span>} />
              <InfoRow label="Ngày đặt" value={formatDate(order.orderDate)} />
              <InfoRow label="Cập nhật" value={formatDate(order.updatedAt)} />
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Popzy
        isOpen={showCancelModal}
        onClose={() => !cancelling && setShowCancelModal(false)}
        closeMethods={cancelling ? [] : ["button", "overlay", "escape"]}
        footer
        content={
          <div className="flex flex-col gap-3 pt-1">
            <div className="w-11 h-11 rounded-full bg-promotion-light flex items-center justify-center">
              <Ban size={20} className="text-promotion" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-primary mb-1">Hủy đơn {order.orderCode}?</h3>
              <p className="text-[13px] text-neutral-dark leading-relaxed">Đơn hàng sẽ bị hủy và tồn kho sẽ được hoàn lại. Hành động này không thể hoàn tác.</p>
            </div>
            {cancelError && <p className="text-[12px] text-promotion px-3 py-2 rounded-lg bg-promotion-light">{cancelError}</p>}
          </div>
        }
        footerButtons={[
          {
            title: "Không, giữ lại",
            className: "px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer",
            onClick: () => setShowCancelModal(false),
          },
          {
            title: cancelling ? "Đang hủy..." : "Xác nhận hủy",
            className: "px-4 py-2 rounded-lg bg-promotion text-white text-[13px] font-medium hover:opacity-90 cursor-pointer disabled:opacity-50",
            onClick: handleCancelConfirm,
          },
        ]}
      />
    </div>
  );
}
