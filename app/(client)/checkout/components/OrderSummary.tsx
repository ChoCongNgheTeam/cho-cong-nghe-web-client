"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useToasty } from "@/components/Toast";

interface OrderSummaryProps {
   subtotal: number;
   discounts: number;
   shipping: number;
   total: number;
   points: number;
   onCheckout: () => void;
   onOpenPromotion?: () => void;
}

export default function OrderSummary({
   subtotal,
   discounts,
   shipping,
   total,
   points,
   onCheckout,
   onOpenPromotion,
}: OrderSummaryProps) {
   const { success, error, info } = useToasty();
   const [usePoints, setUsePoints] = useState(false);
   const [agreedToTerms, setAgreedToTerms] = useState(false);
   const [showDetails, setShowDetails] = useState(true);

   const formatPrice = (price: number) => {
      return new Intl.NumberFormat("vi-VN").format(price) + "đ";
   };

   const handleUsePointsChange = (checked: boolean) => {
      setUsePoints(checked);
      checked
         ? success("Đã áp dụng điểm thưởng")
         : info("Đã hủy sử dụng điểm thưởng");
   };

   const handleCheckoutClick = () => {
      if (!agreedToTerms) {
         error("Vui lòng đồng ý với điều khoản dịch vụ");
         return;
      }
      onCheckout();
   };

   return (
      <div className="bg-neutral-light rounded-lg shadow-sm sticky top-4">
         <div className="p-4 sm:p-5 space-y-4">
            {/* CHỌN ƯU ĐÃI */}
            <div
               onClick={onOpenPromotion}
               className="flex items-center gap-3 p-3 border-2 border-accent rounded-lg cursor-pointer transition-colors hover:border-accent-hover"
            >
               <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-accent">
                  <span className="font-bold text-primary-darker">%</span>
               </div>
               <span className="text-sm font-medium flex-1 ">
                  Chọn hoặc nhập ưu đãi
               </span>
               <ChevronRight size={20} className="text-neutral-dark shrink-0" />
            </div>

            {/* ĐĂNG NHẬP ĐỂ SỬ DỤNG ĐIỂM THƯỞNG */}
            <label className="flex items-center justify-between cursor-pointer p-3 border border-neutral rounded-lg hover:bg-neutral transition-colors">
               <div className="flex items-center gap-2">
                  <span className="text-xl">🪙</span>
                  <span className="text-sm ">
                     Đăng nhập để sử dụng điểm thưởng
                  </span>
               </div>
               <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => handleUsePointsChange(e.target.checked)}
                  className="w-5 h-5 cursor-pointer accent-accent"
               />
            </label>

            {/* THÔNG TIN ĐƠN HÀNG */}
            <div className="pt-4 border-t border-neutral">
               <h3 className="font-semibold mb-3 text-sm  text-primary-darker">
                  Thông tin đơn hàng
               </h3>

               {showDetails && (
                  <div className="space-y-2 text-sm mb-3">
                     <Row label="Tổng tiền" value={formatPrice(subtotal)} />
                     <Row
                        label="Tổng khuyến mãi"
                        value={`-${formatPrice(discounts)}`}
                        color="text-promotion"
                     />
                     <Row
                        label="Giảm giá sản phẩm"
                        value={formatPrice(discounts)}
                        muted
                     />
                     <Row label="Voucher" value="0đ" muted />
                     <Row
                        label="Phí vận chuyển"
                        value={
                           shipping === 0 ? "Miễn phí" : formatPrice(shipping)
                        }
                        success={shipping === 0}
                     />
                  </div>
               )}

               {/* TỔNG THANH TOÁN */}
               <div className="flex justify-between items-center pt-3 mt-3 border-t border-neutral">
                  <span className="font-semibold text-sm  text-primary-darker">
                     Cần thanh toán
                  </span>
                  <span className="text-xl font-bold text-promotion ">
                     {formatPrice(total)}
                  </span>
               </div>

               {/* ĐIỂM THƯỞNG */}
               <div className="flex justify-between items-center mt-2 text-xs">
                  <span className=" text-primary">Điểm thưởng</span>
                  <span className="flex items-center gap-1">
                     <span>⭐</span>
                     <span className="font-medium  text-primary-darker">
                        +{points.toLocaleString()}
                     </span>
                  </span>
               </div>
            </div>

            {/* RÚT GỌN / XEM CHI TIẾT */}
            <button
               onClick={() => setShowDetails(!showDetails)}
               className="w-full text-sm flex items-center justify-center gap-1 py-2 hover:bg-neutral rounded transition-colors cursor-pointer text-primary "
            >
               {showDetails ? "Rút gọn ▲" : "Xem chi tiết ▼"}
            </button>

            {/* NÚT ĐẶT HÀNG */}
            <button
               onClick={handleCheckoutClick}
               disabled={!agreedToTerms}
               className={`w-full py-3 rounded-lg text-base font-semibold shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer  ${
                  agreedToTerms
                     ? "bg-accent text-primary-darker hover:bg-accent-hover"
                     : "bg-neutral text-neutral-darker"
               }`}
            >
               Đặt hàng
            </button>

            {/* ĐIỀU KHOẢN */}
            <label className="flex gap-2 text-xs cursor-pointer">
               <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 cursor-pointer shrink-0 accent-accent"
               />
               <p className="text-neutral-darker ">
                  Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{" "}
                  <a
                     className="underline font-medium hover:text-promotion cursor-pointer"
                     href="#"
                  >
                     Điều khoản dịch vụ
                  </a>{" "}
                  và{" "}
                  <a
                     className="underline font-medium hover:text-promotion cursor-pointer"
                     href="#"
                  >
                     Chính sách xử lý dữ liệu cá nhân
                  </a>{" "}
                  của ChoCongNghe.
               </p>
            </label>

            {/* TÙY CHỌN */}
            <button className="w-full py-2.5 text-sm rounded-lg bg-neutral hover:bg-neutral-dark transition-colors font-medium cursor-pointer text-primary">
               Tùy chọn ▼
            </button>
         </div>
      </div>
   );
}

/* ===================== HELPER ===================== */
function Row({
   label,
   value,
   muted,
   success,
   color,
}: {
   label: string;
   value: string;
   muted?: boolean;
   success?: boolean;
   color?: string;
}) {
   return (
      <div className="flex justify-between ">
         <span
            className={
               muted ? "text-neutral-dark text-xs" : "text-xs text-primary"
            }
         >
            {label}
         </span>
         <span
            className={`font-medium text-xs ${
               success ? "text-green-600" : color || "text-primary-darker"
            }`}
         >
            {value}
         </span>
      </div>
   );
}
