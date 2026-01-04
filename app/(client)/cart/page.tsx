// app/(client)/cart/page.tsx
"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ChevronRight, ChevronUp, ShoppingCart } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import Image from "next/image";
import CartSidebar from "./components/CartSidebar";
import VoucherPromotionModal from "./components/VoucherPromotionModal";

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

  const formatPrice = useCallback((price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫", []);

  const handleSelectPromotions = useCallback((promotionIds: string[], totalValue: number) => {
    setSelectedPromotions(promotionIds);
    setPromotionValue(totalValue);
  }, []);

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
          <p className="text-neutral-darker font-poppins">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light py-4 sm:py-6 lg:py-8 pb-24 lg:pb-8 font-poppins">
      <div className="container">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm">
          <Link href="/" className="text-primary hover:text-primary-hover transition-colors">
            Trang chủ
          </Link>
          <span className="text-neutral-dark">/</span>
          <span className="text-primary-darker font-medium">Giỏ hàng</span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg bg-white p-8 sm:p-12 text-center shadow-sm">
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
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Select All Box */}
              <div className="flex items-center justify-between rounded-lg bg-white px-3 sm:px-4 py-3 shadow-sm">
                <label className="flex cursor-pointer items-center gap-2 sm:gap-3">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer rounded border-neutral-dark text-accent focus:ring-2 focus:ring-accent"
                  />
                  <span className="text-xs sm:text-sm font-medium text-primary-darker">
                    Chọn tất cả ({items.length})
                  </span>
                </label>

                <button
                  onClick={removeSelectedItems}
                  className="text-neutral-darker transition hover:text-promotion disabled:cursor-not-allowed disabled:text-neutral-dark"
                  disabled={selectedItems.length === 0}
                  aria-label="Xóa các sản phẩm đã chọn"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg bg-white p-3 sm:p-4 shadow-sm"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Checkbox - Centered */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleSelectItem(item.id)}
                          className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer rounded border-neutral-dark text-accent focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      {/* Product Image */}
                      <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg border border-neutral bg-neutral-light">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-neutral">
                            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-neutral-dark"></div>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col sm:flex-row sm:justify-between gap-3">
                        {/* Info + Mobile Actions */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="flex-1 text-xs sm:text-sm font-medium text-primary-darker line-clamp-2">
                              {item.product_name}
                            </h3>
                            {/* Trash button - Top right on mobile */}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="sm:hidden text-neutral-dark transition hover:text-promotion flex-shrink-0"
                              aria-label="Xóa sản phẩm"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-neutral-darker mb-2">
                            <span>{item.variant_name}</span>
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>

                          {/* Mobile: Price Section */}
                          <div className="sm:hidden">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-promotion">
                                  {formatPrice(item.price)}
                                </span>
                                {item.original_price > item.price && (
                                  <span className="text-xs text-neutral-dark line-through">
                                    {formatPrice(item.original_price)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quantity + Total */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
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
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="flex h-8 w-8 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light"
                                  aria-label="Tăng số lượng"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <span className="text-base font-bold text-promotion">
                                {formatPrice(item.price * item.quantity)}
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
                                {formatPrice(item.original_price)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
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
                              onClick={() => updateQuantity(item.id, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light"
                              aria-label="Tăng số lượng"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Total Price */}
                          <div className="min-w-[100px] text-right">
                            <span className="text-sm lg:text-base font-semibold text-promotion">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-dark transition hover:text-promotion"
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
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🎁</span>
                    <span className="text-sm font-medium text-primary-darker">
                      Quà tặng
                    </span>
                  </div>
                  <span className="text-sm text-neutral-dark">Xem quà ({selectedPromotions.length})</span>
                </button>
              </div>

              {/* Voucher - Click to open modal */}
              <div className="rounded-lg bg-white border border-neutral shadow-sm">
                <button 
                  onClick={() => setShowVoucherModal(true)}
                  className="flex w-full items-center justify-between p-3 sm:p-4 transition hover:bg-accent-light group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">🏷️</span>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-primary-darker">
                        Chọn hoặc nhập ưu đãi
                      </span>
                      {appliedVoucherCode && (
                        <span className="text-xs text-accent-dark font-semibold truncate w-full">
                          {appliedVoucherCode} • -{formatPrice(appliedVoucherValue)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-dark group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              </div>

              {/* Points */}
              <div className="rounded-lg bg-white border border-neutral shadow-sm p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🪙</span>
                    <span className="text-sm text-primary-darker">
                      Đổi <span className="font-semibold">0</span> điểm (≈<span className="font-semibold">0₫</span>)
                    </span>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-neutral after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-dark after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent"></div>
                  </label>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="rounded-lg bg-white border border-neutral shadow-sm">
                <div className="p-3 sm:p-4">
                  <h3 className="mb-3 text-sm sm:text-base font-semibold text-primary-darker">
                    Thông tin đơn hàng
                  </h3>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-darker">Tổng tiền</span>
                      <span className="font-medium text-primary-darker">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-darker">Tổng khuyến mãi</span>
                      <span className="font-medium text-primary-darker">
                        -{formatPrice(totalDiscountWithVoucher)}
                      </span>
                    </div>

                    <div className="flex justify-between pl-4">
                      <span className="text-neutral-dark text-xs">Giảm giá sản phẩm</span>
                      <span className="text-primary-darker text-sm">
                        -{formatPrice(totalDiscount)}
                      </span>
                    </div>

                    <div className="flex justify-between pl-4">
                      <span className="text-neutral-dark text-xs">Voucher</span>
                      <span className="text-primary-darker text-sm font-medium">
                        {appliedVoucherValue > 0 ? `-${formatPrice(appliedVoucherValue)}` : "0₫"}
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
                      <span className="text-xs text-neutral-darker">Điểm thưởng</span>
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

            {/* Floating Button - Show on mobile/tablet only */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral p-4 z-30 lg:hidden">
              <button
                onClick={() => setShowSidebar(true)}
                className="w-full bg-accent hover:bg-accent-hover text-primary-darker font-semibold py-3 px-4 rounded-lg transition flex items-center gap-3 shadow-lg"
              >
                <ShoppingCart className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-left">Xem đơn hàng ({selectedItems.length})</span>
                <span className="font-bold flex-shrink-0">{formatPrice(finalTotalWithVoucher)}</span>
              </button>
            </div>
          </div>
        )}

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
        />
      </div>
    </div>
  );
}