// app/(client)/cart/page.tsx
"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
   Trash2,
   Plus,
   Minus,
   ChevronRight,
   ChevronUp,
   ShoppingCart,
} from "lucide-react";
import { useCart } from "../../hooks/useCart";
import Image from "next/image";
import VoucherPromotionModal from "./components/VoucherPromotionModal";
import VariantDropdown from "./components/CartVariantSelector";
import toast from "react-hot-toast";
import CartSidebar from "./components/cartsidebar";

export default function CartPage() {
   const {
      items,
      isLoading,
      selectAll,
      selectedItems,
      toggleSelectAll,
      toggleSelectItem,
      updateQuantity,
      removeItem,
      removeSelectedItems,
      subtotal,
      totalDiscount,
      finalTotal,
      rewardPoints,
   } = useCart();

   const [showSummary, setShowSummary] = useState(true);
   const [usePoints, setUsePoints] = useState(false);
   const [showSidebar, setShowSidebar] = useState(false);
   const [showVoucherModal, setShowVoucherModal] = useState(false);

   // Voucher & Promotion states
   const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
   const [promotionValue, setPromotionValue] = useState(0);
   const [appliedVoucherCode, setAppliedVoucherCode] = useState("");
   const [appliedVoucherValue, setAppliedVoucherValue] = useState(0);

   const formatPrice = useCallback(
      (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫",
      []
   );

   const handleSelectPromotions = useCallback(
      (promotionIds: string[], totalValue: number) => {
         setSelectedPromotions(promotionIds);
         setPromotionValue(totalValue);
      },
      []
   );

   const handleApplyVoucher = useCallback((code: string, value: number) => {
      setAppliedVoucherCode(code);
      setAppliedVoucherValue(value);
   }, []);

   // Handle variant change
   const handleVariantChange = useCallback(
      (
         cartItemId: number,
         variantId: number,
         variantName: string,
         price: number
      ) => {
         console.log("Variant changed:", {
            cartItemId,
            variantId,
            variantName,
            price,
         });

         // TODO: Call API to update cart item variant
         // await updateCartItemVariant(cartItemId, variantId);

         // For now, this is handled by the useCart hook's internal state
         // You would typically call an API here and then refetch the cart
         toast.success("Đã cập nhật phiên bản sản phẩm");
      },
      []
   );

   // Calculate final totals with voucher
   const totalDiscountWithVoucher = totalDiscount + appliedVoucherValue;
   const finalTotalWithVoucher = Math.max(0, finalTotal - appliedVoucherValue);

   if (isLoading) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-neutral-light">
            <div className="text-center">
               <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-neutral border-t-accent"></div>
               <p className="text-neutral-darker font-poppins">
                  Đang tải giỏ hàng...
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-neutral-light font-poppins">
         {/* Breadcrumb */}
         <div className="w-full bg-neutral-light">
            <div className="container py-3 md:py-4">
               <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Link
                     href="/"
                     className="text-primary hover:text-primary-hover transition-colors"
                  >
                     Trang chủ
                  </Link>
                  <span className="text-neutral-dark">/</span>
                  <span className="text-primary-darker font-medium">
                     Giỏ hàng
                  </span>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="container pb-28 lg:pb-8 space-y-4 !px-3">
            {items.length === 0 ? (
               <div className="rounded-lg bg-neutral-light p-6 sm:p-8 lg:p-12 text-center shadow-sm">
                  <h2 className="mb-2 text-lg sm:text-xl font-semibold text-primary-darker">
                     Giỏ hàng trống
                  </h2>
                  <p className="mb-6 text-sm sm:text-base text-neutral-darker">
                     Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
                  </p>
                  <Link
                     href="/products"
                     className="inline-block rounded-lg bg-accent px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-primary-darker transition hover:bg-accent-hover"
                  >
                     Mua sắm ngay
                  </Link>
               </div>
            ) : (
               <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
                  {/* LEFT COLUMN - Cart Items */}
                  <div className="lg:col-span-2 space-y-4">
                     {/* Select All Box */}
                     <div className="flex items-center justify-between rounded-lg bg-neutral-light px-4 py-3 border border-neutral">
                        <label className="flex cursor-pointer items-center gap-3">
                           <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={toggleSelectAll}
                              className="h-5 w-5 cursor-pointer rounded border-neutral-dark text-accent focus:ring-2 focus:ring-accent"
                           />
                           <span className="text-sm font-medium text-primary-darker">
                              Chọn tất cả ({items.length})
                           </span>
                        </label>

                        <button
                           onClick={removeSelectedItems}
                           className="text-neutral-darker transition hover:text-primary-darker disabled:cursor-not-allowed disabled:text-neutral-dark"
                           disabled={selectedItems.length === 0}
                           aria-label="Xóa các sản phẩm đã chọn"
                        >
                           <Trash2 className="h-5 w-5" />
                        </button>
                     </div>

                     {/* Cart Items List */}
                     <div className="space-y-4">
                        {items.map((item) => (
                           <div
                              key={item.id}
                              className="rounded-lg bg-neutral-light p-4 border border-neutral"
                           >
                              <div className="flex gap-4">
                                 {/* Checkbox - Centered */}
                                 <div className="flex items-center">
                                    <input
                                       type="checkbox"
                                       checked={item.selected}
                                       onChange={() =>
                                          toggleSelectItem(item.id)
                                       }
                                       className="h-5 w-5 cursor-pointer rounded border-neutral-dark text-accent focus:ring-2 focus:ring-accent"
                                    />
                                 </div>

                                 {/* Product Image */}
                                 <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-neutral bg-neutral-light">
                                    {item.image_url ? (
                                       <Image
                                          src={item.image_url}
                                          alt={item.product_name}
                                          fill
                                          className="object-cover"
                                       />
                                    ) : (
                                       <div className="flex h-full w-full items-center justify-center bg-neutral">
                                          <div className="h-16 w-16 rounded-lg bg-neutral-dark"></div>
                                       </div>
                                    )}
                                 </div>

                                 {/* Product Details */}
                                 <div className="flex flex-1 flex-col sm:flex-row sm:justify-between gap-3">
                                    {/* Info + Mobile Actions */}
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-start justify-between gap-2 mb-1">
                                          <h3 className="flex-1 text-sm font-medium text-primary-darker line-clamp-2">
                                             {item.product_name}
                                          </h3>
                                          {/* Trash button - Top right on mobile */}
                                          <button
                                             onClick={() => removeItem(item.id)}
                                             className="sm:hidden text-neutral-dark transition hover:text-primary-darker flex-shrink-0"
                                             aria-label="Xóa sản phẩm"
                                          >
                                             <Trash2 className="h-5 w-5" />
                                          </button>
                                       </div>

                                       {/* Variant Dropdown - INLINE */}
                                       <VariantDropdown
                                          cartItemId={item.id}
                                          productId={item.product_id || item.id}
                                          currentVariantId={
                                             item.product_variant_id
                                          }
                                          currentVariantName={item.variant_name}
                                          onVariantChange={handleVariantChange}
                                       />

                                       {/* Mobile: Price Section */}
                                       <div className="sm:hidden">
                                          <div className="flex items-center justify-between mb-3">
                                             <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-promotion">
                                                   {formatPrice(item.price)}
                                                </span>
                                                {item.original_price >
                                                   item.price && (
                                                   <span className="text-xs text-neutral-dark line-through">
                                                      {formatPrice(
                                                         item.original_price
                                                      )}
                                                   </span>
                                                )}
                                             </div>
                                          </div>

                                          {/* Quantity + Total */}
                                          <div className="flex items-center justify-between">
                                             <div className="flex items-center gap-2">
                                                <button
                                                   onClick={() =>
                                                      updateQuantity(
                                                         item.id,
                                                         -1
                                                      )
                                                   }
                                                   className="flex h-8 w-8 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
                                                   disabled={item.quantity <= 1}
                                                   aria-label="Giảm số lượng"
                                                >
                                                   <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium text-primary-darker">
                                                   {item.quantity}
                                                </span>
                                                <button
                                                   onClick={() =>
                                                      updateQuantity(item.id, 1)
                                                   }
                                                   className="flex h-8 w-8 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light"
                                                   aria-label="Tăng số lượng"
                                                >
                                                   <Plus className="h-4 w-4" />
                                                </button>
                                             </div>

                                             <span className="text-base font-bold text-promotion">
                                                {formatPrice(
                                                   item.price * item.quantity
                                                )}
                                             </span>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Desktop: Price + Quantity + Total + Delete */}
                                    <div className="hidden sm:flex items-center gap-4 lg:gap-6">
                                       {/* Price */}
                                       <div className="flex flex-col items-end min-w-[80px]">
                                          <span className="text-sm lg:text-base font-semibold text-promotion">
                                             {formatPrice(item.price)}
                                          </span>
                                          {item.original_price > item.price && (
                                             <span className="text-xs text-neutral-dark line-through">
                                                {formatPrice(
                                                   item.original_price
                                                )}
                                             </span>
                                          )}
                                       </div>

                                       {/* Quantity Controls */}
                                       <div className="flex items-center gap-2">
                                          <button
                                             onClick={() =>
                                                updateQuantity(item.id, -1)
                                             }
                                             className="flex h-7 w-7 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
                                             disabled={item.quantity <= 1}
                                             aria-label="Giảm số lượng"
                                          >
                                             <Minus className="h-3 w-3" />
                                          </button>
                                          <span className="w-8 text-center text-sm font-medium text-primary-darker">
                                             {item.quantity}
                                          </span>
                                          <button
                                             onClick={() =>
                                                updateQuantity(item.id, 1)
                                             }
                                             className="flex h-7 w-7 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light"
                                             aria-label="Tăng số lượng"
                                          >
                                             <Plus className="h-3 w-3" />
                                          </button>
                                       </div>

                                       {/* Total Price */}
                                       <div className="min-w-[100px] text-right">
                                          <span className="text-sm lg:text-base font-semibold text-promotion">
                                             {formatPrice(
                                                item.price * item.quantity
                                             )}
                                          </span>
                                       </div>

                                       {/* Delete Button */}
                                       <button
                                          onClick={() => removeItem(item.id)}
                                          className="text-neutral-dark transition hover:text-primary-darker"
                                          aria-label="Xóa sản phẩm"
                                       >
                                          <Trash2 className="h-5 w-5" />
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* RIGHT COLUMN - Summary (Desktop only) */}
                  <div className="hidden lg:block lg:col-span-1 space-y-3 sm:space-y-4">
                     {/* Gifts Box */}
                     <div className="rounded-lg bg-neutral-light border border-neutral">
                        <button className="flex w-full items-center justify-between p-3 sm:p-4 transition hover:bg-neutral-light">
                           <div className="flex items-center gap-3">
                              <span className="text-lg">🎁</span>
                              <span className="text-sm font-medium text-primary-darker">
                                 Quà tặng
                              </span>
                           </div>
                           <span className="text-sm text-neutral-dark">
                              Xem quà ({selectedPromotions.length})
                           </span>
                        </button>
                     </div>

                     {/* Voucher - Click to open modal */}
                     <div className="rounded-lg bg-neutral-light">
                        <button
                           onClick={() => setShowVoucherModal(true)}
                           className="flex w-full items-center justify-between p-3 sm:p-4 hover:bg-accent-light group bg-neutral-light border border-neutral rounded-lg"
                        >
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-lg shrink-0">🏷️</span>
                              <div className="flex flex-col items-start min-w-0">
                                 <span className="text-sm font-medium text-primary-darker">
                                    Chọn hoặc nhập ưu đãi
                                 </span>
                                 {appliedVoucherCode && (
                                    <span className="text-xs text-accent-dark font-semibold truncate w-full">
                                       {appliedVoucherCode} • -
                                       {formatPrice(appliedVoucherValue)}
                                    </span>
                                 )}
                              </div>
                           </div>
                           <ChevronRight className="h-5 w-5 text-neutral-dark group-hover:text-primary transition-colors shrink-0" />
                        </button>
                     </div>

                     {/* Points */}
                     <div className="rounded-lg p-3 sm:p-4 bg-neutral-light border border-neutral">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <span className="text-lg">🪙</span>
                              <span className="text-sm text-primary-darker">
                                 Đổi <span className="font-semibold">0</span>{" "}
                                 điểm (≈
                                 <span className="font-semibold">0₫</span>)
                              </span>
                           </div>
                           <label className="relative inline-flex cursor-pointer items-center">
                              <input
                                 type="checkbox"
                                 checked={usePoints}
                                 onChange={(e) =>
                                    setUsePoints(e.target.checked)
                                 }
                                 className="peer sr-only"
                              />
                              <div className="peer h-6 w-11 rounded-full bg-neutral after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-dark after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent"></div>
                           </label>
                        </div>
                     </div>

                     {/* Order Summary Box */}
                     <div className="rounded-lg bg-neutral-light border border-neutral">
                        <div className="p-3 sm:p-4">
                           <h3 className="mb-3 text-sm sm:text-base font-semibold text-primary-darker">
                              Thông tin đơn hàng
                           </h3>

                           <div className="space-y-2.5 text-sm">
                              <div className="flex justify-between">
                                 <span className="text-neutral-darker">
                                    Tổng tiền
                                 </span>
                                 <span className="font-medium text-primary-darker">
                                    {formatPrice(subtotal)}
                                 </span>
                              </div>

                              <div className="flex justify-between">
                                 <span className="text-neutral-darker">
                                    Tổng khuyến mãi
                                 </span>
                                 <span className="font-medium text-primary-darker">
                                    -{formatPrice(totalDiscountWithVoucher)}
                                 </span>
                              </div>

                              <div className="flex justify-between pl-4">
                                 <span className="text-neutral-dark text-xs">
                                    Giảm giá sản phẩm
                                 </span>
                                 <span className="text-primary-darker text-sm">
                                    -{formatPrice(totalDiscount)}
                                 </span>
                              </div>

                              <div className="flex justify-between pl-4">
                                 <span className="text-neutral-dark text-xs">
                                    Voucher
                                 </span>
                                 <span className="text-primary-darker text-sm font-medium">
                                    {appliedVoucherValue > 0
                                       ? `-${formatPrice(appliedVoucherValue)}`
                                       : "0₫"}
                                 </span>
                              </div>

                              <div className="border-t border-neutral pt-2.5 mt-2.5">
                                 <div className="flex justify-between items-center">
                                    <span className="font-semibold text-primary-darker text-sm">
                                       Cần thanh toán
                                    </span>
                                    <span className="text-xl font-bold text-promotion">
                                       {formatPrice(finalTotalWithVoucher)}
                                    </span>
                                 </div>
                              </div>

                              <div className="flex items-center gap-1 pt-2">
                                 <span className="text-xs text-neutral-darker">
                                    Điểm thưởng
                                 </span>
                                 <span className="text-sm">🪙</span>
                                 <span className="text-sm font-medium text-accent-dark">
                                    +{rewardPoints.toLocaleString()}
                                 </span>
                              </div>
                           </div>

                           {showSummary && (
                              <button
                                 onClick={() => setShowSummary(!showSummary)}
                                 className="mt-3 flex w-full items-center justify-center gap-1 text-xs sm:text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                              >
                                 Rút gọn
                                 <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                           )}
                        </div>

                        {/* Checkout Button */}
                        <Link
                           href="/checkout"
                           className={`block w-full rounded-b-lg py-3.5 text-center text-base font-semibold transition ${
                              selectedItems.length === 0
                                 ? "cursor-not-allowed bg-neutral text-neutral-dark"
                                 : "bg-accent text-primary-darker hover:bg-accent-hover shadow-lg"
                           }`}
                           onClick={(e) => {
                              if (selectedItems.length === 0) {
                                 e.preventDefault();
                              }
                           }}
                        >
                           Xác nhận đơn
                        </Link>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Floating Button - Show on mobile/tablet only - FIXED POSITION */}
         <div className="fixed bottom-0 left-0 right-0 bg-accent border-t-2 border-accent-dark p-3 z-30 lg:hidden shadow-2xl">
            <button
               onClick={() => setShowSidebar(true)}
               className="w-full bg-primary-darker hover:bg-primary text-accent font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-between shadow-xl"
            >
               <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 flex-shrink-0" />
                  <span className="text-left">
                     Xem đơn hàng ({selectedItems.length})
                  </span>
               </div>
               <span className="font-bold flex-shrink-0 text-lg">
                  {formatPrice(finalTotalWithVoucher)}
               </span>
            </button>
         </div>

         {/* Cart Sidebar - Show on mobile/tablet only */}
         <CartSidebar
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
            subtotal={subtotal}
            totalDiscount={totalDiscountWithVoucher}
            finalTotal={finalTotalWithVoucher}
            rewardPoints={rewardPoints}
            selectedItemsCount={selectedItems.length}
            appliedVoucherCode={appliedVoucherCode}
            appliedVoucherValue={appliedVoucherValue}
            onOpenVoucherModal={() => setShowVoucherModal(true)}
         />

         {/* Voucher Modal */}
         <VoucherPromotionModal
            isOpen={showVoucherModal}
            onClose={() => setShowVoucherModal(false)}
            selectedPromotions={selectedPromotions}
            onSelectPromotions={handleSelectPromotions}
            appliedVoucherCode={appliedVoucherCode}
            appliedVoucherValue={appliedVoucherValue}
            onApplyVoucher={handleApplyVoucher}
            cartTotal={subtotal}
         />
      </div>
   );
}
