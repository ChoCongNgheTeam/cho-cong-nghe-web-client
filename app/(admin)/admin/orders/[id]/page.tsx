"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
   ArrowLeft,
   Package,
   User,
   MapPin,
   CreditCard,
   Tag,
   Star,
   Clock,
   CheckCircle2,
   Truck,
   XCircle,
   Loader2,
   Copy,
   ExternalLink,
   ShoppingBag,
   Receipt,
   MessageSquare,
} from "lucide-react";
import { getOrderById } from "../_libs/getOrderById";
import { OrderStatusCell } from "../components";
import { PaymentBadge } from "../components";
import type { Order, OrderStatus } from "../order.types";
import { formatVND, formatDate } from "@/helpers";

const STATUS_STEPS: {
   status: OrderStatus;
   label: string;
   icon: React.ElementType;
}[] = [
   { status: "PENDING", label: "Chờ duyệt", icon: Clock },
   { status: "PROCESSING", label: "Đang xử lý", icon: Loader2 },
   { status: "SHIPPED", label: "Đang giao", icon: Truck },
   { status: "DELIVERED", label: "Hoàn tất", icon: CheckCircle2 },
];

const STATUS_ORDER = [
   "PENDING",
   "PROCESSING",
   "SHIPPED",
   "DELIVERED",
   "CANCELLED",
];

function OrderTimeline({ status }: { status: OrderStatus }) {
   const isCancelled = status === "CANCELLED";
   const currentIdx = STATUS_ORDER.indexOf(status);

   if (isCancelled) {
      return (
         <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-promotion-light border border-promotion-light-active">
            <XCircle size={18} className="text-promotion shrink-0" />
            <span className=" text-[13px] font-semibold text-promotion">
               Đơn hàng đã bị hủy
            </span>
         </div>
      );
   }

   return (
      <div className="relative flex items-center justify-between">
         <div className="absolute top-5 left-0 right-0 h-0.5 bg-neutral z-0" />
         <div
            className="absolute top-5 left-0 h-0.5 bg-accent z-0 transition-all duration-700"
            style={{
               width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%`,
            }}
         />
         {STATUS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = currentIdx > idx;
            const isActive = currentIdx === idx;
            return (
               <div
                  key={step.status}
                  className="relative z-10 flex flex-col items-center gap-2"
               >
                  <div
                     className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isDone
                           ? "bg-accent border-accent"
                           : isActive
                             ? "bg-accent-light border-accent"
                             : "bg-neutral-light border-neutral"
                     }`}
                  >
                     <Icon
                        size={16}
                        className={`${isDone || isActive ? "text-primary" : "text-neutral-dark"} ${isActive && step.status === "PROCESSING" ? "animate-spin" : ""}`}
                     />
                  </div>
                  <span
                     className={` text-[11px] font-medium whitespace-nowrap ${isDone || isActive ? "text-accent" : "text-neutral-dark"}`}
                  >
                     {step.label}
                  </span>
               </div>
            );
         })}
      </div>
   );
}

function InfoCard({
   title,
   icon: Icon,
   children,
}: {
   title: string;
   icon: React.ElementType;
   children: React.ReactNode;
}) {
   return (
      <div className="bg-neutral-light border border-neutral rounded-xl">
         <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral bg-neutral-light-active">
            <Icon size={14} className="text-accent" />
            <span className=" text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
               {title}
            </span>
         </div>
         <div className="p-4">{children}</div>
      </div>
   );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
   return (
      <div className="flex items-start justify-between gap-4 py-1.5">
         <span className=" text-[12px] text-neutral-dark shrink-0">
            {label}
         </span>
         <span className=" text-[13px] text-primary font-medium text-right">
            {value}
         </span>
      </div>
   );
}

function StarRating({ rating = 0 }: { rating?: number }) {
   return (
      <div className="flex items-center gap-0.5">
         {[1, 2, 3, 4, 5].map((s) => (
            <Star
               key={s}
               size={13}
               className={
                  s <= rating
                     ? "text-yellow-400 fill-yellow-400"
                     : "text-neutral"
               }
            />
         ))}
      </div>
   );
}

export default function OrderDetailPage() {
   const params = useParams();
   const router = useRouter();
   const id = params?.id as string;

   const [order, setOrder] = useState<Order | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [copied, setCopied] = useState(false);

   useEffect(() => {
      if (!id) return;
      setLoading(true);
      getOrderById(id)
         .then((res) => setOrder(res.data))
         .catch((e) => setError(e?.message ?? "Không thể tải đơn hàng"))
         .finally(() => setLoading(false));
   }, [id]);

   const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
      if (!order) return;
      setOrder({ ...order, orderStatus: newStatus });
   };

   const copyId = () => {
      navigator.clipboard.writeText(order?.orderCode ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center h-64">
            <Loader2 size={24} className="animate-spin text-accent" />
         </div>
      );
   }

   if (error || !order) {
      return (
         <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Package size={40} className="text-neutral-dark opacity-40" />
            <p className=" text-sm text-neutral-dark">
               {error ?? "Không tìm thấy đơn hàng"}
            </p>
            <button
               onClick={() => router.back()}
               className="px-4 py-2 rounded-lg bg-accent text-white  text-[13px] cursor-pointer"
            >
               Quay lại
            </button>
         </div>
      );
   }

   const subtotal = Number(order.subtotalAmount);
   const shipping = Number(order.shippingFee);
   const discount = Number(order.voucherDiscount);
   const total = Number(order.totalAmount);

   return (
      <div className="p-6 space-y-5 mx-auto bg-neutral-light">
         {/* Breadcrumb */}
         <div className="flex items-center gap-3">
            <button
               onClick={() => router.back()}
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral  text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
               <ArrowLeft size={14} /> Quay lại
            </button>
            <span className="text-neutral-dark  text-[13px]">/</span>
            <Link
               href="/admin/orders"
               className=" text-[13px] text-neutral-dark hover:text-accent transition-colors"
            >
               Đơn hàng
            </Link>
            <span className="text-neutral-dark  text-[13px]">/</span>
            <span className=" text-[13px] text-primary font-medium">
               {order.orderCode}
            </span>
         </div>

         {/* Header */}
         <div className="bg-neutral-light border border-neutral rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                  <Receipt size={18} className="text-accent" />
               </div>
               <div>
                  <div className="flex items-center gap-2">
                     <h1 className=" text-[17px] font-bold text-primary">
                        {order.orderCode}
                     </h1>
                     <button
                        onClick={copyId}
                        className="text-neutral-dark hover:text-accent transition-colors cursor-pointer"
                        title="Copy mã đơn"
                     >
                        <Copy size={13} />
                     </button>
                     {copied && (
                        <span className=" text-[11px] text-accent">
                           Đã copy!
                        </span>
                     )}
                  </div>
                  <p className=" text-[12px] text-neutral-dark">
                     Đặt lúc {formatDate(order.orderDate)}
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <PaymentBadge status={order.paymentStatus} />
               <OrderStatusCell
                  orderId={order.id}
                  status={order.orderStatus}
                  onStatusChange={handleStatusChange}
               />
            </div>
         </div>

         {/* Timeline */}
         <div className="bg-neutral-light border border-neutral rounded-xl px-6 py-5">
            <p className=" text-[12px] font-semibold text-neutral-dark uppercase tracking-wider mb-4">
               Tiến trình đơn hàng
            </p>
            <OrderTimeline status={order.orderStatus} />
         </div>

         {/* Main grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            {/* Left — order items */}
            <div className="lg:col-span-2 space-y-5">
               <div className="bg-neutral-light border border-neutral rounded-xl">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral bg-neutral-light-active">
                     <ShoppingBag size={14} className="text-accent" />
                     <span className=" text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
                        Sản phẩm ({order.orderItems.length})
                     </span>
                  </div>
                  <div className="divide-y divide-neutral">
                     {order.orderItems.map((item) => {
                        const product = item.productVariant.product;
                        const attrs = item.productVariant.variantAttributes;
                        const img = product.img?.[0]?.imageUrl;
                        return (
                           <div key={item.id} className="p-4 space-y-4">
                              <div className="flex items-start gap-3">
                                 <div className="w-16 h-16 rounded-xl border border-neutral bg-neutral-light-active shrink-0">
                                    {img ? (
                                       <Image
                                          src={img}
                                          alt={product.name}
                                          width={64}
                                          height={64}
                                          className="w-full h-full object-cover"
                                       />
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center">
                                          <Package
                                             size={20}
                                             className="text-neutral-dark"
                                          />
                                       </div>
                                    )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                       <div>
                                          <Link
                                             href={`/admin/products/${product.id}`}
                                             className=" text-[14px] font-semibold text-primary hover:text-accent transition-colors flex items-center gap-1 group"
                                          >
                                             {product.name}
                                             <ExternalLink
                                                size={11}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                             />
                                          </Link>
                                          <p className=" text-[11px] text-neutral-dark mt-0.5">
                                             SKU: {item.productVariant.code}
                                          </p>
                                       </div>
                                       <div className="text-right shrink-0">
                                          <p className=" text-[14px] font-bold text-primary">
                                             {formatVND(item.unitPrice)}
                                          </p>
                                          <p className=" text-[11px] text-neutral-dark">
                                             x{item.quantity}
                                          </p>
                                       </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                       {attrs.map((a, i) => (
                                          <span
                                             key={i}
                                             className="px-2 py-0.5 rounded-md bg-neutral-light-active border border-neutral  text-[11px] text-primary"
                                          >
                                             {a.attributeOption.attribute.name}:{" "}
                                             <span className="font-semibold">
                                                {a.attributeOption.value}
                                             </span>
                                          </span>
                                       ))}
                                    </div>
                                 </div>
                              </div>

                              {/* Review */}
                              <div className="ml-19 pl-3 border-l-2 border-neutral space-y-2">
                                 <div className="flex items-center gap-2">
                                    <MessageSquare
                                       size={12}
                                       className="text-neutral-dark"
                                    />
                                    <span className=" text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
                                       Đánh giá từ khách hàng
                                    </span>
                                 </div>
                                 <div className="bg-neutral-light-active rounded-xl p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                                             <span className=" text-[10px] font-bold text-white">
                                                {order.user.fullName
                                                   .charAt(0)
                                                   .toUpperCase()}
                                             </span>
                                          </div>
                                          <span className=" text-[12px] font-medium text-primary">
                                             {order.user.fullName}
                                          </span>
                                       </div>
                                       <StarRating rating={5} />
                                    </div>
                                    <p className=" text-[12px] text-primary leading-relaxed">
                                       Sản phẩm đúng mô tả, đóng gói cẩn thận,
                                       giao hàng nhanh. Rất hài lòng!
                                    </p>
                                    <p className=" text-[10px] text-neutral-dark">
                                       {formatDate(order.orderDate)}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>

            {/* Right — info cards */}
            <div className="space-y-4">
               {/* Customer */}
               <InfoCard title="Khách hàng" icon={User}>
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-neutral">
                     <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <span className=" text-sm font-bold text-white">
                           {order.user.fullName.charAt(0).toUpperCase()}
                        </span>
                     </div>
                     <div>
                        <p className=" text-[13px] font-semibold text-primary">
                           {order.user.fullName}
                        </p>
                        <p className=" text-[11px] text-neutral-dark">
                           {order.user.email}
                        </p>
                     </div>
                  </div>
                  <InfoRow label="Điện thoại" value={order.user.phone} />
                  <div className="mt-2">
                     <Link
                        href={`/admin/users/${order.user.id}`}
                        className="inline-flex items-center gap-1  text-[12px] text-accent hover:underline"
                     >
                        Xem hồ sơ <ExternalLink size={11} />
                     </Link>
                  </div>
               </InfoCard>

               {/* Shipping — dùng flat fields thay vì shippingAddress.xxx */}
               <InfoCard title="Địa chỉ giao hàng" icon={MapPin}>
                  <InfoRow
                     label="Người nhận"
                     value={order.shippingContactName}
                  />
                  <InfoRow label="SĐT" value={order.shippingPhone} />
                  <InfoRow label="Tỉnh/TP" value={order.shippingProvince} />
                  <InfoRow label="Phường/Xã" value={order.shippingWard} />
                  <InfoRow label="Địa chỉ" value={order.shippingDetail} />
               </InfoCard>

               {/* Payment */}
               <InfoCard title="Thanh toán" icon={CreditCard}>
                  <InfoRow
                     label="Phương thức"
                     value={order.paymentMethod.name}
                  />
                  <InfoRow
                     label="Mô tả"
                     value={
                        <span className="text-neutral-dark font-normal text-[12px]">
                           {order.paymentMethod.description}
                        </span>
                     }
                  />
                  <InfoRow
                     label="Trạng thái"
                     value={<PaymentBadge status={order.paymentStatus} />}
                  />
               </InfoCard>

               {/* Voucher */}
               <InfoCard title="Khuyến mãi" icon={Tag}>
                  {order.voucher ? (
                     <InfoRow
                        label="Mã voucher"
                        value={
                           <span className="px-2 py-0.5 rounded-md bg-accent-light text-accent border border-accent  text-[12px] font-semibold">
                              {order.voucher.code}
                           </span>
                        }
                     />
                  ) : (
                     <p className=" text-[12px] text-neutral-dark italic">
                        Không sử dụng voucher
                     </p>
                  )}
               </InfoCard>

               {/* Summary */}
               <InfoCard title="Tổng kết đơn hàng" icon={Receipt}>
                  <div className="space-y-1">
                     <InfoRow label="Tạm tính" value={formatVND(subtotal)} />
                     <InfoRow
                        label="Phí vận chuyển"
                        value={
                           shipping === 0 ? (
                              <span className="text-green-600 font-semibold text-[13px]">
                                 Miễn phí
                              </span>
                           ) : (
                              formatVND(shipping)
                           )
                        }
                     />
                     {discount > 0 && (
                        <InfoRow
                           label="Giảm giá"
                           value={
                              <span className="text-promotion font-semibold text-[13px]">
                                 -{formatVND(discount)}
                              </span>
                           }
                        />
                     )}
                     <div className="pt-2 mt-2 border-t border-neutral flex items-center justify-between">
                        <span className=" text-[13px] font-bold text-primary">
                           Tổng cộng
                        </span>
                        <span className=" text-[16px] font-bold text-accent">
                           {formatVND(total)}
                        </span>
                     </div>
                  </div>
               </InfoCard>
            </div>
         </div>
      </div>
   );
}
