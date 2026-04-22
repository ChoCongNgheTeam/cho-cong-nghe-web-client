"use client";
import React, { useState } from "react";
import { Loader2, MapPin, Plus, Pencil } from "lucide-react";
import { ShippingSectionProps } from "../types";
import { inputCls } from "../helpers/styles";
import Select from "react-select";

// ─── Validators ──────────────────────────────────────────────────────────────
const phoneRe = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const isValidPhone = (v: string) => phoneRe.test(v.trim());

// ─── Component ───────────────────────────────────────────────────────────────
export default function ShippingSection({
  isLoadingAddresses,
  savedAddresses,
  showManualForm,
  selectedSavedAddress,
  contactName,
  contactPhone,
  provinceCode,
  wardCode,
  provinces,
  wards,
  isLoadingProvinces,
  isLoadingWards,
  wantSaveAddress,
  instanceId,
  onSelectSavedAddress,
  onShowManualForm,
  onBackToSaved,
  onContactNameChange,
  onContactPhoneChange,
  onProvinceChange,
  onWardChange,
  onWantSaveAddressChange,
  onEditAddress,
  houseNumber,
  streetName,
  onHouseNumberChange,
  onStreetNameChange,
}: ShippingSectionProps) {
  const [touchedPhone, setTouchedPhone] = useState(false);

  const provinceOptions = provinces.map((p) => ({
    value: p.code,
    label: p.fullName,
  }));

  const wardOptions = wards.map((w) => ({
    value: w.code,
    label: w.fullName,
  }));

  const selectedProvinceOption =
    provinceOptions.find((o) => o.value === provinceCode) ?? null;

  const selectedWardOption =
    wardOptions.find((o) => o.value === wardCode) ?? null;

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: state.isFocused ? "#000" : "#e5e7eb",
      boxShadow: "none",
      "&:hover": { borderColor: "#000" },
      borderRadius: "0.5rem",
      minHeight: "42px",
      fontSize: "0.875rem",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#000"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "#fff" : "#111",
      fontSize: "0.875rem",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9ca3af",
      fontSize: "0.875rem",
    }),
  };

  // ─── Inner content ────────────────────────────────────────────────────────
  const renderContent = () => {
    // Loading state
    if (isLoadingAddresses) {
      return (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-6 justify-center">
          <Loader2 size={16} className="animate-spin" />
          Đang tải địa chỉ...
        </div>
      );
    }

    // Empty state (no saved addresses, not showing form)
    if (!showManualForm && savedAddresses.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-4 gap-3">
          <p className="text-sm text-gray-400">Chưa có địa chỉ nào được lưu</p>
          <button
            type="button"
            onClick={onShowManualForm}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <Plus size={14} />
            Thêm địa chỉ mới
          </button>
        </div>
      );
    }

    // Saved address list
    if (!showManualForm && savedAddresses.length > 0) {
      return (
        <div className="space-y-2">
          {savedAddresses.map((addr) => (
            <label
              key={addr.id}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                selectedSavedAddress?.id === addr.id
                  ? "border-black bg-gray-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name={`saved-address-${instanceId}`}
                checked={selectedSavedAddress?.id === addr.id}
                onChange={() => onSelectSavedAddress(addr)}
                className="mt-0.5 accent-black shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-0.5">
                  <span className="font-medium text-sm">{addr.contactName}</span>
                  <span className="text-gray-400 text-xs">{addr.phone}</span>
                  {addr.isDefault && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{addr.fullAddress}</p>
              </div>
              {selectedSavedAddress?.id === addr.id && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onEditAddress();
                  }}
                  className="shrink-0 text-gray-400 hover:text-black transition-colors"
                  title="Sửa địa chỉ"
                >
                  <Pencil size={14} />
                </button>
              )}
            </label>
          ))}

          <button
            type="button"
            onClick={onShowManualForm}
            className="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            Dùng địa chỉ khác
          </button>
        </div>
      );
    }

    // Manual form
    return (
      <div className="space-y-4">
        {savedAddresses.length > 0 && (
          <button
            type="button"
            onClick={onBackToSaved}
            className="text-sm text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
          >
            ← Dùng địa chỉ đã lưu
          </button>
        )}

        {/* Row 1: Họ tên + Số điện thoại */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Họ tên người nhận <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls}
              value={contactName}
              onChange={(e) => onContactNameChange(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              className={`${inputCls} ${
                touchedPhone && !isValidPhone(contactPhone)
                  ? "border-red-400"
                  : ""
              }`}
              value={contactPhone}
              onChange={(e) => onContactPhoneChange(e.target.value)}
              onBlur={() => setTouchedPhone(true)}
              placeholder="0901234567"
            />
            {touchedPhone && !isValidPhone(contactPhone) && (
              <p className="text-red-500 text-xs mt-1">
                Số điện thoại không hợp lệ
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Tỉnh/thành + Phường/xã */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tỉnh / Thành phố <span className="text-red-500">*</span>
            </label>
            {isLoadingProvinces ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 border rounded-lg px-3 py-2.5">
                <Loader2 size={14} className="animate-spin" />
                Đang tải...
              </div>
            ) : (
              <Select
                instanceId={`province-${instanceId}`}
                options={provinceOptions}
                value={selectedProvinceOption}
                onChange={(opt) => onProvinceChange(opt?.value ?? "")}
                placeholder="Chọn tỉnh / thành"
                styles={selectStyles}
                isSearchable
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phường / Xã <span className="text-red-500">*</span>
            </label>
            {isLoadingWards ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 border rounded-lg px-3 py-2.5">
                <Loader2 size={14} className="animate-spin" />
                Đang tải...
              </div>
            ) : (
              <Select
                instanceId={`ward-${instanceId}`}
                options={wardOptions}
                value={selectedWardOption}
                onChange={(opt) => onWardChange(opt?.value ?? "")}
                placeholder={
                  provinceCode ? "Chọn phường / xã" : "Chọn tỉnh trước"
                }
                isDisabled={!provinceCode}
                styles={selectStyles}
                isSearchable
              />
            )}
          </div>
        </div>

        {/* Row 3: Số nhà + Tên đường */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Số nhà / Tòa nhà <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls}
              value={houseNumber}
              onChange={(e) => onHouseNumberChange(e.target.value)}
              placeholder="VD: 42, 42B, Lô 5, Căn hộ 08"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tên đường / Khu vực <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls}
              value={streetName}
              onChange={(e) => onStreetNameChange(e.target.value)}
              placeholder="VD: Nguyễn Trãi, KDC Vạn Phúc"
            />
          </div>
        </div>

        {/* Row 4: Lưu địa chỉ */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <span className="text-sm text-gray-600">
            Bạn có muốn lưu địa chỉ này không?
          </span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                name={`save-addr-${instanceId}`}
                checked={wantSaveAddress === false}
                onChange={() => onWantSaveAddressChange(false)}
                className="accent-black"
              />
              Không
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                name={`save-addr-${instanceId}`}
                checked={wantSaveAddress === true}
                onChange={() => onWantSaveAddressChange(true)}
                className="accent-black"
              />
              Có
            </label>
          </div>
        </div>
      </div>
    );
  };

  // ─── Wrapper card (matches other sections on checkout page) ──────────────
  return (
    <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
      <h2 className="text-base font-semibold text-primary mb-4">
        Thông tin giao hàng
      </h2>
      {renderContent()}
    </div>
  );
}