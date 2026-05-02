"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Loader2 } from "lucide-react";
import { OrderStatus } from "../order.types";
import { ORDER_STATUS_CONFIG, STATUS_FLOW } from "../const";
import { updateOrderStatus } from "../_libs/orders";

interface OrderStatusCellProps {
  orderId: string;
  status: OrderStatus;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onCancelRequest?: (orderId: string) => void;
}

const CANCELLABLE: OrderStatus[] = ["PENDING", "PROCESSING"];

// Step indicator for visual flow
const STATUS_STEPS: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

export function OrderStatusCell({ orderId, status, onStatusChange, onCancelRequest }: OrderStatusCellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const cfg = ORDER_STATUS_CONFIG[status];
  if (!cfg) return <span className="text-[11px] text-neutral-dark">—</span>;

  const nextStatuses: OrderStatus[] = [...(STATUS_FLOW[status] ?? [])];
  if (CANCELLABLE.includes(status) && !nextStatuses.includes("CANCELLED")) {
    nextStatuses.push("CANCELLED");
  }

  const isDisabled = loading || nextStatuses.length === 0;

  const handleOpen = () => {
    if (isDisabled) return;
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((v) => !v);
  };

  const handleSelect = async (next: OrderStatus) => {
    setOpen(false);
    if (next === status) return;
    if (next === "CANCELLED") {
      onCancelRequest?.(orderId);
      return;
    }
    setLoading(true);
    try {
      await updateOrderStatus(orderId, next);
      onStatusChange(orderId, next);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={isDisabled}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all select-none ${cfg.pill} ${
          isDisabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-80 cursor-pointer active:scale-95"
        }`}
      >
        {loading ? <Loader2 size={10} className="animate-spin shrink-0" /> : <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
        {loading ? "..." : cfg.label}
        {!isDisabled && <ChevronDown size={10} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div ref={dropdownRef} style={{ top: pos.top, left: pos.left }} className="fixed z-[9999] bg-neutral-light border border-neutral rounded-xl shadow-xl py-1.5 min-w-[180px] overflow-hidden">
            {/* Header */}
            <p className="px-3 py-1.5 text-[10px] font-semibold text-neutral-dark uppercase tracking-wider border-b border-neutral mb-1">Chuyển trạng thái</p>

            {nextStatuses.map((s) => {
              const c = ORDER_STATUS_CONFIG[s];
              const isCancel = s === "CANCELLED";
              return (
                <button
                  key={s}
                  onClick={() => handleSelect(s)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                    isCancel ? "hover:bg-red-50 text-red-600" : "hover:bg-neutral-light-active text-primary"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                  <span className="font-medium">{c.label}</span>
                  {!isCancel && <span className="ml-auto text-[10px] text-neutral-dark">→</span>}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
