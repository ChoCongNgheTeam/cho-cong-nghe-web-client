"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { PaymentStatus } from "../order.types";
import { PAYMENT_STATUS_CONFIG } from "../const";
import { updatePaymentStatus } from "../_libs/orders";

interface PaymentStatusCellProps {
   orderId: string;
   status: PaymentStatus;
   onStatusChange: (newStatus: PaymentStatus) => void;
}

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  UNPAID: ["PAID", "REFUNDED_PENDING"],
  PAID: ["REFUNDED_PENDING"],
  REFUNDED_PENDING: ["REFUNDED"],
  REFUNDED: [],
};

export function PaymentStatusCell({
   orderId,
   status,
   onStatusChange,
}: PaymentStatusCellProps) {
   const [open, setOpen] = useState(false);
   const [loading, setLoading] = useState(false);
   const [pos, setPos] = useState<{ top: number; left: number }>({
      top: 0,
      left: 0,
   });
   const btnRef = useRef<HTMLButtonElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
         const target = e.target as Node;
         if (
            btnRef.current?.contains(target) ||
            dropdownRef.current?.contains(target)
         )
            return;
         setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, [open]);

   const cfg = PAYMENT_STATUS_CONFIG[status];
   const nextStatuses = PAYMENT_TRANSITIONS[status];
   const isDisabled = loading || nextStatuses.length === 0;

   const handleOpen = () => {
      if (isDisabled) return;
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
               isDisabled
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:opacity-80 cursor-pointer"
            }`}
         >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            {loading ? "..." : cfg.label}
            {!isDisabled && (
               <ChevronDown
                  size={11}
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
               />
            )}
         </button>

         {open &&
            typeof document !== "undefined" &&
            createPortal(
               <div
                  ref={dropdownRef}
                  style={{ top: pos.top, left: pos.left }}
                  className="fixed z-[9999] bg-neutral-light border border-neutral rounded-xl shadow-lg py-1 min-w-[170px]"
               >
                  {nextStatuses.map((s) => {
                     const c = PAYMENT_STATUS_CONFIG[s];
                     return (
                        <button
                           key={s}
                           onClick={() => handleSelect(s)}
                           className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
                        >
                           <span
                              className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`}
                           />
                           {c.label}
                        </button>
                     );
                  })}
               </div>,
               document.body,
            )}
      </>
   );
}
