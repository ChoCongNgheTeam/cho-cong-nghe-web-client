"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { Loader2 } from "lucide-react";
import { useToasty } from "@/components/Toast";
import { ShippingSectionProps } from "../types";
import { inputCls } from "../helpers/styles";
import Select from "react-select";

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

// ─── ReactSelect wrapper ──────────────────────────────────────────────────────

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
   const selectOptions = options.map((o) => ({
      value: o.id,
      label: o.fullName,
   }));
   const selected = selectOptions.find((o) => o.value === value) ?? null;

   return (
      <Select
         options={selectOptions}
         value={selected}
         onChange={(opt) => onChange(opt?.value ?? "")}
         onBlur={onBlur}
         isLoading={isLoading}
         isDisabled={disabled}
         placeholder={placeholder}
         isClearable
         isSearchable
         noOptionsMessage={() => "Không tìm thấy"}
         loadingMessage={() => "Đang tải..."}
         classNamePrefix="rs"
         styles={{
            control: (base, state) => ({
               ...base,
               minHeight: "42px",
               borderRadius: "0.5rem",
               borderColor: hasError
                  ? "#f87171"
                  : isValid
                    ? "#4ade80"
                    : state.isFocused
                      ? "rgb(var(--accent))"
                      : "rgb(var(--neutral))",
               boxShadow: state.isFocused
                  ? `0 0 0 2px rgb(var(--accent) / 0.2)`
                  : "none",
               backgroundColor: "rgb(var(--neutral-light))",
               "&:hover": {
                  borderColor: hasError
                     ? "#f87171"
                     : isValid
                       ? "#4ade80"
                       : "rgb(var(--neutral-dark))",
               },
               fontSize: "14px",
               cursor: disabled ? "not-allowed" : "default",
            }),
            valueContainer: (base) => ({
               ...base,
               padding: "0 12px",
            }),
            input: (base) => ({
               ...base,
               margin: 0,
               padding: 0,
               color: "rgb(var(--primary))",
            }),
            singleValue: (base) => ({
               ...base,
               color: "rgb(var(--primary))",
               fontSize: "14px",
            }),
            placeholder: (base) => ({
               ...base,
               color: "rgb(var(--neutral-dark))",
               fontSize: "14px",
            }),
            menu: (base) => ({
               ...base,
               borderRadius: "0.5rem",
               marginTop: "4px",
               boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
               border: "1px solid rgb(var(--neutral))",
               backgroundColor: "rgb(var(--neutral-light))",
               zIndex: 9999,
            }),
            menuList: (base) => ({
               ...base,
               maxHeight: "220px",
               overflowY: "auto",
               padding: "4px",
            }),
            option: (base, state) => ({
               ...base,
               borderRadius: "0.375rem",
               fontSize: "14px",
               padding: "8px 12px",
               backgroundColor: state.isSelected
                  ? "rgb(var(--accent))"
                  : state.isFocused
                    ? "rgb(var(--neutral))"
                    : "transparent",
               color: state.isSelected ? "#fff" : "rgb(var(--primary))",
               cursor: "pointer",
               "&:active": {
                  backgroundColor: "rgb(var(--accent) / 0.8)",
               },
            }),
            indicatorSeparator: () => ({ display: "none" }),
            dropdownIndicator: (base) => ({
               ...base,
               color: "rgb(var(--neutral-dark))",
               padding: "0 8px",
            }),
            clearIndicator: (base) => ({
               ...base,
               color: "rgb(var(--neutral-dark))",
               padding: "0 4px",
               "&:hover": { color: "rgb(var(--primary))" },
            }),
            loadingMessage: (base) => ({
               ...base,
               fontSize: "13px",
               color: "rgb(var(--neutral-dark))",
            }),
            noOptionsMessage: (base) => ({
               ...base,
               fontSize: "13px",
               color: "rgb(var(--neutral-dark))",
            }),
         }}
      />
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

   const [dirty, setDirty] = useState({
      contactName: false,
      contactPhone: false,
      detailAddress: false,
      provinceId: false,
      wardId: false,
   });

   const [touched, setTouched] = useState({
      contactName: false,
      contactPhone: false,
      detailAddress: false,
      provinceId: false,
      wardId: false,
   });

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
   };

   const fieldInputCls = (field: keyof typeof errors) => {
      const state = errors[field]
         ? "border-red-400 focus:border-red-400"
         : dirty[field] && touched[field]
           ? "border-green-400 focus:border-green-400"
           : "border-neutral focus:border-accent";
      return `${inputCls} ${state}`;
   };

   const ErrorMsg = ({ field }: { field: keyof typeof errors }) =>
      errors[field] ? (
         <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <span>⚠</span> {errors[field]}
         </p>
      ) : null;

   return (
      <div className="bg-neutral-light rounded-lg p-2 sm:p-3 border border-neutral">
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
                     className="flex items-center gap-1.5 text-[14px] text-accent hover:text-primary transition-colors cursor-pointer mb-4 focus:outline-none underline"
                  >
                     ← Chọn từ địa chỉ đã lưu
                  </button>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* ── Họ tên ── */}
                  <div>
                     <label className="block text-[15px] font-medium text-neutral-darker mb-1.5">
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
                     <label className="block text-[15px] font-medium text-neutral-darker mb-1.5">
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
                              setDirty((p) => ({
                                 ...p,
                                 contactPhone: true,
                              }));
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
                     <label className="block text-[15px] font-medium text-neutral-darker mb-1.5">
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
                     <label className="block text-[15px] font-medium text-neutral-darker mb-1.5">
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
                  <label className="block text-[15px] font-medium text-neutral-darker mb-1.5">
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
                  <span className="text-[14px] text-neutral-darker">
                     Bạn có muốn lưu địa chỉ này không?
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[14px] text-primary">
                     <input
                        type="radio"
                        name={`saveAddress-${instanceId}`}
                        checked={wantSaveAddress === false}
                        onChange={() => onWantSaveAddressChange(false)}
                        className="accent-accent"
                     />
                     Không
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[14px] text-primary">
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
