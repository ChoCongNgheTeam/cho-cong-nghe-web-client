"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, MapPin, AlertTriangle } from "lucide-react";
import { useToasty } from "@/components/Toast";
import UserInfoSidebar from "./components/UserInfoSidebar";
import AddressSidebar, { ApiAddress } from "./components/AddressSidebar";
import VoucherPromotionModal from "@/(client)/cart/components/VoucherPromotionModal";
import CartSidebar from "@/(client)/cart/components/cartSidebar";
import CartItems from "./components/CartItems";
import OrderSummary from "@/components/orderSummary/orderSummary";
import PaymentMethods from "./components/PaymentMethods";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import apiRequest from "@/lib/api";
import { formatVND } from "@/helpers";

// ─── Types ─────────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  name: string;
  variant: string;
  color?: string;
  colorValue?: string;
  quantity: number;
  unit_price: number;
  discount_value: number;
  image?: string;
}

interface SelectedItem {
  id: string;
  productName?: string;
  product_name?: string;
  variantCode?: string;
  variant_name?: string;
  quantity: number;
  unitPrice?: number;
  unit_price?: number;
  originalPrice?: number;
  original_price?: number;
  image?: string;
  image_url?: string;
  color?: string;
  colorValue?: string;
}

interface CheckoutData {
  selectedItems: SelectedItem[];
  selectedPromotions: string[];
  promotionValue: number;
  appliedVoucherCode: string;
  appliedVoucherValue: number;
  appliedVoucherId?: string;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  rewardPoints: number;
  usePoints: boolean;
  newAddressId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

interface PreviewData {
  subtotalAmount: number;
  shippingFee: number;
  voucherDiscount: number;
  taxAmount: number;
  totalAmount: number;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToasty();
  const { user, loading: authLoading } = useAuth();

  // ── Cart state ─────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [promotionValue, setPromotionValue] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);

  // ── Voucher state ──────────────────────────────────────────────────────────
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValue, setVoucherValue] = useState(0);
  const [voucherId, setVoucherId] = useState("");

  const handleApplyVoucher = useCallback((code: string, value: number, id: string) => {
    setVoucherCode(code);
    setVoucherValue(value);
    setVoucherId(id);
  }, []);

  // ── Preview ────────────────────────────────────────────────────────────────
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  // ── User info ──────────────────────────────────────────────────────────────
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // ── Address ────────────────────────────────────────────────────────────────
  const [selectedAddress, setSelectedAddress] = useState<ApiAddress | null>(null);

  // ── Payment ────────────────────────────────────────────────────────────────
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");

  // ── Misc ───────────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState("");
  const [sendInvoice, setSendInvoice] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("Thứ Hai (12/01)");
  const [deliveryTime, setDeliveryTime] = useState("16:00 -> 17:00");

  // ── UI state ───────────────────────────────────────────────────────────────
  const [showUserSidebar, setShowUserSidebar] = useState(false);
  const [showAddressSidebar, setShowAddressSidebar] = useState(false);
  const [showTimeSidebar, setShowTimeSidebar] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { refetchCart } = useCart();

  const formatDisplayAddress = (addr: ApiAddress) => addr.fullAddress ?? [addr.detailAddress, addr.ward?.name, addr.province?.name].filter(Boolean).join(", ");

  // ── Helper: fetch & apply địa chỉ mới nhất ────────────────────────────────
  const fetchAndApplyLatestAddress = useCallback(async (addressId: string) => {
    try {
      const res = await apiRequest.get<{ success: boolean; data: ApiAddress[] }>("/addresses");
      const list = res?.data ?? [];
      if (list.length === 0) return;
      const target = list.find((a) => a.id === addressId) ?? list.find((a) => a.isDefault) ?? list[0];
      setSelectedAddress(target);
    } catch {
      // silent
    }
  }, []);

  // ── Effect 1: Load checkout data từ localStorage ───────────────────────────
  useEffect(() => {
    // Khi quay lại checkout từ payment, clear paymentInfo để tránh conflict
    sessionStorage.removeItem("paymentInfo");
    sessionStorage.removeItem("pendingOrderId");
    sessionStorage.removeItem("pendingOrderCode");

    const savedCheckoutData = localStorage.getItem("checkoutData");
    if (!savedCheckoutData) {
      // Không có checkoutData → redirect về trang chủ, không show lỗi
      router.replace("/");
      return;
    }
    try {
      const data: CheckoutData = JSON.parse(savedCheckoutData);
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
          discount_value: (item.originalPrice ?? item.unitPrice ?? 0) - (item.unitPrice ?? 0),
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

      if (data.contactName) setContactName(data.contactName);
      if (data.contactPhone) setContactPhone(data.contactPhone);
      if (data.contactEmail) setContactEmail(data.contactEmail);

      if (data.newAddressId) {
        const targetId = data.newAddressId as string;
        delete data.newAddressId;
        localStorage.setItem("checkoutData", JSON.stringify(data));
        router.replace("/checkout", { scroll: false });
        apiRequest
          .get<{ success: boolean; data: ApiAddress[] }>("/addresses")
          .then((res) => {
            const list = res?.data ?? [];
            const target = list.find((a) => a.id === targetId) ?? list.find((a) => a.isDefault) ?? list[0];
            if (target) setSelectedAddress(target);
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

  // ── Effect 2: Sync user info ───────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && user) {
      setContactName((prev) => prev || user.fullName);
      setContactPhone((prev) => prev || (user.phone ?? ""));
      setContactEmail((prev) => prev || user.email);
    }
  }, [authLoading, user]);

  // ── Effect 3: Load địa chỉ mặc định ──────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (searchParams.get("newAddress") === "1") return;

    const loadDefaultAddress = async () => {
      try {
        const res = await apiRequest.get<{ success: boolean; data: ApiAddress | null }>("/addresses/default");
        if (res?.data) {
          setSelectedAddress(res.data);
          return;
        }
      } catch {
        /* fallback */
      }
      try {
        const listRes = await apiRequest.get<{ success: boolean; data: ApiAddress[] }>("/addresses");
        const list = listRes?.data ?? [];
        if (list.length > 0) setSelectedAddress(list.find((a) => a.isDefault) ?? list[0]);
      } catch {
        /* silent */
      }
    };
    loadDefaultAddress();
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 4: Fetch preview ────────────────────────────────────────────────
  const fetchPreview = useCallback(async () => {
    if (!selectedAddress?.id || !selectedPaymentMethodId) return;
    try {
      const params = new URLSearchParams({
        paymentMethodId: selectedPaymentMethodId,
        shippingAddressId: selectedAddress.id,
        ...(voucherId ? { voucherId } : {}),
      });
      const res = await apiRequest.get<{ success: boolean; data: PreviewData }>(`/checkout/preview?${params.toString()}`);
      if (res?.data) setPreviewData(res.data);
    } catch {
      /* non-critical */
    }
  }, [selectedAddress?.id, selectedPaymentMethodId, voucherId]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleUserUpdate = async (data: { name: string; phone: string; email: string }) => {
    setContactName(data.name);
    setContactPhone(data.phone);
    setContactEmail(data.email);

    try {
      const raw = localStorage.getItem("checkoutData");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.contactName = data.name;
        parsed.contactPhone = data.phone;
        parsed.contactEmail = data.email;
        localStorage.setItem("checkoutData", JSON.stringify(parsed));
      }
    } catch {
      /* silent */
    }

    if (!user?.phone && data.phone) {
      try {
        await apiRequest.patch("/users/me", {
          fullName: user?.fullName ?? data.name,
          phone: data.phone,
        });
      } catch {
        /* silent */
      }
    }

    toast.success("Cập nhật thông tin người đặt thành công");
  };

  const handlePlaceOrder = async () => {
    if (!contactName || !contactPhone) {
      toast.error("Vui lòng kiểm tra thông tin người đặt");
      return;
    }
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
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

    setIsSubmitting(true);
    try {
      const res = await apiRequest.post<{
        success: boolean;
        data: { orderId: string; orderCode: string; paymentInfo?: any };
        message?: string;
      }>("/checkout", {
        paymentMethodId: selectedPaymentMethodId,
        shippingAddressId: selectedAddress.id,
        shippingContactName: selectedAddress.contactName,
        shippingPhone: selectedAddress.phone,
        ...(voucherId ? { voucherId } : {}),
      });

      if (res?.success) {
        const rawCheckout = localStorage.getItem("checkoutData");
        if (rawCheckout) sessionStorage.setItem("checkoutData", rawCheckout);
        localStorage.removeItem("checkoutData");
        await refetchCart();

        const info = res.data?.paymentInfo ?? { type: "COD" };
        sessionStorage.setItem("paymentInfo", JSON.stringify(info));
        sessionStorage.setItem("pendingOrderId", res.data?.orderId ?? "");
        sessionStorage.setItem("pendingOrderCode", res.data?.orderCode ?? "");
        router.push("/payment");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Có lỗi xảy ra khi đặt hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Computed values ────────────────────────────────────────────────────────
  const displaySubtotal = subtotal;
  const displayDiscount = totalDiscount;
  const displayVoucherDiscount = voucherValue;
  const displayFinalTotal = finalTotal;
  const mobileFinalTotal = Math.max(0, finalTotal - voucherValue);
  const shippingFee = previewData?.shippingFee;
  const taxAmount = previewData?.taxAmount;

  // ── Loading guard ──────────────────────────────────────────────────────────
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

  const userInfoForSidebar = {
    id: user?.id ? Number(user.id) : 0,
    full_name: contactName,
    phone: contactPhone,
    email: contactEmail,
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ── Desktop ── */}
      <div className="hidden md:block">
        <div className="container py-4 sm:py-6">
          <div className="mb-4 sm:mb-6">
            <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Giỏ hàng", href: "/cart" }, { label: "Thanh toán" }]} />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-4">
              <CartItems items={cartItems} />

              {/* Người đặt hàng */}
              <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm sm:text-base font-semibold text-primary">Người đặt hàng</h2>
                  <button onClick={() => setShowUserSidebar(true)} className="text-xs sm:text-sm hover:underline cursor-pointer text-primary">
                    Thay đổi
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm text-primary">{contactName || "Chưa có tên"}</p>
                  <p className="text-neutral-darker text-sm">{contactPhone || "Chưa có số điện thoại"}</p>
                  {contactEmail && <p className="text-neutral-darker text-sm">{contactEmail}</p>}
                </div>
              </div>

              {/* Địa chỉ nhận hàng */}
              <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm sm:text-base font-semibold text-primary">Địa chỉ nhận hàng</h2>
                  <button onClick={() => setShowAddressSidebar(true)} className="text-xs sm:text-sm hover:underline cursor-pointer text-primary">
                    Thay đổi
                  </button>
                </div>
                {selectedAddress ? (
                  <div>
                    <p className="font-semibold text-sm text-primary mb-1">
                      {selectedAddress.contactName} • {selectedAddress.phone}
                    </p>
                    <p className="text-sm text-neutral-darker leading-relaxed">{formatDisplayAddress(selectedAddress)}</p>
                    {selectedAddress.isDefault && <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full bg-accent text-primary-darker font-medium">Địa chỉ mặc định</span>}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowAddressSidebar(true)}
                      className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-neutral-dark rounded-lg hover:border-accent hover:bg-accent-light transition-all cursor-pointer"
                    >
                      <MapPin size={18} className="text-neutral-darker shrink-0" />
                      <span className="text-sm text-neutral-darker">Chọn địa chỉ giao hàng</span>
                    </button>
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <AlertTriangle size={15} className="text-yellow-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-700">
                        Bạn chưa có địa chỉ nào.{" "}
                        <Link href="/profile/addresses?redirect=checkout" className="font-semibold underline">
                          Thêm địa chỉ tại đây
                        </Link>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Ghi chú */}
              <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                <label className="block text-sm font-medium mb-2 text-primary">Ghi chú</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={1000}
                  className="w-full px-3 py-2 border-2 border-neutral-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none bg-neutral-light text-primary"
                  rows={4}
                  placeholder="Ví dụ: Hãy gọi tôi khi chuẩn bị hàng xong"
                />
                <div className="text-xs text-neutral-dark mt-1 text-right">{notes.length}/1000</div>
              </div>

              {/* Hóa đơn */}
              <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sendInvoice} onChange={(e) => setSendInvoice(e.target.checked)} className="w-4 h-4 cursor-pointer accent-promotion" />
                  <span className="text-sm text-primary">Yêu cầu hỗ trợ xuất hóa đơn điện tử</span>
                </label>
              </div>

              <PaymentMethods selectedMethod={selectedPaymentMethodId} onSelect={setSelectedPaymentMethodId} />
            </div>

            {/* Right column */}
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
                onCheckout={handlePlaceOrder}
                buttonText={isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
                showTerms={true}
                agreedToTerms={agreedToTerms}
                onTermsChange={setAgreedToTerms}
                isCheckoutPage={true}
                shippingFee={shippingFee}
                taxAmount={taxAmount}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="md:hidden">
        <div className="bg-neutral-light border-b border-neutral px-4 py-3">
          <Link href="/cart" className="inline-flex items-center gap-1 text-sm cursor-pointer text-primary">
            <span>←</span> Quay lại giỏ hàng
          </Link>
        </div>
        <div className="px-3 pt-3">
          <CartItems items={cartItems} />
        </div>
        <div className="px-3 mt-3">
          <div className="bg-neutral-light rounded-lg p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary mb-3">Người đặt hàng</h2>
            <div className="space-y-2">
              <input
                type="text"
                value={contactName}
                readOnly
                onClick={() => setShowUserSidebar(true)}
                className="w-full px-3 py-2 border border-neutral-dark rounded text-sm cursor-pointer bg-neutral-light text-primary"
                placeholder="Họ và tên"
              />
              <input
                type="tel"
                value={contactPhone}
                readOnly
                onClick={() => setShowUserSidebar(true)}
                className="w-full px-3 py-2 border border-neutral-dark rounded text-sm cursor-pointer bg-neutral-light text-primary"
                placeholder="Số điện thoại"
              />
              <input
                type="email"
                value={contactEmail}
                readOnly
                onClick={() => setShowUserSidebar(true)}
                className="w-full px-3 py-2 border border-neutral-dark rounded text-sm cursor-pointer bg-neutral-light text-primary placeholder:text-neutral-dark"
                placeholder="Email (Không bắt buộc)"
              />
            </div>
          </div>
        </div>
        <div className="px-3 mt-3">
          <div className="bg-neutral-light rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-primary">Địa chỉ nhận hàng</h2>
              <button onClick={() => setShowAddressSidebar(true)} className="text-xs text-primary hover:underline">
                Thay đổi
              </button>
            </div>
            {selectedAddress ? (
              <div onClick={() => setShowAddressSidebar(true)} className="cursor-pointer">
                <p className="font-semibold text-sm text-primary mb-1">
                  {selectedAddress.contactName} • {selectedAddress.phone}
                </p>
                <p className="text-sm text-neutral-darker">{formatDisplayAddress(selectedAddress)}</p>
              </div>
            ) : (
              <button onClick={() => setShowAddressSidebar(true)} className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-neutral-dark rounded-lg text-sm text-neutral-darker">
                <MapPin size={16} /> Chọn địa chỉ giao hàng
              </button>
            )}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-accent border-t-2 border-accent-dark p-3 z-30 shadow-2xl">
          <button
            onClick={() => setShowSidebar(true)}
            className="w-full bg-primary-darker hover:bg-primary text-accent font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 shrink-0" />
              <span>Xem đơn hàng ({cartItems.length})</span>
            </div>
            <span className="font-bold text-lg">{formatVND(mobileFinalTotal)}</span>
          </button>
        </div>
        <div className="h-24" />
      </div>

      {/* ── Sidebars & Modals ── */}
      <UserInfoSidebar isOpen={showUserSidebar} onClose={() => setShowUserSidebar(false)} userInfo={userInfoForSidebar} onUpdate={handleUserUpdate} />
      <AddressSidebar isOpen={showAddressSidebar} onClose={() => setShowAddressSidebar(false)} selectedAddressId={selectedAddress?.id} onSelect={setSelectedAddress} />
      <CartSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        subtotal={displaySubtotal}
        totalDiscount={displayDiscount}
        finalTotal={displayFinalTotal}
        rewardPoints={rewardPoints}
        selectedItemsCount={cartItems.length}
        appliedVoucherCode={voucherCode}
        appliedVoucherValue={displayVoucherDiscount}
        onOpenVoucherModal={() => setShowVoucherModal(true)}
        onCheckout={handlePlaceOrder}
        isCheckoutPage={true}
        showTerms={true}
        agreedToTerms={agreedToTerms}
        onTermsChange={setAgreedToTerms}
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
    </div>
  );
}
