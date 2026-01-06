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
      <div className="min-h-screen bg-neutral-light py-3 sm:py-4 md:py-6 lg:py-8 pb-20 sm:pb-24 lg:pb-8 font-poppins">
         <div className="container">
            {/* Breadcrumb */}
            <div className="mb-3 sm:mb-4 md:mb-6 flex items-center gap-1.5 sm:gap-2 text-xs flex-wrap">
               <Link
                  href="/"
                  className="text-primary hover:text-primary-hover transition-colors whitespace-nowrap"
               >
                  Trang chủ
               </Link>
               <span className="text-neutral-dark">/</span>
               <span className="text-primary-darker font-medium whitespace-nowrap">
                  Giỏ hàng
               </span>
            </div>

            {items.length === 0 ? (
               <div className="rounded-lg bg-white p-6 sm:p-8 md:p-12 text-center shadow-sm">
                  <h2 className="mb-2 text-base sm:text-lg md:text-xl font-semibold text-primary-darker">
                     Giỏ hàng trống
                  </h2>
                  <p className="mb-4 sm:mb-6 text-xs sm:text-sm md:text-base text-neutral-darker">
                     Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
                  </p>
                  <Link
                     href="/products"
                     className="inline-block rounded-lg bg-accent px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base font-semibold text-primary-darker transition hover:bg-accent-hover"
                  >
                     Mua sắm ngay
                  </Link>
               </div>
            ) : (
               <div className="grid gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-3">
                  {/* LEFT COLUMN - Cart Items */}
                  <div className="lg:col-span-2 space-y-2.5 sm:space-y-3 md:space-y-4">
                     {/* Select All Box */}
                     <div className="flex items-center justify-between rounded-lg bg-white px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-3 shadow-sm">
                        <label className="flex cursor-pointer items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-1">
                           <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={toggleSelectAll}
                              className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer rounded border-neutral-dark text-accent focus:ring-2 focus:ring-accent shrink-0"
                           />
                           <span className="text-xs sm:text-sm font-medium text-primary-darker truncate">
                              Chọn tất cả ({items.length})
                           </span>
                        </label>

                        <button
                           onClick={removeSelectedItems}
                           className="text-neutral-darker transition hover:text-promotion disabled:cursor-not-allowed disabled:text-neutral-dark shrink-0 ml-1.5 sm:ml-2"
                           disabled={selectedItems.length === 0}
                           aria-label="Xóa các sản phẩm đã chọn"
                        >
                           <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                     </div>

                     {/* Cart Items List */}
                     <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                        {items.map((item) => (
                           <div
                              key={item.id}
                              className="rounded-lg bg-white p-2.5 sm:p-3 md:p-4 shadow-sm"
                           >
                              <div className="flex gap-2 sm:gap-3">
                                 {/* Checkbox */}
                                 <div className="flex items-start shrink-0 pt-1">
                                    <input
                                       type="checkbox"
                                       checked={item.selected}
                                       onChange={() =>
                                          toggleSelectItem(item.id)
                                       }
                                       className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer rounded border-neutral-dark text-accent focus:ring-2 focus:ring-accent"
                                    />
                                 </div>

                                 {/* Product Image */}
                                 <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-lg border border-neutral bg-neutral-light">
                                    {item.image_url ? (
                                       <Image
                                          src={item.image_url}
                                          alt={item.product_name}
                                          fill
                                          className="object-cover"
                                       />
                                    ) : (
                                       <div className="flex h-full w-full items-center justify-center bg-neutral">
                                          <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 rounded-lg bg-neutral-dark"></div>
                                       </div>
                                    )}
                                 </div>

                                 {/* Product Details */}
                                 <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2">
                                    {/* Top: Name + Delete (Mobile) */}
                                    <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                                       <h3 className="flex-1 text-xs sm:text-sm font-medium text-primary-darker line-clamp-2 min-w-0 break-words">
                                          {item.product_name}
                                       </h3>
                                       <button
                                          onClick={() => removeItem(item.id)}
                                          className="sm:hidden text-neutral-dark transition hover:text-promotion shrink-0"
                                          aria-label="Xóa sản phẩm"
                                       >
                                          <Trash2 className="h-4 w-4" />
                                       </button>
                                    </div>

                                    {/* Variant Name */}
                                    <div className="flex items-center gap-1 text-xs text-neutral-darker min-w-0">
                                       <span className="truncate">
                                          {item.variant_name}
                                       </span>
                                       <svg
                                          className="h-3 w-3 shrink-0"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                       >
                                          <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth={2}
                                             d="M19 9l-7 7-7-7"
                                          />
                                       </svg>
                                    </div>

                                    {/* MOBILE LAYOUT */}
                                    <div className="sm:hidden space-y-1.5 sm:space-y-2">
                                       {/* Price */}
                                       <div className="flex flex-col">
                                          <span className="text-xs sm:text-sm font-semibold text-promotion">
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

                                       {/* Quantity + Total */}
                                       <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                                          <div className="flex items-center gap-1">
                                             <button
                                                onClick={() =>
                                                   updateQuantity(item.id, -1)
                                                }
                                                className="flex h-7 w-7 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                                                disabled={item.quantity <= 1}
                                                aria-label="Giảm số lượng"
                                             >
                                                <Minus className="h-3 w-3" />
                                             </button>
                                             <span className="w-7 text-center text-xs sm:text-sm font-medium text-primary-darker">
                                                {item.quantity}
                                             </span>
                                             <button
                                                onClick={() =>
                                                   updateQuantity(item.id, 1)
                                                }
                                                className="flex h-7 w-7 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light shrink-0"
                                                aria-label="Tăng số lượng"
                                             >
                                                <Plus className="h-3 w-3" />
                                             </button>
                                          </div>

                                          <span className="text-xs sm:text-sm font-bold text-promotion shrink-0 whitespace-nowrap">
                                             {formatPrice(
                                                item.price * item.quantity
                                             )}
                                          </span>
                                       </div>
                                    </div>

                                    {/* DESKTOP LAYOUT */}
                                    <div className="hidden sm:flex items-center gap-2 lg:gap-3 flex-wrap">
                                       {/* Price Column */}
                                       <div className="flex flex-col items-start shrink-0">
                                          <span className="text-sm lg:text-base font-semibold text-promotion whitespace-nowrap">
                                             {formatPrice(item.price)}
                                          </span>
                                          {item.original_price > item.price && (
                                             <span className="text-xs text-neutral-dark line-through whitespace-nowrap">
                                                {formatPrice(
                                                   item.original_price
                                                )}
                                             </span>
                                          )}
                                       </div>

                                       {/* Quantity Controls */}
                                       <div className="flex items-center gap-1 shrink-0">
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
                                          <span className="w-7 text-center text-sm font-medium text-primary-darker">
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
                                       <div className="flex-1 text-right min-w-0">
                                          <span className="text-sm lg:text-base font-semibold text-promotion whitespace-nowrap">
                                             {formatPrice(
                                                item.price * item.quantity
                                             )}
                                          </span>
                                       </div>

                                       {/* Delete Button */}
                                       <button
                                          onClick={() => removeItem(item.id)}
                                          className="text-neutral-dark transition hover:text-promotion shrink-0"
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
                     <div className="rounded-lg bg-white border border-neutral shadow-sm">
                        <button className="flex w-full items-center justify-between p-3 sm:p-4 transition hover:bg-neutral-light">
                           <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-lg shrink-0">🎁</span>
                              <span className="text-sm font-medium text-primary-darker truncate">
                                 Quà tặng
                              </span>
                           </div>
                           <span className="text-sm text-neutral-dark shrink-0 ml-2 whitespace-nowrap">
                              Xem quà ({selectedPromotions.length})
                           </span>
                        </button>
                     </div>

                     {/* Voucher */}
                     <div className="rounded-lg bg-white border border-neutral shadow-sm">
                        <button
                           onClick={() => setShowVoucherModal(true)}
                           className="flex w-full items-center justify-between p-3 sm:p-4 transition hover:bg-accent-light group"
                        >
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-lg shrink-0">🏷️</span>
                              <div className="flex flex-col items-start min-w-0 flex-1">
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
                           <ChevronRight className="h-5 w-5 text-neutral-dark group-hover:text-primary transition-colors shrink-0 ml-2" />
                        </button>
                     </div>

                     {/* Points */}
                     <div className="rounded-lg bg-white border border-neutral shadow-sm p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-2">
                           <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-lg shrink-0">🪙</span>
                              <span className="text-sm text-primary-darker truncate">
                                 Đổi <span className="font-semibold">0</span>{" "}
                                 điểm (≈
                                 <span className="font-semibold">0₫</span>)
                              </span>
                           </div>
                           <label className="relative inline-flex cursor-pointer items-center shrink-0">
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

                     {/* Order Summary */}
                     <div className="rounded-lg bg-white border border-neutral shadow-sm">
                        <div className="p-3 sm:p-4">
                           <h3 className="mb-3 text-sm sm:text-base font-semibold text-primary-darker">
                              Thông tin đơn hàng
                           </h3>

                           <div className="space-y-2.5 text-sm">
                              <div className="flex justify-between gap-2">
                                 <span className="text-neutral-darker">
                                    Tổng tiền
                                 </span>
                                 <span className="font-medium text-primary-darker shrink-0 whitespace-nowrap">
                                    {formatPrice(subtotal)}
                                 </span>
                              </div>

                              <div className="flex justify-between gap-2">
                                 <span className="text-neutral-darker">
                                    Tổng khuyến mãi
                                 </span>
                                 <span className="font-medium text-primary-darker shrink-0 whitespace-nowrap">
                                    -{formatPrice(totalDiscountWithVoucher)}
                                 </span>
                              </div>

                              <div className="flex justify-between pl-4 gap-2">
                                 <span className="text-neutral-dark text-xs">
                                    Giảm giá sản phẩm
                                 </span>
                                 <span className="text-primary-darker text-sm shrink-0 whitespace-nowrap">
                                    -{formatPrice(totalDiscount)}
                                 </span>
                              </div>

                              <div className="flex justify-between pl-4 gap-2">
                                 <span className="text-neutral-dark text-xs">
                                    Voucher
                                 </span>
                                 <span className="text-primary-darker text-sm font-medium shrink-0 whitespace-nowrap">
                                    {appliedVoucherValue > 0
                                       ? `-${formatPrice(appliedVoucherValue)}`
                                       : "0₫"}
                                 </span>
                              </div>

                              <div className="border-t border-neutral pt-2.5 mt-2.5">
                                 <div className="flex justify-between items-center gap-2">
                                    <span className="font-semibold text-primary-darker text-sm">
                                       Cần thanh toán
                                    </span>
                                    <span className="text-xl font-bold text-promotion shrink-0 whitespace-nowrap">
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

                  {/* Floating Button - Mobile/Tablet */}
                  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral p-2.5 sm:p-4 z-30 lg:hidden">
                     <div className="container">
                        <button
                           onClick={() => setShowSidebar(true)}
                           className="w-full bg-accent hover:bg-accent-hover text-primary-darker font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition flex items-center gap-2 sm:gap-3 shadow-lg"
                        >
                           <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                           <span className="flex-1 text-left text-xs sm:text-sm md:text-base min-w-0 truncate">
                              Xem đơn hàng ({selectedItems.length})
                           </span>
                           <span className="font-bold text-xs sm:text-sm md:text-base shrink-0 whitespace-nowrap">
                              {formatPrice(finalTotalWithVoucher)}
                           </span>
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* Cart Sidebar */}
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
            />
         </div>
      </div>
   );
}
