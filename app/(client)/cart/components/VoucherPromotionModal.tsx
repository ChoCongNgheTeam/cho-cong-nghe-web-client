// components/cart/VoucherPromotionModal.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Tag, Check, Plus, Copy, Calendar, Users } from "lucide-react";

// Types based on ERD
interface Voucher {
   id: string;
   code: string;
   description: string;
   discount_type: "percentage" | "fixed_amount";
   discount_value: number;
   max_discount_amount: number | null;
   min_order_value: number;
   start_date: string;
   end_date: string;
   usage_limit: number | null;
   usage_count: number;
   is_active: boolean;
   created_at: string;
}

interface VoucherAction {
   id: string;
   voucher_id: string;
   action_type: "buy_priority" | "gift_product" | "price_off";
   quantity: number | null;
   gift_product_id: string | null;
   is_active: boolean;
}

interface Promotion {
   id: string;
   title: string;
   description: string;
   value: number;
   condition?: string;
   canUse: boolean;
   selected?: boolean;
}

interface VoucherPromotionModalProps {
   isOpen: boolean;
   onClose: () => void;
   selectedPromotions?: string[];
   onSelectPromotions: (promotionIds: string[], totalValue: number) => void;
   appliedVoucherCode?: string;
   appliedVoucherValue?: number;
   onApplyVoucher?: (code: string, value: number) => void;
   cartTotal?: number;
}

// Mock data based on ERD structure
const MOCK_VOUCHERS: Voucher[] = [
   {
      id: "v1",
      code: "GIAM50K",
      description: "Giảm 50.000₫ cho đơn từ 500.000₫",
      discount_type: "fixed_amount",
      discount_value: 50000,
      max_discount_amount: null,
      min_order_value: 500000,
      start_date: "2025-01-01T00:00:00Z",
      end_date: "2025-12-31T23:59:59Z",
      usage_limit: 1000,
      usage_count: 245,
      is_active: true,
      created_at: "2025-01-30T00:00:00Z",
   },
   {
      id: "v2",
      code: "GIAM100K",
      description: "Giảm 100.000₫ cho đơn từ 1.000.000₫",
      discount_type: "fixed_amount",
      discount_value: 100000,
      max_discount_amount: null,
      min_order_value: 1000000,
      start_date: "2025-01-01T00:00:00Z",
      end_date: "2025-12-31T23:59:59Z",
      usage_limit: 500,
      usage_count: 128,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
   },
   {
      id: "v3",
      code: "SALE20",
      description: "Giảm 20% tối đa 200.000₫",
      discount_type: "percentage",
      discount_value: 20,
      max_discount_amount: 200000,
      min_order_value: 500000,
      start_date: "2025-01-01T00:00:00Z",
      end_date: "2025-12-31T23:59:59Z",
      usage_limit: null,
      usage_count: 892,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
   },
   {
      id: "v4",
      code: "FREESHIP",
      description: "Miễn phí vận chuyển cho đơn từ 300.000₫",
      discount_type: "fixed_amount",
      discount_value: 30000,
      max_discount_amount: null,
      min_order_value: 300000,
      start_date: "2025-01-01T00:00:00Z",
      end_date: "2025-12-31T23:59:59Z",
      usage_limit: null,
      usage_count: 1456,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
   },
   {
      id: "v5",
      code: "VIP300",
      description: "Giảm 300.000₫ cho khách VIP - Đơn từ 3.000.000₫",
      discount_type: "fixed_amount",
      discount_value: 300000,
      max_discount_amount: null,
      min_order_value: 3000000,
      start_date: "2025-01-01T00:00:00Z",
      end_date: "2025-12-31T23:59:59Z",
      usage_limit: 100,
      usage_count: 45,
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
   },
];

const MOCK_PROMOTIONS: Promotion[] = [
   {
      id: "promo1",
      title: "Tặng túi lóc 1.040.000₫",
      description:
         "Áp dụng cho Máy nước nóng trực tiếp Panasonic DH-4VP1VW 4500W",
      value: 1040000,
      canUse: true,
      selected: false,
   },
   {
      id: "promo2",
      title: "Giảm 500.000₫",
      description: "Áp dụng cho đơn hàng từ 5.000.000₫",
      value: 500000,
      canUse: true,
      selected: false,
   },
   {
      id: "promo3",
      title: "Lì xì Bảo hành 1 đổi 1 trọn đời",
      description:
         "Áp dụng cho Máy nước nóng trực tiếp Panasonic DH-4VP1VW 4500W",
      value: 0,
      canUse: true,
      selected: false,
   },
];

export default function VoucherPromotionModal({
   isOpen,
   onClose,
   selectedPromotions = [],
   onSelectPromotions,
   appliedVoucherCode = "",
   appliedVoucherValue = 0,
   onApplyVoucher,
   cartTotal = 0,
}: VoucherPromotionModalProps) {
   const [voucherCode, setVoucherCode] = useState("");
   const [voucherError, setVoucherError] = useState("");
   const [voucherSuccess, setVoucherSuccess] = useState(false);
   const [promotionsList, setPromotionsList] = useState<Promotion[]>(() =>
      MOCK_PROMOTIONS.map((promo) => ({
         ...promo,
         selected: false,
      })),
   );
   const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);

   const formatPrice = useCallback(
      (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫",
      [],
   );

   const formatDate = useCallback((dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
   }, []);

   // Calculate discount value based on voucher type
   const calculateDiscount = useCallback(
      (voucher: Voucher, orderTotal: number): number => {
         if (voucher.discount_type === "fixed_amount") {
            return voucher.discount_value;
         } else {
            const discount = (orderTotal * voucher.discount_value) / 100;
            return voucher.max_discount_amount
               ? Math.min(discount, voucher.max_discount_amount)
               : discount;
         }
      },
      [],
   );

   // Check if voucher can be used
   const canUseVoucher = useCallback(
      (voucher: Voucher, orderTotal: number): boolean => {
         if (!voucher.is_active) return false;
         if (orderTotal < voucher.min_order_value) return false;
         if (voucher.usage_limit && voucher.usage_count >= voucher.usage_limit)
            return false;

         const now = new Date();
         const startDate = new Date(voucher.start_date);
         const endDate = new Date(voucher.end_date);

         if (now < startDate || now > endDate) return false;

         return true;
      },
      [],
   );

   // Filter available vouchers based on cart total
   useEffect(() => {
      if (isOpen) {
         const filtered = MOCK_VOUCHERS.filter((v) => v.is_active);
         setAvailableVouchers(filtered);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isOpen, cartTotal]);

   // Initialize when modal opens
   useEffect(() => {
      if (isOpen) {
         setPromotionsList((prev) =>
            prev.map((promo) => ({
               ...promo,
               selected: selectedPromotions.includes(promo.id),
            })),
         );

         if (appliedVoucherCode) {
            setVoucherCode(appliedVoucherCode);
            setVoucherSuccess(true);
            setVoucherError("");
         } else {
            setVoucherCode("");
            setVoucherSuccess(false);
            setVoucherError("");
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isOpen, selectedPromotions, appliedVoucherCode]);

   // Handle body scroll
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

   const handleSelectPromotion = useCallback((promotionId: string) => {
      setPromotionsList((prev) =>
         prev.map((promo) => ({
            ...promo,
            selected:
               promo.id === promotionId ? !promo.selected : promo.selected,
         })),
      );
   }, []);

   const handleApplyVoucher = useCallback(() => {
      if (!voucherCode.trim()) {
         setVoucherError("Vui lòng nhập mã voucher");
         setVoucherSuccess(false);
         return;
      }

      const voucher = MOCK_VOUCHERS.find(
         (v) => v.code.toLowerCase() === voucherCode.toLowerCase(),
      );

      if (!voucher) {
         setVoucherError("Mã voucher không tồn tại");
         setVoucherSuccess(false);
         return;
      }

      if (!voucher.is_active) {
         setVoucherError("Mã voucher đã ngừng hoạt động");
         setVoucherSuccess(false);
         return;
      }

      if (!canUseVoucher(voucher, cartTotal)) {
         if (cartTotal < voucher.min_order_value) {
            setVoucherError(
               `Đơn hàng tối thiểu ${formatPrice(
                  voucher.min_order_value,
               )} để sử dụng mã này`,
            );
         } else if (
            voucher.usage_limit &&
            voucher.usage_count >= voucher.usage_limit
         ) {
            setVoucherError("Mã voucher đã hết lượt sử dụng");
         } else {
            const now = new Date();
            const startDate = new Date(voucher.start_date);
            const endDate = new Date(voucher.end_date);

            if (now < startDate) {
               setVoucherError(
                  `Mã voucher có hiệu lực từ ${formatDate(voucher.start_date)}`,
               );
            } else if (now > endDate) {
               setVoucherError(
                  `Mã voucher đã hết hạn ngày ${formatDate(voucher.end_date)}`,
               );
            } else {
               setVoucherError("Không thể sử dụng mã voucher này");
            }
         }
         setVoucherSuccess(false);
         return;
      }

      const discountValue = calculateDiscount(voucher, cartTotal);
      setVoucherError("");
      setVoucherSuccess(true);

      if (onApplyVoucher) {
         onApplyVoucher(voucher.code, discountValue);
      }
   }, [
      voucherCode,
      cartTotal,
      canUseVoucher,
      calculateDiscount,
      formatPrice,
      formatDate,
      onApplyVoucher,
   ]);

   const copyVoucherCode = useCallback((code: string) => {
      navigator.clipboard.writeText(code);
      setVoucherCode(code);

      // Show toast or feedback
      const button = document.querySelector(`[data-voucher-code="${code}"]`);
      if (button) {
         button.textContent = "✓ Đã copy";
         setTimeout(() => {
            button.textContent = "";
         }, 2000);
      }
   }, []);

   const handleConfirm = useCallback(() => {
      const selectedIds = promotionsList
         .filter((p) => p.selected)
         .map((p) => p.id);

      const totalValue = promotionsList
         .filter((p) => p.selected)
         .reduce((sum, p) => sum + p.value, 0);

      onSelectPromotions(selectedIds, totalValue);
      onClose();
   }, [promotionsList, onSelectPromotions, onClose]);

   const selectedCount = promotionsList.filter((p) => p.selected).length;
   const totalPromotionValue = promotionsList
      .filter((p) => p.selected)
      .reduce((sum, p) => sum + p.value, 0);

   const totalValue =
      totalPromotionValue +
      (voucherSuccess && appliedVoucherValue ? appliedVoucherValue : 0);

   if (!isOpen) return null;

   return (
      <>
         {/* Backdrop */}
         <div
            className="fixed inset-0 bg-neutral-light/70 backdrop-blur-sm z-[60] transition-opacity duration-300"
            onClick={onClose}
         />

         {/* Modal - Desktop: Sidebar from right, Mobile: Bottom sheet */}
         <div className="fixed inset-0 z-[60] flex items-end lg:items-center lg:justify-end p-0 sm:p-4 lg:p-0 pointer-events-none">
            <div
               className="bg-neutral-light w-full sm:max-w-lg lg:h-full lg:max-w-md shadow-2xl flex flex-col sm:rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none animate-slide-up lg:animate-slide-left max-h-[90vh] lg:max-h-full pointer-events-auto"
               onClick={(e) => e.stopPropagation()}
            >
               {/* Header */}
               <div className="flex items-center justify-between p-4 border-b border-neutral">
                  <h2 className="text-lg font-semibold text-primary-darker">
                     Khuyến mãi và ưu đãi
                  </h2>
                  <button
                     onClick={onClose}
                     className="p-2 hover:bg-neutral-light rounded-lg transition-colors"
                     aria-label="Đóng"
                  >
                     <X className="h-5 w-5 text-neutral-darker" />
                  </button>
               </div>

               {/* Content */}
               <div className="flex-1 overflow-y-auto">
                  {/* Voucher Input Section */}
                  <div className="p-4 bg-neutral-light border-b border-neutral">
                     <h3 className="text-sm font-semibold text-primary-darker mb-3">
                        Mã giảm giá
                     </h3>
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
                              placeholder="Nhập mã giảm giá"
                              className="w-full pl-10 pr-4 py-3 border border-neutral rounded-lg text-sm text-primary-darker placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                           />
                        </div>
                        <button
                           className="px-6 py-3 bg-accent hover:bg-accent-hover text-primary-darker font-semibold rounded-lg transition-colors text-sm whitespace-nowrap"
                           onClick={handleApplyVoucher}
                        >
                           Áp dụng
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
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                           <Check className="h-4 w-4 text-green-600 shrink-0" />
                           <span className="text-xs text-green-700">
                              Mã <strong>{appliedVoucherCode}</strong> đã áp
                              dụng - Giảm{" "}
                              <strong>
                                 {formatPrice(appliedVoucherValue)}
                              </strong>
                           </span>
                        </div>
                     )}

                     {/* Available Vouchers */}
                     <div className="mt-4">
                        <p className="text-xs text-neutral-darker mb-2 font-medium">
                           Mã khả dụng ({availableVouchers.length}):
                        </p>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                           {availableVouchers.map((voucher) => {
                              const canUse = canUseVoucher(voucher, cartTotal);
                              const discount = calculateDiscount(
                                 voucher,
                                 cartTotal,
                              );

                              return (
                                 <div
                                    key={voucher.id}
                                    className={`flex items-start gap-3 p-3 bg-neutral-light border rounded-lg transition-all ${
                                       canUse
                                          ? "border-accent hover:border-accent-hover cursor-pointer"
                                          : "border-neutral opacity-60"
                                    }`}
                                 >
                                    {/* Icon */}
                                    <div className="shrink-0 w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                                       <Tag className="h-5 w-5 text-accent-dark" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-start justify-between gap-2 mb-1">
                                          <div>
                                             <p className="text-sm font-bold text-accent-dark">
                                                {voucher.code}
                                             </p>
                                             <p className="text-xs text-neutral-darker line-clamp-2">
                                                {voucher.description}
                                             </p>
                                          </div>
                                          <button
                                             onClick={() =>
                                                copyVoucherCode(voucher.code)
                                             }
                                             className="shrink-0 p-1.5 hover:bg-accent-light rounded transition-colors"
                                             aria-label="Copy mã"
                                             data-voucher-code={voucher.code}
                                             disabled={!canUse}
                                          >
                                             <Copy className="h-3.5 w-3.5 text-neutral-darker" />
                                          </button>
                                       </div>

                                       <div className="flex items-center gap-2 mt-2 text-xs">
                                          {voucher.discount_type ===
                                          "percentage" ? (
                                             <span className="px-2 py-0.5 bg-promotion-light text-promotion font-semibold rounded">
                                                -{voucher.discount_value}%
                                             </span>
                                          ) : (
                                             <span className="px-2 py-0.5 bg-promotion-light text-promotion font-semibold rounded">
                                                -
                                                {formatPrice(
                                                   voucher.discount_value,
                                                )}
                                             </span>
                                          )}

                                          {voucher.max_discount_amount && (
                                             <span className="text-neutral-dark">
                                                Tối đa{" "}
                                                {formatPrice(
                                                   voucher.max_discount_amount,
                                                )}
                                             </span>
                                          )}
                                       </div>

                                       <div className="flex items-center gap-3 mt-2 text-xs text-neutral-dark">
                                          <div className="flex items-center gap-1">
                                             <Calendar className="h-3 w-3" />
                                             <span>
                                                HSD:{" "}
                                                {formatDate(voucher.end_date)}
                                             </span>
                                          </div>
                                          {voucher.usage_limit && (
                                             <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span>
                                                   {voucher.usage_limit -
                                                      voucher.usage_count}{" "}
                                                   lượt
                                                </span>
                                             </div>
                                          )}
                                       </div>

                                       {!canUse && (
                                          <p className="text-xs text-red-600 mt-1">
                                             {cartTotal <
                                             voucher.min_order_value
                                                ? `Đơn tối thiểu ${formatPrice(
                                                     voucher.min_order_value,
                                                  )}`
                                                : "Không đủ điều kiện"}
                                          </p>
                                       )}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>

                  {/* Promotions List */}
                  <div className="p-4">
                     <h3 className="text-sm font-semibold text-primary-darker mb-3">
                        Khuyến mãi sản phẩm
                     </h3>
                     <div className="space-y-3">
                        {promotionsList.map((promo) => (
                           <div
                              key={promo.id}
                              className={`border rounded-lg p-3 transition-all cursor-pointer ${
                                 promo.selected
                                    ? "border-accent bg-accent-light"
                                    : "border-neutral bg-neutral-light hover:border-accent"
                              } ${!promo.canUse ? "opacity-50" : ""}`}
                              onClick={() =>
                                 promo.canUse && handleSelectPromotion(promo.id)
                              }
                           >
                              <div className="flex items-start gap-3">
                                 {/* Icon */}
                                 <div className="shrink-0 w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center">
                                    <span className="text-xl">🎁</span>
                                 </div>

                                 {/* Content */}
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                       <h4 className="text-sm font-semibold text-primary-darker">
                                          {promo.title}
                                       </h4>
                                       {promo.selected ? (
                                          <div className="shrink-0 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                                             <Check className="h-3 w-3 text-primary-darker" />
                                          </div>
                                       ) : (
                                          <button className="shrink-0 w-5 h-5 border-2 border-neutral rounded-full flex items-center justify-center hover:border-accent transition-colors">
                                             <Plus className="h-3 w-3 text-neutral-dark" />
                                          </button>
                                       )}
                                    </div>
                                    <p className="text-xs text-neutral-darker mb-2 line-clamp-2">
                                       {promo.description}
                                    </p>
                                    {promo.value > 0 && (
                                       <span className="inline-block px-2 py-0.5 bg-promotion-light text-promotion text-xs font-semibold rounded">
                                          Giá trị: {formatPrice(promo.value)}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>

                     {/* Note */}
                     <div className="mt-4 p-3 bg-accent-light rounded-lg border border-accent">
                        <p className="text-xs text-primary-darker">
                           <span className="font-semibold">Lưu ý:</span> Một số
                           khuyến mãi không áp dụng đồng thời. Chọn khuyến mãi
                           phù hợp nhất với đơn hàng.
                        </p>
                     </div>
                  </div>
               </div>

               {/* Footer */}
               <div className="border-t border-neutral p-4 bg-neutral-light">
                  <div className="flex items-center justify-between mb-3 text-sm">
                     <span className="text-neutral-darker">
                        {selectedCount > 0 && `${selectedCount} khuyến mãi`}
                        {selectedCount > 0 &&
                           voucherSuccess &&
                           appliedVoucherValue > 0 &&
                           " + "}
                        {voucherSuccess &&
                           appliedVoucherValue > 0 &&
                           "1 voucher"}
                        {selectedCount === 0 &&
                           (!voucherSuccess || appliedVoucherValue === 0) &&
                           "Chưa chọn"}
                     </span>
                     <span className="text-lg font-bold text-accent-dark">
                        -{formatPrice(totalValue)}
                     </span>
                  </div>
                  <button
                     onClick={handleConfirm}
                     className="w-full bg-accent hover:bg-accent-hover text-primary-darker font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-accent/30"
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
