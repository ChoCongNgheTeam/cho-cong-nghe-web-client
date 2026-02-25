// components/cart/VoucherPromotionModal.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Tag, Check, Copy, Calendar, Users, Loader2 } from "lucide-react";
import apiRequest from "@/lib/api";

interface VoucherTarget {
   id: string;
   targetType: "ALL" | "BRAND" | "CATEGORY" | "PRODUCT";
   targetId: string;
}

interface Voucher {
   id: string;
   code: string;
   description: string;
   discountType: "DISCOUNT_PERCENT" | "DISCOUNT_FIXED";
   discountValue: number;
   minOrderValue: number;
   maxUses?: number;
   maxUsesPerUser?: number;
   usesCount: number;
   priority?: number;
   startDate?: string;
   endDate?: string;
   isActive: boolean;
   isExpired: boolean;
   isAvailable: boolean;
   createdAt?: string;
   updatedAt?: string;
   targets?: VoucherTarget[];
}

interface VoucherListResponse {
   data: Voucher[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
   };
   message: string;
}

interface VoucherDetailResponse {
   data: Voucher;
   message: string;
}

interface VoucherPromotionModalProps {
   isOpen: boolean;
   onClose: () => void;
   appliedVoucherCode?: string;
   appliedVoucherValue?: number;
   onApplyVoucher?: (code: string, value: number, voucherId: string) => void;
   cartTotal?: number;
}

export default function VoucherPromotionModal({
   isOpen,
   onClose,
   appliedVoucherCode = "",
   appliedVoucherValue = 0,
   onApplyVoucher,
   cartTotal = 0,
}: VoucherPromotionModalProps) {
   const [voucherCode, setVoucherCode] = useState("");
   const [voucherError, setVoucherError] = useState("");
   const [voucherSuccess, setVoucherSuccess] = useState(false);
   const [vouchers, setVouchers] = useState<Voucher[]>([]);
   const [loading, setLoading] = useState(false);
   const [applying, setApplying] = useState(false);
   const [copiedCode, setCopiedCode] = useState("");

   const formatPrice = useCallback(
      (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫",
      [],
   );

   const formatDate = useCallback((dateString?: string) => {
      if (!dateString) return null;
      return new Date(dateString).toLocaleDateString("vi-VN");
   }, []);

   const calculateDiscount = useCallback(
      (voucher: Voucher): number => {
         if (voucher.discountType === "DISCOUNT_FIXED") {
            return voucher.discountValue;
         }
         return Math.floor((cartTotal * voucher.discountValue) / 100);
      },
      [cartTotal],
   );

   const canUseVoucher = useCallback(
      (voucher: Voucher): boolean => {
         return (
            voucher.isAvailable &&
            !voucher.isExpired &&
            voucher.isActive &&
            cartTotal >= voucher.minOrderValue
         );
      },
      [cartTotal],
   );

   // Fetch danh sách voucher
   useEffect(() => {
      if (!isOpen) return;
      const fetchVouchers = async () => {
         setLoading(true);
         try {
            const res = await apiRequest.get<VoucherListResponse>("/vouchers", {
               noAuth: true,
            });
            setVouchers(res.data);
         } catch {
            setVouchers([]);
         } finally {
            setLoading(false);
         }
      };
      fetchVouchers();
   }, [isOpen]);

   // Sync trạng thái voucher đang áp dụng
   useEffect(() => {
      if (!isOpen) return;
      if (appliedVoucherCode) {
         setVoucherCode(appliedVoucherCode);
         setVoucherSuccess(true);
         setVoucherError("");
      } else {
         setVoucherCode("");
         setVoucherSuccess(false);
         setVoucherError("");
      }
   }, [isOpen, appliedVoucherCode]);

   // Lock body scroll
   useEffect(() => {
      if (isOpen) {
         const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;
         document.body.style.paddingRight = `${scrollbarWidth}px`;
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.paddingRight = "0px";
         document.body.style.overflow = "unset";
      }
      return () => {
         document.body.style.paddingRight = "0px";
         document.body.style.overflow = "unset";
      };
   }, [isOpen]);

   const validateAndApply = useCallback(
      (voucher: Voucher) => {
         if (voucher.isExpired) {
            setVoucherError("Mã voucher đã hết hạn");
            setVoucherSuccess(false);
            return;
         }
         if (!voucher.isActive) {
            setVoucherError("Mã voucher không còn hiệu lực");
            setVoucherSuccess(false);
            return;
         }
         if (cartTotal < voucher.minOrderValue) {
            setVoucherError(
               `Đơn tối thiểu ${formatPrice(voucher.minOrderValue)} để dùng mã này`,
            );
            setVoucherSuccess(false);
            return;
         }
         if (!voucher.isAvailable) {
            setVoucherError("Mã voucher đã hết lượt sử dụng");
            setVoucherSuccess(false);
            return;
         }

         const discountValue = calculateDiscount(voucher);
         setVoucherCode(voucher.code);
         setVoucherError("");
         setVoucherSuccess(true);
         onApplyVoucher?.(voucher.code, discountValue, voucher.id);
      },
      [cartTotal, calculateDiscount, formatPrice, onApplyVoucher],
   );

   // Nhập tay → gọi API /vouchers/code/{code}
   const handleApplyInputCode = useCallback(async () => {
      const normalized = voucherCode.trim().toUpperCase();
      if (!normalized) {
         setVoucherError("Vui lòng nhập mã voucher");
         return;
      }

      setApplying(true);
      try {
         const res = await apiRequest.get<VoucherDetailResponse>(
            `/vouchers/code/${normalized}`,
            { noAuth: true },
         );
         validateAndApply(res.data);
      } catch {
         setVoucherError("Mã voucher không tồn tại hoặc không hợp lệ");
         setVoucherSuccess(false);
      } finally {
         setApplying(false);
      }
   }, [voucherCode, validateAndApply]);

   const handleSelectFromList = useCallback(
      (voucher: Voucher) => {
         // Nếu đang chọn voucher này → bỏ chọn
         if (appliedVoucherCode === voucher.code) {
            setVoucherCode("");
            setVoucherSuccess(false);
            onApplyVoucher?.("", 0, "");
            return;
         }
         if (!canUseVoucher(voucher)) return;
         validateAndApply(voucher);
      },
      [canUseVoucher, appliedVoucherCode, validateAndApply, onApplyVoucher],
   );

   const handleCopyCode = useCallback((code: string) => {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 2000);
   }, []);

   if (!isOpen) return null;

   return (
      <>
         {/* Backdrop */}
         <div
            className="fixed inset-0 bg-neutral-light/70 backdrop-blur-sm z-[60] transition-opacity duration-300"
            onClick={onClose}
         />

         {/* Modal */}
         <div className="fixed inset-0 z-[60] flex items-end lg:items-center lg:justify-end p-0 sm:p-4 lg:p-0 pointer-events-none">
            <div
               className="bg-neutral-light w-full sm:max-w-lg lg:h-full lg:max-w-md shadow-2xl flex flex-col sm:rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none animate-slide-up lg:animate-slide-left max-h-[90vh] lg:max-h-full pointer-events-auto"
               onClick={(e) => e.stopPropagation()}
            >
               {/* Header */}
               <div className="flex items-center justify-between p-4 border-b border-neutral shrink-0">
                  <h2 className="text-lg font-semibold text-primary">
                     Mã giảm giá
                  </h2>
                  <button
                     onClick={onClose}
                     className="p-2 hover:bg-neutral rounded-lg transition-colors cursor-pointer"
                     aria-label="Đóng"
                  >
                     <X className="h-5 w-5 text-neutral-darker" />
                  </button>
               </div>

               {/* Content */}
               <div className="flex-1 overflow-y-auto">
                  {/* Input nhập tay */}
                  <div className="p-4 border-b border-neutral">
                     <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                           <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-dark" />
                           <input
                              type="text"
                              value={voucherCode}
                              onChange={(e) => {
                                 setVoucherCode(e.target.value.toUpperCase());
                                 setVoucherError("");
                                 setVoucherSuccess(false);
                              }}
                              onKeyDown={(e) =>
                                 e.key === "Enter" && handleApplyInputCode()
                              }
                              placeholder="Nhập mã giảm giá"
                              className="w-full pl-10 pr-4 py-3 border border-neutral rounded-lg text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:border-accent"
                           />
                        </div>
                        <button
                           disabled={applying}
                           onClick={handleApplyInputCode}
                           className="px-6 py-3 bg-primary hover:bg-primary-hover text-neutral-light font-semibold rounded-lg transition-colors text-sm whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                           {applying ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                              "Áp dụng"
                           )}
                        </button>
                     </div>

                     {voucherError && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                           <p className="text-xs text-red-600">
                              {voucherError}
                           </p>
                        </div>
                     )}

                     {voucherSuccess && appliedVoucherValue > 0 && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between gap-2">
                           <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600 shrink-0" />
                              <span className="text-xs text-green-700">
                                 Mã <strong>{appliedVoucherCode}</strong> đã áp
                                 dụng — Giảm{" "}
                                 <strong>
                                    {formatPrice(appliedVoucherValue)}
                                 </strong>
                              </span>
                           </div>
                           <button
                              onClick={() => {
                                 setVoucherCode("");
                                 setVoucherSuccess(false);
                                 onApplyVoucher?.("", 0, "");
                              }}
                              className="shrink-0 p-1 hover:bg-green-100 rounded transition-colors cursor-pointer"
                           >
                              <X className="h-3.5 w-3.5 text-green-600" />
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Danh sách voucher */}
                  <div className="p-4">
                     {loading ? (
                        <div className="flex items-center justify-center py-12">
                           <Loader2 className="h-6 w-6 animate-spin text-neutral-dark" />
                        </div>
                     ) : vouchers.length === 0 ? (
                        <p className="text-sm text-neutral-dark text-center py-10">
                           Không có mã nào khả dụng
                        </p>
                     ) : (
                        <>
                           <p className="text-xs text-neutral-darker mb-3 font-medium">
                              Mã khả dụng ({vouchers.length}):
                           </p>
                           <div className="space-y-2">
                              {vouchers.map((voucher) => {
                                 const canUse = canUseVoucher(voucher);
                                 const isApplied =
                                    appliedVoucherCode === voucher.code;

                                 return (
                                    <div
                                       key={voucher.id}
                                       className={`flex gap-3 p-3 border rounded-lg transition-all ${
                                          isApplied
                                             ? "border-accent bg-accent/5"
                                             : canUse
                                               ? "border-neutral hover:border-accent cursor-pointer"
                                               : "border-neutral opacity-50 cursor-not-allowed"
                                       }`}
                                       onClick={() =>
                                          handleSelectFromList(voucher)
                                       }
                                    >
                                       {/* Icon */}
                                       <div className="shrink-0 w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                                          <Tag className="h-5 w-5 text-accent-dark" />
                                       </div>

                                       {/* Info */}
                                       <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-2 mb-0.5">
                                             <p className="text-sm font-bold text-accent-dark">
                                                {voucher.code}
                                             </p>
                                             <div className="flex items-center gap-1 shrink-0">
                                                {isApplied && (
                                                   <span className="text-xs px-2 py-0.5 bg-accent text-primary font-medium rounded">
                                                      Đang dùng
                                                   </span>
                                                )}
                                                <button
                                                   onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleCopyCode(
                                                         voucher.code,
                                                      );
                                                   }}
                                                   className="p-1.5 hover:bg-neutral rounded transition-colors cursor-pointer"
                                                   aria-label="Copy mã"
                                                >
                                                   {copiedCode ===
                                                   voucher.code ? (
                                                      <Check className="h-3.5 w-3.5 text-green-500" />
                                                   ) : (
                                                      <Copy className="h-3.5 w-3.5 text-neutral-darker" />
                                                   )}
                                                </button>
                                             </div>
                                          </div>

                                          <p className="text-xs text-neutral-darker line-clamp-2 mb-2">
                                             {voucher.description}
                                          </p>

                                          <div className="flex items-center gap-2 flex-wrap text-xs">
                                             {voucher.discountType ===
                                             "DISCOUNT_PERCENT" ? (
                                                <span className="px-2 py-0.5 bg-promotion-light text-promotion font-semibold rounded">
                                                   -{voucher.discountValue}%
                                                </span>
                                             ) : voucher.discountValue > 0 ? (
                                                <span className="px-2 py-0.5 bg-promotion-light text-promotion font-semibold rounded">
                                                   -
                                                   {formatPrice(
                                                      voucher.discountValue,
                                                   )}
                                                </span>
                                             ) : null}
                                             <span className="text-neutral-dark">
                                                Đơn tối thiểu{" "}
                                                {formatPrice(
                                                   voucher.minOrderValue,
                                                )}
                                             </span>
                                          </div>

                                          <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-dark">
                                             {voucher.endDate && (
                                                <div className="flex items-center gap-1">
                                                   <Calendar className="h-3 w-3" />
                                                   <span>
                                                      HSD:{" "}
                                                      {formatDate(
                                                         voucher.endDate,
                                                      )}
                                                   </span>
                                                </div>
                                             )}
                                             {voucher.maxUses && (
                                                <div className="flex items-center gap-1">
                                                   <Users className="h-3 w-3" />
                                                   <span>
                                                      {voucher.maxUses -
                                                         voucher.usesCount}{" "}
                                                      lượt còn lại
                                                   </span>
                                                </div>
                                             )}
                                          </div>

                                          {!canUse && (
                                             <p className="text-xs text-red-500 mt-1">
                                                {voucher.isExpired
                                                   ? "Mã đã hết hạn"
                                                   : !voucher.isAvailable
                                                     ? "Mã đã hết lượt"
                                                     : cartTotal <
                                                         voucher.minOrderValue
                                                       ? `Cần thêm ${formatPrice(
                                                            voucher.minOrderValue -
                                                               cartTotal,
                                                         )} để dùng mã`
                                                       : "Không đủ điều kiện"}
                                             </p>
                                          )}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </>
                     )}
                  </div>
               </div>

               {/* Footer */}
               <div className="border-t border-neutral p-4 bg-neutral-light shrink-0">
                  <div className="flex items-center justify-between mb-3 text-sm">
                     <span className="text-neutral-darker">
                        {voucherSuccess && appliedVoucherValue > 0
                           ? "1 mã đang áp dụng"
                           : "Chưa áp dụng mã nào"}
                     </span>
                     {voucherSuccess && appliedVoucherValue > 0 && (
                        <span className="text-lg font-bold text-accent-dark">
                           -{formatPrice(appliedVoucherValue)}
                        </span>
                     )}
                  </div>
                  <button
                     onClick={onClose}
                     className="w-full bg-primary hover:bg-primary-hover text-neutral-light font-semibold py-3 rounded-lg transition-colors cursor-pointer"
                  >
                     Xác nhận
                  </button>
               </div>
            </div>
         </div>

         <style jsx>{`
            @keyframes slide-up {
               from {
                  transform: translateY(100%);
                  opacity: 0;
               }
               to {
                  transform: translateY(0);
                  opacity: 1;
               }
            }
            @keyframes slide-left {
               from {
                  transform: translateX(100%);
                  opacity: 0;
               }
               to {
                  transform: translateX(0);
                  opacity: 1;
               }
            }
            .animate-slide-up {
               animation: slide-up 0.3s ease-out;
            }
            .animate-slide-left {
               animation: slide-left 0.3s ease-out;
            }
         `}</style>
      </>
   );
}
