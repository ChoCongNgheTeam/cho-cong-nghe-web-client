"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToasty } from "@/components/Toast";
import AddressSidebar, { ApiAddress } from "./components/AddressSidebar";
import VoucherPromotionModal from "@/(client)/cart/components/VoucherPromotionModal";
import CartItems from "./components/CartItems";
import OrderSummary from "@/components/OrderSummary/OrderSummary";
import PaymentMethods from "./components/PaymentMethods";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import apiRequest from "@/lib/api";
import { formatVND } from "@/helpers";
import PaymentResultModal from "./components/PaymentResultModal";
import { getProvinces } from "@/(client)/(protected)/profile/_lib/get-provice";
import { getWards } from "@/(client)/(protected)/profile/_lib/get-wards";
import { Popzy } from "@/components/Modal";
import { Province, Ward, UserProfile, SavedAddress, CartItem, SelectedItem, CheckoutData, PreviewData, ShippingSectionProps } from "./types";
import ShippingSection from "./components/shippingSection";
import CartBottomBar from "@/(client)/cart/components/CartBottomMobile";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToasty();
  const { loading: authLoading } = useAuth();
  const { refetchCart } = useCart();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [promotionValue, setPromotionValue] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValue, setVoucherValue] = useState(0);
  const [voucherId, setVoucherId] = useState("");
  const handleApplyVoucher = useCallback((code: string, value: number, id: string) => {
    setVoucherCode(code);
    setVoucherValue(value);
    setVoucherId(id);
  }, []);

  const [showManualForm, setShowManualForm] = useState(false);
  const [wantSaveAddress, setWantSaveAddress] = useState<boolean | null>(null);

  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [contactSelectedId, setContactSelectedId] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isContactOpen, setIsContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [hasFetchedAddresses, setHasFetchedAddresses] = useState(false);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<SavedAddress | null>(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const addressRef = useRef<HTMLDivElement>(null);

  const [provinceId, setProvinceId] = useState("");
  const [wardId, setWardId] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [sendInvoice, setSendInvoice] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [mobileSelectedAddress, setMobileSelectedAddress] = useState<ApiAddress | null>(null);

  const [showAddressSidebar, setShowAddressSidebar] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentResultModal, setPaymentResultModal] = useState<{
    isOpen: boolean;
    paymentInfo: any;
    orderId: string;
  }>({ isOpen: false, paymentInfo: null, orderId: "" });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(e.target as Node)) setIsContactOpen(false);
      if (addressRef.current && !addressRef.current.contains(e.target as Node)) setIsAddressOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoadingProfiles(true);
      try {
        const res = await apiRequest.get<{ data: UserProfile }>("/users/me");
        if (res?.data) setUserProfiles([res.data]);
      } catch {
        setUserProfiles([]);
      } finally {
        setIsLoadingProfiles(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoadingProvinces(true);
      try {
        setProvinces(await getProvinces());
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!provinceId) {
      setWards([]);
      return;
    }
    const load = async () => {
      setIsLoadingWards(true);
      try {
        setWards(await getWards(provinceId));
      } finally {
        setIsLoadingWards(false);
      }
    };
    load();
  }, [provinceId]);

  const fetchSavedAddresses = async () => {
    if (hasFetchedAddresses) return;
    setIsLoadingAddresses(true);
    try {
      const res = await apiRequest.get<{ data: SavedAddress[] }>("/addresses");
      const list = res?.data ?? [];
      setSavedAddresses(list);
      setHasFetchedAddresses(true);
      const defaultAddr = list.find((a) => a.isDefault) ?? list[0];
      if (defaultAddr) {
        setSelectedSavedAddress(defaultAddr);
        setProvinceId(defaultAddr.province.id);
        setWardId(defaultAddr.ward.id);
        setDetailAddress(defaultAddr.detailAddress);
        setContactName(defaultAddr.contactName);
        setContactPhone(defaultAddr.phone);
      }
    } catch {
      setSavedAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchSavedAddresses();
  }, []);

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
      setCartItems(
        data.selectedItems.map((item) => ({
          id: item.id,
          name: item.productName ?? item.product_name ?? "",
          variant: item.variantCode ?? item.variant_name ?? "",
          color: item.color ?? "",
          colorValue: item.colorValue ?? "",
          quantity: item.quantity,
          unit_price: item.unitPrice ?? item.unit_price ?? 0,
          original_price: item.originalPrice ?? item.original_price,
          image: item.image ?? item.image_url ?? "",
        })),
      );
      setSelectedPromotions(data.selectedPromotions);
      setPromotionValue(data.promotionValue);
      setSubtotal(data.subtotal);
      setTotalDiscount(data.totalDiscount);
      setFinalTotal(data.finalTotal);
      setRewardPoints(data.rewardPoints);
      setUsePoints(data.usePoints ?? false);
      setVoucherCode(data.appliedVoucherCode ?? "");
      setVoucherValue(data.appliedVoucherValue ?? 0);
      setVoucherId(data.appliedVoucherId ?? "");
      if (data.newAddressId) {
        const targetId = data.newAddressId;
        delete data.newAddressId;
        localStorage.setItem("checkoutData", JSON.stringify(data));
        router.replace("/checkout", { scroll: false });
        apiRequest
          .get<{ success: boolean; data: ApiAddress[] }>("/addresses")
          .then((res) => {
            const list = res?.data ?? [];
            const target = list.find((a) => a.id === targetId) ?? list.find((a) => a.isDefault) ?? list[0];
            if (target) setMobileSelectedAddress(target);
          })
          .catch(() => {});
      }
    } catch {
      toast.error("Dữ liệu đơn hàng không hợp lệ");
      router.push("/cart");
    } finally {
      setIsPageLoading(false);
    }
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authLoading) return;
    if (searchParams.get("newAddress") === "1") return;
    const load = async () => {
      try {
        const res = await apiRequest.get<{
          success: boolean;
          data: ApiAddress | null;
        }>("/addresses/default");
        if (res?.data) {
          setMobileSelectedAddress(res.data);
          return;
        }
      } catch {
        /* fallback */
      }
      try {
        const listRes = await apiRequest.get<{
          success: boolean;
          data: ApiAddress[];
        }>("/addresses");
        const list = listRes?.data ?? [];
        if (list.length > 0) setMobileSelectedAddress(list.find((a) => a.isDefault) ?? list[0]);
      } catch {
        /* silent */
      }
    };
    load();
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPreview = useCallback(async () => {
    if (!mobileSelectedAddress?.id || !selectedPaymentMethodId) return;
    try {
      const params = new URLSearchParams({
        paymentMethodId: selectedPaymentMethodId,
        shippingAddressId: mobileSelectedAddress.id,
        ...(voucherId ? { voucherId } : {}),
      });
      const res = await apiRequest.get<{
        success: boolean;
        data: PreviewData;
      }>(`/checkout/preview?${params.toString()}`);
      if (res?.data) setPreviewData(res.data);
    } catch {
      /* non-critical */
    }
  }, [mobileSelectedAddress?.id, selectedPaymentMethodId, voucherId]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedSavedAddress(addr);
    setProvinceId(addr.province.id);
    setWardId(addr.ward.id);
    setDetailAddress(addr.detailAddress);
    setContactName(addr.contactName);
    setContactPhone(addr.phone);
    setContactSelectedId(null);
    setIsAddressOpen(false);
  };

  const handleClearAddress = () => {
    setSelectedSavedAddress(null);
    setProvinceId("");
    setWardId("");
    setDetailAddress("");
    setWards([]);
    setContactName("");
    setContactPhone("");
    setContactSelectedId(null);
    setWantSaveAddress(null);
  };

  const handleProvinceChange = (id: string) => {
    if (selectedSavedAddress) setSelectedSavedAddress(null);
    setProvinceId(id);
    setWardId("");
    setWards([]);
  };

  const handleFieldChange = (field: "wardId" | "detailAddress", val: string) => {
    if (selectedSavedAddress) setSelectedSavedAddress(null);
    if (field === "wardId") setWardId(val);
    else setDetailAddress(val);
  };

  const handleCheckoutClick = () => {
    if (!contactName.trim()) {
      toast.error("Vui lòng nhập họ tên người đặt");
      return;
    }
    if (!contactPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại người đặt");
      return;
    }
    if (!selectedSavedAddress && (!provinceId || !wardId || !detailAddress.trim())) {
      toast.error("Vui lòng điền đầy đủ địa chỉ giao hàng");
      return;
    }
    if (!selectedPaymentMethodId) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }
    if (!agreedToTerms) {
      toast.error("Vui lòng đồng ý với điều khoản đặt hàng");
      return;
    }
    setShowConfirmModal(true);
  };

  const handlePlaceOrder = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    let tempAddressId: string | null = null;
    try {
      let addressId = selectedSavedAddress?.id ?? null;
      if (!addressId) {
        const createRes = await apiRequest.post<{ data: { id: string } }>("/addresses", {
          contactName,
          phone: contactPhone,
          provinceId,
          wardId,
          detailAddress,
          type: "HOME",
          isDefault: false,
        });
        tempAddressId = createRes?.data?.id ?? null;
        addressId = tempAddressId;
      }
      if (!addressId) {
        toast.error("Không thể xác định địa chỉ giao hàng");
        return;
      }
      const res = await apiRequest.post<{
        success: boolean;
        data: {
          orderId: string;
          orderCode: string;
          paymentMethodCode: string;
          paymentInfo: any;
        };
      }>("/checkout", {
        paymentMethodId: selectedPaymentMethodId,
        shippingAddressId: addressId,
        contactName,
        phone: contactPhone,
        ...(voucherId ? { voucherId } : {}),
      });
      if (res?.success) {
        localStorage.removeItem("checkoutData");
        await refetchCart();
        if (tempAddressId && wantSaveAddress === false) apiRequest.delete(`/addresses/${tempAddressId}`).catch(() => {});
        navigateAfterOrder(res.data.orderCode, res.data.orderId, res.data.paymentMethodCode, res.data.paymentInfo);
      }
    } catch (err: any) {
      if (tempAddressId) apiRequest.delete(`/addresses/${tempAddressId}`).catch(() => {});
      toast.error(err?.response?.data?.message ?? err?.message ?? "Có lỗi xảy ra khi đặt hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateAfterOrder = (orderCode: string, orderId: string, paymentMethodCode: string, paymentInfo: any) => {
    const m = paymentMethodCode.toUpperCase();
    if (m.includes("COD") || m.includes("BANK_TRANSFER")) {
      router.push(`/order/${orderCode}/payment`);
      return;
    }
    if (m.includes("MOMO") || m.includes("VNPAY") || m.includes("ZALOPAY")) {
      if (paymentInfo?.paymentUrl) window.location.href = paymentInfo.paymentUrl;
      else toast.error("Không lấy được đường dẫn thanh toán.");
      return;
    }
    if (m.includes("STRIPE") || m.includes("CREDIT_CARD")) {
      setPaymentResultModal({ isOpen: true, paymentInfo, orderId });
      return;
    }
    router.push(`/order/${orderCode}/payment`);
  };

  const displaySubtotal = subtotal;
  const displayDiscount = totalDiscount;
  const displayVoucherDiscount = voucherValue;
  const displayFinalTotal = finalTotal;
  const shippingFee = previewData?.shippingFee;
  const amountAfterDiscount = Math.max(0, subtotal - totalDiscount - voucherValue);
  const calculatedTax = amountAfterDiscount * 0.1;
  const confirmTotal = amountAfterDiscount + calculatedTax + (shippingFee ?? 0);

  const shippingProps: ShippingSectionProps = {
    isLoadingAddresses,
    savedAddresses,
    showManualForm,
    selectedSavedAddress,
    contactName,
    contactPhone,
    provinceId,
    wardId,
    detailAddress,
    provinces,
    wards,
    isLoadingProvinces,
    isLoadingWards,
    wantSaveAddress,
    onSelectSavedAddress: handleSelectSavedAddress,
    onShowManualForm: () => {
      setShowManualForm(true);
      handleClearAddress();
    },
    onBackToSaved: () => {
      setShowManualForm(false);
      setWantSaveAddress(null);
      const defaultAddr = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
      if (defaultAddr) handleSelectSavedAddress(defaultAddr);
    },
    onContactNameChange: setContactName,
    onContactPhoneChange: setContactPhone,
    onProvinceChange: handleProvinceChange,
    onWardChange: (v) => handleFieldChange("wardId", v),
    onDetailAddressChange: (v) => handleFieldChange("detailAddress", v),
    onWantSaveAddressChange: setWantSaveAddress,
    onEditAddress: () => router.push("/profile/addresses?redirect=checkout"),
  };

  if (isPageLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-neutral border-t-accent mb-4" />
          <p className="text-neutral-darker">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ── Desktop ── */}
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
              <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendInvoice}
                    onChange={(e) => setSendInvoice(e.target.checked)}
                    style={{
                      accentColor: "rgb(var(--accent-active))",
                    }}
                    className="w-4 h-4 cursor-pointer rounded"
                  />
                  <span className="text-sm text-primary">Yêu cầu hỗ trợ xuất hóa đơn điện tử</span>
                </label>
              </div>
              <PaymentMethods selectedMethod={selectedPaymentMethodId} onSelect={setSelectedPaymentMethodId} />
            </div>
            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={displaySubtotal}
                totalDiscount={displayDiscount}
                finalTotal={displayFinalTotal}
                rewardPoints={rewardPoints}
                selectedItemsCount={cartItems.length}
                appliedVoucherCode={voucherCode}
                appliedVoucherValue={displayVoucherDiscount}
                selectedPromotions={selectedPromotions}
                promotionValue={promotionValue}
                onOpenVoucherModal={() => setShowVoucherModal(true)}
                onCheckout={handleCheckoutClick}
                buttonText={isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
                showTerms
                agreedToTerms={agreedToTerms}
                onTermsChange={setAgreedToTerms}
                isCheckoutPage
                shippingFee={shippingFee}
                taxAmount={calculatedTax}
                computedTotal={confirmTotal}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile ── */}
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
          <div className="bg-neutral-light rounded-lg p-4 border border-neutral">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendInvoice}
                onChange={(e) => setSendInvoice(e.target.checked)}
                style={{ accentColor: "rgb(var(--accent-active))" }}
                className="w-4 h-4 cursor-pointer rounded"
              />
              <span className="text-sm text-primary">Yêu cầu hỗ trợ xuất hóa đơn điện tử</span>
            </label>
          </div>
          <PaymentMethods selectedMethod={selectedPaymentMethodId} onSelect={setSelectedPaymentMethodId} />
        </div>
      </div>

      <CartBottomBar
        finalTotal={confirmTotal}
        totalSaved={displayDiscount + voucherValue}
        summaryRows={[
          { label: "Tổng tiền", value: formatVND(displaySubtotal) },
          {
            label: "Tổng khuyến mãi",
            value: `-${formatVND(displayDiscount + voucherValue)}`,
          },
          {
            label: "Giảm giá sản phẩm",
            value: `-${formatVND(displayDiscount)}`,
            indent: true,
          },
          {
            label: "Voucher",
            value: voucherValue > 0 ? `-${formatVND(voucherValue)}` : "0₫",
            indent: true,
          },
          {
            label: "Phí vận chuyển",
            value: shippingFee != null ? formatVND(shippingFee) : "Miễn phí",
          },
          {
            label: "Cần thanh toán",
            value: formatVND(confirmTotal),
            highlight: true,
          },
        ]}
        voucherCode={voucherCode}
        voucherValue={voucherValue}
        onOpenVoucherModal={() => setShowVoucherModal(true)}
        rewardPoints={rewardPoints}
        actionLabel={isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
        actionDisabled={isSubmitting}
        onAction={handleCheckoutClick}
        showTerms
        agreedToTerms={agreedToTerms}
        onTermsChange={setAgreedToTerms}
      />

      {/* Sidebars & Modals */}
      <AddressSidebar isOpen={showAddressSidebar} onClose={() => setShowAddressSidebar(false)} selectedAddressId={mobileSelectedAddress?.id} onSelect={setMobileSelectedAddress} />
      <VoucherPromotionModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        appliedVoucherCode={voucherCode}
        appliedVoucherValue={voucherValue}
        appliedVoucherId={voucherId}
        onApplyVoucher={handleApplyVoucher}
        cartTotal={subtotal}
      />
      <Popzy
        isOpen={showConfirmModal}
        enableScrollLock={false}
        onClose={() => setShowConfirmModal(false)}
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
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-neutral rounded-lg text-sm text-neutral-darker hover:bg-neutral transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="cursor-pointer flex-1 py-2.5 bg-primary-dark hover:bg-primary-dark-hover text-neutral-light font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        }
      />
      <PaymentResultModal
        isOpen={paymentResultModal.isOpen}
        paymentInfo={paymentResultModal.paymentInfo}
        onClose={() => setPaymentResultModal((p) => ({ ...p, isOpen: false }))}
        onDone={() => router.push("/profile/orders")}
      />
    </div>
  );
}
