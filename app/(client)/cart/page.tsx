"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import VoucherPromotionModal from "./components/VoucherPromotionModal";
import VariantDropdown from "./components/CartVariantSelector";
import OrderSummary from "@/components/odersummary/OrderSummary";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import { useCart } from "@/hooks/useCart";
import CartSidebar from "./components/cartSidebar";

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
      removeItem,
      removeSelectedItems,
      subtotal,
      totalDiscount,
      finalTotal,
      rewardPoints,
   } = useCart();
   console.log(items);

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
      [],
   );

   const handleSelectPromotions = useCallback(
      (promotionIds: string[], totalValue: number) => {
         setSelectedPromotions(promotionIds);
         setPromotionValue(totalValue);
      },
      [],
   );

   const handleApplyVoucher = useCallback((code: string, value: number) => {
      setAppliedVoucherCode(code);
      setAppliedVoucherValue(value);
   }, []);

   // Handle variant change
   const handleVariantChange = useCallback(
      (
         cartItemId: string,
         variantId: string,
         variantName: string,
         price: number,
      ) => {
         toast.success("Đã cập nhật phiên bản sản phẩm");
      },
      [],
   );

   // Handle checkout - Save selected items to localStorage and navigate
   // Checkout page đọc localStorage["checkoutData"] → KHÔNG cần sửa gì ở checkout
   const handleCheckout = useCallback(() => {
      if (selectedItems.length === 0) {
         toast.error("Vui lòng chọn ít nhất một sản phẩm");
         return;
      }

      // Lưu TẤT CẢ thông tin vào localStorage
      const checkoutData = {
         selectedItems: selectedItems,
         selectedPromotions: selectedPromotions,
         promotionValue: promotionValue,
         appliedVoucherCode: appliedVoucherCode,
         appliedVoucherValue: appliedVoucherValue,
         subtotal: subtotal,
         totalDiscount: totalDiscount,
         finalTotal: finalTotal,
         rewardPoints: rewardPoints,
         usePoints: usePoints,
      };

      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

      // Navigate to checkout page
      router.push("/checkout");
   }, [
      selectedItems,
      selectedPromotions,
      promotionValue,
      appliedVoucherCode,
      appliedVoucherValue,
      subtotal,
      totalDiscount,
      finalTotal,
      rewardPoints,
      router,
      usePoints,
   ]);

   const finalTotalWithVoucher = Math.max(0, finalTotal - appliedVoucherValue);

   if (isLoading) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-neutral-light">
            <div className="text-center">
               <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-neutral border-t-accent"></div>
               <p className="text-neutral-darker">Đang tải giỏ hàng...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-neutral-light">
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
         {/* Main Content */}
         <div className="container pb-28 lg:pb-8 space-y-4 px-3">
            {items.length === 0 ? (
               <div className="rounded-lg bg-neutral-light p-6 sm:p-8 lg:p-12 text-center shadow-sm">
                  <h2 className="mb-2 text-lg sm:text-xl font-semibold text-primary">
                     Giỏ hàng trống
                  </h2>
                  <p className="mb-6 text-sm sm:text-base text-neutral-darker">
                     Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
                  </p>
                  <Link
                     href="/products"
                     className="inline-block rounded-lg bg-accent px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-primary transition hover:bg-accent-hover"
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
                           <span className="text-sm font-medium text-primary">
                              Chọn tất cả ({items.length})
                           </span>
                        </label>

                        <button
                           onClick={removeSelectedItems}
                           className="text-neutral-darker transition hover:text-primary disabled:cursor-not-allowed disabled:text-neutral-dark cursor-pointer"
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
                                 {/* Checkbox */}
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
                                 <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral bg-neutral-light">
                                    {item.image ? (
                                       <Image
                                          src={item.image}
                                          alt={item.productName}
                                          fill
                                          sizes="(max-width: 768px) 100vw, 50vw"
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
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-start justify-between gap-2 mb-1">
                                          <div className="flex-1 min-w-0">
                                             {/* Product Name */}
                                             <h3 className="text-sm font-medium text-primary line-clamp-2">
                                                {item.productName}
                                             </h3>
                                             {/* Brand */}
                                             <span className="text-xs font-medium text-neutral-dark uppercase tracking-wide">
                                                {item.brandName}
                                             </span>
                                          </div>
                                          <button
                                             onClick={() => removeItem(item.id)}
                                             className="sm:hidden text-neutral-dark transition hover:text-primary shrink-0 cursor-pointer"
                                             aria-label="Xóa sản phẩm"
                                          >
                                             <Trash2 className="h-5 w-5" />
                                          </button>
                                       </div>

                                       {/* Color */}
                                       {item.color && (
                                          <div className="flex items-center gap-1.5 mb-1">
                                             <span
                                                className="h-3.5 w-3.5 rounded-full border border-neutral shrink-0"
                                                style={{
                                                   backgroundColor:
                                                      item.colorValue,
                                                }}
                                             />
                                             <span className="text-xs text-neutral-dark">
                                                Màu: {item.color}
                                             </span>
                                          </div>
                                       )}

                                       {/* Variant Dropdown */}
                                       <VariantDropdown
                                          cartItemId={Number(item.id)}
                                          productId={Number(
                                             item.productId ?? item.id,
                                          )}
                                          currentVariantId={Number(
                                             item.productVariantId,
                                          )}
                                          currentVariantName={item.variantCode}
                                          onVariantChange={(
                                             cartItemId,
                                             variantId,
                                             variantName,
                                             price,
                                          ) =>
                                             handleVariantChange(
                                                String(cartItemId),
                                                String(variantId),
                                                variantName,
                                                price,
                                             )
                                          }
                                       />

                                       {/* Mobile: Price Section */}
                                       <div className="sm:hidden">
                                          <div className="flex items-center justify-between mb-3">
                                             <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-promotion">
                                                   {formatPrice(item.unitPrice)}
                                                </span>
                                                {item.originalPrice &&
                                                   item.originalPrice >
                                                      item.unitPrice && (
                                                      <span className="text-xs text-neutral-dark line-through">
                                                         {formatPrice(
                                                            item.originalPrice,
                                                         )}
                                                      </span>
                                                   )}
                                             </div>
                                          </div>
                                          <div className="flex items-center justify-between">
                                             <div className="flex items-center gap-2">
                                                <button
                                                   onClick={() =>
                                                      updateQuantity(
                                                         item.id,
                                                         -1,
                                                      )
                                                   }
                                                   className="flex h-8 w-8 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
                                                   disabled={item.quantity <= 1}
                                                   aria-label="Giảm số lượng"
                                                >
                                                   <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium text-primary">
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
                                                   item.unitPrice *
                                                      item.quantity,
                                                )}
                                             </span>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Desktop: Price + Quantity + Total + Delete */}
                                    <div className="hidden sm:flex items-center gap-4 lg:gap-6">
                                       <div className="flex flex-col items-end min-w-20">
                                          <span className="text-sm lg:text-base font-semibold text-promotion">
                                             {formatPrice(item.unitPrice)}
                                          </span>
                                          {item.originalPrice &&
                                             item.originalPrice >
                                                item.unitPrice && (
                                                <span className="text-xs text-neutral-dark line-through">
                                                   {formatPrice(
                                                      item.originalPrice,
                                                   )}
                                                </span>
                                             )}
                                       </div>

                                       <div className="flex items-center gap-2">
                                          <button
                                             onClick={() =>
                                                updateQuantity(item.id, -1)
                                             }
                                             className="flex h-7 w-7 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                             disabled={item.quantity <= 1}
                                             aria-label="Giảm số lượng"
                                          >
                                             <Minus className="h-3 w-3" />
                                          </button>
                                          <span className="w-8 text-center text-sm font-medium text-primary">
                                             {item.quantity}
                                          </span>
                                          <button
                                             onClick={() =>
                                                updateQuantity(item.id, 1)
                                             }
                                             className="flex h-7 w-7 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light cursor-pointer"
                                             aria-label="Tăng số lượng"
                                          >
                                             <Plus className="h-3 w-3" />
                                          </button>
                                       </div>

                                       <div className="min-w-25 text-right">
                                          <span className="text-sm lg:text-base font-semibold text-promotion">
                                             {formatPrice(
                                                item.unitPrice * item.quantity,
                                             )}
                                          </span>
                                       </div>

                                       <button
                                          onClick={() => removeItem(item.id)}
                                          className="text-neutral-dark transition hover:text-primary cursor-pointer"
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
                  <div className="hidden lg:block lg:col-span-1 border border-neutral">
                     <OrderSummary
                        subtotal={subtotal}
                        totalDiscount={totalDiscount}
                        finalTotal={finalTotal}
                        rewardPoints={rewardPoints}
                        selectedItemsCount={selectedItems.length}
                        appliedVoucherCode={appliedVoucherCode}
                        appliedVoucherValue={appliedVoucherValue}
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
         {/* Floating Button - Show on mobile/tablet only - FIXED POSITION */}
         <div className="fixed bottom-0 left-0 right-0 bg-accent border-t-2 border-accent-dark p-3 z-30 lg:hidden shadow-2xl">
            <button
               onClick={() => setShowSidebar(true)}
               className="w-full bg-primary-darker hover:bg-primary text-accent font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-between shadow-xl"
            >
               <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 shrink-0" />
                  <span className="text-left">
                     Xem đơn hàng ({selectedItems.length})
                  </span>
               </div>
               <span className="font-bold shrink-0 text-lg">
                  {formatPrice(finalTotalWithVoucher)}
               </span>
            </button>
         </div>
         {/* Cart Sidebar - Show on mobile/tablet only */}
         <CartSidebar
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
            subtotal={subtotal}
            totalDiscount={totalDiscount}
            finalTotal={finalTotal}
            rewardPoints={rewardPoints}
            selectedItemsCount={selectedItems.length}
            appliedVoucherCode={appliedVoucherCode}
            appliedVoucherValue={appliedVoucherValue}
            onOpenVoucherModal={() => setShowVoucherModal(true)}
            onCheckout={handleCheckout}
            usePoints={usePoints}
            onTogglePoints={setUsePoints}
         />
         {/* Voucher Modal */}
         <VoucherPromotionModal
            isOpen={showVoucherModal}
            onClose={() => setShowVoucherModal(false)}
            appliedVoucherCode={appliedVoucherCode}
            appliedVoucherValue={appliedVoucherValue}
            onApplyVoucher={handleApplyVoucher}
            cartTotal={subtotal}
         />
      </div>
   );
}