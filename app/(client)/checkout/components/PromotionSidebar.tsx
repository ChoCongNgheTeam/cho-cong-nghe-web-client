"use client";

import React, { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { useToasty } from "@/components/Toast";

interface Voucher {
   id: string;
   code: string;
   title: string;
   description: string;
   discount: string;
   minOrder?: number;
   expiry: string;
   available: boolean;
}

interface PromotionSidebarProps {
   isOpen: boolean;
   onClose: () => void;
   onApply: (code: string) => void;
}

const availableVouchers: Voucher[] = [
   {
      id: "1",
      code: "GIAM50K",
      title: "Giảm 50.000đ",
      description: "Cho đơn hàng từ 500.000đ",
      discount: "50.000đ",
      minOrder: 500000,
      expiry: "31/01/2026",
      available: true,
   },
   {
      id: "2",
      code: "FREESHIP",
      title: "Miễn phí vận chuyển",
      description: "Cho đơn hàng từ 300.000đ",
      discount: "Miễn phí ship",
      minOrder: 300000,
      expiry: "31/01/2026",
      available: true,
   },
   {
      id: "3",
      code: "GIAM10P",
      title: "Giảm 10%",
      description: "Tối đa 100.000đ, cho đơn từ 1.000.000đ",
      discount: "10%",
      minOrder: 1000000,
      expiry: "28/01/2026",
      available: true,
   },
   {
      id: "4",
      code: "NEWUSER",
      title: "Ưu đãi khách hàng mới",
      description: "Giảm 100.000đ cho đơn đầu tiên",
      discount: "100.000đ",
      minOrder: 1000000,
      expiry: "31/01/2026",
      available: false,
   },
];

export default function PromotionSidebar({
   isOpen,
   onClose,
   onApply,
}: PromotionSidebarProps) {
   const { success, error } = useToasty();
   const [voucherCode, setVoucherCode] = useState("");
   const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);

   const handleApplyCode = () => {
      if (!voucherCode.trim()) {
         error("Vui lòng nhập mã ưu đãi");
         return;
      }

      const voucher = availableVouchers.find(
         (v) => v.code === voucherCode.toUpperCase(),
      );

      if (!voucher) {
         error("Mã ưu đãi không hợp lệ");
         return;
      }

      if (!voucher.available) {
         error("Bạn không đủ điều kiện sử dụng mã này");
         return;
      }

      onApply(voucherCode.toUpperCase());
      success(`Đã áp dụng mã ${voucherCode.toUpperCase()}`);
      onClose();
   };

   const handleSelectVoucher = (voucher: Voucher) => {
      if (!voucher.available) {
         error("Bạn không đủ điều kiện sử dụng mã này");
         return;
      }

      setSelectedVoucher(voucher.id);
      setVoucherCode(voucher.code);
   };

   const handleConfirm = () => {
      if (!selectedVoucher) {
         error("Vui lòng chọn mã ưu đãi");
         return;
      }

      const voucher = availableVouchers.find((v) => v.id === selectedVoucher);
      if (voucher) {
         onApply(voucher.code);
         success(`Đã áp dụng mã ${voucher.code}`);
         onClose();
      }
   };

   if (!isOpen) return null;

   return (
      <>
         {/* Backdrop - Blur effect */}
         <div
            className="fixed inset-0 z-40 transition-all cursor-pointer backdrop-blur-sm bg-white/70"
            onClick={onClose}
         />

         {/* Sidebar */}
         <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[520px] bg-neutral-light shadow-2xl z-50 overflow-hidden">
            <div className="flex flex-col h-full">
               {/* Header */}
               <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral shrink-0">
                  <h2 className="text-base sm:text-lg font-semibold  text-primary">
                     Chọn hoặc nhập ưu đãi
                  </h2>
                  <button
                     onClick={onClose}
                     className="text-neutral-dark hover:text-neutral-darker text-2xl w-8 h-8 flex items-center justify-center cursor-pointer transition-colors hover:bg-neutral rounded-full"
                  >
                     <X size={24} />
                  </button>
               </div>

               {/* Voucher Code Input */}
               <div className="p-4 sm:p-5 border-b border-neutral shrink-0">
                  <div className="flex gap-2">
                     <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) =>
                           setVoucherCode(e.target.value.toUpperCase())
                        }
                        placeholder="Nhập mã ưu đãi"
                        className="flex-1 px-3 py-2.5 text-sm border-2 border-neutral-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent uppercase  text-primary"
                     />
                     <button
                        onClick={handleApplyCode}
                        className="px-6 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-all hover:shadow-md bg-accent hover:bg-accent-hover text-primary "
                     >
                        Áp dụng
                     </button>
                  </div>
               </div>

               {/* Available Vouchers List */}
               <div className="flex-1 overflow-y-auto">
                  <div className="p-4 sm:p-5">
                     <h3 className="text-sm font-semibold mb-3  text-primary">
                        Ưu đãi có sẵn
                     </h3>

                     <div className="space-y-3">
                        {availableVouchers.map((voucher) => (
                           <div
                              key={voucher.id}
                              onClick={() => handleSelectVoucher(voucher)}
                              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                 selectedVoucher === voucher.id
                                    ? "border-accent bg-accent-light shadow-sm"
                                    : voucher.available
                                      ? "border-neutral-dark hover:border-neutral-darker hover:shadow-sm"
                                      : "border-neutral bg-neutral-light opacity-60 cursor-not-allowed"
                              }`}
                           >
                              <div className="flex items-start gap-3">
                                 {/* Voucher Icon */}
                                 <div
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                                       voucher.available
                                          ? "bg-accent"
                                          : "bg-neutral"
                                    }`}
                                 >
                                    <span className="font-bold text-xl text-primary">
                                       %
                                    </span>
                                 </div>

                                 {/* Voucher Info */}
                                 <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm mb-1  text-primary">
                                       {voucher.title}
                                    </h4>
                                    <p className="text-xs text-neutral-darker mb-2 ">
                                       {voucher.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                       <span className="text-xs px-2 py-1 rounded bg-accent text-primary ">
                                          {voucher.code}
                                       </span>
                                       <span className="text-xs text-neutral-dark ">
                                          HSD: {voucher.expiry}
                                       </span>
                                    </div>
                                 </div>

                                 {/* Radio/Arrow */}
                                 {voucher.available &&
                                    (selectedVoucher === voucher.id ? (
                                       <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-accent">
                                          <svg
                                             className="w-4 h-4 text-primary"
                                             fill="none"
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth="2"
                                             viewBox="0 0 24 24"
                                             stroke="currentColor"
                                          >
                                             <path d="M5 13l4 4L19 7"></path>
                                          </svg>
                                       </div>
                                    ) : (
                                       <ChevronRight
                                          size={20}
                                          className="text-neutral-dark shrink-0"
                                       />
                                    ))}
                              </div>

                              {!voucher.available && (
                                 <p className="text-xs text-neutral-dark mt-2 italic ">
                                    Không đủ điều kiện sử dụng
                                 </p>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Footer */}
               <div className="p-4 sm:p-5 border-t border-neutral shrink-0">
                  <button
                     onClick={handleConfirm}
                     disabled={!selectedVoucher}
                     className={`w-full py-3 rounded-lg font-medium text-sm cursor-pointer transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed  ${
                        selectedVoucher
                           ? "bg-accent hover:bg-accent-hover text-primary"
                           : "bg-neutral text-neutral-darker"
                     }`}
                  >
                     Xác nhận
                  </button>
               </div>
            </div>
         </div>
      </>
   );
}
