"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import VoucherPromotionModal from "./components/VoucherPromotionModal";
import CartVariantSelector from "./components/CartVariantSelector";
import OrderSummary from "@/components/OrderSummary/OrderSummary";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import { useCart } from "@/hooks/useCart";
import { useVoucher } from "@/hooks/useVoucher";
import CartSidebar from "./components/CartSidebar";
import DeleteConfirmSidebar from "./components/DeleteConfirmSidebar";
import { CartItemWithDetails } from "./types/cart.types";
import { formatVND } from "@/helpers";

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

  const [showSummary, setShowSummary] = useState(true);
  const [usePoints, setUsePoints] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [promotionValue, setPromotionValue] = useState(0);

  // ── Delete single item confirm sidebar ────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Delete ALL selected items confirm sidebar ─────────────────────────────
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // ── Voucher state ─────────────────────────────────────────────────────────
  const {
    applied: appliedVoucher,
    applyByInput: _applyByInput,
    applyFromList: _applyFromList,
    clearVoucher: _clearVoucher,
  } = useVoucher({ cartTotal: subtotal });

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValue, setVoucherValue] = useState(0);
  const [voucherId, setVoucherId] = useState("");

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
            items={[{ label: "Trang chủ", href: "/" }, { label: "Giỏ hàng" }]}
          />
        </div>
      </div>

      <div className="container pb-28 lg:pb-8 space-y-4 px-3">
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
                    <circle cx="30" cy="49" r="3.5" fill="currentColor" className="text-primary-darker" />
                    <circle cx="46" cy="49" r="3.5" fill="currentColor" className="text-primary-darker" />
                    <circle cx="35" cy="31" r="1.5" fill="currentColor" className="text-primary-darker" />
                    <circle cx="45" cy="31" r="1.5" fill="currentColor" className="text-primary-darker" />
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
              Hãy khám phá và thêm sản phẩm yêu thích vào giỏ hàng để tiếp tục mua sắm nhé!
            </p>
            <Link
              href="/category/dien-thoai"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-dark text-neutral-light px-8 sm:px-10 py-3 sm:py-3.5 font-semibold transition hover:bg-accent-hover shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-150"
            >
              <ShoppingCart className="h-4 w-4" />
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-4">
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
                    className="rounded-lg bg-neutral-light p-4 border border-neutral"
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleSelectItem(item.id)}
                          className="h-5 w-5 cursor-pointer rounded border-neutral-dark text-accent focus:ring-2 focus:ring-accent"
                        />
                      </div>

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
                            <div className="h-16 w-16 rounded-lg bg-neutral-dark" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col sm:flex-row sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-primary line-clamp-2">
                                {item.productName}
                              </h3>
                              <span className="text-xs font-medium text-neutral-dark uppercase tracking-wide">
                                {item.brandName}
                              </span>
                            </div>
                            {/* Mobile: nút xoá đơn lẻ */}
                            <button
                              onClick={() => handleRemoveClick(item)}
                              className="sm:hidden text-neutral-dark transition hover:text-primary shrink-0 cursor-pointer"
                              aria-label="Xóa sản phẩm"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          {item.color && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-neutral shrink-0"
                                style={{ backgroundColor: item.colorValue }}
                              />
                              <span className="text-xs text-neutral-dark">
                                Màu: {item.color}
                              </span>
                            </div>
                          )}

                          <CartVariantSelector
                            cartItemId={item.id}
                            productSlug={item.productSlug}
                            currentVariantId={item.productVariantId}
                            currentVariantCode={item.variantCode}
                            currentQuantity={item.quantity}
                            onSuccess={() => refetchCart(true)}
                            onUpdateItem={(patch) => updateItem(item.id, patch)}
                          />

                          {/* Mobile price */}
                          <div className="sm:hidden">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-promotion">
                                  {formatVND(item.unitPrice)}
                                </span>
                                {item.originalPrice &&
                                  item.originalPrice > item.unitPrice && (
                                    <span className="text-xs text-neutral-dark line-through">
                                      {formatVND(item.originalPrice)}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="flex h-8 w-8 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium text-primary">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="flex h-8 w-8 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <span className="text-base font-bold text-promotion">
                                {formatVND(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Desktop price */}
                        <div className="hidden sm:flex items-center gap-4 lg:gap-6">
                          <div className="flex flex-col items-end min-w-20">
                            <span className="text-sm lg:text-base font-semibold text-promotion">
                              {formatVND(item.unitPrice)}
                            </span>
                            {item.originalPrice &&
                              item.originalPrice > item.unitPrice && (
                                <span className="text-xs text-neutral-dark line-through">
                                  {formatVND(item.originalPrice)}
                                </span>
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="flex h-7 w-7 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-primary">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded border border-neutral text-neutral-darker transition hover:border-accent hover:bg-accent-light cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="min-w-25 text-right">
                            <span className="text-sm lg:text-base font-semibold text-promotion">
                              {formatVND(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                          {/* Desktop: nút xoá đơn lẻ */}
                          <button
                            onClick={() => handleRemoveClick(item)}
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

            {/* RIGHT COLUMN - Desktop */}
            <div className="hidden lg:block lg:col-span-1 border border-neutral">
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

      {/* Floating Button - mobile */}
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
            {formatVND(finalTotalWithVoucher)}
          </span>
        </button>
      </div>

      <CartSidebar
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
      />

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