"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
   ChevronRight,
   ExternalLink,
   RefreshCcw,
   Landmark,
   Star,
} from "lucide-react";
import { useState } from "react";
import { Order } from "../../type/order";
import {
   orderStatusConfig,
   paymentStatusConfig,
   REDIRECT_PAYMENT_METHODS,
   BANK_TRANSFER_METHODS,
} from "./Constants";
import CancelOrderButton from "./CancelOrderButton";
import ReorderButton from "./ReorderButton";
import ReviewModal from "./ReviewModal";
import ReviewSuccessModal from "@/(client)/products/product-comment/ReviewSuccessModal ";
import Link from "next/link";
import { useToasty } from "@/components/Toast";
import { formatDate, formatVND } from "@/helpers";

interface OrderCardProps {
   order: Order;
   isHighlighted?: boolean; // ← thêm
   onViewDetail: () => void;
   onCancelSuccess: () => void;
   onReorderSuccess: () => void;
   onBeforeNavigate: () => Promise<void> | void;
}

function getFirstValidImage(
   imgs: { imageUrl: string | null }[] | undefined,
): string {
   if (!imgs) return "";
   return imgs.find((i) => i.imageUrl !== null)?.imageUrl ?? "";
}

function getPaymentAction(order: Order): {
   type: "bank" | "redirect" | null;
   url?: string;
} {
   if (order.paymentStatus === "PAID") return { type: null };
   const methodUpper = (order.paymentMethod?.name ?? "")
      .toUpperCase()
      .replace(/\s+/g, "_");
   if (
      BANK_TRANSFER_METHODS.some((m) =>
         methodUpper.includes(m.replace(/\s+/g, "_")),
      )
   )
      return { type: "bank" };
   if (REDIRECT_PAYMENT_METHODS.some((m) => methodUpper.includes(m)))
      return { type: "redirect", url: order.paymentRedirectUrl ?? undefined };
   return { type: null };
}

export default function OrderCard({
   order,
   isHighlighted = false,
   onViewDetail,
   onCancelSuccess,
   onReorderSuccess,
   onBeforeNavigate,
}: OrderCardProps) {
   const router = useRouter();
   const toasty = useToasty();

   const [reviewTarget, setReviewTarget] = useState<{
      orderItemId: string;
      productName: string;
   } | null>(null);
   const [reviewedStars, setReviewedStars] = useState<number | null>(null);
   const [localReviewedIds, setLocalReviewedIds] = useState<Set<string>>(
      new Set(
         order.orderItems
            .filter((item) => !item.canReview)
            .map((item) => item.id),
      ),
   );

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
   const showReview =
      order.orderStatus === "DELIVERED" && order.paymentStatus === "PAID";
   const showPayment = order.orderStatus !== "CANCELLED";
   const paymentAction = getPaymentAction(order);

   const handlePaymentAction = () => {
      if (paymentAction.type === "bank")
         router.push(`/order/${order.orderCode}/payment`);
      else if (paymentAction.type === "redirect" && paymentAction.url)
         window.open(paymentAction.url, "_blank", "noopener,noreferrer");
   };

   const handleReviewClick = (item: Order["orderItems"][number]) => {
      if (localReviewedIds.has(item.id)) {
         toasty.info("Bạn đã đánh giá sản phẩm này rồi", {
            title: "Đã đánh giá",
            duration: 3000,
            showProgress: true,
         });
         return;
      }
      setReviewTarget({
         orderItemId: item.id,
         productName: item.productVariant?.product?.name ?? "",
      });
   };

   return (
      <>
         <div
            id={`order-card-${order.id}`}
          className={`
            bg-neutral-light rounded-xl
            hover:shadow-md transition-all duration-500
            border border-neutral
            ${isHighlighted ? "shadow-[0_0_0_2px_var(--color-accent)]" : ""}
          `}
         >
            {/* ── Header ── */}
              <div className="flex flex-col gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 bg-neutral-light border-b border-neutral">
               {/* Order code + status */}
               <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs sm:text-sm text-primary">
                     #{order.orderCode}
                  </span>
                  <span
                     className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${orderStatus.color} ${orderStatus.bgColor}`}
                  >
                     <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${orderStatus.dot}`}
                     />
                     {orderStatus.label}
                  </span>
               </div>

               {/* Meta info */}
               <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 text-[10px] sm:text-xs text-neutral-darker">
                  <span>{formatDate(order.orderDate)}</span>
                  <span className="text-neutral">•</span>
                  {/* Hide payment method on very small screens */}
                  <span className="hidden xs:inline truncate max-w-[110px] sm:max-w-none">
                     {order.paymentMethod.description}
                  </span>
                  <span className="hidden xs:inline text-neutral">•</span>
                  {/* <span>{order.orderItems.length} SP</span>
            <span className="text-neutral">•</span> */}
                  <span
                     className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${paymentStatus.color} ${paymentStatus.bgColor}`}
                  >
                     {paymentStatus.label}
                  </span>
               </div>

               {/* Payment expiry warning */}
               {order.paymentStatus === "UNPAID" &&
                  order.paymentExpiredAt &&
                  paymentAction.type !== null && (
                     <div
                        className="flex items-center gap-1.5 text-[10px] sm:text-xs rounded-lg px-2.5 sm:px-3 py-1.5 border"
                        style={{
                           color: "rgb(180 83 9)",
                           background: "rgb(255 251 235 / 0.15)",
                           borderColor: "rgb(180 83 9 / 0.3)",
                        }}
                     >
                        <RefreshCcw className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                           Hết hạn TT:{" "}
                           <span className="font-semibold">
                              {formatDate(order.paymentExpiredAt, {
                                 withTime: true,
                              })}
                           </span>
                        </span>
                     </div>
                  )}
            </div>

            {/* ── Product List ── */}
            <div className="divide-y divide-neutral">
               {order.orderItems.map((item) => {
                  const imageUrl =
                     item.image ??
                     getFirstValidImage(item.productVariant?.product?.img);
                  const attrs = item.productVariant?.variantAttributes
                     ?.map((a) => a.attributeOption.value)
                     .join(" · ");
                  const productSlug = item.productVariant?.product?.slug;
                  const alreadyReviewed = localReviewedIds.has(item.id);

                  return (
                     <div key={item.id} className="flex flex-col">
                        {/* Product row */}
                        <Link
                           href={productSlug ? `/products/${productSlug}` : "#"}
                           className="flex gap-2.5 sm:gap-3 px-3 sm:px-5 py-3 sm:py-3.5 hover:bg-neutral-light-active transition-colors"
                        >
                           {/* Image */}
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-lg bg-neutral overflow-hidden">
                              {imageUrl ? (
                                 <Image
                                    src={imageUrl}
                                    alt={
                                       item.productVariant?.product?.name ?? ""
                                    }
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                 />
                              ) : (
                                 <div className="w-full h-full bg-neutral-light flex items-center justify-center text-neutral-darker text-xs">
                                    N/A
                                 </div>
                              )}
                           </div>

                           {/* Info */}
                           <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-primary line-clamp-2 sm:line-clamp-1">
                                 {item.productVariant?.product?.name}
                              </p>
                              {attrs && (
                                 <p className="text-[10px] sm:text-xs text-neutral-darker mt-0.5 line-clamp-1">
                                    {attrs}
                                 </p>
                              )}
                              <p className="text-[10px] sm:text-xs text-neutral-darker mt-0.5">
                                 x{item.quantity}
                              </p>
                           </div>

                           {/* Price */}
                           <div className="text-right shrink-0">
                              <p className="text-xs sm:text-sm font-semibold text-primary">
                                 {formatVND(Number(item.unitPrice))}
                              </p>
                              {Number(item.productVariant?.price) >
                                 Number(item.unitPrice) && (
                                 <p className="text-[10px] sm:text-xs line-through text-neutral-darker">
                                    {formatVND(
                                       Number(item.productVariant?.price),
                                    )}
                                 </p>
                              )}
                           </div>
                        </Link>

                        {/* Review bar */}
                        {showReview && (
                           <div className="px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between bg-neutral-light border-t border-neutral gap-2">
                              {/* Hide text on mobile, show icon only */}
                              <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                                 <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                                 <span className="text-xs text-neutral-darker truncate">
                                    Hãy đánh giá sản phẩm bạn vừa nhận được!
                                 </span>
                              </div>
                              {/* Mobile: just star icon */}
                              <div className="flex sm:hidden items-center gap-1">
                                 <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                 <span className="text-[10px] text-neutral-darker">
                                    Đánh giá
                                 </span>
                              </div>

                              <button
                                 onClick={() => handleReviewClick(item)}
                                 disabled={alreadyReviewed}
                                 className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors shrink-0
                        ${alreadyReviewed ? "bg-neutral text-neutral-darker cursor-default" : "bg-amber-400 hover:bg-amber-500 text-amber-900 cursor-pointer"}`}
                              >
                                 <Star
                                    className={`w-3 h-3 ${alreadyReviewed ? "fill-neutral-darker" : "fill-amber-900"}`}
                                 />
                                 <span className="hidden sm:inline">
                                    {alreadyReviewed
                                       ? "Đã đánh giá ✓"
                                       : "Đánh giá ngay"}
                                 </span>
                                 <span className="sm:hidden">
                                    {alreadyReviewed ? "✓" : "Ngay"}
                                 </span>
                              </button>
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>

            {/* ── Footer ── */}
            <div className="px-3 sm:px-5 py-3 sm:py-4 bg-neutral-light border-t border-neutral">
               {/* Mobile: total on top, buttons below */}
               <div className="flex items-center justify-between mb-2.5 sm:hidden">
                  <span className="text-xs text-neutral-darker">
                     Tổng cộng:
                  </span>
                  <span className="text-sm font-bold text-primary">
                     {formatVND(Number(order.totalAmount))}
                  </span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                     <button
                        onClick={onViewDetail}
                        className="h-8 sm:h-9 flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium
                  border border-neutral hover:border-neutral-dark hover:bg-neutral
                  text-neutral-darker hover:text-primary transition-colors cursor-pointer"
                     >
                        Chi tiết
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                     </button>

                     {showReorder && (
                        <ReorderButton
                           orderId={order.id}
                           onReorderSuccess={onReorderSuccess}
                           onBeforeNavigate={onBeforeNavigate}
                        />
                     )}

                     {showCancel && (
                        <CancelOrderButton
                           orderId={order.id}
                           onCancelSuccess={onCancelSuccess}
                        />
                     )}

                     {showPayment && paymentAction.type === "bank" && (
                        <button
                           onClick={handlePaymentAction}
                           className="h-8 sm:h-9 flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium
                    bg-primary text-neutral-light hover:bg-primary-hover transition-colors cursor-pointer"
                        >
                           <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                           <span className="hidden sm:inline">
                              Xem thông tin CK
                           </span>
                           <span className="sm:hidden">Chuyển khoản</span>
                        </button>
                     )}

                     {showPayment &&
                        paymentAction.type === "redirect" &&
                        paymentAction.url && (
                           <button
                              onClick={handlePaymentAction}
                              className="h-8 sm:h-9 flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium
                    bg-accent text-neutral-light hover:bg-accent-hover transition-colors cursor-pointer"
                           >
                              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              Thanh toán
                           </button>
                        )}
                  </div>

                  {/* Total — hidden on mobile (shown above) */}
                  <div className="hidden sm:block text-right shrink-0">
                     <span className="text-xs text-neutral-darker">Tổng: </span>
                     <span className="text-base font-bold text-primary">
                        {formatVND(Number(order.totalAmount))}
                     </span>
                  </div>
               </div>
            </div>
         </div>

         {reviewTarget && (
            <ReviewModal
               isOpen={!!reviewTarget}
               onClose={() => setReviewTarget(null)}
               orderItemId={reviewTarget.orderItemId}
               productName={reviewTarget.productName}
               onSuccess={(stars: number) => {
                  setLocalReviewedIds((prev) =>
                     new Set(prev).add(reviewTarget.orderItemId),
                  );
                  setReviewedStars(stars);
                  setReviewTarget(null);
               }}
            />
         )}

         <ReviewSuccessModal
            isOpen={reviewedStars !== null}
            stars={reviewedStars ?? 5}
            onClose={() => setReviewedStars(null)}
         />
      </>
   );
}
