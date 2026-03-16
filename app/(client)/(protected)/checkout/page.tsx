"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
   ShoppingCart,
   MapPin,
   ChevronDown,
   Check,
   Loader2,
   X,
   User,
} from "lucide-react";
import { useToasty } from "@/components/Toast";
import AddressSidebar, { ApiAddress } from "./components/AddressSidebar";
import VoucherPromotionModal from "@/(client)/cart/components/VoucherPromotionModal";
import CartSidebar from "@/(client)/cart/components/CartSidebar";
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

// ─── Types ───────────────────────────────────────────────────────────────────

interface Province {
   id: string;
   name: string;
   fullName: string;
}
interface Ward {
   id: string;
   name: string;
   fullName: string;
}

interface UserProfile {
   id: string;
   fullName: string;
   phone: string | null;
   email: string;
}

interface SavedAddress {
   id: string;
   contactName: string;
   phone: string;
   province: { id: string; name: string; fullName: string };
   ward: { id: string; name: string; fullName: string };
   detailAddress: string;
   fullAddress: string;
   type: "HOME" | "OFFICE" | "OTHER";
   isDefault: boolean;
}

interface CartItem {
   id: string;
   name: string;
   variant: string;
   color?: string;
   colorValue?: string;
   quantity: number;
   unit_price: number;
   original_price?: number;
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
}

interface PreviewData {
   subtotalAmount: number;
   shippingFee: number;
   voucherDiscount: number;
   taxAmount: number;
   totalAmount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputCls =
   "w-full px-3 py-2.5 border border-neutral rounded-lg text-sm focus:outline-none focus:border-accent bg-neutral-light text-primary placeholder:text-neutral-dark transition-colors";
const selectCls =
   "w-full px-3 py-2.5 pr-9 border border-neutral rounded-lg text-sm focus:outline-none focus:border-accent bg-neutral-light text-primary appearance-none cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral";
const disabledInputCls =
   "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral";

// ─── Component ───────────────────────────────────────────────────────────────

export default function CheckoutPage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const toast = useToasty();
   const { loading: authLoading } = useAuth();
   const { refetchCart } = useCart();

   // ── Cart ──────────────────────────────────────────────────────────────────
   const [cartItems, setCartItems] = useState<CartItem[]>([]);
   const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
   const [promotionValue, setPromotionValue] = useState(0);
   const [subtotal, setSubtotal] = useState(0);
   const [totalDiscount, setTotalDiscount] = useState(0);
   const [finalTotal, setFinalTotal] = useState(0);
   const [rewardPoints, setRewardPoints] = useState(0);
   const [usePoints, setUsePoints] = useState(false);

   // ── Voucher ───────────────────────────────────────────────────────────────
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

   // ── Contact (người đặt hàng) ──────────────────────────────────────────────
   const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
   const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
   const [contactSelectedId, setContactSelectedId] = useState<string | null>(
      null,
   );
   const [contactName, setContactName] = useState("");
   const [contactPhone, setContactPhone] = useState("");
   const [isContactOpen, setIsContactOpen] = useState(false);
   const contactRef = useRef<HTMLDivElement>(null);

   // ── Address (địa chỉ nhận hàng) ───────────────────────────────────────────
   const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
   const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
   const [hasFetchedAddresses, setHasFetchedAddresses] = useState(false);
   const [selectedSavedAddress, setSelectedSavedAddress] =
      useState<SavedAddress | null>(null);
   const [isAddressOpen, setIsAddressOpen] = useState(false);
   const addressRef = useRef<HTMLDivElement>(null);

   // Address form (nhập tay — chỉ dùng khi không chọn saved)
   const [provinceId, setProvinceId] = useState("");
   const [wardId, setWardId] = useState("");
   const [detailAddress, setDetailAddress] = useState("");
   const [provinces, setProvinces] = useState<Province[]>([]);
   const [wards, setWards] = useState<Ward[]>([]);
   const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
   const [isLoadingWards, setIsLoadingWards] = useState(false);

   // ── Misc ──────────────────────────────────────────────────────────────────
   const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
      useState<string>("");
   const [notes, setNotes] = useState("");
   const [sendInvoice, setSendInvoice] = useState(false);
   const [agreedToTerms, setAgreedToTerms] = useState(false);
   const [previewData, setPreviewData] = useState<PreviewData | null>(null);
   const [mobileSelectedAddress, setMobileSelectedAddress] =
      useState<ApiAddress | null>(null);

   // ── UI ────────────────────────────────────────────────────────────────────
   const [showAddressSidebar, setShowAddressSidebar] = useState(false);
   const [showVoucherModal, setShowVoucherModal] = useState(false);
   const [showSidebar, setShowSidebar] = useState(false);
   const [isPageLoading, setIsPageLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showConfirmModal, setShowConfirmModal] = useState(false);
   const [showSaveAddressModal, setShowSaveAddressModal] = useState(false);
   const [pendingOrderResult, setPendingOrderResult] = useState<{
      orderCode: string;
      orderId: string;
      paymentMethodCode: string;
      paymentInfo: any;
      tempAddressId: string;
   } | null>(null);
   const [paymentResultModal, setPaymentResultModal] = useState<{
      isOpen: boolean;
      paymentInfo: any;
      orderId: string;
   }>({ isOpen: false, paymentInfo: null, orderId: "" });

   // ── Close dropdowns on outside click ─────────────────────────────────────
   useEffect(() => {
      const handler = (e: MouseEvent) => {
         if (
            contactRef.current &&
            !contactRef.current.contains(e.target as Node)
         )
            setIsContactOpen(false);
         if (
            addressRef.current &&
            !addressRef.current.contains(e.target as Node)
         )
            setIsAddressOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, []);

   // ── Fetch user profile ────────────────────────────────────────────────────
   useEffect(() => {
      const load = async () => {
         setIsLoadingProfiles(true);
         try {
            const res = await apiRequest.get<{ data: UserProfile }>(
               "/users/me",
            );
            if (res?.data) setUserProfiles([res.data]);
         } catch {
            setUserProfiles([]);
         } finally {
            setIsLoadingProfiles(false);
         }
      };
      load();
   }, []);

   // ── Fetch provinces ───────────────────────────────────────────────────────
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

   // ── Fetch wards when province changes ────────────────────────────────────
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

   // ── Fetch saved addresses — auto-select mặc định khi mount ─────────────
   const fetchSavedAddresses = async () => {
      if (hasFetchedAddresses) return;
      setIsLoadingAddresses(true);
      try {
         const res = await apiRequest.get<{ data: SavedAddress[] }>(
            "/addresses",
         );
         const list = res?.data ?? [];
         setSavedAddresses(list);
         setHasFetchedAddresses(true);
         // Auto chọn mặc định
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

   // Auto-fetch khi mount
   // eslint-disable-next-line react-hooks/exhaustive-deps
   useEffect(() => {
      fetchSavedAddresses();
   }, []);

   // ── Effect: Load checkout data ────────────────────────────────────────────
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
                  const target =
                     list.find((a) => a.id === targetId) ??
                     list.find((a) => a.isDefault) ??
                     list[0];
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

   // ── Effect: Load default address (mobile) ────────────────────────────────
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
            if (list.length > 0)
               setMobileSelectedAddress(
                  list.find((a) => a.isDefault) ?? list[0],
               );
         } catch {
            /* silent */
         }
      };
      load();
   }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

   // ── Preview ───────────────────────────────────────────────────────────────
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

   // ── Handlers: Contact ─────────────────────────────────────────────────────
   const handleSelectContact = (profile: UserProfile) => {
      setContactSelectedId(profile.id);
      setContactName(profile.fullName ?? "");
      setContactPhone(profile.phone ?? "");
      setIsContactOpen(false);
   };

   const handleClearContact = () => {
      setContactSelectedId(null);
      setContactName("");
      setContactPhone("");
   };

   const contactPhoneDisabled =
      !!contactSelectedId &&
      !!userProfiles.find((p) => p.id === contactSelectedId)?.phone;
   const contactNameDisabled = !!contactSelectedId;

   // ── Handlers: Address ─────────────────────────────────────────────────────
   const handleSelectSavedAddress = (addr: SavedAddress) => {
      setSelectedSavedAddress(addr);
      setProvinceId(addr.province.id);
      setWardId(addr.ward.id);
      setDetailAddress(addr.detailAddress);
      // ✅ Sync contact từ address — không cần section người đặt hàng riêng
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
      // ✅ reset luôn contact
      setContactName("");
      setContactPhone("");
      setContactSelectedId(null);
   };

   const handleProvinceChange = (id: string) => {
      if (selectedSavedAddress) setSelectedSavedAddress(null);
      setProvinceId(id);
      setWardId("");
      setWards([]);
   };

   const handleFieldChange = (
      field: "wardId" | "detailAddress",
      val: string,
   ) => {
      if (selectedSavedAddress) setSelectedSavedAddress(null);
      if (field === "wardId") setWardId(val);
      else setDetailAddress(val);
   };

   // ── Validate ──────────────────────────────────────────────────────────────
   const handleCheckoutClick = () => {
      if (!contactName.trim()) {
         toast.error("Vui lòng nhập họ tên người đặt");
         return;
      }
      if (!contactPhone.trim()) {
         toast.error("Vui lòng nhập số điện thoại người đặt");
         return;
      }
      if (
         !selectedSavedAddress &&
         (!provinceId || !wardId || !detailAddress.trim())
      ) {
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

   // ── Place order ───────────────────────────────────────────────────────────
   const handlePlaceOrder = async () => {
      setShowConfirmModal(false);
      setIsSubmitting(true);
      let tempAddressId: string | null = null;

      try {
         let addressId = selectedSavedAddress?.id ?? null;

         // Nhập tay → tạo address tạm
         if (!addressId) {
            const createRes = await apiRequest.post<{ data: { id: string } }>(
               "/addresses",
               {
                  contactName,
                  phone: contactPhone,
                  provinceId,
                  wardId,
                  detailAddress,
                  type: "HOME",
                  isDefault: false,
               },
            );
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

            // Nếu có address tạm → hỏi lưu không, xử lý sau
            if (tempAddressId) {
               setPendingOrderResult({
                  orderCode: res.data.orderCode,
                  orderId: res.data.orderId,
                  paymentMethodCode: res.data.paymentMethodCode,
                  paymentInfo: res.data.paymentInfo,
                  tempAddressId,
               });
               setShowSaveAddressModal(true);
               return;
            }

            navigateAfterOrder(
               res.data.orderCode,
               res.data.orderId,
               res.data.paymentMethodCode,
               res.data.paymentInfo,
            );
         }
      } catch (err: any) {
         if (tempAddressId) {
            apiRequest.delete(`/addresses/${tempAddressId}`).catch(() => {});
         }
         toast.error(
            err?.response?.data?.message ??
               err?.message ??
               "Có lỗi xảy ra khi đặt hàng",
         );
      } finally {
         setIsSubmitting(false);
      }
   };

   const navigateAfterOrder = (
      orderCode: string,
      orderId: string,
      paymentMethodCode: string,
      paymentInfo: any,
   ) => {
      const methodUpper = paymentMethodCode.toUpperCase();
      if (
         methodUpper.includes("COD") ||
         methodUpper.includes("BANK_TRANSFER")
      ) {
         router.push(`/order/${orderCode}/payment`);
         return;
      }
      if (
         methodUpper.includes("MOMO") ||
         methodUpper.includes("VNPAY") ||
         methodUpper.includes("ZALOPAY")
      ) {
         if (paymentInfo?.paymentUrl)
            window.location.href = paymentInfo.paymentUrl;
         else toast.error("Không lấy được đường dẫn thanh toán.");
         return;
      }
      if (
         methodUpper.includes("STRIPE") ||
         methodUpper.includes("CREDIT_CARD")
      ) {
         setPaymentResultModal({ isOpen: true, paymentInfo, orderId });
         return;
      }
      router.push(`/order/${orderCode}/payment`);
   };

   // ── Save address modal handlers ───────────────────────────────────────────
   const handleSaveAddress = async () => {
      if (!pendingOrderResult) return;
      // Cập nhật address tạm → đổi isDefault nếu muốn, không xóa
      // Địa chỉ đã tồn tại trong DB rồi (tạo khi checkout), chỉ cần đóng modal
      setShowSaveAddressModal(false);
      toast.success("Đã lưu địa chỉ vào sổ địa chỉ");
      navigateAfterOrder(
         pendingOrderResult.orderCode,
         pendingOrderResult.orderId,
         pendingOrderResult.paymentMethodCode,
         pendingOrderResult.paymentInfo,
      );
      setPendingOrderResult(null);
   };

   const handleDontSaveAddress = async () => {
      if (!pendingOrderResult) return;
      // Xóa address tạm
      apiRequest
         .delete(`/addresses/${pendingOrderResult.tempAddressId}`)
         .catch(() => {});
      setShowSaveAddressModal(false);
      navigateAfterOrder(
         pendingOrderResult.orderCode,
         pendingOrderResult.orderId,
         pendingOrderResult.paymentMethodCode,
         pendingOrderResult.paymentInfo,
      );
      setPendingOrderResult(null);
   };

   // ── Computed ──────────────────────────────────────────────────────────────
   const displaySubtotal = subtotal;
   const displayDiscount = totalDiscount;
   const displayVoucherDiscount = voucherValue;
   const displayFinalTotal = finalTotal;
   const mobileFinalTotal = Math.max(0, finalTotal - voucherValue);
   const shippingFee = previewData?.shippingFee;
   const taxAmount = previewData?.taxAmount;
   const selectedContactProfile = userProfiles.find(
      (p) => p.id === contactSelectedId,
   );

   const formatDisplayAddress = (addr: ApiAddress) =>
      addr.fullAddress ??
      [addr.detailAddress, addr.ward?.name, addr.province?.name]
         .filter(Boolean)
         .join(", ");

   // ── Loading ───────────────────────────────────────────────────────────────
   if (isPageLoading || authLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-neutral-light">
            <div className="text-center">
               <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-neutral border-t-accent mb-4" />
               <p className="text-neutral-darker">
                  Đang tải thông tin đơn hàng...
               </p>
            </div>
         </div>
      );
   }

   // ─── Render ───────────────────────────────────────────────────────────────
   return (
      <div className="min-h-screen bg-neutral-light">
         {/* ── Desktop ── */}
         <div className="hidden md:block">
            <div className="container py-4 sm:py-6">
               <div className="mb-4 sm:mb-6">
                  <Breadcrumb
                     items={[
                        { label: "Trang chủ", href: "/" },
                        { label: "Giỏ hàng", href: "/cart" },
                        { label: "Thanh toán" },
                     ]}
                  />
               </div>

               <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                     <CartItems items={cartItems} />

                     {/* ── Thông tin giao hàng (1 section) ── */}
                     <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                        <h2 className="text-sm sm:text-base font-semibold text-primary mb-4">
                           Thông tin giao hàng
                        </h2>

                        {/* Dropdown saved address */}
                        <div className="relative mb-4" ref={addressRef}>
                           <button
                              type="button"
                              onClick={() => {
                                 setIsAddressOpen((v) => !v);
                                 fetchSavedAddresses();
                              }}
                              className="w-full flex items-center justify-between gap-2 px-4 py-3 border border-neutral rounded-lg text-sm bg-neutral-light hover:border-accent transition-colors cursor-pointer"
                           >
                              <div className="flex items-center gap-2 min-w-0">
                                 <MapPin
                                    size={16}
                                    className="text-accent shrink-0"
                                 />
                                 {selectedSavedAddress ? (
                                    <span className="text-primary font-medium truncate">
                                       {selectedSavedAddress.contactName} —{" "}
                                       {selectedSavedAddress.fullAddress}
                                    </span>
                                 ) : (
                                    <span className="text-neutral-dark">
                                       Chọn từ địa chỉ đã lưu
                                    </span>
                                 )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                 {selectedSavedAddress && (
                                    <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent font-medium rounded-full">
                                       Đã chọn
                                    </span>
                                 )}
                                 <ChevronDown
                                    size={16}
                                    className={`text-neutral-dark transition-transform duration-200 ${isAddressOpen ? "rotate-180" : ""}`}
                                 />
                              </div>
                           </button>

                           {isAddressOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1.5 bg-neutral-light border border-neutral rounded-lg shadow-xl z-30 overflow-hidden">
                                 {isLoadingAddresses ? (
                                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-neutral-dark">
                                       <Loader2
                                          size={16}
                                          className="animate-spin"
                                       />{" "}
                                       Đang tải...
                                    </div>
                                 ) : savedAddresses.length === 0 ? (
                                    <p className="text-sm text-neutral-dark text-center py-6">
                                       Chưa có địa chỉ nào được lưu
                                    </p>
                                 ) : (
                                    <ul className="max-h-64 overflow-y-auto divide-y divide-neutral">
                                       {savedAddresses.map((addr) => (
                                          <li key={addr.id}>
                                             <button
                                                type="button"
                                                onClick={() =>
                                                   handleSelectSavedAddress(
                                                      addr,
                                                   )
                                                }
                                                className={`w-full text-left px-4 py-3 hover:bg-neutral transition-colors cursor-pointer flex items-start gap-3 ${selectedSavedAddress?.id === addr.id ? "bg-accent/5" : ""}`}
                                             >
                                                <div className="flex-1 min-w-0">
                                                   <div className="flex items-center gap-2 flex-wrap">
                                                      <span className="text-sm font-semibold text-primary">
                                                         {addr.contactName}
                                                      </span>
                                                      <span className="text-sm text-neutral-darker">
                                                         {addr.phone}
                                                      </span>
                                                      {addr.isDefault && (
                                                         <span className="text-[10px] px-1.5 py-0.5 bg-accent text-white font-medium rounded">
                                                            Mặc định
                                                         </span>
                                                      )}
                                                   </div>
                                                   <p className="text-xs text-neutral-darker mt-0.5 line-clamp-1">
                                                      {addr.fullAddress}
                                                   </p>
                                                </div>
                                                {selectedSavedAddress?.id ===
                                                   addr.id && (
                                                   <Check
                                                      size={16}
                                                      className="text-accent shrink-0 mt-0.5"
                                                   />
                                                )}
                                             </button>
                                          </li>
                                       ))}
                                    </ul>
                                 )}
                              </div>
                           )}
                        </div>

                        {selectedSavedAddress && (
                           <button
                              type="button"
                              onClick={handleClearAddress}
                              className="flex items-center gap-1.5 text-xs text-promotion transition-colors cursor-pointer mb-4"
                           >
                              <X size={13} /> Xóa lựa chọn và nhập thủ công
                           </button>
                        )}

                        {/* Tên + SĐT */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                           <div>
                              <label className="block text-xs font-medium text-neutral-darker mb-1.5">
                                 Họ tên người nhận{" "}
                                 <span className="text-promotion">*</span>
                              </label>
                              <input
                                 type="text"
                                 value={contactName}
                                 onChange={(e) => {
                                    if (selectedSavedAddress)
                                       setSelectedSavedAddress(null);
                                    setContactName(e.target.value);
                                 }}
                                 placeholder="Nguyễn Văn A"
                                 disabled={!!selectedSavedAddress}
                                 className={`${inputCls} ${disabledInputCls}`}
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-neutral-darker mb-1.5">
                                 Số điện thoại{" "}
                                 <span className="text-promotion">*</span>
                              </label>
                              <input
                                 type="tel"
                                 value={contactPhone}
                                 onChange={(e) => {
                                    if (selectedSavedAddress)
                                       setSelectedSavedAddress(null);
                                    setContactPhone(e.target.value);
                                 }}
                                 placeholder="0901 234 567"
                                 disabled={!!selectedSavedAddress}
                                 className={`${inputCls} ${disabledInputCls}`}
                              />
                           </div>
                        </div>

                        {/* Form tỉnh / phường / địa chỉ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                           <div>
                              <label className="block text-xs font-medium text-neutral-darker mb-1.5">
                                 Tỉnh / Thành phố{" "}
                                 <span className="text-promotion">*</span>
                              </label>
                              <div className="relative">
                                 <select
                                    value={provinceId}
                                    onChange={(e) =>
                                       handleProvinceChange(e.target.value)
                                    }
                                    disabled={
                                       isLoadingProvinces ||
                                       !!selectedSavedAddress
                                    }
                                    className={selectCls}
                                 >
                                    <option value="">Chọn tỉnh / thành</option>
                                    {provinces.map((p) => (
                                       <option key={p.id} value={p.id}>
                                          {p.fullName}
                                       </option>
                                    ))}
                                 </select>
                                 <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                    {isLoadingProvinces ? (
                                       <Loader2
                                          size={14}
                                          className="animate-spin text-neutral-dark"
                                       />
                                    ) : (
                                       <ChevronDown
                                          size={14}
                                          className="text-neutral-dark"
                                       />
                                    )}
                                 </div>
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-neutral-darker mb-1.5">
                                 Phường / Xã{" "}
                                 <span className="text-promotion">*</span>
                              </label>
                              <div className="relative">
                                 <select
                                    value={wardId}
                                    onChange={(e) =>
                                       handleFieldChange(
                                          "wardId",
                                          e.target.value,
                                       )
                                    }
                                    disabled={
                                       !provinceId ||
                                       isLoadingWards ||
                                       !!selectedSavedAddress
                                    }
                                    className={selectCls}
                                 >
                                    <option value="">Chọn phường / xã</option>
                                    {wards.map((w) => (
                                       <option key={w.id} value={w.id}>
                                          {w.fullName}
                                       </option>
                                    ))}
                                 </select>
                                 <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                    {isLoadingWards ? (
                                       <Loader2
                                          size={14}
                                          className="animate-spin text-neutral-dark"
                                       />
                                    ) : (
                                       <ChevronDown
                                          size={14}
                                          className="text-neutral-dark"
                                       />
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-neutral-darker mb-1.5">
                              Địa chỉ chi tiết{" "}
                              <span className="text-promotion">*</span>
                           </label>
                           <input
                              type="text"
                              value={detailAddress}
                              onChange={(e) =>
                                 handleFieldChange(
                                    "detailAddress",
                                    e.target.value,
                                 )
                              }
                              placeholder="Số nhà, tên đường..."
                              disabled={!!selectedSavedAddress}
                              className={`${inputCls} ${disabledInputCls}`}
                           />
                        </div>
                     </div>

                     {/* ── Ghi chú ── */}
                     <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                        <label className="block text-sm font-medium mb-2 text-primary">
                           Ghi chú
                        </label>
                        <textarea
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                           maxLength={1000}
                           rows={4}
                           className="w-full px-3 py-2 border-2 border-neutral-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none bg-neutral-light text-primary"
                           placeholder="Ví dụ: Hãy gọi tôi khi chuẩn bị hàng xong"
                        />
                        <div className="text-xs text-neutral-dark mt-1 text-right">
                           {notes.length}/1000
                        </div>
                     </div>

                     {/* ── Hóa đơn ── */}
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
                           <span className="text-sm text-primary">
                              Yêu cầu hỗ trợ xuất hóa đơn điện tử
                           </span>
                        </label>
                     </div>

                     <PaymentMethods
                        selectedMethod={selectedPaymentMethodId}
                        onSelect={setSelectedPaymentMethodId}
                     />
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
                        taxAmount={taxAmount}
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* ── Mobile ── */}
         <div className="md:hidden">
            <div className="bg-neutral-light border-b border-neutral px-4 py-3">
               <Link
                  href="/cart"
                  className="inline-flex items-center gap-1 text-sm cursor-pointer text-primary"
               >
                  <span>←</span> Quay lại giỏ hàng
               </Link>
            </div>
            <div className="px-3 pt-3">
               <CartItems items={cartItems} />
            </div>
            <div className="px-3 mt-3">
               <div className="bg-neutral-light rounded-lg p-4 shadow-sm border border-neutral">
                  <h2 className="text-sm font-semibold text-primary mb-3">
                     Người đặt hàng
                  </h2>
                  <div className="grid grid-cols-1 gap-2">
                     <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Họ và tên"
                        className={inputCls}
                     />
                     <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Số điện thoại"
                        className={inputCls}
                     />
                  </div>
               </div>
            </div>
            <div className="px-3 mt-3">
               <div className="bg-neutral-light rounded-lg p-4 shadow-sm border border-neutral">
                  <div className="flex items-center justify-between mb-3">
                     <h2 className="text-sm font-semibold text-primary">
                        Địa chỉ nhận hàng
                     </h2>
                     <button
                        onClick={() => setShowAddressSidebar(true)}
                        className="text-xs text-primary hover:underline"
                     >
                        Thay đổi
                     </button>
                  </div>
                  {mobileSelectedAddress ? (
                     <div
                        onClick={() => setShowAddressSidebar(true)}
                        className="cursor-pointer"
                     >
                        <p className="font-semibold text-sm text-primary mb-1">
                           {mobileSelectedAddress.contactName} •{" "}
                           {mobileSelectedAddress.phone}
                        </p>
                        <p className="text-sm text-neutral-darker">
                           {formatDisplayAddress(mobileSelectedAddress)}
                        </p>
                     </div>
                  ) : (
                     <button
                        onClick={() => setShowAddressSidebar(true)}
                        className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-neutral-dark rounded-lg text-sm text-neutral-darker"
                     >
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
                  <span className="font-bold text-lg">
                     {formatVND(mobileFinalTotal)}
                  </span>
               </button>
            </div>
            <div className="h-24" />
         </div>

         {/* ── Sidebars & Modals ── */}
         <AddressSidebar
            isOpen={showAddressSidebar}
            onClose={() => setShowAddressSidebar(false)}
            selectedAddressId={mobileSelectedAddress?.id}
            onSelect={setMobileSelectedAddress}
         />
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
            onCheckout={handleCheckoutClick}
            isCheckoutPage
            showTerms
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

         {/* ── Confirm Modal ── */}
         {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
               <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowConfirmModal(false)}
               />
               <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                  <h3 className="text-base font-semibold text-primary mb-2">
                     Xác nhận đặt hàng
                  </h3>
                  <p className="text-sm text-neutral-darker mb-1">
                     Tổng thanh toán:{" "}
                     <span className="font-bold text-primary">
                        {formatVND(displayFinalTotal)}
                     </span>
                  </p>
                  <p className="text-xs text-neutral-darker mb-5">
                     Bạn có chắc chắn muốn đặt đơn hàng này không?
                  </p>
                  <div className="flex gap-3">
                     <button
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-2.5 border border-neutral rounded-lg text-sm text-neutral-darker hover:bg-neutral transition-colors"
                     >
                        Hủy
                     </button>
                     <button
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 bg-accent text-primary-darker font-semibold rounded-lg text-sm hover:bg-accent-dark transition-colors disabled:opacity-60"
                     >
                        {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ── Save Address Modal ── */}
         {showSaveAddressModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
               <div className="absolute inset-0 bg-black/50" />
               <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                  <h3 className="text-base font-semibold text-primary mb-2">
                     Lưu địa chỉ?
                  </h3>
                  <p className="text-sm text-neutral-darker mb-5">
                     Bạn có muốn lưu địa chỉ này vào sổ địa chỉ để dùng cho lần
                     sau không?
                  </p>
                  <div className="flex gap-3">
                     <button
                        onClick={handleDontSaveAddress}
                        className="flex-1 py-2.5 border border-neutral rounded-lg text-sm text-neutral-darker hover:bg-neutral transition-colors"
                     >
                        Không lưu
                     </button>
                     <button
                        onClick={handleSaveAddress}
                        className="flex-1 py-2.5 bg-accent text-primary-darker font-semibold rounded-lg text-sm hover:bg-accent-dark transition-colors"
                     >
                        Lưu địa chỉ
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ── Payment Result Modal ── */}
         <PaymentResultModal
            isOpen={paymentResultModal.isOpen}
            paymentInfo={paymentResultModal.paymentInfo}
            onClose={() =>
               setPaymentResultModal((p) => ({ ...p, isOpen: false }))
            }
            onDone={() => router.push("/profile/orders")}
         />
      </div>
   );
}
