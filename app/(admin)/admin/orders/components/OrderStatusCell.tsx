"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { OrderStatus } from "../order.types";
import { ORDER_STATUS_CONFIG, STATUS_FLOW } from "../const";
import { updateOrderStatus } from "../_libs/orders";

interface OrderStatusCellProps {
  orderId: string;
  status: OrderStatus;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  /** Khi user chọn CANCELLED từ dropdown → không gọi API trực tiếp mà gọi callback này để parent mở modal xác nhận */
  onCancelRequest?: (orderId: string) => void;
}

export function OrderStatusCell({ orderId, status, onStatusChange, onCancelRequest }: OrderStatusCellProps) {
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

  const cfg = ORDER_STATUS_CONFIG[status];

  // Lấy các bước tiếp theo + thêm CANCELLED nếu đơn chưa chốt
  const nextStatuses: OrderStatus[] = [...STATUS_FLOW[status]];
  const canCancel = status !== "CANCELLED" && status !== "DELIVERED";
  if (canCancel && !nextStatuses.includes("CANCELLED")) {
    nextStatuses.push("CANCELLED");
  }

  const handleSelect = async (next: OrderStatus) => {
    setOpen(false);
    if (next === status) return;

    // CANCELLED → yêu cầu xác nhận từ parent (modal)
    if (next === "CANCELLED") {
      onCancelRequest?.(orderId);
      return;
    }

    setLoading(true);
    try {
      await updateOrderStatus(orderId, next);
      onStatusChange(orderId, next);
    } catch {
      // lỗi im lặng — parent có thể xử lý nếu muốn
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || nextStatuses.length === 0;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => !isDisabled && setOpen((v) => !v)}
        disabled={isDisabled}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer select-none ${cfg.pill} ${
          isDisabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-80"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        {loading ? "..." : cfg.label}
        {!isDisabled && <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-neutral-light border border-neutral rounded-xl shadow-lg py-1 min-w-[160px]">
          {nextStatuses.map((s) => {
            const c = ORDER_STATUS_CONFIG[s];
            const isCancel = s === "CANCELLED";
            return (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                  isCancel ? "hover:bg-promotion-light text-promotion" : `${c.dropdownHover} text-primary`
                }`}
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
