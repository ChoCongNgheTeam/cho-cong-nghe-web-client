"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
   Trash2,
   Plus,
   Minus,
   ShoppingCart,
   ChevronUp,
   ChevronDown,
   X,
   ChevronRight,
} from "lucide-react";
import Image from "next/image";
import VoucherPromotionModal from "./components/VoucherPromotionModal";
import CartVariantSelector from "./components/CartVariantSelector";
import OrderSummary from "@/components/OrderSummary/OrderSummary";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import { useCart } from "@/hooks/useCart";
import { useVoucher } from "@/hooks/useVoucher";
import CartSidebar from "./components/CartSidebar";
import DeleteConfirmSidebar from "./components/DeleteConfirmSidebar";
import { CartItemWithDetails } from "./types/cart.types";
import { formatVND } from "@/helpers";
import { useToasty } from "@/components/Toast";

export default function CartPage() {
   const router = useRouter();
   const {
      items,
      isLoading,
      selectAll,
      selectedItems,
      toggleSelectAll,
      toggleSelectItem,
      updateQuantity,
      updateItem,
      removeItem,
      removeSelectedItems,
      subtotal,
      totalDiscount,
      finalTotal,
      rewardPoints,
      refetchCart,
   } = useCart();

   // const [showSummary, setShowSummary] = useState(true);
   const [usePoints, setUsePoints] = useState(false);
   const [showSidebar, setShowSidebar] = useState(false);
   const [showVoucherModal, setShowVoucherModal] = useState(false);
   const toast = useToasty();

   const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
   const [promotionValue, setPromotionValue] = useState(0);

   const [deleteTarget, setDeleteTarget] = useState<{
      id: string;
      name: string;
   } | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);

   const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
   const [isDeletingAll, setIsDeletingAll] = useState(false);

   const {
      applied: appliedVoucher,
      applyByInput: _applyByInput,
      applyFromList: _applyFromList,
      clearVoucher: _clearVoucher,
   } = useVoucher({ cartTotal: subtotal });

   const [voucherCode, setVoucherCode] = useState("");
   const [voucherValue, setVoucherValue] = useState(0);
   const [voucherId, setVoucherId] = useState("");

   const handleIncrease = async (itemId: string) => {
      const success = await updateQuantity(itemId, 1);

      if (!success) {
         toast.error("Số lượng vượt quá tồn kho");
      }
   };

   const handleDecrease = async (itemId: string) => {
      await updateQuantity(itemId, -1);
   };

   const handleApplyVoucher = useCallback(
      (code: string, value: number, id: string) => {
         setVoucherCode(code);
         setVoucherValue(value);
         setVoucherId(id);
      },
      [],
   );

   // ── Single item delete ────────────────────────────────────────────────────
   const handleRemoveClick = useCallback((item: CartItemWithDetails) => {
      setDeleteTarget({ id: item.id, name: item.productName });
   }, []);

   const handleConfirmDelete = useCallback(async () => {
      if (!deleteTarget) return;
      setIsDeleting(true);
      await removeItem(deleteTarget.id);
      setIsDeleting(false);
      setDeleteTarget(null);
   }, [deleteTarget, removeItem]);

   const handleCloseDeleteSidebar = useCallback(() => {
      if (!isDeleting) setDeleteTarget(null);
   }, [isDeleting]);

   // ── Delete ALL selected ───────────────────────────────────────────────────
   const handleRemoveAllClick = useCallback(() => {
      if (selectedItems.length === 0) return;
      setShowDeleteAllConfirm(true);
   }, [selectedItems.length]);

   const handleConfirmDeleteAll = useCallback(async () => {
      setIsDeletingAll(true);
      await removeSelectedItems();
      setIsDeletingAll(false);
      setShowDeleteAllConfirm(false);
   }, [removeSelectedItems]);

   const handleCloseDeleteAllSidebar = useCallback(() => {
      if (!isDeletingAll) setShowDeleteAllConfirm(false);
   }, [isDeletingAll]);

   // ── Checkout ──────────────────────────────────────────────────────────────
   const handleCheckout = useCallback(() => {
      if (selectedItems.length === 0) {
         toast.error("Vui lòng chọn ít nhất một sản phẩm");
         return;
      }

      const checkoutData = {
         selectedItems,
         selectedPromotions,
         promotionValue,
         appliedVoucherCode: voucherCode,
         appliedVoucherValue: voucherValue,
         appliedVoucherId: voucherId,
         subtotal,
         totalDiscount,
         finalTotal,
         rewardPoints,
         usePoints,
      };

      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
      router.push("/checkout");
   }, [
      selectedItems,
      selectedPromotions,
      promotionValue,
      voucherCode,
      voucherValue,
      voucherId,
      subtotal,
      totalDiscount,
      finalTotal,
      rewardPoints,
      router,
      usePoints,
      toast,
   ]);

   const finalTotalWithVoucher = Math.max(0, finalTotal - voucherValue);

   if (isLoading) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-neutral-light">
            <div className="text-center">
               <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-neutral border-t-accent" />
               <p className="text-neutral-darker">Đang tải giỏ hàng...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="bg-neutral-light">
         <div className="w-full bg-neutral-light">
            <div className="container py-3 md:py-4">
               <Breadcrumb
                  items={[
                     { label: "Trang chủ", href: "/" },
                     { label: "Giỏ hàng" },
                  ]}
               />
            </div>
         </div>

         <div
            className="container space-y-4 px-3"
            style={{
               paddingBottom: "clamp(7rem, 15vw, 12rem)",
            }}
         >
            {items.length === 0 ? (
               <div className="rounded-2xl bg-neutral-light p-8 sm:p-12 lg:p-16 text-center shadow-sm border border-neutral">
                  {/* Animated Cart Illustration */}
                  <div className="flex justify-center mb-6">
                     <div className="relative">
                        <div
                           className="absolute inset-0 rounded-full bg-accent opacity-10 animate-ping"
                           style={{ animationDuration: "2.5s" }}
                        />
                        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-accent flex items-center justify-center shadow-lg">
                           <svg
                              viewBox="0 0 80 80"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-24 h-24 sm:w-32 sm:h-32"
                           >
                              <path
                                 d="M10 12h4l2 8"
                                 stroke="currentColor"
                                 strokeWidth="3.5"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 className="text-primary-darker"
                              />
                              <path
                                 d="M14 18h6l6 24h26l4-16H24"
                                 stroke="currentColor"
                                 strokeWidth="3.5"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 className="text-primary-darker"
                              />
                              <circle
                                 cx="30"
                                 cy="49"
                                 r="3.5"
                                 fill="currentColor"
                                 className="text-primary-darker"
                              />
                              <circle
                                 cx="46"
                                 cy="49"
                                 r="3.5"
                                 fill="currentColor"
                                 className="text-primary-darker"
                              />
                              <circle
                                 cx="35"
                                 cy="31"
                                 r="1.5"
                                 fill="currentColor"
                                 className="text-primary-darker"
                              />
                              <circle
                                 cx="45"
                                 cy="31"
                                 r="1.5"
                                 fill="currentColor"
                                 className="text-primary-darker"
                              />
                              <path
                                 d="M33 37.5 Q40 34 47 37.5"
                                 stroke="currentColor"
                                 strokeWidth="2.5"
                                 strokeLinecap="round"
                                 className="text-primary-darker"
                              />
                           </svg>
                        </div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary-dark opacity-60" />
                        <span className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-accent-dark opacity-40" />
                     </div>
                  </div>

                  <h2 className="mb-2 text-xl sm:text-2xl font-bold text-primary">
                     Giỏ hàng của bạn đang trống
                  </h2>
                  <p className="mb-8 text-sm sm:text-base text-neutral-darker max-w-xs mx-auto leading-relaxed">
                     Hãy khám phá và thêm sản phẩm yêu thích vào giỏ hàng để
                     tiếp tục mua sắm nhé!
                  </p>
                  <Link
                     href="/category/dien-thoai"
                     className="inline-flex items-center gap-2 rounded-xl bg-primary-dark text-neutral-light px-8 sm:px-10 py-3 sm:py-3.5 font-semibold transition shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-150"
                  >
                     <ShoppingCart className="h-4 w-4" />
                     Mua sắm ngay
                  </Link>
               </div>
            ) : (
               <div className="grid gap-4 lg:grid-cols-3">
                  {/* LEFT COLUMN */}
                  <div className="lg:col-span-2 space-y-4">
                     <div className="flex items-center justify-between rounded-lg bg-neutral-light px-2 sm:px-4 py-3 border border-neutral min-h-13">
                        <label className="flex cursor-pointer items-center gap-3 text-xs sm:text-base">
                           <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={toggleSelectAll}
                              style={{
                                 accentColor: "rgb(var(--accent-active))",
                              }}
                              className="h-5 w-5 cursor-pointer rounded"
                           />
                           <span className="text-sm font-medium text-primary">
                              Chọn tất cả ({items.length})
                           </span>
                        </label>
                        {/* ── Nút xoá đã chọn → mở confirm sidebar ── */}
                        <button
                           onClick={handleRemoveAllClick}
                           className="text-neutral-darker transition hover:text-primary disabled:cursor-not-allowed disabled:text-neutral-dark cursor-pointer"
                           disabled={selectedItems.length === 0}
                           aria-label="Xóa các sản phẩm đã chọn"
                        >
                           <Trash2 className="h-5 w-5" />
                        </button>
                     </div>

                     <div className="space-y-4">
                        {items.map((item) => (
                           <div
                              key={item.id}
                              className="rounded-lg bg-neutral-light p-2 sm:p-4 border border-neutral overflow-hidden"
                           >
                              <div className="flex gap-2 sm:gap-3 min-w-0">
                                 {/* Checkbox */}
                                 <div className="flex items-start shrink-0 pt-1">
                                    <input
                                       type="checkbox"
                                       checked={item.selected}
                                       onChange={() =>
                                          toggleSelectItem(item.id)
                                       }
                                       style={{
                                          accentColor:
                                             "rgb(var(--accent-active))",
                                       }}
                                       className="h-5 w-5 cursor-pointer rounded"
                                    />
                                 </div>
                                 <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-neutral bg-neutral-light">
                                    {item.image ? (
                                       <Image
                                          src={item.image}
                                          alt={item.productName}
                                          fill
                                          sizes="(max-width: 640px) 64px, 80px"
                                          className="object-cover"
                                       />
                                    ) : (
                                       <div className="flex h-full w-full items-center justify-center bg-neutral">
                                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-neutral-dark" />
                                       </div>
                                    )}
                                 </div>

                                 {/* Product info */}
                                 <div className="flex-1 min-w-0">
                                    {/* Tên + nút xóa (mobile/tablet) */}
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                       <h3 className="text-sm font-medium text-primary line-clamp-2 min-w-0 flex-1">
                                          {item.productName}
                                       </h3>
                                       <button
                                          onClick={() =>
                                             handleRemoveClick(item)
                                          }
                                          className="xl:hidden shrink-0 text-neutral-darker transition hover:text-primary cursor-pointer"
                                          aria-label="Xóa sản phẩm"
                                       >
                                          <Trash2 className="h-5 w-5" />
                                       </button>
                                    </div>

                                    {/* Variant selector */}
                                    <div className="mb-1.5">
                                       <CartVariantSelector
                                          cartItemId={item.id}
                                          productSlug={item.productSlug}
                                          currentVariantId={
                                             item.productVariantId
                                          }
                                          colorLabel={item.colorLabel}
                                          storageLabel={item.storageLabel}
                                          currentQuantity={item.quantity}
                                          onSuccess={() => refetchCart(true)}
                                          onUpdateItem={(patch) =>
                                             updateItem(item.id, patch)
                                          }
                                       />
                                    </div>

                                    {/* === MOBILE/TABLET (<xl): đơn giá + số lượng + tổng ngang hàng === */}
                                    <div className="xl:hidden flex items-center  gap-1 sm:gap-3 flex-wrap">
                                       {/* Đơn giá */}
                                       <div className="flex flex-col shrink-0">
                                          <span className="text-sm font-semibold text-promotion whitespace-nowrap">
                                             {formatVND(item.unitPrice)}
                                          </span>
                                          {item.originalPrice &&
                                             item.originalPrice >
                                                item.unitPrice && (
                                                <span className="text-xs text-neutral-dark line-through whitespace-nowrap">
                                                   {formatVND(
                                                      item.originalPrice,
                                                   )}
                                                </span>
                                             )}
                                       </div>

                                       {/* Nút +/- gộp liền */}
                                       <div className="flex items-center border border-neutral rounded w-fit shrink-0">
                                          <button
                                             onClick={() =>
                                                handleDecrease(item.id)
                                             }
                                             className="flex h-8 w-8 items-center justify-center rounded-l text-neutral-darker transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
                                             disabled={item.quantity <= 1}
                                          >
                                             <Minus className="h-4 w-4" />
                                          </button>
                                          <span className="flex h-8 w-8 items-center justify-center border-x border-neutral text-sm font-medium text-primary">
                                             {item.quantity}
                                          </span>
                                          <button
                                             onClick={() =>
                                                handleIncrease(item.id)
                                             }
                                             className="flex h-8 w-8 items-center justify-center rounded-r text-neutral-darker transition hover:bg-accent-light"
                                          >
                                             <Plus className="h-4 w-4" />
                                          </button>
                                       </div>

                                       {/* Tổng tiền */}
                                       <span className="text-sm font-bold text-promotion whitespace-nowrap shrink-0 ml-auto">
                                          {formatVND(
                                             item.unitPrice * item.quantity,
                                          )}
                                       </span>
                                    </div>
                                 </div>

                                 {/* === DESKTOP (xl+): đơn giá | số lượng | tổng | xóa === */}
                                 <div className="hidden xl:flex items-center gap-4 shrink-0">
                                    {/* Đơn giá */}
                                    <div className="flex flex-col items-end w-28 shrink-0">
                                       <span className="text-base font-semibold text-promotion whitespace-nowrap">
                                          {formatVND(item.unitPrice)}
                                       </span>
                                       {item.originalPrice &&
                                          item.originalPrice >
                                             item.unitPrice && (
                                             <span className="text-xs text-neutral-dark line-through whitespace-nowrap">
                                                {formatVND(item.originalPrice)}
                                             </span>
                                          )}
                                    </div>

                                    {/* Nút +/- gộp liền */}
                                    <div className="flex items-center border border-neutral rounded w-fit shrink-0">
                                       <button
                                          onClick={() =>
                                             handleDecrease(item.id)
                                          }
                                          className="flex h-7 w-7 items-center justify-center rounded-l text-neutral-darker transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                          disabled={item.quantity <= 1}
                                       >
                                          <Minus className="h-3 w-3" />
                                       </button>
                                       <span className="flex h-7 w-7 items-center justify-center border-x border-neutral text-sm font-medium text-primary">
                                          {item.quantity}
                                       </span>
                                       <button
                                          onClick={() =>
                                             handleIncrease(item.id)
                                          }
                                          className="flex h-7 w-7 items-center justify-center rounded-r text-neutral-darker transition hover:bg-accent-light cursor-pointer"
                                       >
                                          <Plus className="h-3 w-3" />
                                       </button>
                                    </div>

                                    {/* Tổng tiền */}
                                    <div className="w-28 text-right shrink-0">
                                       <span className="text-base font-semibold text-promotion whitespace-nowrap">
                                          {formatVND(
                                             item.unitPrice * item.quantity,
                                          )}
                                       </span>
                                    </div>

                                    {/* Nút xóa */}
                                    <button
                                       onClick={() => handleRemoveClick(item)}
                                       className="text-neutral-darker transition hover:text-primary cursor-pointer shrink-0"
                                       aria-label="Xóa sản phẩm"
                                    >
                                       <Trash2 className="h-5 w-5" />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* RIGHT COLUMN - Desktop */}
                  <div className="hidden lg:block lg:col-span-1">
                     <OrderSummary
                        subtotal={subtotal}
                        totalDiscount={totalDiscount}
                        finalTotal={finalTotal}
                        rewardPoints={rewardPoints}
                        selectedItemsCount={selectedItems.length}
                        appliedVoucherCode={voucherCode}
                        appliedVoucherValue={voucherValue}
                        selectedPromotions={selectedPromotions}
                        promotionValue={promotionValue}
                        onOpenVoucherModal={() => setShowVoucherModal(true)}
                        onCheckout={handleCheckout}
                        buttonText="Xác nhận đơn"
                        showTerms={false}
                        isCheckoutPage={false}
                     />
                  </div>
               </div>
            )}
         </div>

         {/* Floating Panel + Bar - mobile */}
         <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden shadow-2xl">
            {/* Panel chi tiết - chỉ hiện khi showSidebar = true */}
            {showSidebar && (
               <div className="bg-neutral-light border-t border-neutral rounded-t-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral">
                     <span className="text-sm font-semibold text-primary">
                        Thông tin đơn hàng
                     </span>
                     <button
                        onClick={() => setShowSidebar(false)}
                        className="p-1.5 hover:bg-neutral rounded-lg transition-colors"
                     >
                        <X className="h-5 w-5 text-neutral-darker" />
                     </button>
                  </div>
                  {/* Voucher */}
                  <div className="border-b border-neutral">
                     <button
                        type="button"
                        onClick={(e) => {
                           e.stopPropagation();
                           setShowVoucherModal(true);
                        }}
                        className="flex w-full items-center justify-between p-3 transition hover:bg-accent/5 group"
                     >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                           <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                              <span className="text-lg">🏷️</span>
                           </div>
                           <div className="flex flex-col items-start min-w-0">
                              <span className="text-sm font-medium text-primary">
                                 Chọn hoặc nhập ưu đãi
                              </span>
                              {voucherCode ? (
                                 <span className="text-xs text-accent-dark font-semibold truncate w-full">
                                    {voucherCode} • -{formatVND(voucherValue)}
                                 </span>
                              ) : (
                                 <span className="text-xs text-neutral-dark">
                                    Chưa áp dụng
                                 </span>
                              )}
                           </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-dark group-hover:text-accent transition-colors shrink-0" />
                     </button>
                  </div>
                  {/* Chi tiết thanh toán */}
                  <div className="px-4 py-3 space-y-2 text-sm max-h-[40vh] overflow-y-auto">
                     <h3 className="font-semibold text-primary">
                        Chi tiết thanh toán
                     </h3>

                     <div className="flex justify-between">
                        <span className="text-neutral-darker">Tổng tiền</span>
                        <span className="font-medium text-primary">
                           {formatVND(subtotal)}
                        </span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-neutral-darker">
                           Tổng khuyến mãi
                        </span>
                        <span className="font-medium text-primary">
                           -{formatVND(totalDiscount + voucherValue)}
                        </span>
                     </div>
                     <div className="flex justify-between pl-4">
                        <span className="text-neutral-dark text-xs">
                           Giảm giá sản phẩm
                        </span>
                        <span className="text-xs">
                           -{formatVND(totalDiscount)}
                        </span>
                     </div>
                     <div className="flex justify-between pl-4">
                        <span className="text-neutral-dark text-xs">
                           Voucher
                        </span>
                        <span className="text-xs font-medium">
                           {voucherValue > 0
                              ? `-${formatVND(voucherValue)}`
                              : "0₫"}
                        </span>
                     </div>

                     <div className="border-t border-neutral pt-2">
                        <div className="flex justify-between items-center">
                           <span className="font-semibold text-primary">
                              Cần thanh toán
                           </span>
                           <span className="text-lg font-bold text-promotion">
                              {formatVND(finalTotalWithVoucher)}
                           </span>
                        </div>
                     </div>

                     <div className="flex items-center gap-1 pb-1">
                        <span className="text-xs text-neutral-darker">
                           Điểm thưởng
                        </span>
                        <span className="text-sm">🪙</span>
                        <span className="text-sm font-medium text-accent-dark">
                           +{rewardPoints.toLocaleString()}
                        </span>
                     </div>
                  </div>
               </div>
            )}

            {/* Floating Panel + Bar - mobile */}
            <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden shadow-2xl">
               {/* Backdrop */}
               {showSidebar && (
                  <div
                     className="fixed inset-0 bg-black/40 z-[-1]"
                     onClick={() => setShowSidebar(false)}
                  />
               )}

               {/* Expanded Panel - dùng transition thay vì conditional render */}
               <div
                  className={`bg-neutral-light border-t border-neutral overflow-hidden transition-all duration-300 ease-in-out ${
                     showSidebar ? "max-h-[70vh]" : "max-h-0"
                  }`}
               >
                  <div className="overflow-y-auto max-h-[70vh]">
                     {/* Header */}
                     <div className="flex items-center justify-between px-4 py-3 border-b border-neutral">
                        <span className="text-sm font-semibold text-primary">
                           Thông tin đơn hàng
                        </span>
                        <button
                           onClick={() => setShowSidebar(false)}
                           className="p-1.5 hover:bg-neutral rounded-lg transition-colors"
                        >
                           <X className="h-5 w-5 text-neutral-darker" />
                        </button>
                     </div>

                     {/* Voucher Button */}
                     <div className="border-b border-neutral">
                        <button
                           type="button"
                           onClick={() => {
                              setShowSidebar(false);
                              setShowVoucherModal(true);
                           }}
                           className="flex w-full items-center justify-between p-3 transition hover:bg-accent/5 group"
                        >
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                 <span className="text-lg">🏷️</span>
                              </div>
                              <div className="flex flex-col items-start min-w-0">
                                 <span className="text-sm font-medium text-primary">
                                    Chọn hoặc nhập ưu đãi
                                 </span>
                                 {voucherCode ? (
                                    <span className="text-xs text-accent-dark font-semibold truncate w-full">
                                       {voucherCode} • -
                                       {formatVND(voucherValue)}
                                    </span>
                                 ) : (
                                    <span className="text-xs text-neutral-dark">
                                       Chưa áp dụng
                                    </span>
                                 )}
                              </div>
                           </div>
                           <ChevronRight className="h-5 w-5 text-neutral-dark group-hover:text-accent transition-colors shrink-0" />
                        </button>
                     </div>

                     {/* Summary Section */}
                     <div className="px-4 py-4 space-y-2.5">
                        <h3 className="text-sm font-semibold text-primary mb-3">
                           Chi tiết thanh toán
                        </h3>
                        <div className="space-y-2.5 text-sm">
                           <div className="flex justify-between">
                              <span className="text-neutral-darker">
                                 Tổng tiền
                              </span>
                              <span className="font-medium text-primary">
                                 {formatVND(subtotal)}
                              </span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-neutral-darker">
                                 Tổng khuyến mãi
                              </span>
                              <span className="font-medium text-primary">
                                 -{formatVND(totalDiscount + voucherValue)}
                              </span>
                           </div>
                           <div className="flex justify-between pl-4">
                              <span className="text-neutral-dark text-xs">
                                 Giảm giá sản phẩm
                              </span>
                              <span className="text-primary text-sm">
                                 -{formatVND(totalDiscount)}
                              </span>
                           </div>
                           <div className="flex justify-between pl-4">
                              <span className="text-neutral-dark text-xs">
                                 Voucher
                              </span>
                              <span className="text-primary text-sm font-medium">
                                 {voucherValue > 0
                                    ? `-${formatVND(voucherValue)}`
                                    : "0₫"}
                              </span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-neutral-darker">
                                 Phí vận chuyển
                              </span>
                              <span className="font-medium text-accent-dark">
                                 Miễn phí
                              </span>
                           </div>
                           <div className="border-t border-neutral pt-2.5 mt-2.5">
                              <div className="flex justify-between items-center">
                                 <span className="font-semibold text-primary text-sm">
                                    Cần thanh toán
                                 </span>
                                 <span className="text-xl font-bold text-promotion">
                                    {formatVND(finalTotalWithVoucher)}
                                 </span>
                              </div>
                           </div>
                           <div className="flex items-center gap-1 pt-1 pb-2">
                              <span className="text-xs text-neutral-darker">
                                 Điểm thưởng
                              </span>
                              <span className="text-sm">🪙</span>
                              <span className="text-sm font-medium text-accent-dark">
                                 +{rewardPoints.toLocaleString()}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Bar luôn hiển thị */}
               <div className="bg-neutral-light border-t border-neutral flex items-center gap-2 px-3 py-2.5">
                  <button
                     onClick={() => setShowSidebar((prev) => !prev)}
                     className="flex-1 flex items-center justify-end gap-2 min-w-0 py-1 rounded-lg hover:bg-neutral transition"
                  >
                     <div className="flex flex-col items-end min-w-0">
                        <span className="text-base font-bold text-promotion whitespace-nowrap">
                           {formatVND(finalTotalWithVoucher)}
                        </span>
                        {totalDiscount + voucherValue > 0 && (
                           <span className="text-xs text-neutral-darker whitespace-nowrap">
                              Tiết kiệm{" "}
                              {formatVND(totalDiscount + voucherValue)}
                           </span>
                        )}
                     </div>
                     {showSidebar ? (
                        <ChevronDown className="h-4 w-4 text-neutral-darker shrink-0" />
                     ) : (
                        <ChevronUp className="h-4 w-4 text-neutral-darker shrink-0" />
                     )}
                  </button>

                  <button
                     onClick={handleCheckout}
                     disabled={selectedItems.length === 0}
                     className={`shrink-0 rounded-xl px-5 py-3 text-sm font-bold transition shadow-lg ${
                        selectedItems.length === 0
                           ? "cursor-not-allowed bg-neutral text-neutral-dark opacity-50"
                           : "bg-accent text-white hover:bg-accent-hover active:scale-[0.98]"
                     }`}
                  >
                     Xác nhận đơn
                  </button>
               </div>
            </div>
         </div>
         {/* <CartSidebar
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
            subtotal={subtotal}
            totalDiscount={totalDiscount}
            finalTotal={finalTotal}
            rewardPoints={rewardPoints}
            selectedItemsCount={selectedItems.length}
            appliedVoucherCode={voucherCode}
            appliedVoucherValue={voucherValue}
            onOpenVoucherModal={() => setShowVoucherModal(true)}
            onCheckout={handleCheckout}
            usePoints={usePoints}
            onTogglePoints={setUsePoints}
         /> */}

         <VoucherPromotionModal
            isOpen={showVoucherModal}
            onClose={() => setShowVoucherModal(false)}
            appliedVoucherCode={voucherCode}
            appliedVoucherValue={voucherValue}
            appliedVoucherId={voucherId}
            onApplyVoucher={handleApplyVoucher}
            cartTotal={subtotal}
         />

         {/* Delete single item confirm sidebar */}
         <DeleteConfirmSidebar
            isOpen={!!deleteTarget}
            onClose={handleCloseDeleteSidebar}
            onConfirm={handleConfirmDelete}
            productName={deleteTarget?.name ?? ""}
            isLoading={isDeleting}
         />

         {/* Delete ALL selected items confirm sidebar */}
         <DeleteConfirmSidebar
            isOpen={showDeleteAllConfirm}
            onClose={handleCloseDeleteAllSidebar}
            onConfirm={handleConfirmDeleteAll}
            productName={`${selectedItems.length} sản phẩm đã chọn`}
            isLoading={isDeletingAll}
         />
      </div>
   );
}
