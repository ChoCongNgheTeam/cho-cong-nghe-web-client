"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
import { formatNumber, formatVND } from "@/helpers";

interface BottomBarSummaryRow {
  label: string;
  value: string;
  indent?: boolean;
  highlight?: boolean;
}

interface CartBottomBarProps {
  /** Tổng cần thanh toán hiển thị ở bar */
  finalTotal: number;
  /** Tổng tiết kiệm (discount + voucher). Nếu = 0 thì không hiện */
  totalSaved?: number;
  /** Danh sách rows trong panel chi tiết */
  summaryRows: BottomBarSummaryRow[];
  /** Voucher */
  voucherCode?: string;
  voucherValue?: number;
  onOpenVoucherModal?: () => void;
  /** Điểm thưởng */
  rewardPoints?: number;
  /** Nút action chính */
  actionLabel: string;
  actionDisabled?: boolean;
  onAction: () => void;
  /** Checkbox điều khoản (checkout only) */
  agreedToTerms?: boolean;
  onTermsChange?: (v: boolean) => void;
  showTerms?: boolean;
}

export default function CartBottomBar({
  finalTotal,
  totalSaved = 0,
  summaryRows,
  voucherCode,
  voucherValue = 0,
  onOpenVoucherModal,
  rewardPoints,
  actionLabel,
  actionDisabled = false,
  onAction,
  agreedToTerms,
  onTermsChange,
  showTerms = false,
}: CartBottomBarProps) {
  const [showPanel, setShowPanel] = useState(false);

  const togglePanel = (next: boolean) => {
    setShowPanel(next);
    window.dispatchEvent(new CustomEvent("sheet:toggle", { detail: { open: next } }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden shadow-2xl">
      {/* Backdrop */}
      {showPanel && <div className="fixed inset-0 bg-black/40 z-[-1]" onClick={() => togglePanel(false)} />}

      {/* Expanded panel */}
      <div className={`bg-neutral-light border-t border-neutral overflow-hidden transition-all duration-300 ease-in-out ${showPanel ? "max-h-[70vh]" : "max-h-0"}`}>
        <div className="overflow-y-auto max-h-[70vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral">
            <span className="text-sm font-semibold text-primary">Thông tin đơn hàng</span>
            <button onClick={() => togglePanel(false)} className="p-1.5 hover:bg-neutral rounded-lg transition-colors">
              <X className="h-5 w-5 text-neutral-darker" />
            </button>
          </div>

          {/* Voucher button */}
          {onOpenVoucherModal && (
            <div className="border-b border-neutral">
              <button
                type="button"
                onClick={() => {
                  togglePanel(false);
                  onOpenVoucherModal();
                }}
                className="flex w-full items-center justify-between p-3 transition hover:bg-accent/5 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="text-base">🏷️</span>
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-primary">Chọn hoặc nhập ưu đãi</span>
                    {voucherCode ? (
                      <span className="text-xs text-accent-dark font-semibold truncate w-full">
                        {voucherCode} • -{formatVND(voucherValue)}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-dark">Chưa áp dụng</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-dark group-hover:text-accent transition-colors shrink-0" />
              </button>
            </div>
          )}

          {/* Summary rows */}
          <div className="px-4 py-4 space-y-2.5">
            <h3 className="text-sm font-semibold text-primary mb-3">Chi tiết thanh toán</h3>
            <div className="space-y-2.5 text-sm">
              {summaryRows.map((row, i) => (
                <div key={i} className={`flex justify-between ${row.indent ? "pl-4" : ""}`}>
                  <span className={row.indent ? "text-neutral-dark text-xs" : "text-neutral-darker"}>{row.label}</span>
                  <span className={row.highlight ? "text-xl font-bold text-promotion" : row.indent ? "text-primary text-sm font-medium" : "font-medium text-primary"}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Điểm thưởng */}
            {rewardPoints != null && rewardPoints > 0 && (
              <div className="flex items-center gap-1 pt-1 pb-2">
                <span className="text-xs text-neutral-darker">Điểm thưởng</span>
                <span className="text-sm">🪙</span>
                <span className="text-sm font-medium text-accent-dark">+{formatNumber(rewardPoints)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-neutral-light border-t border-neutral flex items-center gap-2 px-3 py-2.5">
        {/* Checkbox điều khoản (checkout only) */}
        {showTerms && onTermsChange && (
          <label className="flex items-start gap-2 cursor-pointer pt-2 shrink-0 max-w-[45%]">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => onTermsChange(e.target.checked)}
              style={{ accentColor: "rgb(var(--accent-active))" }}
              className="w-4 h-4 cursor-pointer rounded mt-0.5 shrink-0"
            />
            <span className="text-xs text-neutral-darker leading-relaxed wrap-break-words">
              Tôi đồng ý với{" "}
              <Link href="/terms" className="text-accent underline">
                điều khoản đặt hàng
              </Link>{" "}
              của cửa hàng
            </span>
          </label>
        )}

        {/* Tổng tiền + toggle panel */}
        <button onClick={() => togglePanel(!showPanel)} className="flex-1 flex items-center justify-end gap-2 min-w-0 py-1 rounded-lg hover:bg-neutral transition">
          <div className="flex flex-col items-end min-w-0">
            <span className="text-base font-bold text-promotion whitespace-nowrap">{formatVND(finalTotal)}</span>
            {totalSaved > 0 && <span className="text-xs text-neutral-darker whitespace-nowrap">Tiết kiệm {formatVND(totalSaved)}</span>}
          </div>
          {showPanel ? <ChevronDown className="h-4 w-4 text-neutral-darker shrink-0" /> : <ChevronUp className="h-4 w-4 text-neutral-darker shrink-0" />}
        </button>

        {/* Nút action */}
        <button
          onClick={onAction}
          disabled={actionDisabled}
          className={`shrink-0 rounded-xl px-5 py-3 text-sm font-bold transition shadow-lg ${
            actionDisabled ? "cursor-not-allowed bg-neutral text-neutral-dark opacity-50" : "bg-primary-dark text-neutral-light hover:bg-accent-hover active:scale-[0.98]"
          }`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
