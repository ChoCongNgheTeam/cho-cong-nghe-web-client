// components/cart/VoucherPromotionModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Tag, Check, Plus } from "lucide-react";

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
  selectedPromotion?: string;
  onSelectPromotion: (promotionId: string) => void;
}

export default function VoucherPromotionModal({
  isOpen,
  onClose,
  selectedPromotion,
  onSelectPromotion,
}: VoucherPromotionModalProps) {
  const [voucherCode, setVoucherCode] = useState("");
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(
    selectedPromotion || null
  );
  const [promotionsList, setPromotionsList] = useState<Promotion[]>([
    {
      id: "promo1",
      title: "Tặng túi lóc 1.040.000₫",
      description: "Áp dụng cho Máy nước nóng trực tiếp Panasonic DH-4VP1VW 4500W",
      value: 1040000,
      canUse: true,
      selected: true,
    },
    {
      id: "promo2",
      title: "Tặng túi lóc 1.040.000₫",
      description: "Áp dụng cho Máy nước nóng trực tiếp Panasonic DH-4VP1VW 4500W",
      value: 1040000,
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
  ]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

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

  const handleSelectPromotion = (promotionId: string) => {
    setPromotionsList(prev => 
      prev.map(promo => ({
        ...promo,
        selected: promo.id === promotionId ? !promo.selected : promo.selected
      }))
    );
    setSelectedPromotionId(promotionId);
  };

  const handleConfirm = () => {
    if (selectedPromotionId) {
      onSelectPromotion(selectedPromotionId);
    }
    onClose();
  };

  const selectedCount = promotionsList.filter((p) => p.selected).length;
  const totalValue = promotionsList
    .filter((p) => p.selected)
    .reduce((sum, p) => sum + p.value, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary-darker/50 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up shadow-2xl"
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
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã giảm giá của bạn tại đây nhé"
                    className="w-full pl-10 pr-4 py-3 border border-neutral rounded-lg text-sm text-primary-darker placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                <button
                  className="px-6 py-3 bg-accent hover:bg-accent-hover text-primary-darker font-semibold rounded-lg transition-colors text-sm whitespace-nowrap"
                  onClick={() => {
                    console.log("Apply voucher:", voucherCode);
                  }}
                >
                  Áp dụng
                </button>
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
                Đã chọn {selectedCount} khuyến mãi và ưu đãi
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
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}