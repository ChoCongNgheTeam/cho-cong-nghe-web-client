"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, RotateCcw, Loader2, Check } from "lucide-react";
import { PaymentStatus } from "../order.types";
import { PAYMENT_STATUS_CONFIG } from "../const";
import { updatePaymentStatus, confirmManualRefund } from "../_libs/orders";

interface PaymentStatusCellProps {
  orderId: string;
  status: PaymentStatus;
  onStatusChange: (newStatus: PaymentStatus) => void;
}

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  UNPAID: ["PAID"],
  PAID: [],
  REFUND_PENDING: [],
  REFUNDED: [],
};

// ─── Mini-modal xác nhận hoàn tiền ───────────────────────────────────────────
function RefundConfirmModal({
  orderId,
  anchorRect, // null = render ở giữa màn hình (dùng cho detail)
  onClose,
  onConfirmed,
}: {
  orderId: string;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Đóng khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Tính vị trí: nếu có anchorRect thì hiện gần icon, không thì center màn hình
  const style: React.CSSProperties = anchorRect
    ? {
        position: "fixed",
        top: anchorRect.bottom + 6,
        left: Math.min(anchorRect.left, window.innerWidth - 312),
        zIndex: 9999,
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
      };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmManualRefund(orderId, note || undefined);
      onConfirmed();
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <>
      {/* Backdrop mờ nhẹ */}
      <div className="fixed inset-0 z-[9998] bg-black/20" onClick={onClose} />
      {/* Modal box */}
      <div ref={ref} style={style} className="w-[300px] bg-neutral-light border border-neutral rounded-2xl shadow-xl p-5 space-y-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
          <RotateCcw size={17} className="text-amber-700" />
        </div>

        <div>
          <p className="text-[14px] font-semibold text-primary">Xác nhận đã hoàn tiền?</p>
          <p className="text-[12px] text-neutral-dark mt-1 leading-relaxed">
            Xác nhận bạn đã chuyển tiền hoàn lại cho khách. Trạng thái sẽ cập nhật sang <span className="font-medium text-primary">Đã hoàn tiền</span>.
          </p>
        </div>

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú: mã GD, ngân hàng... (tuỳ chọn)"
          className="w-full px-3 py-2 text-[12px] rounded-xl border border-neutral bg-neutral-light-active text-primary placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-neutral text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer">
            Huỷ
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-[12px] font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PaymentStatusCell({ orderId, status, onStatusChange }: PaymentStatusCellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const refundBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cfg = PAYMENT_STATUS_CONFIG[status];
  const nextStatuses = PAYMENT_TRANSITIONS[status];
  const isRefundPending = status === "REFUND_PENDING";
  const isDisabled = loading || (nextStatuses.length === 0 && !isRefundPending);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    if (isDisabled || isRefundPending) return;
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen((v) => !v);
  };

  const handleSelect = async (next: PaymentStatus) => {
    setOpen(false);
    if (next === status) return;
    setLoading(true);
    try {
      await updatePaymentStatus(orderId, next);
      onStatusChange(next);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openRefundModal = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setAnchorRect(rect);
    setShowRefundModal(true);
  };

  return (
    <>
      <div className="inline-flex items-center gap-1.5">
        {/* Badge trạng thái */}
        <button
          ref={btnRef}
          onClick={handleOpen}
          disabled={isDisabled}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all select-none ${cfg.pill} ${
            isDisabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-80 cursor-pointer"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
          {loading ? "..." : cfg.label}
          {!isDisabled && nextStatuses.length > 0 && <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
        </button>

        {/* Icon trigger hoàn tiền — chỉ hiện khi REFUND_PENDING */}
        {isRefundPending && (
          <button
            ref={refundBtnRef}
            onClick={openRefundModal}
            title="Xác nhận đã hoàn tiền thủ công"
            className="w-[22px] h-[22px] rounded-md bg-amber-50 border border-amber-300 flex items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <RotateCcw size={11} className="text-amber-700" />
          </button>
        )}
      </div>

      {/* Dropdown chuyển trạng thái */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div ref={dropdownRef} style={{ top: pos.top, left: pos.left }} className="fixed z-[9999] bg-neutral-light border border-neutral rounded-xl shadow-lg py-1 min-w-[170px]">
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
          </div>,
          document.body,
        )}

      {/* Refund confirm modal */}
      {showRefundModal && (
        <RefundConfirmModal
          orderId={orderId}
          anchorRect={anchorRect}
          onClose={() => setShowRefundModal(false)}
          onConfirmed={() => {
            onStatusChange("REFUNDED");
            setShowRefundModal(false);
          }}
        />
      )}
    </>
  );
}
