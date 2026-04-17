"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Loader2, ArrowRightLeft } from "lucide-react";
import { updatePaymentMethod, getActivePaymentMethods, PaymentMethod } from "../_libs/orders";
import { OrderStatus, PaymentStatus } from "../order.types";

interface Props {
  orderId: string;
  currentMethod: { id: string; name: string };
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  onMethodChange: (newMethod: { id: string; name: string }) => void;
}

export function PaymentMethodCell({ orderId, currentMethod, orderStatus, paymentStatus, onMethodChange }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isCOD = currentMethod.name?.toUpperCase().includes("COD") || methods.find((m) => m.id === currentMethod.id)?.code === "COD";

  const canChange = orderStatus !== "DELIVERED" && orderStatus !== "CANCELLED" && paymentStatus !== "PAID" && !isCOD;

  useEffect(() => {
    if (open && methods.length === 0) {
      getActivePaymentMethods().then(setMethods);
    }
  }, [open]);

  // Đóng khi click ngoài
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Đóng khi scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open]);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen((v) => !v);
  };

  const handleSelect = async (method: PaymentMethod) => {
    if (method.id === currentMethod.id) {
      setOpen(false);
      return;
    }
    if (method.code !== "COD") {
      setOpen(false);
      return;
    }
    setSaving(true);
    setOpen(false);
    try {
      await updatePaymentMethod(orderId, method.id);
      onMethodChange({ id: method.id, name: method.name });
    } catch {
      // toast error nếu có
    } finally {
      setSaving(false);
    }
  };

  const codMethods = methods.filter((m) => m.code === "COD");
  if (!canChange) {
    return <span className="text-[12px] text-primary">{currentMethod.name}</span>;
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={saving}
        title="Chuyển sang COD"
        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-neutral
                   text-[12px] text-primary hover:border-accent hover:text-accent
                   transition-all cursor-pointer disabled:opacity-50"
      >
        {saving ? <Loader2 size={12} className="animate-spin" /> : <ArrowRightLeft size={11} />}
        {currentMethod.name}
        <ChevronDown size={11} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        createPortal(
          <div ref={dropdownRef} style={{ top: dropdownPos.top, left: dropdownPos.left }} className="fixed w-52 bg-neutral-light border border-neutral rounded-xl shadow-lg z-[9999] overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b border-neutral bg-neutral-light-active">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Chuyển sang COD</p>
              <p className="text-[11px] text-primary/50 mt-0.5">Dùng khi thanh toán online lỗi</p>
            </div>

            {/* Loading */}
            {methods.length === 0 ? (
              <div className="px-3 py-3 flex items-center gap-2 text-[12px] text-primary/60">
                <Loader2 size={12} className="animate-spin" /> Đang tải...
              </div>
            ) : codMethods.length === 0 ? (
              <div className="px-3 py-3 text-[12px] text-primary/50 text-center">COD không khả dụng</div>
            ) : (
              codMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className="w-full text-left px-3 py-2.5 text-[12px] text-primary
                             hover:bg-accent-light hover:text-accent transition-colors cursor-pointer
                             flex items-center justify-between"
                >
                  <span>{m.name}</span>
                  <span className="text-[10px] text-primary/40">Thanh toán khi nhận hàng</span>
                </button>
              ))
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
