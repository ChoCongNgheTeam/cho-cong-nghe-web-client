"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { useToasty } from "@/components/Toast";
import { ShippingSectionProps } from "../types";
import { inputCls } from "../helpers/styles";

const PHONE_REGEX = /^(0[3|5|7|8|9])\d{8}$/;

function validatePhone(value: string): string | null {
   if (!value) return "Vui lòng nhập số điện thoại";
   if (value.length !== 10) return "Số điện thoại phải có đúng 10 chữ số";
   if (!PHONE_REGEX.test(value))
      return "Số điện thoại không hợp lệ (03, 05, 07, 08, 09)";
   return null;
}

function validateName(value: string): string | null {
   if (!value.trim()) return "Vui lòng nhập họ tên";
   if (value.trim().length < 2) return "Họ tên phải có ít nhất 2 ký tự";
   return null;
}

function validateAddress(value: string): string | null {
   if (!value.trim()) return "Vui lòng nhập địa chỉ chi tiết";
   if (value.trim().length < 5) return "Địa chỉ quá ngắn";
   return null;
}

// ─── SearchableSelect ─────────────────────────────────────────────────────────

interface SelectOption {
   id: string;
   fullName: string;
}

interface SearchableSelectProps {
   value: string;
   options: SelectOption[];
   placeholder?: string;
   isLoading?: boolean;
   disabled?: boolean;
   hasError?: boolean;
   isValid?: boolean;
   onChange: (value: string) => void;
   onBlur?: () => void;
}

function SearchableSelect({
   value,
   options,
   placeholder = "Chọn...",
   isLoading = false,
   disabled = false,
   hasError = false,
   isValid = false,
   onChange,
   onBlur,
}: SearchableSelectProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [search, setSearch] = useState("");
   const [focusedIdx, setFocusedIdx] = useState(-1);
   const containerRef = useRef<HTMLDivElement>(null);
   const searchRef = useRef<HTMLInputElement>(null);
   const listRef = useRef<HTMLDivElement>(null);

   const selectedLabel = options.find((o) => o.id === value)?.fullName ?? "";

   const filtered = search.trim()
      ? options.filter((o) =>
           o.fullName.toLowerCase().includes(search.toLowerCase()),
        )
      : options;

   // Đóng khi click ra ngoài
   useEffect(() => {
      const handler = (e: MouseEvent) => {
         if (
            containerRef.current &&
            !containerRef.current.contains(e.target as Node)
         ) {
            setIsOpen(false);
            setSearch("");
            setFocusedIdx(-1);
            onBlur?.();
         }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, [onBlur]);

   // Focus search khi mở
   useEffect(() => {
      if (isOpen) {
         setTimeout(() => searchRef.current?.focus(), 50);
         setFocusedIdx(-1);
      }
   }, [isOpen]);

   // Scroll item focused vào view
   useEffect(() => {
      if (focusedIdx < 0 || !listRef.current) return;
      const item = listRef.current.children[focusedIdx] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
   }, [focusedIdx]);

   const handleOpen = () => {
      if (disabled || isLoading) return;
      setIsOpen((prev) => !prev);
      if (!isOpen) setSearch("");
   };

   const handleSelect = (option: SelectOption) => {
      onChange(option.id);
      setIsOpen(false);
      setSearch("");
      setFocusedIdx(-1);
      onBlur?.();
   };

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("");
      setSearch("");
      setFocusedIdx(-1);
      onBlur?.();
   };

   // Keyboard navigation trong search input
   const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
         e.preventDefault();
         setFocusedIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
         e.preventDefault();
         setFocusedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
         e.preventDefault();
         if (focusedIdx >= 0 && filtered[focusedIdx]) {
            handleSelect(filtered[focusedIdx]);
         } else if (filtered.length === 1) {
            // Nếu chỉ còn 1 kết quả, Enter tự chọn luôn
            handleSelect(filtered[0]);
         }
      } else if (e.key === "Escape") {
         setIsOpen(false);
         setSearch("");
         setFocusedIdx(-1);
         onBlur?.();
      }
   };

   const borderCls = hasError
      ? "border-red-400"
      : isValid
        ? "border-green-400"
        : isOpen
          ? "border-accent"
          : "border-neutral hover:border-neutral-dark";

   return (
      <div ref={containerRef} className="relative w-full">
         {/* Trigger */}
         <button
            type="button"
            onClick={handleOpen}
            disabled={disabled || isLoading}
            className={`w-full flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm bg-neutral-light transition-colors
               ${borderCls} ${disabled ? "opacity-60 cursor-not-allowed bg-neutral" : "cursor-pointer"}`}
         >
            {isLoading ? (
               <>
                  <Loader2
                     size={14}
                     className="animate-spin text-neutral-dark shrink-0"
                  />
                  <span className="flex-1 text-left text-neutral-dark truncate">
                     Đang tải...
                  </span>
               </>
            ) : (
               <>
                  <span
                     className={`flex-1 text-left truncate ${selectedLabel ? "text-primary" : "text-neutral-dark"}`}
                  >
                     {selectedLabel || placeholder}
                  </span>
                  {value && !disabled && (
                     <span
                        onClick={handleClear}
                        className="shrink-0 text-neutral-dark hover:text-primary transition-colors"
                     >
                        <X size={13} />
                     </span>
                  )}
               </>
            )}
            <ChevronDown
               size={14}
               className={`shrink-0 text-neutral-dark transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
         </button>

         {/* Dropdown */}
         {isOpen && (
            <div className="absolute left-0 top-full mt-1 w-full z-50 bg-neutral-light border border-neutral rounded-lg shadow-xl overflow-hidden">
               {/* Search */}
               <div className="p-2 border-b border-neutral">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 border border-neutral rounded-md bg-white focus-within:border-accent transition-colors">
                     <Search size={13} className="text-neutral-dark shrink-0" />
                     <input
                        ref={searchRef}
                        type="text"
                        value={search}
                        onChange={(e) => {
                           setSearch(e.target.value);
                           setFocusedIdx(-1);
                        }}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Tìm kiếm..."
                        className="flex-1 text-sm outline-none bg-transparent text-primary placeholder:text-neutral-dark"
                     />
                     {search && (
                        <button
                           type="button"
                           onClick={() => {
                              setSearch("");
                              setFocusedIdx(-1);
                           }}
                        >
                           <X
                              size={12}
                              className="text-neutral-dark hover:text-primary"
                           />
                        </button>
                     )}
                  </div>
               </div>

               {/* List */}
               <div ref={listRef} className="max-h-52 overflow-y-auto">
                  {filtered.length === 0 ? (
                     <div className="py-6 text-center text-sm text-neutral-dark">
                        Không tìm thấy kết quả
                     </div>
                  ) : (
                     filtered.map((option, idx) => {
                        const isSelected = option.id === value;
                        const isFocused = idx === focusedIdx;
                        const label = option.fullName;
                        const matchIdx = search
                           ? label.toLowerCase().indexOf(search.toLowerCase())
                           : -1;

                        return (
                           <button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelect(option)}
                              className={`w-full text-left px-3 py-2.5 text-sm transition-colors
                                 ${
                                    isSelected
                                       ? "bg-accent/10 text-accent font-medium"
                                       : isFocused
                                         ? "bg-neutral text-primary"
                                         : "hover:bg-neutral text-primary"
                                 }`}
                           >
                              {matchIdx >= 0 && search ? (
                                 <>
                                    {label.slice(0, matchIdx)}
                                    <mark className="bg-yellow-100 text-primary rounded-sm px-0.5">
                                       {label.slice(
                                          matchIdx,
                                          matchIdx + search.length,
                                       )}
                                    </mark>
                                    {label.slice(matchIdx + search.length)}
                                 </>
                              ) : (
                                 label
                              )}
                           </button>
                        );
                     })
                  )}
               </div>
            </div>
         )}
      </div>
   );
}

// ─── ShippingSection ──────────────────────────────────────────────────────────

export default function ShippingSection({
   isLoadingAddresses,
   savedAddresses,
   showManualForm,
   selectedSavedAddress,
   contactName,
   contactPhone,
   provinceId,
   wardId,
   detailAddress,
   provinces,
   wards,
   isLoadingProvinces,
   isLoadingWards,
   wantSaveAddress,
   instanceId = "default",
   onSelectSavedAddress,
   onShowManualForm,
   onBackToSaved,
   onContactNameChange,
   onContactPhoneChange,
   onProvinceChange,
   onWardChange,
   onDetailAddressChange,
   onWantSaveAddressChange,
   onEditAddress,
}: ShippingSectionProps) {
   const toast = useToasty();

   // dirty: đã từng nhập vào field
   const [dirty, setDirty] = useState({
      contactName: false,
      contactPhone: false,
      detailAddress: false,
      provinceId: false,
      wardId: false,
   });

   // touched: đã blur khỏi field
   const [touched, setTouched] = useState({
      contactName: false,
      contactPhone: false,
      detailAddress: false,
      provinceId: false,
      wardId: false,
   });

   // Chỉ hiện lỗi khi đã dirty VÀ đã touched
   const shouldShow = (field: keyof typeof touched) =>
      touched[field] && dirty[field];

   const errors = {
      contactName: shouldShow("contactName") ? validateName(contactName) : null,
      contactPhone: shouldShow("contactPhone")
         ? validatePhone(contactPhone)
         : null,
      detailAddress: shouldShow("detailAddress")
         ? validateAddress(detailAddress)
         : null,
      provinceId:
         shouldShow("provinceId") && !provinceId
            ? "Vui lòng chọn tỉnh / thành phố"
            : null,
      wardId:
         shouldShow("wardId") && !wardId ? "Vui lòng chọn phường / xã" : null,
   };

   const handleBlur = (field: keyof typeof touched) => {
      setTouched((p) => ({ ...p, [field]: true }));
      // Không toast khi blur — chỉ inline error
   };

   // Border class cho text input
   const fieldInputCls = (field: keyof typeof errors) => {
      const state = errors[field]
         ? "border-red-400 focus:border-red-400"
         : dirty[field] && touched[field]
           ? "border-green-400 focus:border-green-400"
           : "border-neutral focus:border-accent";
      return `${inputCls} ${state}`;
   };

   // Inline error text
   const ErrorMsg = ({ field }: { field: keyof typeof errors }) =>
      errors[field] ? (
         <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <span>⚠</span> {errors[field]}
         </p>
      ) : null;

   return (
      <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
         <h2 className="text-sm sm:text-base font-semibold text-primary mb-4">
            Thông tin giao hàng
         </h2>

         {isLoadingAddresses ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-neutral-dark">
               <Loader2 size={16} className="animate-spin" /> Đang tải...
            </div>
         ) : savedAddresses.length === 0 && !showManualForm ? (
            <p className="text-sm text-neutral-dark text-center py-4">
               Chưa có địa chỉ nào được lưu
            </p>
         ) : (
            !showManualForm && (
               <ul className="divide-y divide-neutral mb-4">
                  {savedAddresses
                     .filter((addr) => addr.isDefault)
                     .map((addr) => (
                        <li key={addr.id}>
                           <div
                              onClick={() => onSelectSavedAddress(addr)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                 if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSelectSavedAddress(addr);
                                 }
                              }}
                              className="w-full text-left px-2 py-3 hover:bg-neutral/50 transition-colors cursor-pointer flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
                           >
                              <div className="shrink-0 mt-0.5">
                                 <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                       selectedSavedAddress?.id === addr.id
                                          ? "border-accent bg-accent"
                                          : "border-neutral-dark"
                                    }`}
                                 >
                                    {selectedSavedAddress?.id === addr.id && (
                                       <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                 </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                       <span className="text-sm font-semibold text-primary">
                                          {addr.contactName}
                                       </span>
                                       <span className="text-sm text-neutral-darker">
                                          (+84) {addr.phone.replace(/^0/, "")}
                                       </span>
                                    </div>
                                    <button
                                       type="button"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          onEditAddress();
                                       }}
                                       className="shrink-0 text-base text-neutral-darker hover:text-primary transition-colors focus:outline-none focus:underline"
                                    >
                                       Sửa
                                    </button>
                                 </div>
                                 <p className="text-sm text-neutral-darker mt-0.5">
                                    {addr.detailAddress}
                                 </p>
                                 <p className="text-sm text-neutral-darker">
                                    {addr.ward?.fullName},{" "}
                                    {addr.province?.fullName}
                                 </p>
                                 <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 border border-accent text-accent rounded">
                                    Mặc định
                                 </span>
                              </div>
                           </div>
                        </li>
                     ))}
               </ul>
            )
         )}

         {!showManualForm ? (
            <button
               type="button"
               onClick={onShowManualForm}
               className="flex items-center gap-1.5 text-sm text-accent underline transition-colors cursor-pointer mt-1 focus:outline-none focus:underline"
            >
               + Nhập địa chỉ khác
            </button>
         ) : (
            <>
               {savedAddresses.length > 0 && (
                  <button
                     type="button"
                     onClick={onBackToSaved}
                     className="flex items-center gap-1.5 text-base text-neutral-darker hover:text-primary transition-colors cursor-pointer mb-4 focus:outline-none underline"
                  >
                     ← Chọn từ địa chỉ đã lưu
                  </button>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* ── Họ tên ── */}
                  <div>
                     <label className="block text-base font-medium text-neutral-darker mb-1.5">
                        Họ tên người nhận{" "}
                        <span className="text-promotion">*</span>
                     </label>
                     <input
                        type="text"
                        value={contactName}
                        onChange={(e) => {
                           onContactNameChange(e.target.value);
                           if (e.target.value.length > 0)
                              setDirty((p) => ({ ...p, contactName: true }));
                        }}
                        onBlur={() => handleBlur("contactName")}
                        placeholder="Nguyễn Văn A"
                        className={fieldInputCls("contactName")}
                     />
                     <ErrorMsg field="contactName" />
                  </div>

                  {/* ── Số điện thoại ── */}
                  <div>
                     <label className="block text-base font-medium text-neutral-darker mb-1.5">
                        Số điện thoại <span className="text-promotion">*</span>
                     </label>
                     <input
                        type="tel"
                        inputMode="numeric"
                        value={contactPhone}
                        onChange={(e) => {
                           const raw = e.target.value.replace(/\D/g, "");
                           onContactPhoneChange(raw);
                           if (raw.length > 0)
                              setDirty((p) => ({ ...p, contactPhone: true }));
                        }}
                        onBlur={() => handleBlur("contactPhone")}
                        placeholder="0901234567"
                        maxLength={10}
                        className={fieldInputCls("contactPhone")}
                     />
                     <ErrorMsg field="contactPhone" />
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* ── Tỉnh / Thành phố ── */}
                  <div>
                     <label className="block text-base font-medium text-neutral-darker mb-1.5">
                        Tỉnh / Thành phố{" "}
                        <span className="text-promotion">*</span>
                     </label>
                     <SearchableSelect
                        value={provinceId}
                        options={provinces}
                        placeholder="Chọn tỉnh / thành"
                        isLoading={isLoadingProvinces}
                        hasError={!!errors.provinceId}
                        isValid={
                           dirty.provinceId &&
                           touched.provinceId &&
                           !errors.provinceId
                        }
                        onChange={(v) => {
                           onProvinceChange(v);
                           setDirty((p) => ({ ...p, provinceId: true }));
                        }}
                        onBlur={() => handleBlur("provinceId")}
                     />
                     <ErrorMsg field="provinceId" />
                  </div>

                  {/* ── Phường / Xã ── */}
                  <div>
                     <label className="block text-base font-medium text-neutral-darker mb-1.5">
                        Phường / Xã <span className="text-promotion">*</span>
                     </label>
                     <SearchableSelect
                        value={wardId}
                        options={wards}
                        placeholder="Chọn phường / xã"
                        isLoading={isLoadingWards}
                        disabled={!provinceId}
                        hasError={!!errors.wardId}
                        isValid={
                           dirty.wardId && touched.wardId && !errors.wardId
                        }
                        onChange={(v) => {
                           onWardChange(v);
                           setDirty((p) => ({ ...p, wardId: true }));
                        }}
                        onBlur={() => handleBlur("wardId")}
                     />
                     <ErrorMsg field="wardId" />
                  </div>
               </div>

               {/* ── Địa chỉ chi tiết ── */}
               <div className="mb-3">
                  <label className="block text-base font-medium text-neutral-darker mb-1.5">
                     Địa chỉ chi tiết <span className="text-promotion">*</span>
                  </label>
                  <input
                     type="text"
                     value={detailAddress}
                     onChange={(e) => {
                        onDetailAddressChange(e.target.value);
                        if (e.target.value.length > 0)
                           setDirty((p) => ({ ...p, detailAddress: true }));
                     }}
                     onBlur={() => handleBlur("detailAddress")}
                     placeholder="Số nhà, tên đường..."
                     className={fieldInputCls("detailAddress")}
                  />
                  <ErrorMsg field="detailAddress" />
               </div>

               {/* ── Hỏi lưu địa chỉ inline ── */}
               <div className="flex items-center gap-4 pt-2 border-t border-neutral mt-1">
                  <span className="text-base text-neutral-darker">
                     Bạn có muốn lưu địa chỉ này không?
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-base text-primary">
                     <input
                        type="radio"
                        name={`saveAddress-${instanceId}`}
                        checked={wantSaveAddress === false}
                        onChange={() => onWantSaveAddressChange(false)}
                        className="accent-accent"
                     />
                     Không
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-base text-primary">
                     <input
                        type="radio"
                        name={`saveAddress-${instanceId}`}
                        checked={wantSaveAddress === true}
                        onChange={() => onWantSaveAddressChange(true)}
                        className="accent-accent"
                     />
                     Có
                  </label>
               </div>
            </>
         )}
      </div>
   );
}
