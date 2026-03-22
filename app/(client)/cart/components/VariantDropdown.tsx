"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";

export interface VariantOption {
   id: string;
   colorLabel: string;
   storageLabel: string;
   price: number;
   finalPrice?: number;
   imageUrl?: string;
   available: boolean;
   colorValue?: string;
}

interface VariantDropdownProps {
   triggerLabel: string;
   options: VariantOption[];
   selectedId: string;
   isOpen: boolean;
   isFetching: boolean;
   productName: string;
   isChanging: boolean;
   errorMessage: string | null;
   onToggle: () => void;
   onSelect: (variant: VariantOption) => void;
   onRetry: () => void;
}

// ─── Shared option grid ──────────────────────────────────────────────────────
function OptionGrid({
   options,
   selectedId,
   isFetching,
   errorMessage,
   onSelect,
   onRetry,
}: {
   options: VariantOption[];
   selectedId: string;
   isFetching: boolean;
   errorMessage: string | null;
   onSelect: (v: VariantOption) => void;
   onRetry: () => void;
}) {
   const showList = !isFetching && !errorMessage && options.length > 0;
   const showEmpty = !isFetching && !errorMessage && options.length === 0;

   return (
      <>
         {isFetching && (
            <div className="flex items-center justify-center gap-2 py-5 px-4">
               <Loader2 className="h-4 w-4 animate-spin text-accent" />
               <span className="text-xs text-neutral-darker">
                  Đang tải biến thể...
               </span>
            </div>
         )}

         {errorMessage && !isFetching && (
            <div className="py-4 px-4 text-center">
               <p className="text-xs text-red-500 mb-2">{errorMessage}</p>
               <button
                  type="button"
                  onClick={onRetry}
                  className="text-xs text-accent underline hover:text-accent-hover transition"
               >
                  Thử lại
               </button>
            </div>
         )}

         {showEmpty && (
            <div className="py-5 px-4 text-center">
               <p className="text-xs text-neutral-dark">
                  Không có biến thể khác
               </p>
            </div>
         )}

         {showList && (
            <div className="grid grid-cols-3 gap-2">
               {options.map((variant) => {
                  const isSelected = variant.id === selectedId;
                  const isOutOfStock = !variant.available;

                  return (
                     <button
                        key={variant.id}
                        type="button"
                        onClick={() => onSelect(variant)}
                        disabled={isOutOfStock}
                        title={variant.colorLabel}
                        className={`cursor-pointer relative flex flex-row items-center gap-1.5 rounded-lg border-2 overflow-hidden transition-all w-full
                           ${isSelected ? "border-accent" : "border-neutral bg-neutral-light hover:border-neutral-dark"}
                           ${isOutOfStock ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                     >
                        {/* Product image */}
                        {variant.imageUrl ? (
                           <img
                              src={variant.imageUrl}
                              alt={variant.colorLabel}
                              className="w-9 h-11 object-contain shrink-0"
                           />
                        ) : (
                           <div
                              className="w-9 h-11 rounded shrink-0"
                              style={{
                                 backgroundColor: variant.colorValue ?? "#ccc",
                              }}
                           />
                        )}

                        {/* Label */}
                        <span
                           className={`text-[11px] sm:text-[12px] font-medium leading-tight line-clamp-2
                              ${isSelected ? "text-primary" : "text-neutral-darker"}`}
                        >
                           {variant.colorLabel}
                        </span>

                        {/* Selected ribbon */}
                        {isSelected && (
                           <span
                              className="absolute top-0 right-0 w-0 h-0
                                 border-t-[18px] border-t-accent
                                 border-l-[18px] border-l-transparent"
                           />
                        )}

                        {/* Out of stock overlay */}
                        {isOutOfStock && (
                           <div className="absolute inset-0 bg-neutral-light/80 flex items-center justify-center">
                              <span className="text-[13px] text-promotion font-semibold">
                                 Hết hàng
                              </span>
                           </div>
                        )}
                     </button>
                  );
               })}
            </div>
         )}
      </>
   );
}

function BottomSheet({
   isOpen,
   onClose,
   title,
   children,
   productName,
}: {
   isOpen: boolean;
   onClose: () => void;
   title: string;
   productName?: string; // ← thêm
   children: React.ReactNode;
}) {
   const sheetRef = useRef<HTMLDivElement>(null);

   // Drag-to-close state
   const dragStartY = useRef<number | null>(null);
   const dragDelta = useRef(0);
   const [dragging, setDragging] = useState(false);
   const [translateY, setTranslateY] = useState(0);

   // Lock body scroll when open
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "";
         setTranslateY(0);
      }
      return () => {
         document.body.style.overflow = "";
      };
   }, [isOpen]);

   const handlePointerDown = (e: React.PointerEvent) => {
      dragStartY.current = e.clientY;
      dragDelta.current = 0;
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
   };

   const handlePointerMove = (e: React.PointerEvent) => {
      if (dragStartY.current === null) return;
      const delta = Math.max(0, e.clientY - dragStartY.current);
      dragDelta.current = delta;
      setTranslateY(delta);
   };

   const handlePointerUp = () => {
      setDragging(false);
      if (dragDelta.current > 100) {
         onClose();
      } else {
         setTranslateY(0);
      }
      dragStartY.current = null;
   };

   return (
      <>
         {/* Overlay */}
         <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300
               ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={onClose}
            aria-hidden="true"
         />

         <div
            ref={sheetRef}
            className={`fixed bottom-0 left-0 right-0 z-50
               bg-white rounded-t-2xl shadow-2xl
               flex flex-col
               transition-transform
               ${dragging ? "" : "duration-300 ease-out"}
               ${isOpen ? "" : "translate-y-full"}
            `}
            style={{
               transform: isOpen
                  ? `translateY(${translateY}px)`
                  : "translateY(100%)",
               maxHeight: "85dvh",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
         >
            {/* Drag handle */}
            <div
               className="flex-shrink-0 flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none touch-none"
               onPointerDown={handlePointerDown}
               onPointerMove={handlePointerMove}
               onPointerUp={handlePointerUp}
            >
               <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100">
               <span className="text-base font-semibold text-gray-800">
                  {title}
               </span>{" "}
               {productName && (
                  <span className="text-base text-primary line-clamp-1">
                     {productName}
                  </span>
               )}
               <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
                  aria-label="Đóng"
               >
                  <X className="w-4 h-4 text-gray-600" />
               </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
               {children}
            </div>
         </div>
      </>
   );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function VariantDropdown({
   triggerLabel,
   options,
   selectedId,
   isOpen,
   isFetching,
   isChanging,
   errorMessage,
   productName,
   onToggle,
   onSelect,
   onRetry,
}: VariantDropdownProps) {
   const containerRef = useRef<HTMLDivElement>(null);
   const panelRef = useRef<HTMLDivElement>(null);

   const [isMobile, setIsMobile] = useState(false);
   useEffect(() => {
      const mq = window.matchMedia("(max-width: 767px)");
      setIsMobile(mq.matches);
      const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
   }, []);

   // ── Click outside để đóng desktop dropdown ──────────────────────────────
   useEffect(() => {
      if (isMobile || !isOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
         if (
            containerRef.current &&
            !containerRef.current.contains(e.target as Node)
         ) {
            onToggle();
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, [isMobile, isOpen, onToggle]);

   // Reposition desktop dropdown
   useEffect(() => {
      if (isMobile || !isOpen || !panelRef.current) return;
      const panel = panelRef.current;
      panel.style.left = "0";
      panel.style.right = "auto";
      const rect = panel.getBoundingClientRect();
      if (rect.right > window.innerWidth - 8) {
         panel.style.left = "auto";
         panel.style.right = "0";
      }
   }, [isOpen, options, isMobile]);

   const handleSelect = (variant: VariantOption) => {
      onSelect(variant);
      // Đóng sau khi select — cả desktop lẫn mobile
      if (isOpen) onToggle();
   };

   const sharedContent = (
      <OptionGrid
         options={options}
         selectedId={selectedId}
         isFetching={isFetching}
         errorMessage={errorMessage}
         onSelect={handleSelect}
         onRetry={onRetry}
      />
   );

   return (
      <>
         {/* ── Trigger button (always visible) ── */}
         <div ref={containerRef} className="relative inline-block mb-2">
            <button
               type="button"
               onClick={onToggle}
               disabled={isChanging}
               aria-haspopup="listbox"
               aria-expanded={isOpen}
               className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 text-xs
                  border border-neutral rounded bg-neutral-light
                  hover:border-accent transition-colors duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed
                  max-w-[220px] sm:max-w-none"
            >
               {isChanging ? (
                  <>
                     <Loader2 className="h-3 w-3 animate-spin text-accent shrink-0" />
                     <span className="text-neutral-darker truncate">
                        Đang cập nhật...
                     </span>
                  </>
               ) : isFetching && options.length === 0 ? (
                  <>
                     <Loader2 className="h-3 w-3 animate-spin text-neutral-dark shrink-0" />
                     <span className="text-neutral-darker truncate">
                        {triggerLabel}
                     </span>
                  </>
               ) : (
                  <span className="font-medium text-neutral-darker truncate">
                     {triggerLabel}
                  </span>
               )}
               <ChevronDown
                  className={`h-3 w-3 text-neutral-dark transition-transform duration-200 shrink-0 ${
                     isOpen ? "rotate-180" : ""
                  }`}
               />
            </button>

            {/* ── Desktop dropdown ── */}
            {!isMobile && isOpen && (
               <div
                  ref={panelRef}
                  role="listbox"
                  className="absolute top-full mt-1 z-50
                     bg-neutral-light border border-neutral rounded-lg shadow-lg
                     w-[calc(100vw-16px)] max-w-[300px]"
               >
                  <div className="p-3">{sharedContent}</div>
               </div>
            )}
         </div>

         {/* ── Mobile bottom sheet ── */}
         {isMobile && (
            <BottomSheet
               isOpen={isOpen}
               onClose={onToggle}
               title="Màu"
               productName={productName}
            >
               {sharedContent}
            </BottomSheet>
         )}
      </>
   );
}
