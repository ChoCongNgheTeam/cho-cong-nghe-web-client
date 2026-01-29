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
import CartSidebar from "@/(client)/cart/components/cartsidebar";
import CartItems from "./components/CartItems";
import OrderSummary from "@/components/odersummary/OrderSummary";
import PaymentMethods from "./components/PaymentMethods";

interface UserInfo {
   id: number;
   full_name: string;
   phone: string;
   email: string;
}

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

const mockAPI = {
   getUserInfo: async (userId: number): Promise<UserInfo> => {
      return {
         id: userId,
         full_name: "a Thắng",
         phone: "0966399967",
         email: "thang@example.com",
      };
   },
   getUserAddresses: async (userId: number): Promise<Address[]> => {
      return [
         {
            id: 1,
            contact_name: "a Thắng",
            phone: "0966399967",
            detail_address:
               "cà phê liinh, Phường Bến Thành, Quận 1, Hồ Chí Minh",
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
         {
            id: 3,
            contact_name: "a Thắng",
            phone: "0966399967",
            detail_address:
               "331/38/2D Phan Huy Ích, Phường An Hội Tây, Quận Gò Vấp, Hồ Chí Minh",
            province_id: 79,
            district_id: 764,
            ward_id: 26812,
            type: "office",
            is_default: false,
         },
      ];
   },
};

export default function CheckoutPage() {
   const router = useRouter();
   const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
   const [addresses, setAddresses] = useState<Address[]>([]);
   const [cartItems, setCartItems] = useState<CartItem[]>([]);
   const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
   const [deliveryDate, setDeliveryDate] = useState("Thứ Hai (12/01)");
   const [deliveryTime, setDeliveryTime] = useState("16:00 -> 17:00");

   const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
   const [promotionValue, setPromotionValue] = useState(0);
   const [appliedVoucherCode, setAppliedVoucherCode] = useState("");
   const [appliedVoucherValue, setAppliedVoucherValue] = useState(0);
   const [subtotal, setSubtotal] = useState(0);
   const [totalDiscount, setTotalDiscount] = useState(0);
   const [finalTotal, setFinalTotal] = useState(0);
   const [rewardPoints, setRewardPoints] = useState(0);

   const [showUserSidebar, setShowUserSidebar] = useState(false);
   const [showAddressSidebar, setShowAddressSidebar] = useState(false);
   const [showTimeSidebar, setShowTimeSidebar] = useState(false);
   const [showVoucherModal, setShowVoucherModal] = useState(false);
   const [showSidebar, setShowSidebar] = useState(false); // For mobile cart sidebar
   const [agreedToTerms, setAgreedToTerms] = useState(false);
   const [sendInvoice, setSendInvoice] = useState(false);
   const [notes, setNotes] = useState("");
   const [usePoints, setUsePoints] = useState(false);

   const formatPrice = (price: number) =>
      new Intl.NumberFormat("vi-VN").format(price) + "₫";

   const finalTotalWithVoucher = Math.max(0, finalTotal - appliedVoucherValue);

   useEffect(() => {
      const loadData = async () => {
         const loadingToast = toast.loading("Đang tải thông tin...");

         try {
            const savedCheckoutData = localStorage.getItem("checkoutData");

            if (!savedCheckoutData) {
               toast.error("Không có thông tin đơn hàng", { id: loadingToast });
               router.push("/cart");
               return;
            }

            const checkoutData: CheckoutData = JSON.parse(savedCheckoutData);

            if (!checkoutData.selectedItems || checkoutData.selectedItems.length === 0) {
               toast.error("Vui lòng chọn sản phẩm từ giỏ hàng", { id: loadingToast });
               router.push("/cart");
               return;
            }

            const formattedItems: CartItem[] = checkoutData.selectedItems.map(
               (item: SelectedItem) => ({
                  id: item.id,
                  name: item.product_name,
                  variant: item.variant_name,
                  quantity: item.quantity,
                  unit_price: item.price,
                  discount_value: item.original_price - item.price,
                  image: item.image_url,
               }),
            );

            const [user, addressList] = await Promise.all([
               mockAPI.getUserInfo(1),
               mockAPI.getUserAddresses(1),
            ]);

            setCartItems(formattedItems);
            setSelectedPromotions(checkoutData.selectedPromotions);
            setPromotionValue(checkoutData.promotionValue);
            setAppliedVoucherCode(checkoutData.appliedVoucherCode);
            setAppliedVoucherValue(checkoutData.appliedVoucherValue);
            setSubtotal(checkoutData.subtotal);
            setTotalDiscount(checkoutData.totalDiscount);
            setFinalTotal(checkoutData.finalTotal);
            setRewardPoints(checkoutData.rewardPoints);
            setUsePoints(checkoutData.usePoints || false);

            setUserInfo(user);
            setAddresses(addressList);
            setSelectedAddress(
               addressList.find((a) => a.is_default) || addressList[0],
            );

            toast.success("Tải thông tin thành công", { id: loadingToast });
         } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Không thể tải thông tin. Vui lòng thử lại!", { id: loadingToast });
         }
      };

      loadData();
   }, [router]);

   const handleUserUpdate = (data: { name: string; phone: string; email: string }) => {
      if (userInfo) {
         setUserInfo({
            ...userInfo,
            full_name: data.name,
            phone: data.phone,
            email: data.email,
         });
         toast.success("Cập nhật thông tin người đặt thành công");
      }
   };

   const handleTimeSelect = (date: string, time: string) => {
      setDeliveryDate(date);
      setDeliveryTime(time);
   };

   const handleApplyVoucher = (code: string, value: number) => {
      setAppliedVoucherCode(code);
      setAppliedVoucherValue(value);
   };

   const handleSelectPromotions = (promotionIds: string[], totalValue: number) => {
      setSelectedPromotions(promotionIds);
      setPromotionValue(totalValue);
   };

   const handlePlaceOrder = async () => {
      if (!userInfo || !selectedAddress) {
         toast.error("Vui lòng kiểm tra thông tin người đặt và địa chỉ giao hàng");
         return;
      }

      const loadingToast = toast.loading("Đang xử lý đơn hàng...");

      try {
         const orderData = {
            user_id: userInfo.id,
            address_id: selectedAddress.id,
            contact_name: userInfo.full_name,
            phone: userInfo.phone,
            payment_method_id: 1,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime,
            notes: notes,
            request_invoice: sendInvoice,
            use_points: false,
            voucher_code: appliedVoucherCode,
            items: cartItems.map((item) => ({
               product_variant_id: item.id,
               quantity: item.quantity,
            })),
         };

         console.log("Order data:", orderData);

         setTimeout(() => {
            localStorage.removeItem("checkoutData");

            toast.success("Đặt hàng thành công! Mã đơn: ORD20260112001", {
               id: loadingToast,
               duration: 4000,
            });

            setTimeout(() => {
               router.push("/");
            }, 1500);
         }, 1500);
      } catch (error) {
         console.error("Checkout error:", error);
         toast.error("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!", { id: loadingToast });
      }
   };

   if (cartItems.length === 0) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-neutral-light">
            <div className="text-center">
               <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-neutral border-t-accent mb-4"></div>
               <p className="text-neutral-darker">Đang tải thông tin đơn hàng...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-neutral-light">
         {/* Desktop/Tablet Layout */}
         <div className="hidden md:block">
            <div className="container py-4 sm:py-6">
               <Link
                  href="/cart"
                  className="inline-flex items-center gap-1 mb-4 sm:mb-6 text-sm hover:underline cursor-pointer transition-colors text-primary"
               >
                  <span>←</span> Quay lại giỏ hàng
               </Link>

               <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                     <CartItems items={cartItems} />

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
                        {userInfo && (
                           <div className="space-y-1">
                              <p className="font-medium text-sm text-primary">
                                 {userInfo.full_name}
                              </p>
                              <p className="text-neutral-darker text-sm">
                                 {userInfo.phone}
                              </p>
                           </div>
                        )}
                     </div>

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
                              <p className="font-semibold mb-1 text-sm text-primary-darker">
                                 {selectedAddress.contact_name} • {selectedAddress.phone}
                              </p>
                              <p className="text-primary-dark text-sm font-medium">
                                 {selectedAddress.detail_address.split(",")[0]}
                              </p>
                              <p className="text-neutral-darker text-sm">
                                 {selectedAddress.detail_address.split(",").slice(1).join(",")}
                              </p>
                           </div>
                        )}
                     </div>

                     <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
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
                           Vào lúc <span className="font-semibold">{deliveryTime}</span>, ngày{" "}
                           <span className="font-semibold">{deliveryDate}</span>
                        </p>
                     </div>

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

            <div className="px-3 mt-3">
               <div className="bg-neutral-light rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                     <h2 className="text-sm font-semibold text-primary">
                        Người đặt hàng
                     </h2>
                  </div>
                  {userInfo && (
                     <div className="space-y-2">
                        <input
                           type="text"
                           value={userInfo.full_name}
                           readOnly
                           onClick={() => setShowUserSidebar(true)}
                           className="w-full px-3 py-2 border border-neutral-dark rounded text-sm cursor-pointer bg-neutral-light text-primary"
                        />
                        <input
                           type="tel"
                           value={userInfo.phone}
                           readOnly
                           onClick={() => setShowUserSidebar(true)}
                           className="w-full px-3 py-2 border border-neutral-dark rounded text-sm cursor-pointer bg-neutral-light text-primary"
                        />
                        <input
                           type="email"
                           value={userInfo.email}
                           readOnly
                           onClick={() => setShowUserSidebar(true)}
                           placeholder="Email (Không bắt buộc)"
                           className="w-full px-3 py-2 border border-neutral-dark rounded text-sm cursor-pointer bg-neutral-light text-primary placeholder:text-neutral-dark"
                        />
                     </div>
                  )}
               </div>
            </div>

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
                        <p className="font-semibold mb-1 text-sm text-primary-darker">
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

            {/* Floating Button - GIỐNG CART */}
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

            <div className="h-24"></div>
         </div>

         {/* Sidebars */}
         {userInfo && (
            <UserInfoSidebar
               isOpen={showUserSidebar}
               onClose={() => setShowUserSidebar(false)}
               userInfo={userInfo}
               onUpdate={handleUserUpdate}
            />
         )}

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

         {/* Dùng chung CartSidebar - GIỐNG CART */}
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
            selectedPromotions={selectedPromotions}
            onSelectPromotions={handleSelectPromotions}
            appliedVoucherCode={appliedVoucherCode}
            appliedVoucherValue={appliedVoucherValue}
            onApplyVoucher={handleApplyVoucher}
            cartTotal={subtotal}
         />
      </div>
   );
}