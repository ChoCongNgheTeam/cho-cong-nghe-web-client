"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import apiRequest from "@/lib/api";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { ORDER_STATUS_CONFIG, STATUS_FLOW } from "../const";

export type OrderStatus =
   | "PENDING"
   | "PROCESSING"
   | "SHIPPED"
   | "DELIVERED"
   | "CANCELLED";

interface OrderStatusCellProps {
   orderId: string;
   status: OrderStatus;
   onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderStatusCell({
   orderId,
   status,
   onStatusChange,
}: OrderStatusCellProps) {
   const [open, setOpen] = useState(false);
   const [updating, setUpdating] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [coords, setCoords] = useState({ top: 0, left: 0 });
   const triggerRef = useRef<HTMLButtonElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const DROPDOWN_HEIGHT = 230;

   const calcCoords = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setCoords({
         top:
            spaceBelow < DROPDOWN_HEIGHT
               ? rect.top - DROPDOWN_HEIGHT - 4
               : rect.bottom + 4,
         left: rect.left,
      });
   };

   useEffect(() => {
      if (open) calcCoords();
   }, [open]);

   useEffect(() => {
      if (!open) return;
      window.addEventListener("scroll", calcCoords, true);
      window.addEventListener("resize", calcCoords);
      return () => {
         window.removeEventListener("scroll", calcCoords, true);
         window.removeEventListener("resize", calcCoords);
      };
   }, [open]);

   useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
         const t = e.target as Node;
         if (
            triggerRef.current?.contains(t) ||
            dropdownRef.current?.contains(t)
         )
            return;
         setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, [open]);

   const handleSelect = async (newStatus: OrderStatus) => {
      if (newStatus === status) {
         setOpen(false);
         return;
      }
      setOpen(false);
      setUpdating(true);
      setError(null);
      try {
         await apiRequest.patch(`/orders/admin/${orderId}`, {
            orderStatus: newStatus,
         });
         onStatusChange(orderId, newStatus);
      } catch (e: any) {
         const msg =
            e?.response?.data?.message ?? e?.message ?? "Cập nhật thất bại";
         setError(msg);
         setTimeout(() => setError(null), 3000);
      } finally {
         setUpdating(false);
      }
   };

   const allowedNextStatuses = STATUS_FLOW[status] ?? [];

   if (allowedNextStatuses.length === 0)
      return <OrderStatusBadge status={status} />;

   const cfg = ORDER_STATUS_CONFIG[status];

   return (
      <div className="relative inline-block">
         {/* Trigger */}
         <button
            ref={triggerRef}
            disabled={updating}
            onClick={() => {
               setError(null);
               setOpen((v) => !v);
            }}
            className={`
               inline-flex items-center gap-1.5 px-3 py-1 rounded-full
               text-[12px] font-medium whitespace-nowrap
               transition-all duration-150
               ${cfg.pill}
               ${open ? "ring-2 ring-accent/40 ring-offset-1" : ""}
               ${error ? "ring-2 ring-promotion/50 ring-offset-1" : ""}
               ${updating ? "opacity-60 cursor-wait" : "cursor-pointer hover:opacity-80"}
            `}
         >
            {updating ? (
               <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
               <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`}
               />
            )}
            {cfg.label}
            <ChevronDown
               size={12}
               className={`ml-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
         </button>

         {/* Error toast */}
         {error && (
            <div className="absolute top-full left-0 mt-1.5 z-50 px-3 py-1.5 rounded-lg bg-promotion-light border border-promotion-light-active shadow-sm whitespace-nowrap">
               <span className="text-[11px] text-promotion">{error}</span>
            </div>
         )}

         {/* Portal dropdown — chỉ hiện các status được phép */}
         {open &&
            createPortal(
               <div
                  ref={dropdownRef}
                  style={{
                     position: "fixed",
                     top: coords.top,
                     left: coords.left,
                     zIndex: 9999,
                     minWidth: 210,
                  }}
                  className="rounded-2xl overflow-hidden bg-neutral-light border border-neutral shadow-[0_12px_40px_rgba(0,0,0,0.13)]"
               >
                  {/* Header */}
                  <div className="px-4 py-2.5 border-b border-neutral">
                     <p className="text-[10px] font-semibold text-neutral-dark uppercase tracking-widest">
                        Cập nhật trạng thái
                     </p>
                  </div>

                  {/* Options — chỉ render các bước tiếp theo hợp lệ */}
                  <div className="p-1.5 flex flex-col gap-0.5">
                     {/* Hiển thị trạng thái hiện tại (disabled) */}
                     <button
                        disabled
                        className={`
                           w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
                           text-[13px] font-medium text-left
                           cursor-default opacity-60
                           ${ORDER_STATUS_CONFIG[status].pillSelected}
                        `}
                     >
                        <span
                           className={`w-2 h-2 rounded-full shrink-0 ${ORDER_STATUS_CONFIG[status].dot}`}
                        />
                        <span className="flex-1">
                           {ORDER_STATUS_CONFIG[status].label}
                        </span>
                        <Check size={13} className="text-accent shrink-0" />
                     </button>

                     {/* Divider */}
                     <div className="my-0.5 border-t border-neutral" />

                     {allowedNextStatuses.map((opt) => {
                        const optCfg = ORDER_STATUS_CONFIG[opt];
                        return (
                           <button
                              key={opt}
                              onClick={() => handleSelect(opt)}
                              className={`
                                 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
                                 text-[13px] font-medium text-left
                                 text-primary cursor-pointer transition-colors duration-100
                                 ${optCfg.dropdownHover}
                              `}
                           >
                              <span
                                 className={`w-2 h-2 rounded-full shrink-0 ${optCfg.dot}`}
                              />
                              <span className="flex-1">{optCfg.label}</span>
                           </button>
                        );
                     })}
                  </div>
               </div>,
               document.body,
            )}
      </div>
   );
}
