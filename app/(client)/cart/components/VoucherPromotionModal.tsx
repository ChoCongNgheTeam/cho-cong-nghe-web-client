// components/cart/VoucherPromotionModal.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Tag, Check, Plus, Copy } from "lucide-react";

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
}

// Mock voucher database - moved outside component
const AVAILABLE_VOUCHERS = [
  { code: "GIAM50K", value: 50000, description: "Giảm 50.000₫ cho đơn từ 500.000₫" },
  { code: "GIAM100K", value: 100000, description: "Giảm 100.000₫ cho đơn từ 1.000.000₫" },
  { code: "FREESHIP", value: 30000, description: "Miễn phí vận chuyển" },
  { code: "SALE20", value: 200000, description: "Giảm 200.000₫ cho đơn từ 2.000.000₫" },
  { code: "VIP300", value: 300000, description: "Giảm 300.000₫ cho khách VIP" },
];

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: "promo1",
    title: "Tặng túi lóc 1.040.000₫",
    description: "Áp dụng cho Máy nước nóng trực tiếp Panasonic DH-4VP1VW 4500W",
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
    description: "Áp dụng cho Máy nước nóng trực tiếp Panasonic DH-4VP1VW 4500W",
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
}: VoucherPromotionModalProps) {
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [voucherSuccess, setVoucherSuccess] = useState(false);
  const [promotionsList, setPromotionsList] = useState<Promotion[]>(() =>
    INITIAL_PROMOTIONS.map(promo => ({
      ...promo,
      selected: false
    }))
  );

  const formatPrice = useCallback((price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫", []);

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setPromotionsList(prev =>
        prev.map(promo => ({
          ...promo,
          selected: selectedPromotions.includes(promo.id)
        }))
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
  }, [isOpen, selectedPromotions, appliedVoucherCode]);

  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSelectPromotion = useCallback((promotionId: string) => {
    setPromotionsList(prev =>
      prev.map(promo => ({
        ...promo,
        selected: promo.id === promotionId ? !promo.selected : promo.selected
      }))
    );
  }, []);

  const handleApplyVoucher = useCallback(() => {
    if (!voucherCode.trim()) {
      setVoucherError("Vui lòng nhập mã voucher");
      setVoucherSuccess(false);
      return;
    }

    const voucher = AVAILABLE_VOUCHERS.find(v => v.code === voucherCode.toUpperCase());
    
    if (voucher) {
      setVoucherError("");
      setVoucherSuccess(true);
      if (onApplyVoucher) {
        onApplyVoucher(voucher.code, voucher.value);
      }
    } else {
      setVoucherError("Mã voucher không hợp lệ hoặc đã hết hạn");
      setVoucherSuccess(false);
    }
  }, [voucherCode, onApplyVoucher]);

  const copyVoucherCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setVoucherCode(code);
  }, []);

  const handleConfirm = useCallback(() => {
    const selectedIds = promotionsList
      .filter(p => p.selected)
      .map(p => p.id);
    
    const totalValue = promotionsList
      .filter(p => p.selected)
      .reduce((sum, p) => sum + p.value, 0);

    onSelectPromotions(selectedIds, totalValue);
    onClose();
  }, [promotionsList, onSelectPromotions, onClose]);

  const selectedCount = promotionsList.filter((p) => p.selected).length;
  const totalPromotionValue = promotionsList
    .filter((p) => p.selected)
    .reduce((sum, p) => sum + p.value, 0);
  
  const totalValue = totalPromotionValue + (voucherSuccess && appliedVoucherValue ? appliedVoucherValue : 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary-darker/50 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal - Desktop: Sidebar from right, Mobile: Bottom sheet */}
      <div className="fixed inset-0 z-[60] flex items-end lg:items-center lg:justify-end p-0 sm:p-4 lg:p-0">
        <div
          className={`bg-white w-full sm:max-w-lg lg:h-full lg:max-w-md shadow-2xl flex flex-col
            sm:rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none
            animate-slide-up lg:animate-slide-left
            max-h-[90vh] lg:max-h-full
          `}
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
                  <p className="text-xs text-red-600">{voucherError}</p>
                </div>
              )}
              
              {voucherSuccess && appliedVoucherValue > 0 && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-green-700">
                    Mã <strong>{appliedVoucherCode}</strong> đã áp dụng - Giảm <strong>{formatPrice(appliedVoucherValue)}</strong>
                  </span>
                </div>
              )}

              {/* Available Vouchers */}
              <div className="mt-3">
                <p className="text-xs text-neutral-darker mb-2 font-medium">Mã khả dụng:</p>
                <div className="space-y-2">
                  {AVAILABLE_VOUCHERS.map((voucher) => (
                    <div
                      key={voucher.code}
                      className="flex items-center justify-between p-2 bg-white border border-neutral rounded-lg hover:border-accent transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-accent-dark">{voucher.code}</p>
                        <p className="text-xs text-neutral-dark">{voucher.description}</p>
                      </div>
                      <button
                        onClick={() => copyVoucherCode(voucher.code)}
                        className="ml-2 p-2 hover:bg-accent-light rounded transition-colors"
                        aria-label="Copy mã"
                      >
                        <Copy className="h-3 w-3 text-neutral-darker" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Promotions List */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-primary-darker mb-3">
                Khuyến mãi
              </h3>
              <div className="space-y-3">
                {promotionsList.map((promo) => (
                  <div
                    key={promo.id}
                    className={`border rounded-lg p-3 transition-all cursor-pointer ${
                      promo.selected
                        ? "border-accent bg-accent-light"
                        : "border-neutral bg-white hover:border-accent"
                    } ${!promo.canUse ? "opacity-50" : ""}`}
                    onClick={() => promo.canUse && handleSelectPromotion(promo.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center">
                        <span className="text-xl">🎁</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-primary-darker">
                            {promo.title}
                          </h4>
                          {promo.selected ? (
                            <div className="flex-shrink-0 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-darker" />
                            </div>
                          ) : (
                            <button className="flex-shrink-0 w-5 h-5 border-2 border-neutral rounded-full flex items-center justify-center hover:border-accent transition-colors">
                              <Plus className="h-3 w-3 text-neutral-dark" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-neutral-darker mb-2 line-clamp-2">
                          {promo.description}
                        </p>
                        {promo.condition && (
                          <p className="text-xs text-neutral-dark">
                            {promo.condition}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="mt-4 p-3 bg-accent-light rounded-lg border border-accent">
                <p className="text-xs text-primary-darker">
                  <span className="font-semibold">Lưu ý:</span> Không áp dụng đồng thời với các khuyến mãi sau - Tặng túi lóc 1.040.000₫
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral p-4 bg-white">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-neutral-darker">
                Đã chọn {selectedCount} khuyến mãi {voucherSuccess && appliedVoucherValue > 0 ? "+ 1 voucher" : ""}
              </span>
              <span className="text-lg font-bold text-accent-dark">
                {formatPrice(totalValue)}
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