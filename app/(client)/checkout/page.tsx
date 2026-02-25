"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import UserInfoSidebar from "./components/UserInfoSidebar";
import AddressSidebar from "./components/AddressSidebar";
import TimeSlotSidebar from "./components/TimeSlotSidebar";
import VoucherPromotionModal from "@/(client)/cart/components/VoucherPromotionModal";
import CartSidebar from "@/(client)/cart/components/cartSidebar";
import CartItems from "./components/CartItems";
import OrderSummary from "@/components/oderSummary/OrderSummary";
import PaymentMethods from "./components/PaymentMethods";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
   id: number;
   contact_name: string;
   phone: string;
   detail_address: string;
   province_id: number;
   district_id: number;
   ward_id: number;
   type: string;
   is_default: boolean;
}

interface CartItem {
   id: number;
   name: string;
   variant: string;
   quantity: number;
   unit_price: number;
   discount_value: number;
   image?: string;
}

interface SelectedItem {
   id: number;
   product_name: string;
   variant_name: string;
   quantity: number;
   price: number;
   original_price: number;
   image_url?: string;
}

interface CheckoutData {
   selectedItems: SelectedItem[];
   selectedPromotions: string[];
   promotionValue: number;
   appliedVoucherCode: string;
   appliedVoucherValue: number;
   subtotal: number;
   totalDiscount: number;
   finalTotal: number;
   rewardPoints: number;
   usePoints: boolean;
}

// ─── Mock addresses (thay bằng API thật sau) ─────────────────────────────────

const mockAddresses: Address[] = [
   {
      id: 1,
      contact_name: "a Thắng",
      phone: "0966399967",
      detail_address: "cà phê liinh, Phường Bến Thành, Quận 1, Hồ Chí Minh",
      province_id: 79,
      district_id: 760,
      ward_id: 26734,
      type: "office",
      is_default: true,
   },
   {
      id: 2,
      contact_name: "Nhất Thắng",
      phone: "0966399967",
      detail_address: "182 pasteur, Phường Bến Nghé, Quận 1, Hồ Chí Minh",
      province_id: 79,
      district_id: 760,
      ward_id: 26735,
      type: "office",
      is_default: false,
   },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
   const router = useRouter();
   const { user, loading: authLoading } = useAuth();

   // ── Cart data từ localStorage ─────────────────────────────────────────────
   const [cartItems, setCartItems] = useState<CartItem[]>([]);
   const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
   const [promotionValue, setPromotionValue] = useState(0);
   const [appliedVoucherCode, setAppliedVoucherCode] = useState("");
   const [appliedVoucherValue, setAppliedVoucherValue] = useState(0);
   const [subtotal, setSubtotal] = useState(0);
   const [totalDiscount, setTotalDiscount] = useState(0);
   const [finalTotal, setFinalTotal] = useState(0);
   const [rewardPoints, setRewardPoints] = useState(0);
   const [usePoints, setUsePoints] = useState(false);

   // ── Thông tin người đặt - lấy từ AuthContext ──────────────────────────────
   const [contactName, setContactName] = useState("");
   const [contactPhone, setContactPhone] = useState("");
   const [contactEmail, setContactEmail] = useState("");

   // ── Địa chỉ ───────────────────────────────────────────────────────────────
   const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
   const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

   // ── Giao hàng ─────────────────────────────────────────────────────────────
   const [deliveryDate, setDeliveryDate] = useState("Thứ Hai (12/01)");
   const [deliveryTime, setDeliveryTime] = useState("16:00 -> 17:00");
   const [notes, setNotes] = useState("");
   const [sendInvoice, setSendInvoice] = useState(false);
   const [agreedToTerms, setAgreedToTerms] = useState(false);

   // ── UI state ──────────────────────────────────────────────────────────────
   const [showUserSidebar, setShowUserSidebar] = useState(false);
   const [showAddressSidebar, setShowAddressSidebar] = useState(false);
   const [showTimeSidebar, setShowTimeSidebar] = useState(false);
   const [showVoucherModal, setShowVoucherModal] = useState(false);
   const [showSidebar, setShowSidebar] = useState(false);
   const [isPageLoading, setIsPageLoading] = useState(true);

   const formatPrice = (price: number) =>
      new Intl.NumberFormat("vi-VN").format(price) + "₫";

   const finalTotalWithVoucher = Math.max(0, finalTotal - appliedVoucherValue);

   // ── Sync thông tin người dùng từ AuthContext ──────────────────────────────
   useEffect(() => {
      if (!authLoading && user) {
         setContactName(user.fullName);
         setContactPhone(user.phone ?? "");
         setContactEmail(user.email);
      }
   }, [authLoading, user]);

   // ── Load checkout data từ localStorage ───────────────────────────────────
   useEffect(() => {
      const savedCheckoutData = localStorage.getItem("checkoutData");

      if (!savedCheckoutData) {
         toast.error("Không có thông tin đơn hàng");
         router.push("/cart");
         return;
      }

      try {
         const checkoutData: CheckoutData = JSON.parse(savedCheckoutData);

         if (!checkoutData.selectedItems?.length) {
            toast.error("Vui lòng chọn sản phẩm từ giỏ hàng");
            router.push("/cart");
            return;
         }

         const formattedItems: CartItem[] = checkoutData.selectedItems.map(
            (item) => ({
               id: item.id,
               name: item.product_name,
               variant: item.variant_name,
               quantity: item.quantity,
               unit_price: item.price,
               discount_value: item.original_price - item.price,
               image: item.image_url,
            }),
         );

         setCartItems(formattedItems);
         setSelectedPromotions(checkoutData.selectedPromotions);
         setPromotionValue(checkoutData.promotionValue);
         setAppliedVoucherCode(checkoutData.appliedVoucherCode);
         setAppliedVoucherValue(checkoutData.appliedVoucherValue);
         setSubtotal(checkoutData.subtotal);
         setTotalDiscount(checkoutData.totalDiscount);
         setFinalTotal(checkoutData.finalTotal);
         setRewardPoints(checkoutData.rewardPoints);
         setUsePoints(checkoutData.usePoints ?? false);

         // Set địa chỉ mặc định
         const defaultAddress =
            mockAddresses.find((a) => a.is_default) ?? mockAddresses[0];
         setSelectedAddress(defaultAddress ?? null);
      } catch {
         toast.error("Dữ liệu đơn hàng không hợp lệ");
         router.push("/cart");
      } finally {
         setIsPageLoading(false);
      }
   }, [router]);

   // ── Handlers ──────────────────────────────────────────────────────────────

   const handleUserUpdate = (data: {
      name: string;
      phone: string;
      email: string;
   }) => {
      setContactName(data.name);
      setContactPhone(data.phone);
      setContactEmail(data.email);
      toast.success("Cập nhật thông tin người đặt thành công");
   };

   const handleTimeSelect = (date: string, time: string) => {
      setDeliveryDate(date);
      setDeliveryTime(time);
   };

   const handleApplyVoucher = (code: string, value: number) => {
      setAppliedVoucherCode(code);
      setAppliedVoucherValue(value);
   };

   const handleSelectPromotions = (
      promotionIds: string[],
      totalValue: number,
   ) => {
      setSelectedPromotions(promotionIds);
      setPromotionValue(totalValue);
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
      if (!agreedToTerms) {
         toast.error("Vui lòng đồng ý với điều khoản đặt hàng");
         return;
      }

      const loadingToast = toast.loading("Đang xử lý đơn hàng...");

      try {
         const orderData = {
            contact_name: contactName,
            phone: contactPhone,
            email: contactEmail,
            address_id: selectedAddress.id,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime,
            notes,
            request_invoice: sendInvoice,
            use_points: usePoints,
            voucher_code: appliedVoucherCode,
            items: cartItems.map((item) => ({
               product_variant_id: item.id,
               quantity: item.quantity,
            })),
         };

         console.log("Order data:", orderData);

         // TODO: gọi API đặt hàng thật
         await new Promise((resolve) => setTimeout(resolve, 1500));

         localStorage.removeItem("checkoutData");
         toast.success("Đặt hàng thành công! Mã đơn: ORD20260112001", {
            id: loadingToast,
            duration: 4000,
         });

         setTimeout(() => router.push("/"), 1500);
      } catch {
         toast.error("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!", {
            id: loadingToast,
         });
      }
   };

   // ── Loading state ─────────────────────────────────────────────────────────

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

   // ── UserInfo object để truyền vào sidebar ─────────────────────────────────
   const userInfoForSidebar = {
      id: user?.id ? Number(user.id) : 0,
      full_name: contactName,
      phone: contactPhone,
      email: contactEmail,
   };

   // ─── Render ───────────────────────────────────────────────────────────────

   return (
      <div className="min-h-screen bg-neutral-light">
         {/* Desktop/Tablet Layout */}
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
                  {/* LEFT COLUMN */}
                  <div className="lg:col-span-2 space-y-4">
                     <CartItems items={cartItems} />

                     {/* Người đặt hàng */}
                     <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                        <div className="flex items-center justify-between mb-3">
                           <h2 className="text-sm sm:text-base font-semibold text-primary">
                              Người đặt hàng
                           </h2>
                           <button
                              onClick={() => setShowUserSidebar(true)}
                              className="text-xs sm:text-sm hover:underline cursor-pointer transition-colors text-primary"
                           >
                              Thay đổi
                           </button>
                        </div>
                        <div className="space-y-1">
                           <p className="font-medium text-sm text-primary">
                              {contactName || "Chưa có tên"}
                           </p>
                           <p className="text-neutral-darker text-sm">
                              {contactPhone || "Chưa có số điện thoại"}
                           </p>
                           {contactEmail && (
                              <p className="text-neutral-darker text-sm">
                                 {contactEmail}
                              </p>
                           )}
                        </div>
                     </div>

                     {/* Địa chỉ nhận hàng */}
                     <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                        <div className="flex items-center justify-between mb-3">
                           <h2 className="text-sm sm:text-base font-semibold text-primary">
                              Địa chỉ nhận hàng
                           </h2>
                           <button
                              onClick={() => setShowAddressSidebar(true)}
                              className="text-xs sm:text-sm hover:underline cursor-pointer text-primary"
                           >
                              Thay đổi
                           </button>
                        </div>
                        {selectedAddress && (
                           <div>
                              <p className="font-medium mb-1 text-xs sm:text-sm text-primary">
                                 Nhận tại: Văn Phòng
                              </p>
                              <p className="font-semibold mb-1 text-sm text-primary">
                                 {selectedAddress.contact_name} •{" "}
                                 {selectedAddress.phone}
                              </p>
                              <p className="text-primary-dark text-sm font-medium">
                                 {selectedAddress.detail_address.split(",")[0]}
                              </p>
                              <p className="text-neutral-darker text-sm">
                                 {selectedAddress.detail_address
                                    .split(",")
                                    .slice(1)
                                    .join(",")}
                              </p>
                           </div>
                        )}
                     </div>

                     {/* Thời gian nhận hàng */}
                     {/* <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                        <div className="flex items-center justify-between mb-3">
                           <h2 className="text-sm sm:text-base font-semibold text-primary">
                              Thời gian nhận hàng
                           </h2>
                           <button
                              onClick={() => setShowTimeSidebar(true)}
                              className="text-xs sm:text-sm hover:underline cursor-pointer text-primary"
                           >
                              Thay đổi
                           </button>
                        </div>
                        <p className="text-primary-dark text-sm">
                           Vào lúc{" "}
                           <span className="font-semibold">{deliveryTime}</span>
                           , ngày{" "}
                           <span className="font-semibold">{deliveryDate}</span>
                        </p>
                     </div> */}

                     {/* Ghi chú */}
                     <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                        <label className="block text-sm font-medium mb-2 text-primary">
                           Ghi chú
                        </label>
                        <textarea
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                           maxLength={1000}
                           className="w-full px-3 py-2 border-2 border-neutral-dark rounded-lg text-sm
                              focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                              resize-none bg-neutral-light text-primary"
                           rows={4}
                           placeholder="Ví dụ: Hãy gọi tôi khi chuẩn bị hàng xong"
                        />
                        <div className="text-xs text-neutral-dark mt-1 text-right">
                           {notes.length}/1000
                        </div>
                     </div>

                     {/* Hóa đơn */}
                     <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={sendInvoice}
                              onChange={(e) => setSendInvoice(e.target.checked)}
                              className="w-4 h-4 cursor-pointer accent-promotion"
                           />
                           <span className="text-sm text-primary">
                              Yêu cầu hỗ trợ xuất hóa đơn điện tử
                           </span>
                        </label>
                     </div>

                     <PaymentMethods />
                  </div>

                  {/* RIGHT COLUMN - Order Summary */}
                  <div className="lg:col-span-1 border border-neutral rounded">
                     <OrderSummary
                        subtotal={subtotal}
                        totalDiscount={totalDiscount}
                        finalTotal={finalTotal}
                        rewardPoints={rewardPoints}
                        selectedItemsCount={cartItems.length}
                        appliedVoucherCode={appliedVoucherCode}
                        appliedVoucherValue={appliedVoucherValue}
                        selectedPromotions={selectedPromotions}
                        promotionValue={promotionValue}
                        onOpenVoucherModal={() => setShowVoucherModal(true)}
                        onCheckout={handlePlaceOrder}
                        buttonText="Đặt hàng"
                        showTerms={true}
                        agreedToTerms={agreedToTerms}
                        onTermsChange={setAgreedToTerms}
                        isCheckoutPage={true}
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Mobile Layout */}
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

            {/* Người đặt hàng - Mobile */}
            <div className="px-3 mt-3">
               <div className="bg-neutral-light rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                     <h2 className="text-sm font-semibold text-primary">
                        Người đặt hàng
                     </h2>
                  </div>
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

            {/* Địa chỉ - Mobile */}
            <div className="px-3 mt-3">
               <div className="bg-neutral-light rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                     <h2 className="text-sm font-semibold text-primary">
                        Địa chỉ nhận hàng
                     </h2>
                  </div>
                  {selectedAddress && (
                     <div
                        onClick={() => setShowAddressSidebar(true)}
                        className="cursor-pointer"
                     >
                        <p className="font-medium mb-1 text-xs text-primary">
                           Nhận tại: Văn Phòng
                        </p>
                        <p className="font-semibold mb-1 text-sm text-primary">
                           {selectedAddress.contact_name}
                        </p>
                        <p className="text-neutral-darker text-sm mb-2">
                           {selectedAddress.phone}
                        </p>
                        <p className="text-primary-dark text-sm">
                           {selectedAddress.detail_address}
                        </p>
                     </div>
                  )}
               </div>
            </div>

            {/* Floating Button - Mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-accent border-t-2 border-accent-dark p-3 z-30 md:hidden shadow-2xl">
               <button
                  onClick={() => setShowSidebar(true)}
                  className="w-full bg-primary-darker hover:bg-primary text-accent font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-between shadow-xl"
               >
                  <div className="flex items-center gap-3">
                     <ShoppingCart className="h-5 w-5 shrink-0" />
                     <span className="text-left">
                        Xem đơn hàng ({cartItems.length})
                     </span>
                  </div>
                  <span className="font-bold shrink-0 text-lg">
                     {formatPrice(finalTotalWithVoucher)}
                  </span>
               </button>
            </div>

            <div className="h-24" />
         </div>

         {/* ── Sidebars & Modals ── */}
         <UserInfoSidebar
            isOpen={showUserSidebar}
            onClose={() => setShowUserSidebar(false)}
            userInfo={userInfoForSidebar}
            onUpdate={handleUserUpdate}
         />

         <AddressSidebar
            isOpen={showAddressSidebar}
            onClose={() => setShowAddressSidebar(false)}
            addresses={addresses}
            selectedAddress={selectedAddress?.id}
            onSelect={setSelectedAddress}
         />

         <TimeSlotSidebar
            isOpen={showTimeSidebar}
            onClose={() => setShowTimeSidebar(false)}
            onSelect={handleTimeSelect}
            selectedSlot={deliveryTime}
         />

         <CartSidebar
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
            subtotal={subtotal}
            totalDiscount={totalDiscount}
            finalTotal={finalTotal}
            rewardPoints={rewardPoints}
            selectedItemsCount={cartItems.length}
            appliedVoucherCode={appliedVoucherCode}
            appliedVoucherValue={appliedVoucherValue}
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
            appliedVoucherCode={appliedVoucherCode}
            appliedVoucherValue={appliedVoucherValue}
            onApplyVoucher={handleApplyVoucher}
            cartTotal={subtotal}
         />
      </div>
   );
}
