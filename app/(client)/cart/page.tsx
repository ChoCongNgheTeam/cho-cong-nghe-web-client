"use client";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import VoucherPromotionModal from "./components/VoucherPromotionModal";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "../../../hooks/useAuth";
import DeleteConfirmSidebar from "./components/DeleteConfirmSidebar";
import { CartItemWithDetails } from "@/store/cart/cart.types";
import { formatVND } from "../../../helpers";
import { computeFinalTotalWithVoucher } from "./_lib/cartMath";
import { useToasty } from "@/components/toast";
import CartBottomBar from "./components/CartBottomMobile";
import CartItemRow from "./components/CartItemRow";
import LoginHintSheet from "./components/LoginHintSheet";
import PageLoader from "@/components/shared/PageLoader";
import OrderSummary from "../(protected)/checkout/components/OrderSummary";

const LOGIN_REDIRECT_INTENT_KEY = "loginRedirectIntent";

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

  const { user } = useAuth();

  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showLoginHintMobile, setShowLoginHintMobile] = useState(false);
  const toast = useToasty();

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

  // ── Voucher modal handler — check login trước ────────────────────────────

  const handleOpenVoucherModal = useCallback(() => {
    if (!user) {
      setShowLoginHintMobile(true);
      return;
    }
    setShowVoucherModal(true);
  }, [user]);

  const handleLoginClick = useCallback(() => {
    setShowLoginHintMobile(false);
    sessionStorage.setItem(LOGIN_REDIRECT_INTENT_KEY, "/cart");
    router.push("/account?tab=login");
  }, [router]);

  // ── Quantity handlers ────────────────────────────────────────────────────

  const handleIncrease = useCallback(
    async (itemId: string) => {
      const success = await updateQuantity(itemId, 1);
      if (!success) toast.error("Số lượng vượt quá tồn kho");
    },
    [updateQuantity, toast],
  );

  const handleDecrease = useCallback(
    async (itemId: string) => {
      await updateQuantity(itemId, -1);
    },
    [updateQuantity],
  );

  // Khi gõ — chỉ lưu vào local state, chưa gọi API
  const handleQuantityChange = useCallback(
    (itemId: string, value: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const num = parseInt(value);
      // Luôn ép về availableQuantity thật — kể cả khi = 0 (hết hàng), trước đây
      // điều kiện "> 0" khiến hết hàng lại thành KHÔNG giới hạn số lượng nhập
      if (!isNaN(num) && num > item.availableQuantity) {
        toast.error(item.availableQuantity > 0 ? `Chỉ còn ${item.availableQuantity} sản phẩm trong kho` : "Sản phẩm đã hết hàng");
        setQuantityInputs((prev) => ({
          ...prev,
          [itemId]: String(Math.max(0, item.availableQuantity)),
        }));
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

      // Check tồn kho — luôn ép về availableQuantity thật, kể cả khi = 0 (hết hàng)
      if (num > item.availableQuantity) {
        toast.error(item.availableQuantity > 0 ? `Chỉ còn ${item.availableQuantity} sản phẩm trong kho` : "Sản phẩm đã hết hàng");
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

    // ── THÊM: chưa đăng nhập → lưu intent rồi redirect login ──
    if (!user) {
      sessionStorage.setItem(LOGIN_REDIRECT_INTENT_KEY, "/cart");
      router.push("/account?tab=login");
      return;
    }
    // ──────────────────────────────────────────────────────────

    const checkoutData = {
      selectedItems,
      cartItemIds: selectedItems.map((item) => item.id),
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
  }, [user, selectedItems, voucherCode, voucherValue, voucherId, subtotal, totalDiscount, finalTotal, rewardPoints, router, toast]);

  const finalTotalWithVoucher = computeFinalTotalWithVoucher(finalTotal, voucherValue);

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
              <Image src="/images/empty-cart.png" alt="Empty cart" width={160} height={160} className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 object-contain" priority />{" "}
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
                  <CartItemRow
                    key={item.id}
                    item={item}
                    quantityInputValue={quantityInputs[item.id] ?? item.quantity}
                    onToggleSelect={toggleSelectItem}
                    onRemoveClick={handleRemoveClick}
                    onQuantityChange={handleQuantityChange}
                    onQuantityBlur={handleQuantityBlur}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    onVariantSuccess={() => refetchCart(true)}
                    onUpdateItem={(id, patch) => updateItem(id, patch)}
                  />
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
                onOpenVoucherModal={handleOpenVoucherModal}
                onCheckout={handleCheckout}
                buttonText="Xác nhận đơn"
                showTerms={false}
                isCheckoutPage={false}
                totalPromotionDiscount={totalDiscount}
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
            {
              label: "Cần thanh toán",
              value: formatVND(finalTotalWithVoucher),
              highlight: true,
            },
          ]}
          voucherCode={voucherCode}
          voucherValue={voucherValue}
          onOpenVoucherModal={handleOpenVoucherModal}
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

      <LoginHintSheet isOpen={showLoginHintMobile} onClose={() => setShowLoginHintMobile(false)} onLoginClick={handleLoginClick} />
    </div>
  );
}
