"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToasty } from "@/components/Toast";
import { ShippingSectionProps } from "../types";
import { inputCls } from "../helpers/styles";
import Select from "react-select";

// ─── Validators ───────────────────────────────────────────────────────────────

const PHONE_REGEX = /^(0[35789])\d{8}$/;

function validatePhone(value: string): string | null {
  if (!value) return "Vui lòng nhập số điện thoại";
  if (value.length !== 10) return "Số điện thoại phải có đúng 10 chữ số";
  if (!PHONE_REGEX.test(value)) return "Số điện thoại không hợp lệ (đầu số 03, 05, 07, 08, 09)";
  return null;
}

function validateName(value: string): string | null {
  if (!value.trim()) return "Vui lòng nhập họ tên";
  if (value.trim().length < 2) return "Họ tên phải có ít nhất 2 ký tự";
  return null;
}

/**
 * Số nhà / toà nhà: phải có ít nhất 1 chữ số (e.g. "42", "42B", "Lô 5")
 */
function validateHouseNumber(value: string): string | null {
  if (!value.trim()) return "Vui lòng nhập số nhà / tòa nhà";
  if (!/\d/.test(value)) return "Số nhà phải chứa ít nhất một chữ số (VD: 42, 42B, Lô 5)";
  return null;
}

/**
 * Tên đường: phải có ít nhất 3 ký tự và chứa chữ cái.
 */
function validateStreetName(value: string): string | null {
  if (!value.trim()) return "Vui lòng nhập tên đường / khu vực";
  if (value.trim().length < 3) return "Tên đường quá ngắn";
  if (!/[a-zA-ZÀ-ỹ]/.test(value)) return "Tên đường phải chứa chữ cái (VD: Nguyễn Trãi, Lê Lợi)";
  return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldKey = "contactName" | "contactPhone" | "houseNumber" | "streetName" | "provinceId" | "wardId";

type FieldBoolMap = Record<FieldKey, boolean>;
type ErrorsMap = Record<FieldKey, string | null>;

// ─── renderErrorMsg (outside component — avoids "create during render") ───────

function renderErrorMsg(field: FieldKey, errors: ErrorsMap) {
  if (!errors[field]) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <span aria-hidden="true">⚠</span>
      <span>{errors[field]}</span>
    </p>
  );
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

function SearchableSelect({ value, options, placeholder = "Chọn...", isLoading = false, disabled = false, hasError = false, isValid = false, onChange, onBlur }: SearchableSelectProps) {
  const selectOptions = options.map((o) => ({ value: o.id, label: o.fullName }));
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
          borderColor: hasError ? "#f87171" : isValid ? "#4ade80" : state.isFocused ? "rgb(var(--accent))" : "rgb(var(--neutral))",
          boxShadow: state.isFocused ? "0 0 0 2px rgb(var(--accent) / 0.2)" : "none",
          backgroundColor: "rgb(var(--neutral-light))",
          "&:hover": {
            borderColor: hasError ? "#f87171" : isValid ? "#4ade80" : "rgb(var(--neutral-dark))",
          },
          fontSize: "14px",
          cursor: disabled ? "not-allowed" : "default",
        }),
        valueContainer: (base) => ({ ...base, padding: "0 12px" }),
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
          backgroundColor: state.isSelected ? "rgb(var(--accent))" : state.isFocused ? "rgb(var(--neutral))" : "transparent",
          color: state.isSelected ? "#fff" : "rgb(var(--primary))",
          cursor: "pointer",
          "&:active": { backgroundColor: "rgb(var(--accent) / 0.8)" },
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

/**
 * BREAKING CHANGE – prop update required in types.ts + parent:
 *
 *   REMOVED:  detailAddress: string
 *             onDetailAddressChange: (v: string) => void
 *
 *   ADDED:    houseNumber: string          e.g. "42B", "Lô 5", "Căn hộ 08"
 *             streetName: string           e.g. "Nguyễn Trãi", "KDC Vạn Phúc"
 *             onHouseNumberChange: (v: string) => void
 *             onStreetNameChange:  (v: string) => void
 *
 *   In the parent, combine before submit:
 *     const detailAddress = `${houseNumber.trim()} ${streetName.trim()}`.trim()
 */
export default function ShippingSection({
  isLoadingAddresses,
  savedAddresses,
  showManualForm,
  selectedSavedAddress,
  contactName,
  contactPhone,
  provinceId,
  wardId,
  houseNumber,
  streetName,
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
  onHouseNumberChange,
  onStreetNameChange,
  onWantSaveAddressChange,
  onEditAddress,
}: ShippingSectionProps) {
  // Initialise dirty from existing prop values so pre-filled fields validate correctly
  const [dirty, setDirty] = useState<FieldBoolMap>({
    contactName: contactName.length > 0,
    contactPhone: contactPhone.length > 0,
    houseNumber: houseNumber.length > 0,
    streetName: streetName.length > 0,
    provinceId: !!provinceId,
    wardId: !!wardId,
  });

  const [touched, setTouched] = useState<FieldBoolMap>({
    contactName: false,
    contactPhone: false,
    houseNumber: false,
    streetName: false,
    provinceId: false,
    wardId: false,
  });

  const shouldShow = (field: FieldKey) => touched[field] && dirty[field];

  const errors: ErrorsMap = {
    contactName: shouldShow("contactName") ? validateName(contactName) : null,
    contactPhone: shouldShow("contactPhone") ? validatePhone(contactPhone) : null,
    houseNumber: shouldShow("houseNumber") ? validateHouseNumber(houseNumber) : null,
    streetName: shouldShow("streetName") ? validateStreetName(streetName) : null,
    provinceId: shouldShow("provinceId") && !provinceId ? "Vui lòng chọn tỉnh / thành phố" : null,
    wardId: shouldShow("wardId") && !wardId ? "Vui lòng chọn phường / xã" : null,
  };

  const handleBlur = (field: FieldKey) => setTouched((p) => ({ ...p, [field]: true }));

  /** Fully type-safe — no implicit any */
  const fieldInputCls = (field: FieldKey): string => {
    const state = errors[field] ? "border-red-400 focus:border-red-400" : dirty[field] && touched[field] ? "border-green-400 focus:border-green-400" : "border-neutral focus:border-accent";
    return `${inputCls} ${state}`;
  };

  const hasNoAddresses = savedAddresses.length === 0;

  // Address preview — assembled from the two split fields + ward/province
  const previewAddress = [[houseNumber.trim(), streetName.trim()].filter(Boolean).join(" "), wards.find((w) => w.id === wardId)?.fullName, provinces.find((p) => p.id === provinceId)?.fullName]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-neutral-light rounded-lg p-2 sm:p-3 border border-neutral">
      <h2 className="text-sm sm:text-base font-semibold text-primary mb-4">Thông tin giao hàng</h2>

      {isLoadingAddresses ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-neutral-dark">
          <Loader2 size={16} className="animate-spin" />
          Đang tải...
        </div>
      ) : (
        <>
          {/* ── Saved address list ── */}
          {!showManualForm && !hasNoAddresses && (
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
                            selectedSavedAddress?.id === addr.id ? "border-accent bg-accent" : "border-neutral-dark"
                          }`}
                        >
                          {selectedSavedAddress?.id === addr.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-primary">{addr.contactName}</span>
                            <span className="text-sm text-neutral-darker">(+84) {addr.phone.replace(/^0/, "")}</span>
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
                        <p className="text-sm text-neutral-darker mt-0.5">{addr.detailAddress}</p>
                        <p className="text-sm text-neutral-darker">
                          {addr.ward?.fullName}, {addr.province?.fullName}
                        </p>
                        <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 border border-accent text-accent rounded">Mặc định</span>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}

          {/* ── Empty state ── */}
          {!showManualForm && hasNoAddresses && <p className="text-sm text-neutral-dark text-center py-4">Chưa có địa chỉ nào được lưu</p>}

          {/* ── Toggle / Manual form ── */}
          {!showManualForm ? (
            <button
              type="button"
              onClick={onShowManualForm}
              className="flex items-center gap-1.5 text-sm text-accent underline transition-colors cursor-pointer mt-1 focus:outline-none focus:underline"
            >
              {hasNoAddresses ? "+ Thêm địa chỉ mới" : "+ Nhập địa chỉ khác"}
            </button>
          ) : (
            <>
              {!hasNoAddresses && (
                <button
                  type="button"
                  onClick={onBackToSaved}
                  className="flex items-center gap-1.5 text-[14px] text-accent hover:text-primary transition-colors cursor-pointer mb-4 focus:outline-none underline"
                >
                  ← Chọn từ địa chỉ đã lưu
                </button>
              )}

              {/* ── Họ tên + Số điện thoại ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[15px] font-medium text-neutral-darker mb-1.5">
                    Họ tên người nhận <span className="text-promotion">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => {
                      onContactNameChange(e.target.value);
                      if (e.target.value.length > 0) setDirty((p) => ({ ...p, contactName: true }));
                    }}
                    onBlur={() => handleBlur("contactName")}
                    placeholder="Nguyễn Văn A"
                    className={fieldInputCls("contactName")}
                  />
                  {renderErrorMsg("contactName", errors)}
                </div>

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
                      if (raw.length > 0) setDirty((p) => ({ ...p, contactPhone: true }));
                    }}
                    onBlur={() => handleBlur("contactPhone")}
                    placeholder="0901234567"
                    maxLength={10}
                    className={fieldInputCls("contactPhone")}
                  />
                  {renderErrorMsg("contactPhone", errors)}
                </div>
              </div>

              {/* ── Tỉnh / Thành phố + Phường / Xã ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[15px] font-medium text-neutral-darker mb-1.5">
                    Tỉnh / Thành phố <span className="text-promotion">*</span>
                  </label>
                  <SearchableSelect
                    value={provinceId}
                    options={provinces}
                    placeholder="Chọn tỉnh / thành"
                    isLoading={isLoadingProvinces}
                    hasError={!!errors.provinceId}
                    isValid={dirty.provinceId && touched.provinceId && !errors.provinceId}
                    onChange={(v) => {
                      onProvinceChange(v);
                      setDirty((p) => ({ ...p, provinceId: true }));
                    }}
                    onBlur={() => handleBlur("provinceId")}
                  />
                  {renderErrorMsg("provinceId", errors)}
                </div>

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
                    isValid={dirty.wardId && touched.wardId && !errors.wardId}
                    onChange={(v) => {
                      onWardChange(v);
                      setDirty((p) => ({ ...p, wardId: true }));
                    }}
                    onBlur={() => handleBlur("wardId")}
                  />
                  {renderErrorMsg("wardId", errors)}
                </div>
              </div>

              {/* ── Địa chỉ chi tiết: 2 field tách biệt ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[15px] font-medium text-neutral-darker mb-1.5">
                    Số nhà / Tòa nhà <span className="text-promotion">*</span>
                  </label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => {
                      onHouseNumberChange(e.target.value);
                      if (e.target.value.length > 0) setDirty((p) => ({ ...p, houseNumber: true }));
                    }}
                    onBlur={() => handleBlur("houseNumber")}
                    placeholder="VD: 42, 42B, Lô 5, Căn hộ 08"
                    className={fieldInputCls("houseNumber")}
                  />
                  {renderErrorMsg("houseNumber", errors)}
                </div>

                <div>
                  <label className="block text-[15px] font-medium text-neutral-darker mb-1.5">
                    Tên đường / Khu vực <span className="text-promotion">*</span>
                  </label>
                  <input
                    type="text"
                    value={streetName}
                    onChange={(e) => {
                      onStreetNameChange(e.target.value);
                      if (e.target.value.length > 0) setDirty((p) => ({ ...p, streetName: true }));
                    }}
                    onBlur={() => handleBlur("streetName")}
                    placeholder="VD: Nguyễn Trãi, KDC Vạn Phúc"
                    className={fieldInputCls("streetName")}
                  />
                  {renderErrorMsg("streetName", errors)}
                </div>
              </div>

              {/* ── Address preview: user tự kiểm tra trước submit ── */}
              {previewAddress && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-neutral border border-dashed border-neutral-dark/30 text-[13px] text-neutral-darker leading-relaxed">
                  <span className="font-semibold text-primary">📍 Địa chỉ nhận hàng: </span>
                  {previewAddress}
                </div>
              )}

              {/* ── Lưu địa chỉ ── */}
              <div className="flex items-center gap-4 pt-2 border-t border-neutral mt-1">
                <span className="text-[14px] text-neutral-darker">Bạn có muốn lưu địa chỉ này không?</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[14px] text-primary">
                  <input type="radio" name={`saveAddress-${instanceId}`} checked={wantSaveAddress === false} onChange={() => onWantSaveAddressChange(false)} className="accent-accent" />
                  Không
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[14px] text-primary">
                  <input type="radio" name={`saveAddress-${instanceId}`} checked={wantSaveAddress === true} onChange={() => onWantSaveAddressChange(true)} className="accent-accent" />
                  Có
                </label>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
