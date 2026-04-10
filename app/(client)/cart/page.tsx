"use client";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import VoucherPromotionModal from "./components/VoucherPromotionModal";
import OrderSummary from "@/components/OrderSummary/OrderSummary";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import { useCart } from "@/hooks/useCart";
import DeleteConfirmSidebar from "./components/DeleteConfirmSidebar";
import { CartItemWithDetails } from "./types/cart.types";
import { formatVND } from "@/helpers";
import { useToasty } from "@/components/Toast";
import CartBottomBar from "./components/CartBottomMobile";
import CartVariantSelector from "./components/CartVariantSelector";
import PageLoader from "@/components/shared/PageLoader";

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
    rawItems,
  } = useCart();

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

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValue, setVoucherValue] = useState(0);
  const [voucherId, setVoucherId] = useState("");

  // Local state cho input số lượng — cho phép xóa trống khi gõ
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});

  // ── Quantity handlers ────────────────────────────────────────────────────

  const handleIncrease = async (itemId: string) => {
    const success = await updateQuantity(itemId, 1);
    if (!success) toast.error("Số lượng vượt quá tồn kho");
  };

  const handleDecrease = async (itemId: string) => {
    await updateQuantity(itemId, -1);
  };

  // Khi gõ — chỉ lưu vào local state, chưa gọi API
  const handleQuantityChange = useCallback(
    (itemId: string, value: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const num = parseInt(value);
      // Nếu vượt tồn kho thì clamp luôn, không cho nhập tiếp
      if (!isNaN(num) && item.availableQuantity > 0 && num > item.availableQuantity) {
        toast.error(`Chỉ còn ${item.availableQuantity} sản phẩm trong kho`);
        setQuantityInputs((prev) => ({ ...prev, [itemId]: String(item.availableQuantity) }));
        return;
      }
      setQuantityInputs((prev) => ({ ...prev, [itemId]: value }));
    },
    [items, toast],
  );
  // Khi blur hoặc Enter — validate rồi gọi API
  const handleQuantityBlur = useCallback(
    async (itemId: string) => {
      const raw = quantityInputs[itemId];

      // Xóa local state → trả về controlled value từ item
      setQuantityInputs((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });

      const num = parseInt(raw ?? "");
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      // Không hợp lệ hoặc bằng số cũ → không làm gì
      if (isNaN(num) || num < 1) return;
      if (num === item.quantity) return;

      // Check tồn kho
      if (item.availableQuantity > 0 && num > item.availableQuantity) {
        toast.error(`Chỉ còn ${item.availableQuantity} sản phẩm trong kho`);
        return;
      }

      const delta = num - item.quantity;
      const success = await updateQuantity(itemId, delta);
      if (!success) toast.error(`Chỉ còn ${item.availableQuantity} sản phẩm trong kho`);
    },
    [quantityInputs, items, updateQuantity, toast],
  );

  // ── Other handlers ───────────────────────────────────────────────────────

  const handleApplyVoucher = useCallback((code: string, value: number, id: string) => {
    setVoucherCode(code);
    setVoucherValue(value);
    setVoucherId(id);
  }, []);

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
    };
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    router.push("/checkout");
  }, [selectedItems, selectedPromotions, promotionValue, voucherCode, voucherValue, voucherId, subtotal, totalDiscount, finalTotal, rewardPoints, router, toast]);

  const finalTotalWithVoucher = Math.max(0, finalTotal - voucherValue);

  // ── Shared quantity input renderer ───────────────────────────────────────

  const renderQtyInput = (item: CartItemWithDetails, size: "sm" | "md") => {
    const h = size === "md" ? "h-8 w-8" : "h-7 w-7";
    const inputH = size === "md" ? "h-8" : "h-7";
    const iconSize = size === "md" ? "h-4 w-4" : "h-3 w-3";

    return (
      <div className="flex items-center border border-neutral rounded w-fit shrink-0">
        <button
          onClick={() => handleDecrease(item.id)}
          disabled={item.quantity <= 1}
          className={`flex ${h} items-center justify-center rounded-l text-neutral-darker transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer`}
        >
          <Minus className={iconSize} />
        </button>

        <input
          type="number"
          min={1}
          max={item.availableQuantity > 0 ? item.availableQuantity : undefined}
          // Ưu tiên local state khi đang gõ, fallback về item.quantity
          value={quantityInputs[item.id] ?? item.quantity}
          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
          onBlur={() => handleQuantityBlur(item.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className={`${inputH} w-10 border-x border-neutral text-sm font-medium text-primary bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />

        <button onClick={() => handleIncrease(item.id)} className={`flex ${h} items-center justify-center rounded-r text-neutral-darker transition hover:bg-accent-light cursor-pointer`}>
          <Plus className={iconSize} />
        </button>
      </div>
    );
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) return <PageLoader message="Đang tải giỏ hàng..." />;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-neutral-light">
      <div className="w-full bg-neutral-light">
        <div className="container py-3 md:py-4">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Giỏ hàng" }]} />
        </div>
      </div>

      <div className="container space-y-4 px-3" style={{ paddingBottom: "clamp(7rem, 15vw, 12rem)" }}>
        {items.length === 0 ? (
          <div className="rounded-2xl bg-neutral-light p-8 sm:p-12 lg:p-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-accent opacity-10 animate-ping" style={{ animationDuration: "2.5s" }} />
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-accent flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 sm:w-32 sm:h-32">
                    <path d="M10 12h4l2 8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" />
                    <path d="M14 18h6l6 24h26l4-16H24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" />
                    <circle cx="30" cy="49" r="3.5" fill="currentColor" className="text-white" />
                    <circle cx="46" cy="49" r="3.5" fill="currentColor" className="text-white" />
                    <circle cx="35" cy="31" r="1.5" fill="currentColor" className="text-white" />
                    <circle cx="45" cy="31" r="1.5" fill="currentColor" className="text-white" />
                    <path d="M33 37.5 Q40 34 47 37.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-white" />
                  </svg>
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary-dark opacity-60" />
                <span className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-accent-dark opacity-40" />
              </div>
            </div>
            <h2 className="mb-2 text-xl sm:text-2xl font-bold text-primary">Giỏ hàng của bạn đang trống</h2>
            <p className="mb-8 text-sm sm:text-base text-neutral-darker max-w-xs mx-auto leading-relaxed">Hãy khám phá và thêm sản phẩm yêu thích vào giỏ hàng để tiếp tục mua sắm nhé!</p>
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
              {/* Select all bar */}
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
                  <span className="text-sm font-medium text-primary">Chọn tất cả ({items.length})</span>
                </label>
                <button
                  onClick={handleRemoveAllClick}
                  disabled={selectedItems.length === 0}
                  className="text-neutral-darker transition hover:text-primary disabled:cursor-not-allowed disabled:text-neutral-dark cursor-pointer"
                  aria-label="Xóa các sản phẩm đã chọn"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Cart items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="rounded-lg bg-neutral-light p-2 sm:p-4 border border-neutral">
                    <div className="flex gap-2 sm:gap-3 min-w-0">
                      {/* Checkbox */}
                      <div className="flex items-start shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleSelectItem(item.id)}
                          style={{
                            accentColor: "rgb(var(--accent-active))",
                          }}
                          className="h-5 w-5 cursor-pointer rounded"
                        />
                      </div>

                      {/* Image */}
                      <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-neutral bg-neutral-light">
                        {item.image ? (
                          <Image src={item.image} alt={item.productName} fill sizes="(max-width: 640px) 64px, 80px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-neutral">
                            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-neutral-dark" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-medium text-primary line-clamp-2 min-w-0 flex-1">{item.productName}</h3>
                          <button onClick={() => handleRemoveClick(item)} className="xl:hidden shrink-0 text-neutral-darker transition hover:text-primary cursor-pointer" aria-label="Xóa sản phẩm">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mb-1.5">
                          <CartVariantSelector
                            cartItemId={item.id}
                            productSlug={item.productSlug}
                            currentVariantId={item.productVariantId}
                            productName={item.productName}
                            colorLabel={item.colorLabel}
                            storageLabel={item.storageLabel}
                            storageValue={item.storageLabel.toLowerCase().replace(/\s+/g, "")}
                            currentQuantity={item.quantity}
                            onSuccess={() => refetchCart(true)}
                            onUpdateItem={(patch) => updateItem(item.id, patch)}
                          />
                        </div>

                        {/* Mobile layout */}
                        <div className="xl:hidden flex items-center gap-1 sm:gap-3 flex-wrap">
                          <div className="flex flex-col shrink-0">
                            <span className="text-sm font-semibold text-promotion whitespace-nowrap">{formatVND(item.unitPrice)}</span>
                            {item.originalPrice && item.originalPrice > item.unitPrice && (
                              <span className="text-xs text-neutral-dark line-through whitespace-nowrap">{formatVND(item.originalPrice)}</span>
                            )}
                          </div>
                          {renderQtyInput(item, "md")}
                          <span className="text-sm font-bold text-promotion whitespace-nowrap shrink-0 ml-auto">{formatVND(item.unitPrice * item.quantity)}</span>
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden xl:flex items-center gap-4 shrink-0">
                        <div className="flex flex-col items-end w-28 shrink-0">
                          <span className="text-base font-semibold text-promotion whitespace-nowrap">{formatVND(item.unitPrice)}</span>
                          {item.originalPrice && item.originalPrice > item.unitPrice && (
                            <span className="text-xs text-neutral-dark line-through whitespace-nowrap">{formatVND(item.originalPrice)}</span>
                          )}
                        </div>
                        {renderQtyInput(item, "sm")}
                        <div className="w-28 text-right shrink-0">
                          <span className="text-base font-semibold text-promotion whitespace-nowrap">{formatVND(item.unitPrice * item.quantity)}</span>
                        </div>
                        <button onClick={() => handleRemoveClick(item)} className="text-neutral-darker transition hover:text-primary cursor-pointer shrink-0" aria-label="Xóa sản phẩm">
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

      {/* Mobile bottom bar */}
      {items.length > 0 && (
        <CartBottomBar
          finalTotal={finalTotalWithVoucher}
          totalSaved={totalDiscount + voucherValue}
          summaryRows={[
            { label: "Tổng tiền", value: formatVND(subtotal) },
            {
              label: "Tổng khuyến mãi",
              value: `-${formatVND(totalDiscount + voucherValue)}`,
            },
            {
              label: "Giảm giá sản phẩm",
              value: `-${formatVND(totalDiscount)}`,
              indent: true,
            },
            {
              label: "Voucher",
              value: voucherValue > 0 ? `-${formatVND(voucherValue)}` : "0₫",
              indent: true,
            },
            { label: "Phí vận chuyển", value: "Miễn phí" },
            {
              label: "Cần thanh toán",
              value: formatVND(finalTotalWithVoucher),
              highlight: true,
            },
          ]}
          voucherCode={voucherCode}
          voucherValue={voucherValue}
          onOpenVoucherModal={() => setShowVoucherModal(true)}
          rewardPoints={rewardPoints}
          actionLabel="Xác nhận đơn"
          actionDisabled={selectedItems.length === 0}
          onAction={handleCheckout}
        />
      )}

      <VoucherPromotionModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        appliedVoucherCode={voucherCode}
        appliedVoucherValue={voucherValue}
        appliedVoucherId={voucherId}
        onApplyVoucher={handleApplyVoucher}
        cartTotal={finalTotal}
        cartItems={rawItems.map((item) => ({
          productId: item.productId,
          brandId: item.brandId,
          categoryId: item.categoryId,
          categoryPath: item.categoryPath,
          itemTotal: item.price?.final ?? item.totalFinalPrice ?? item.unitPrice ?? 0,
        }))}
      />

      <DeleteConfirmSidebar isOpen={!!deleteTarget} onClose={handleCloseDeleteSidebar} onConfirm={handleConfirmDelete} productName={deleteTarget?.name ?? ""} isLoading={isDeleting} />

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
