"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PaymentMethod {
   id: string;
   name: string;
   icon: string;
   description?: string;
   badge?: string;
}

const paymentMethods: PaymentMethod[] = [
   {
      id: "cod",
      name: "Thanh toán khi nhận hàng",
      icon: "💵",
   },
   {
      id: "bank_transfer",
      name: "Chuyển khoản ngân hàng (QR Code)",
      icon: "🏦",
   },
   {
      id: "atm",
      name: "Thẻ ATM nội địa (qua VNPAY)",
      icon: "💳",
   },
   {
      id: "credit_card",
      name: "Thẻ Quốc tế Visa, Master, JCB, AMEX, Apple Pay, Google pay, Samsung Pay",
      icon: "💳",
      badge: "1 ưu đãi",
   },
   {
      id: "installment_mb",
      name: "Ngân hàng thương mại cổ phần Quân đội",
      icon: "🏦",
      badge: "1 ưu đãi",
   },
   // Hidden by default
   {
      id: "other_banks",
      name: "Các ngân hàng khác",
      icon: "🏦",
   },
   {
      id: "zalopay",
      name: "Ví ZaloPay",
      icon: "💰",
   },
   {
      id: "momo",
      name: "Ví điện tử MoMo",
      icon: "🎀",
   },
   {
      id: "kredivo",
      name: "Trả góp/trả tháng qua Kredivo",
      icon: "💳",
   },
   {
      id: "home_pay",
      name: "Home PayLater",
      icon: "🏠",
      badge: "3 ưu đãi",
   },
   {
      id: "credit_installment",
      name: "Trả góp qua thẻ tín dụng",
      icon: "💳",
      badge: "1 ưu đãi",
   },
   {
      id: "finance_company",
      name: "Trả góp qua công ty tài chính",
      icon: "🏢",
   },
];

interface PaymentMethodsProps {
   selectedMethod?: string;
   onSelect?: (methodId: string) => void;
}

export default function PaymentMethods({
   selectedMethod: controlledMethod,
   onSelect,
}: PaymentMethodsProps) {
   const [internalSelected, setInternalSelected] = useState("cod");
   const [showAll, setShowAll] = useState(false);

   const selectedMethod = controlledMethod || internalSelected;
   const visibleMethods = showAll ? paymentMethods : paymentMethods.slice(0, 5);

   const handleSelect = (methodId: string) => {
      if (onSelect) {
         onSelect(methodId);
      } else {
         setInternalSelected(methodId);
      }
   };

   return (
      <div className="bg-neutral-light rounded-lg shadow-sm">
         <div className="p-4 sm:p-5 border-b border-neutral">
            <h2 className="text-sm sm:text-base font-semibold text-primary-darker">
               Phương thức thanh toán
            </h2>
         </div>

         <div className="p-4 sm:p-5">
            <div className="space-y-0">
               {visibleMethods.map((method) => (
                  <label
                     key={method.id}
                     className="flex items-center gap-3 py-3 cursor-pointer transition-colors -mx-2 px-2 rounded hover:bg-neutral"
                  >
                     {/* Custom Radio Button - Yellow/Black FPT Style */}
                     <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                        <input
                           type="radio"
                           name="payment"
                           checked={selectedMethod === method.id}
                           onChange={() => handleSelect(method.id)}
                           className="sr-only peer"
                        />
                        <div
                           className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedMethod === method.id
                                 ? "border-accent bg-accent"
                                 : "border-neutral-dark bg-transparent"
                           }`}
                        >
                           {selectedMethod === method.id && (
                              <div className="w-2 h-2 rounded-full bg-primary-darker"></div>
                           )}
                        </div>
                     </div>

                     <span className="text-lg shrink-0 mt-0.5">
                        {method.icon}
                     </span>

                     <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start gap-2">
                           <span className="text-sm leading-tight text-primary-darker">
                              {method.name}
                           </span>
                           {method.badge && (
                              <span className="text-xs px-2 py-0.5 rounded whitespace-nowrap shrink-0 font-medium bg-accent text-primary-darker">
                                 {method.badge}
                              </span>
                           )}
                        </div>
                     </div>
                  </label>
               ))}
            </div>

            {/* Show More/Less Button */}
            {paymentMethods.length > 5 && (
               <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full mt-2 py-2 flex items-center justify-center gap-1 text-sm font-medium transition-colors rounded hover:bg-neutral text-primary cursor-pointer"
               >
                  <span>{showAll ? "Rút gọn" : "Xem thêm"}</span>
                  {showAll ? (
                     <ChevronUp className="w-4 h-4" />
                  ) : (
                     <ChevronDown className="w-4 h-4" />
                  )}
               </button>
            )}
         </div>
      </div>
   );
}
