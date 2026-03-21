"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { PaymentStatus } from "../order.types";
import { PAYMENT_STATUS_CONFIG } from "../const";
import { updatePaymentStatus } from "../_libs/orders";

interface PaymentStatusCellProps {
  orderId: string;
  status: PaymentStatus;
  onStatusChange: (newStatus: PaymentStatus) => void;
}

// Các trạng thái có thể chuyển sang (không cho quay về UNPAID một khi đã thanh toán)
const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  UNPAID: ["PAID", "REFUNDED"],
  PAID: ["REFUNDED"],
  REFUNDED: [],
};

export function PaymentStatusCell({ orderId, status, onStatusChange }: PaymentStatusCellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cfg = PAYMENT_STATUS_CONFIG[status];
  const nextStatuses = PAYMENT_TRANSITIONS[status];
  const isDisabled = loading || nextStatuses.length === 0;

  const handleSelect = async (next: PaymentStatus) => {
    setOpen(false);
    if (next === status) return;
    setLoading(true);
    try {
      await updatePaymentStatus(orderId, next);
      onStatusChange(next);
    } catch {
      // lỗi silent — có thể toast nếu muốn
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => !isDisabled && setOpen((v) => !v)}
        disabled={isDisabled}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all select-none ${cfg.pill} ${
          isDisabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-80 cursor-pointer"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        {loading ? "..." : cfg.label}
        {!isDisabled && <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-neutral-light border border-neutral rounded-xl shadow-lg py-1 min-w-[170px]">
          {nextStatuses.map((s) => {
            const c = PAYMENT_STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
