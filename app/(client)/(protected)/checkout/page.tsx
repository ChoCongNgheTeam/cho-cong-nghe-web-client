"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToasty } from "@/components/toast";
import AddressSidebar from "./components/address/AddressSidebar";
import VoucherPromotionModal from "@/(client)/cart/components/VoucherPromotionModal";
import CartItems from "./components/CartItems";
import PaymentMethods from "./components/payment/PaymentMethods";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { useAuth } from "../../../../hooks/useAuth";
import { useCart } from "../../../../hooks/useCart";
import { formatVND } from "../../../../helpers";
import { computeFinalTotalWithVoucher } from "@/(client)/cart/_lib/cartMath";
import PaymentResultModal from "./components/payment/PaymentResultModal";
import { CartItem, CheckoutData, ShippingSectionProps } from "./_lib";
import ShippingSection from "./components/address/ShippingSection";
import CartBottomBar from "@/(client)/cart/components/CartBottomMobile";
import PageLoader from "@/components/shared/PageLoader";
import OrderSummary from "./components/OrderSummary";
import { logError } from "@/lib/monitoring/log-error";
import { Popzy } from "@/components/modal";
import { useCheckoutAddress } from "./hooks/useCheckoutAddress";
import { useCheckoutPreview } from "./hooks/useCheckoutPreview";
import { useCheckoutSubmit } from "./hooks/useCheckoutSubmit";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToasty();
  const { loading: authLoading } = useAuth();
  const { refetchCart, rawItems } = useCart();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValue, setVoucherValue] = useState(0);
  const [voucherId, setVoucherId] = useState("");
  const handleApplyVoucher = useCallback((code: string, value: number, id: string) => {
    setVoucherCode(code);
    setVoucherValue(value);
    setVoucherId(id);
  }, []);
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);

  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [showAddressSidebar, setShowAddressSidebar] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const isReturningFromNewAddress = searchParams.get("newAddress") === "1";

  const address = useCheckoutAddress({ authLoading, skipDefaultFetch: isReturningFromNewAddress });

  const { previewData } = useCheckoutPreview({
    activeAddressId: address.activeAddressId,
    selectedPaymentMethodId,
    voucherId,
    cartItemIds,
  });

  const submit = useCheckoutSubmit({
    router,
    toast,
    refetchCart,
    contactName: address.contactName,
    contactPhone: address.contactPhone,
    selectedSavedAddress: address.selectedSavedAddress,
    provinceCode: address.provinceCode,
    wardCode: address.wardCode,
    provinces: address.provinces,
    wards: address.wards,
    detailAddress: address.detailAddress,
    wantSaveAddress: address.wantSaveAddress,
    selectedPaymentMethodId,
    agreedToTerms,
    voucherId,
  });

  // Khôi phục dữ liệu giỏ hàng đã chọn từ trang cart (lưu tạm ở localStorage trước khi
  // điều hướng sang /checkout). Nếu vừa quay lại từ trang thêm địa chỉ mới, đồng bộ luôn
  // mobileSelectedAddress với địa chỉ vừa tạo.
  useEffect(() => {
    sessionStorage.removeItem("paymentInfo");
    sessionStorage.removeItem("pendingOrderId");
    sessionStorage.removeItem("pendingOrderCode");
    const raw = localStorage.getItem("checkoutData");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const data: CheckoutData = JSON.parse(raw);
      if (!data.selectedItems?.length) {
        toast.error("Vui lòng chọn sản phẩm từ giỏ hàng");
        router.push("/cart");
        return;
      }
      // Effect đồng bộ với localStorage (external system), không phải derived state —
      // rule set-state-in-effect false-positive với pattern fetch/restore-on-mount này
      // (xem facebook/react#34743). React 18+ tự batch các setState đồng bộ này thành 1 render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartItems(
        data.selectedItems.map((item) => ({
          id: item.id,
          name: item.productName,
          variant: item.storageLabel || "",
          color: item.color ?? "",
          colorValue: item.colorValue ?? "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          originalPrice: item.originalPrice,
          image: item.image ?? "",
        })),
      );
      setCartItemIds(data.cartItemIds ?? data.selectedItems.map((item) => item.id));
      setSubtotal(data.subtotal);
      setTotalDiscount(data.totalDiscount);
      setFinalTotal(data.finalTotal);
      setVoucherCode(data.appliedVoucherCode ?? "");
      setVoucherValue(data.appliedVoucherValue ?? 0);
      setVoucherId(data.appliedVoucherId ?? "");
      if (data.newAddressId) {
        const targetId = data.newAddressId;
        delete data.newAddressId;
        localStorage.setItem("checkoutData", JSON.stringify(data));
        router.replace("/checkout", { scroll: false });
        address.refreshAfterNewAddress(targetId);
      }
    } catch (err) {
      logError("CheckoutPage: parse checkoutData from localStorage failed", err);
      toast.error("Dữ liệu đơn hàng không hợp lệ");
      router.push("/cart");
    } finally {
      setIsPageLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const shippingFee = previewData?.shippingFee;
  const resolvedPromotionDiscount = previewData?.totalPromotionDiscount ?? totalDiscount;
  const amountAfterDiscount = computeFinalTotalWithVoucher(subtotal - resolvedPromotionDiscount, voucherValue);
  const confirmTotal = amountAfterDiscount + (shippingFee ?? 0);

  const shippingProps: ShippingSectionProps = {
    isLoadingAddresses: address.isLoadingAddresses,
    savedAddresses: address.savedAddresses,
    showManualForm: address.showManualForm,
    selectedSavedAddress: address.selectedSavedAddress,
    contactName: address.contactName,
    contactPhone: address.contactPhone,
    provinceCode: address.provinceCode,
    wardCode: address.wardCode,
    provinces: address.provinces,
    wards: address.wards,
    isLoadingProvinces: address.isLoadingProvinces,
    isLoadingWards: address.isLoadingWards,
    wantSaveAddress: address.wantSaveAddress,
    onSelectSavedAddress: address.onSelectSavedAddress,
    onShowManualForm: address.onShowManualForm,
    onBackToSaved: address.onBackToSaved,
    onContactNameChange: address.onContactNameChange,
    onContactPhoneChange: address.onContactPhoneChange,
    onProvinceChange: address.onProvinceChange,
    onWardChange: address.onWardChange,
    onHouseNumberChange: address.onHouseNumberChange,
    onStreetNameChange: address.onStreetNameChange,
    onWantSaveAddressChange: address.setWantSaveAddress,
    onEditAddress: () => router.push("/profile/addresses?redirect=checkout"),
    houseNumber: address.houseNumber,
    streetName: address.streetName,
  };

  if (isPageLoading || authLoading) return <PageLoader message="Đang tải thông tin đơn hàng..." />;

  const orderSummaryProps = {
    subtotal,
    totalDiscount,
    finalTotal,
    selectedItemsCount: cartItems.length,
    appliedVoucherCode: voucherCode,
    appliedVoucherValue: voucherValue,
    onOpenVoucherModal: () => setShowVoucherModal(true),
    onCheckout: submit.handleCheckoutClick,
    buttonText: submit.isSubmitting ? "Đang xử lý..." : "Đặt hàng",
    showTerms: true,
    agreedToTerms,
    onTermsChange: setAgreedToTerms,
    isCheckoutPage: true,
    shippingFee,
    computedTotal: confirmTotal,
    totalPromotionDiscount: resolvedPromotionDiscount,
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="hidden md:block">
        <div className="container py-4 sm:py-6">
          <div className="mb-4 sm:mb-6">
            <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Giỏ hàng", href: "/cart" }, { label: "Thanh toán" }]} />
          </div>
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4">
              <CartItems items={cartItems} />
              <ShippingSection {...shippingProps} instanceId="desktop" />
              <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                <label className="block text-sm font-medium mb-2 text-primary">Ghi chú</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-neutral-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none bg-neutral-light text-primary"
                  placeholder="Ví dụ: Hãy gọi tôi khi chuẩn bị hàng xong"
                />
                <div className="text-base text-neutral-dark mt-1 text-right">{notes.length}/1000</div>
              </div>
              <PaymentMethods selectedMethod={selectedPaymentMethodId} onSelect={setSelectedPaymentMethodId} />
            </div>
            <div className="lg:col-span-1">
              <OrderSummary {...orderSummaryProps} />
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden" style={{ paddingBottom: "clamp(7rem, 15vw, 12rem)" }}>
        <div className="bg-neutral-light border-b border-neutral px-4 py-3">
          <Link href="/cart" className="inline-flex items-center gap-1 text-sm cursor-pointer text-primary">
            <span>←</span> Quay lại giỏ hàng
          </Link>
        </div>
        <div className="px-3 pt-3 space-y-3">
          <CartItems items={cartItems} />
          <ShippingSection {...shippingProps} instanceId="mobile" />
          <div className="bg-neutral-light rounded-lg p-4 border border-neutral">
            <label className="block text-sm font-medium mb-2 text-primary">Ghi chú</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full px-3 py-2 border-2 border-neutral-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none bg-neutral-light text-primary"
              placeholder="Ví dụ: Hãy gọi tôi khi chuẩn bị hàng xong"
            />
            <div className="text-base text-neutral-dark mt-1 text-right">{notes.length}/1000</div>
          </div>
          <PaymentMethods selectedMethod={selectedPaymentMethodId} onSelect={setSelectedPaymentMethodId} />
        </div>
      </div>

      <CartBottomBar
        finalTotal={confirmTotal}
        totalSaved={resolvedPromotionDiscount + voucherValue}
        summaryRows={[
          { label: "Tổng tiền hàng", value: formatVND(subtotal) },
          { label: "Giảm giá sản phẩm", value: `-${formatVND(resolvedPromotionDiscount)}`, indent: true },
          { label: "Voucher", value: voucherValue > 0 ? `-${formatVND(voucherValue)}` : "0₫", indent: true },
          { label: "Phí vận chuyển", value: shippingFee != null ? formatVND(shippingFee) : "Chọn địa chỉ" },
          { label: "Cần thanh toán", value: formatVND(confirmTotal), highlight: true },
        ]}
        voucherCode={voucherCode}
        voucherValue={voucherValue}
        onOpenVoucherModal={() => setShowVoucherModal(true)}
        actionLabel={submit.isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
        actionDisabled={submit.isSubmitting}
        onAction={submit.handleCheckoutClick}
        showTerms
        agreedToTerms={agreedToTerms}
        onTermsChange={setAgreedToTerms}
      />

      <AddressSidebar isOpen={showAddressSidebar} onClose={() => setShowAddressSidebar(false)} selectedAddressId={address.mobileSelectedAddress?.id} onSelect={address.setMobileSelectedAddress} />
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
      <Popzy
        isOpen={submit.showConfirmModal}
        enableScrollLock={false}
        onClose={() => submit.setShowConfirmModal(false)}
        closeMethods={["button", "overlay", "escape"]}
        cssClass="!w-full !max-w-sm !mx-4"
        content={
          <div>
            <h3 className="text-base font-semibold text-primary mb-2">Xác nhận đặt hàng</h3>
            <p className="text-sm text-neutral-darker mb-1">
              Tổng thanh toán: <span className="font-bold text-primary">{formatVND(confirmTotal)}</span>
            </p>
            <p className="text-base text-neutral-darker mb-5">Bạn có chắc chắn muốn đặt đơn hàng này không?</p>
            <div className="flex gap-3">
              <button
                onClick={() => submit.setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-neutral rounded-lg text-sm text-neutral-darker hover:bg-neutral transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={submit.handlePlaceOrder}
                disabled={submit.isSubmitting}
                className="cursor-pointer flex-1 py-2.5 bg-primary-dark hover:bg-primary-dark-hover text-neutral-light font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {submit.isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        }
      />
      <PaymentResultModal
        isOpen={submit.paymentResultModal.isOpen}
        paymentInfo={submit.paymentResultModal.paymentInfo && "clientSecret" in submit.paymentResultModal.paymentInfo ? submit.paymentResultModal.paymentInfo : null}
        onClose={() => submit.setPaymentResultModal((p) => ({ ...p, isOpen: false }))}
        onDone={() => router.push("/profile/orders")}
      />
    </div>
  );
}
