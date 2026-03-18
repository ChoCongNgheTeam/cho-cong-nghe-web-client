"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Loader2, X, ChevronUp, ChevronRight } from "lucide-react";
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

// ─── ShippingSection — tách ra ngoài CheckoutPage để tránh remount ────────────

interface ShippingSectionProps {
   isLoadingAddresses: boolean;
   savedAddresses: SavedAddress[];
   showManualForm: boolean;
   selectedSavedAddress: SavedAddress | null;
   contactName: string;
   contactPhone: string;
   provinceId: string;
   wardId: string;
   detailAddress: string;
   provinces: Province[];
   wards: Ward[];
   isLoadingProvinces: boolean;
   isLoadingWards: boolean;
   wantSaveAddress: boolean | null;
   instanceId?: string; // thêm dòng này
   onSelectSavedAddress: (addr: SavedAddress) => void;
   onShowManualForm: () => void;
   onBackToSaved: () => void;
   onContactNameChange: (v: string) => void;
   onContactPhoneChange: (v: string) => void;
   onProvinceChange: (v: string) => void;
   onWardChange: (v: string) => void;
   onDetailAddressChange: (v: string) => void;
   onWantSaveAddressChange: (v: boolean) => void;
   onEditAddress: () => void;
}

function ShippingSection({
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
   instanceId = "default",
   onSelectSavedAddress,
   onShowManualForm,
   onBackToSaved,
   onContactNameChange,
   onContactPhoneChange,
   onProvinceChange,
   onWardChange,
   onDetailAddressChange,
   onWantSaveAddressChange,
   onEditAddress,
}: ShippingSectionProps) {
   return (
      <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
         <h2 className="text-sm sm:text-base font-semibold text-primary mb-4">
            Thông tin giao hàng
         </h2>

         {isLoadingAddresses ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-neutral-dark">
               <Loader2 size={16} className="animate-spin" /> Đang tải...
            </div>
         ) : savedAddresses.length === 0 && !showManualForm ? (
            <p className="text-sm text-neutral-dark text-center py-4">
               Chưa có địa chỉ nào được lưu
            </p>
         ) : (
            !showManualForm && (
               <ul className="divide-y divide-neutral mb-4">
                  {savedAddresses
                     .filter((addr) => addr.isDefault)
                     .map((addr) => (
                        <li key={addr.id}>
                           <div
                              onClick={() => onSelectSavedAddress(addr)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                 if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSelectSavedAddress(addr);
                                 }
                              }}
                              className="w-full text-left px-2 py-3 hover:bg-neutral/50 transition-colors cursor-pointer flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
                           >
                              <div className="shrink-0 mt-0.5">
                                 <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSavedAddress?.id === addr.id ? "border-accent bg-accent" : "border-neutral-dark"}`}
                                 >
                                    {selectedSavedAddress?.id === addr.id && (
                                       <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                 </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                       <span className="text-sm font-semibold text-primary">
                                          {addr.contactName}
                                       </span>
                                       <span className="text-sm text-neutral-darker">
                                          (+84) {addr.phone.replace(/^0/, "")}
                                       </span>
                                    </div>
                                    <button
                                       type="button"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          onEditAddress();
                                       }}
                                       className="shrink-0 text-xs text-neutral-darker hover:text-primary transition-colors focus:outline-none focus:underline"
                                    >
                                       Sửa
                                    </button>
                                 </div>
                                 <p className="text-sm text-neutral-darker mt-0.5">
                                    {addr.detailAddress}
                                 </p>
                                 <p className="text-sm text-neutral-darker">
                                    {addr.ward?.fullName},{" "}
                                    {addr.province?.fullName}
                                 </p>
                                 <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 border border-accent text-accent rounded">
                                    Mặc định
                                 </span>
                              </div>
                           </div>
                        </li>
                     ))}
               </ul>
            )
         )}

         {!showManualForm ? (
            <button
               type="button"
               onClick={onShowManualForm}
               className="flex items-center gap-1.5 text-sm text-accent hover:underline transition-colors cursor-pointer mt-1 focus:outline-none focus:underline"
            >
               + Nhập địa chỉ khác
            </button>
         ) : (
            <>
               {savedAddresses.length > 0 && (
                  <button
                     type="button"
                     onClick={onBackToSaved}
                     className="flex items-center gap-1.5 text-xs text-neutral-darker hover:text-primary transition-colors cursor-pointer mb-4 focus:outline-none focus:underline"
                  >
                     ← Chọn từ địa chỉ đã lưu
                  </button>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                     <label className="block text-xs font-medium text-neutral-darker mb-1.5">
                        Họ tên người nhận{" "}
                        <span className="text-promotion">*</span>
                     </label>
                     <input
                        type="text"
                        value={contactName}
                        onChange={(e) => onContactNameChange(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className={inputCls}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-neutral-darker mb-1.5">
                        Số điện thoại <span className="text-promotion">*</span>
                     </label>
                     <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => onContactPhoneChange(e.target.value)}
                        placeholder="0901 234 567"
                        className={inputCls}
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                     <label className="block text-xs font-medium text-neutral-darker mb-1.5">
                        Tỉnh / Thành phố{" "}
                        <span className="text-promotion">*</span>
                     </label>
                     <div className="relative">
                        <select
                           value={provinceId}
                           onChange={(e) => onProvinceChange(e.target.value)}
                           disabled={isLoadingProvinces}
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
                        Phường / Xã <span className="text-promotion">*</span>
                     </label>
                     <div className="relative">
                        <select
                           value={wardId}
                           onChange={(e) => onWardChange(e.target.value)}
                           disabled={!provinceId || isLoadingWards}
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

               <div className="mb-3">
                  <label className="block text-xs font-medium text-neutral-darker mb-1.5">
                     Địa chỉ chi tiết <span className="text-promotion">*</span>
                  </label>
                  <input
                     type="text"
                     value={detailAddress}
                     onChange={(e) => onDetailAddressChange(e.target.value)}
                     placeholder="Số nhà, tên đường..."
                     className={inputCls}
                  />
               </div>

               {/* ── Hỏi lưu địa chỉ inline ── */}
               <div className="flex items-center gap-4 pt-2 border-t border-neutral mt-1">
                  <span className="text-xs text-neutral-darker">
                     Bạn có muốn lưu địa chỉ này không?
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-primary">
                     <input
                        type="radio"
                        name={`saveAddress-${instanceId}`}
                        checked={wantSaveAddress === false}
                        onChange={() => onWantSaveAddressChange(false)}
                        className="accent-accent"
                     />
                     Không
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-primary">
                     <input
                        type="radio"
                        name={`saveAddress-${instanceId}`}
                        checked={wantSaveAddress === true}
                        onChange={() => onWantSaveAddressChange(true)}
                        className="accent-accent"
                     />
                     Có
                  </label>
               </div>
            </>
         )}
      </div>
   );
}

// ─── CheckoutPage ─────────────────────────────────────────────────────────────

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
   const handleApplyVoucher = useCallback(
      (code: string, value: number, id: string) => {
         setVoucherCode(code);
         setVoucherValue(value);
         setVoucherId(id);
      },
      [],
   );

   const [showManualForm, setShowManualForm] = useState(false);
   const [wantSaveAddress, setWantSaveAddress] = useState<boolean | null>(null);

   const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
   const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
   const [contactSelectedId, setContactSelectedId] = useState<string | null>(
      null,
   );
   const [contactName, setContactName] = useState("");
   const [contactPhone, setContactPhone] = useState("");
   const [isContactOpen, setIsContactOpen] = useState(false);
   const contactRef = useRef<HTMLDivElement>(null);

   const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
   const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
   const [hasFetchedAddresses, setHasFetchedAddresses] = useState(false);
   const [selectedSavedAddress, setSelectedSavedAddress] =
      useState<SavedAddress | null>(null);
   const [isAddressOpen, setIsAddressOpen] = useState(false);
   const addressRef = useRef<HTMLDivElement>(null);

   const [provinceId, setProvinceId] = useState("");
   const [wardId, setWardId] = useState("");
   const [detailAddress, setDetailAddress] = useState("");
   const [provinces, setProvinces] = useState<Province[]>([]);
   const [wards, setWards] = useState<Ward[]>([]);
   const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
   const [isLoadingWards, setIsLoadingWards] = useState(false);

   const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
      useState<string>("");
   const [notes, setNotes] = useState("");
   const [sendInvoice, setSendInvoice] = useState(false);
   const [agreedToTerms, setAgreedToTerms] = useState(false);
   const [previewData, setPreviewData] = useState<PreviewData | null>(null);
   const [mobileSelectedAddress, setMobileSelectedAddress] =
      useState<ApiAddress | null>(null);

   const [showAddressSidebar, setShowAddressSidebar] = useState(false);
   const [showVoucherModal, setShowVoucherModal] = useState(false);
   const [showSidebar, setShowSidebar] = useState(false);
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
         const res = await apiRequest.get<{ data: SavedAddress[] }>(
            "/addresses",
         );
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

   const handleFieldChange = (
      field: "wardId" | "detailAddress",
      val: string,
   ) => {
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

   const handlePlaceOrder = async () => {
      setShowConfirmModal(false);
      setIsSubmitting(true);
      let tempAddressId: string | null = null;
      try {
         let addressId = selectedSavedAddress?.id ?? null;
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
            if (tempAddressId && wantSaveAddress === false) {
               apiRequest.delete(`/addresses/${tempAddressId}`).catch(() => {});
            }
            navigateAfterOrder(
               res.data.orderCode,
               res.data.orderId,
               res.data.paymentMethodCode,
               res.data.paymentInfo,
            );
         }
      } catch (err: any) {
         if (tempAddressId)
            apiRequest.delete(`/addresses/${tempAddressId}`).catch(() => {});
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
      const m = paymentMethodCode.toUpperCase();
      if (m.includes("COD") || m.includes("BANK_TRANSFER")) {
         router.push(`/order/${orderCode}/payment`);
         return;
      }
      if (m.includes("MOMO") || m.includes("VNPAY") || m.includes("ZALOPAY")) {
         if (paymentInfo?.paymentUrl)
            window.location.href = paymentInfo.paymentUrl;
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
   const mobileFinalTotal = Math.max(0, finalTotal - voucherValue);
   const shippingFee = previewData?.shippingFee;
   const taxAmount = previewData?.taxAmount;

   // Props cho ShippingSection
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
         const defaultAddr =
            savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
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
               <p className="text-neutral-darker">
                  Đang tải thông tin đơn hàng...
               </p>
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
                     <ShippingSection {...shippingProps} instanceId="desktop" />

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
         <div
            className="md:hidden"
            style={{ paddingBottom: "clamp(7rem, 15vw, 12rem)" }}
         >
            <div className="bg-neutral-light border-b border-neutral px-4 py-3">
               <Link
                  href="/cart"
                  className="inline-flex items-center gap-1 text-sm cursor-pointer text-primary"
               >
                  <span>←</span> Quay lại giỏ hàng
               </Link>
            </div>

            <div className="px-3 pt-3 space-y-3">
               <CartItems items={cartItems} />
               <ShippingSection {...shippingProps} instanceId="mobile" />
               <div className="bg-neutral-light rounded-lg p-4 border border-neutral">
                  <label className="block text-sm font-medium mb-2 text-primary">
                     Ghi chú
                  </label>
                  <textarea
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     maxLength={1000}
                     rows={3}
                     className="w-full px-3 py-2 border-2 border-neutral-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none bg-neutral-light text-primary"
                     placeholder="Ví dụ: Hãy gọi tôi khi chuẩn bị hàng xong"
                  />
                  <div className="text-xs text-neutral-dark mt-1 text-right">
                     {notes.length}/1000
                  </div>
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

            {/* Floating bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 z-30 shadow-2xl">
               {showSidebar && (
                  <div
                     className="fixed inset-0 bg-black/40 z-[-1]"
                     onClick={() => setShowSidebar(false)}
                  />
               )}

               <div
                  className={`bg-neutral-light border-t border-neutral overflow-hidden transition-all duration-300 ease-in-out ${showSidebar ? "max-h-[70vh]" : "max-h-0"}`}
               >
                  <div className="overflow-y-auto max-h-[70vh]">
                     <div className="flex items-center justify-between px-4 py-3 border-b border-neutral">
                        <span className="text-sm font-semibold text-primary">
                           Thông tin đơn hàng
                        </span>
                        <button
                           onClick={() => setShowSidebar(false)}
                           className="p-1.5 hover:bg-neutral rounded-lg transition-colors"
                        >
                           <X className="h-5 w-5 text-neutral-darker" />
                        </button>
                     </div>

                     <div className="border-b border-neutral">
                        <button
                           type="button"
                           onClick={() => {
                              setShowSidebar(false);
                              setShowVoucherModal(true);
                           }}
                           className="flex w-full items-center justify-between p-3 transition hover:bg-accent/5 group"
                        >
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                 <span className="text-lg">🏷️</span>
                              </div>
                              <div className="flex flex-col items-start min-w-0">
                                 <span className="text-sm font-medium text-primary">
                                    Chọn hoặc nhập ưu đãi
                                 </span>
                                 {voucherCode ? (
                                    <span className="text-xs text-accent-dark font-semibold truncate w-full">
                                       {voucherCode} • -
                                       {formatVND(voucherValue)}
                                    </span>
                                 ) : (
                                    <span className="text-xs text-neutral-dark">
                                       Chưa áp dụng
                                    </span>
                                 )}
                              </div>
                           </div>
                           <ChevronRight className="h-5 w-5 text-neutral-dark group-hover:text-accent transition-colors shrink-0" />
                        </button>
                     </div>

                     <div className="px-4 py-4 space-y-2.5">
                        <h3 className="text-sm font-semibold text-primary mb-3">
                           Chi tiết thanh toán
                        </h3>
                        <div className="space-y-2.5 text-sm">
                           <div className="flex justify-between">
                              <span className="text-neutral-darker">
                                 Tổng tiền
                              </span>
                              <span className="font-medium text-primary">
                                 {formatVND(displaySubtotal)}
                              </span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-neutral-darker">
                                 Tổng khuyến mãi
                              </span>
                              <span className="font-medium text-primary">
                                 -{formatVND(displayDiscount + voucherValue)}
                              </span>
                           </div>
                           <div className="flex justify-between pl-4">
                              <span className="text-neutral-dark text-xs">
                                 Giảm giá sản phẩm
                              </span>
                              <span className="text-primary text-sm">
                                 -{formatVND(displayDiscount)}
                              </span>
                           </div>
                           <div className="flex justify-between pl-4">
                              <span className="text-neutral-dark text-xs">
                                 Voucher
                              </span>
                              <span className="text-primary text-sm font-medium">
                                 {voucherValue > 0
                                    ? `-${formatVND(voucherValue)}`
                                    : "0₫"}
                              </span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-neutral-darker">
                                 Phí vận chuyển
                              </span>
                              <span className="font-medium text-accent-dark">
                                 {shippingFee != null
                                    ? formatVND(shippingFee)
                                    : "Miễn phí"}
                              </span>
                           </div>
                           <div className="border-t border-neutral pt-2.5 mt-2.5">
                              <div className="flex justify-between items-center">
                                 <span className="font-semibold text-primary text-sm">
                                    Cần thanh toán
                                 </span>
                                 <span className="text-xl font-bold text-promotion">
                                    {formatVND(mobileFinalTotal)}
                                 </span>
                              </div>
                           </div>
                           <div className="flex items-center gap-1 pt-1 pb-1">
                              <span className="text-xs text-neutral-darker">
                                 Điểm thưởng
                              </span>
                              <span className="text-sm">🪙</span>
                              <span className="text-sm font-medium text-accent-dark">
                                 +{rewardPoints.toLocaleString()}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-neutral-light border-t border-neutral flex items-center gap-2 px-3 py-2.5">
                  <label className="flex items-start gap-2 cursor-pointer pt-2">
                     <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        style={{ accentColor: "rgb(var(--accent-active))" }}
                        className="w-4 h-4 cursor-pointer rounded mt-0.5 shrink-0"
                     />
                     <span className="text-xs text-neutral-darker leading-relaxed">
                        Tôi đồng ý với{" "}
                        <Link href="/terms" className="text-accent underline">
                           điều khoản đặt hàng
                        </Link>{" "}
                        của cửa hàng
                     </span>
                  </label>
                  <button
                     onClick={() => setShowSidebar((prev) => !prev)}
                     className="flex-1 flex items-center justify-end gap-2 min-w-0 py-1 rounded-lg hover:bg-neutral transition"
                  >
                     <div className="flex flex-col items-end min-w-0">
                        <span className="text-base font-bold text-promotion whitespace-nowrap">
                           {formatVND(mobileFinalTotal)}
                        </span>
                        {displayDiscount + voucherValue > 0 && (
                           <span className="text-xs text-neutral-darker whitespace-nowrap">
                              Tiết kiệm{" "}
                              {formatVND(displayDiscount + voucherValue)}
                           </span>
                        )}
                     </div>
                     {showSidebar ? (
                        <ChevronDown className="h-4 w-4 text-neutral-darker shrink-0" />
                     ) : (
                        <ChevronUp className="h-4 w-4 text-neutral-darker shrink-0" />
                     )}
                  </button>
                  <button
                     onClick={handleCheckoutClick}
                     disabled={isSubmitting}
                     className={`shrink-0 rounded-xl px-5 py-3 text-sm font-bold transition shadow-lg ${isSubmitting ? "cursor-not-allowed bg-neutral text-neutral-dark opacity-50" : "bg-accent text-white hover:bg-accent-hover active:scale-[0.98]"}`}
                  >
                     {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
                  </button>
               </div>
            </div>
         </div>

         {/* ── Sidebars & Modals ── */}
         <AddressSidebar
            isOpen={showAddressSidebar}
            onClose={() => setShowAddressSidebar(false)}
            selectedAddressId={mobileSelectedAddress?.id}
            onSelect={setMobileSelectedAddress}
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

         <Popzy
            isOpen={showConfirmModal}
            enableScrollLock={false}
            onClose={() => setShowConfirmModal(false)}
            closeMethods={["button", "overlay", "escape"]}
            cssClass="!w-full !max-w-sm !mx-4"
            content={
               <div>
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
            onClose={() =>
               setPaymentResultModal((p) => ({ ...p, isOpen: false }))
            }
            onDone={() => router.push("/profile/orders")}
         />
      </div>
   );
}
