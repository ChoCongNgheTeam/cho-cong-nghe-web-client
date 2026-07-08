"use client";
import { useState } from "react";
import { Loader2, Plus, Pencil } from "lucide-react";
import { ShippingSectionProps } from "../../_lib";
import { inputCls } from "../../_lib/styles";
import Select, { StylesConfig } from "react-select";

const phoneRe = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const isValidPhone = (v: string) => phoneRe.test(v.trim());

const nameHasDigit = (v: string) => /\d/.test(v);

const addressInvalidChar = (v: string) => /[^a-zA-ZÀ-ỹ0-9\s\/,.]/.test(v);

interface SelectOption {
  value: string;
  label: string;
}

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
  const [touchedName, setTouchedName] = useState(false);
  const [touchedHouse, setTouchedHouse] = useState(false);
  const [touchedStreet, setTouchedStreet] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
    onContactPhoneChange(digitsOnly);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const noDigits = e.target.value.replace(/[0-9]/g, "");
    onContactNameChange(noDigits);
  };

  const handleAddressChange = (raw: string, setter: (v: string) => void) => {
    const cleaned = raw.replace(/[^a-zA-ZÀ-ỹ0-9\s\/,.]/g, "");
    setter(cleaned);
  };

  const provinceOptions = provinces.map((p) => ({
    value: p.code,
    label: p.fullName,
  }));

  const wardOptions = wards.map((w) => ({
    value: w.code,
    label: w.fullName,
  }));

  const selectedProvinceOption = provinceOptions.find((o) => o.value === provinceCode) ?? null;

  const selectedWardOption = wardOptions.find((o) => o.value === wardCode) ?? null;

  const selectStyles: StylesConfig<SelectOption, false> = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "rgb(var(--primary))" : "rgb(var(--neutral))",
      boxShadow: "none",
      "&:hover": { borderColor: "rgb(var(--primary))" },
      borderRadius: "0.5rem",
      minHeight: "42px",
      fontSize: "0.875rem",
      cursor: "pointer",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "rgb(var(--primary))" : state.isFocused ? "rgb(var(--neutral-light-active))" : "rgb(var(--neutral-light))",
      color: state.isSelected ? "rgb(var(--neutral-light))" : "rgb(var(--primary))",
      fontSize: "0.875rem",
      cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: "rgb(var(--neutral-dark))",
      fontSize: "0.875rem",
    }),
  };

  // Loading state
  if (isLoadingAddresses) {
    return (
      <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
        <h2 className="text-base font-semibold text-primary mb-4">Thông tin giao hàng</h2>
        <div className="flex items-center gap-2 text-neutral-dark text-sm py-6 justify-center">
          <Loader2 size={16} className="animate-spin" />
          Đang tải địa chỉ...
        </div>
      </div>
    );
  }

  // Saved address list view
  const renderSavedList = () => (
    <div className="space-y-2">
      {savedAddresses.map((addr) => (
        <label
          key={addr.id}
          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            selectedSavedAddress?.id === addr.id ? "border-primary bg-neutral-light-active" : "border-neutral hover:border-neutral-dark"
          }`}
        >
          <input
            type="radio"
            name={`saved-address-${instanceId}`}
            checked={selectedSavedAddress?.id === addr.id}
            onChange={() => onSelectSavedAddress(addr)}
            className="mt-0.5 accent-accent shrink-0 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-0.5">
              <span className="font-medium text-sm text-primary">{addr.contactName}</span>
              <span className="text-neutral-dark text-xs">{addr.phone}</span>
              {addr.isDefault && <span className="text-xs text-star-color bg-accent-light px-1.5 py-0.5 rounded-full">Mặc định</span>}
            </div>
            <p className="text-xs text-neutral-darker truncate">{addr.fullAddress}</p>
          </div>
          {selectedSavedAddress?.id === addr.id && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onEditAddress();
              }}
              className="shrink-0 text-neutral-dark hover:text-primary transition-colors cursor-pointer"
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
        className="w-full border border-dashed border-neutral-dark rounded-xl py-2.5 text-sm text-neutral-darker hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Plus size={14} />
        Dùng địa chỉ khác
      </button>
    </div>
  );

  // Manual form view
  const renderManualForm = () => (
    <div className="space-y-4">
      {savedAddresses.length > 0 && (
        <button type="button" onClick={onBackToSaved} className="text-sm text-neutral-darker hover:text-primary flex items-center gap-1 transition-colors cursor-pointer">
          ← Dùng địa chỉ đã lưu
        </button>
      )}

      {/* Row 1: Họ tên + Số điện thoại */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-primary">
            Họ tên người nhận <span className="text-promotion">*</span>
          </label>
          <input
            className={`${inputCls} ${touchedName && nameHasDigit(contactName) ? "border-promotion" : ""}`}
            value={contactName}
            onChange={handleNameChange}
            onBlur={() => setTouchedName(true)}
            placeholder="Nguyễn Văn A"
          />
          {touchedName && nameHasDigit(contactName) && <p className="text-promotion text-xs mt-1">Họ tên không được chứa số</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-primary">
            Số điện thoại <span className="text-promotion">*</span>
          </label>
          <input
            className={`${inputCls} ${touchedPhone && !isValidPhone(contactPhone) ? "border-promotion" : ""}`}
            value={contactPhone}
            onChange={handlePhoneChange}
            onBlur={() => setTouchedPhone(true)}
            placeholder="0901234567"
            inputMode="numeric"
            maxLength={10}
          />
          {touchedPhone && !isValidPhone(contactPhone) && (
            <p className="text-promotion text-xs mt-1">{contactPhone.length === 0 ? "Vui lòng nhập số điện thoại" : "Số điện thoại không hợp lệ (VD: 0901234567)"}</p>
          )}
        </div>
      </div>

      {/* Row 2: Tỉnh/thành + Phường/xã */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-primary">
            Tỉnh / Thành phố <span className="text-promotion">*</span>
          </label>
          {isLoadingProvinces ? (
            <div className="flex items-center gap-2 text-sm text-neutral-dark border border-neutral rounded-lg px-3 py-2.5">
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
          <label className="block text-sm font-medium mb-1 text-primary">
            Phường / Xã <span className="text-promotion">*</span>
          </label>
          {isLoadingWards ? (
            <div className="flex items-center gap-2 text-sm text-neutral-dark border border-neutral rounded-lg px-3 py-2.5">
              <Loader2 size={14} className="animate-spin" />
              Đang tải...
            </div>
          ) : (
            <Select
              instanceId={`ward-${instanceId}`}
              options={wardOptions}
              value={selectedWardOption}
              onChange={(opt) => onWardChange(opt?.value ?? "")}
              placeholder={provinceCode ? "Chọn phường / xã" : "Chọn tỉnh trước"}
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
          <label className="block text-sm font-medium mb-1 text-primary">
            Số nhà / Tòa nhà <span className="text-promotion">*</span>
          </label>
          <input
            className={`${inputCls} ${touchedHouse && addressInvalidChar(houseNumber) ? "border-promotion" : ""}`}
            value={houseNumber}
            onChange={(e) => handleAddressChange(e.target.value, onHouseNumberChange)}
            onBlur={() => setTouchedHouse(true)}
            placeholder="VD: 42, 42B, Lô 5, Căn hộ 08"
          />
          {touchedHouse && addressInvalidChar(houseNumber) && <p className="text-promotion text-xs mt-1">Chỉ được nhập chữ, số và các ký tự / , .</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-primary">
            Tên đường / Khu vực <span className="text-promotion">*</span>
          </label>
          <input
            className={`${inputCls} ${touchedStreet && addressInvalidChar(streetName) ? "border-promotion" : ""}`}
            value={streetName}
            onChange={(e) => handleAddressChange(e.target.value, onStreetNameChange)}
            onBlur={() => setTouchedStreet(true)}
            placeholder="VD: Nguyễn Trãi, KDC Vạn Phúc"
          />
          {touchedStreet && addressInvalidChar(streetName) && <p className="text-promotion text-xs mt-1">Chỉ được nhập chữ, số và các ký tự / , .</p>}
        </div>
      </div>

      {/* Row 4: Lưu địa chỉ */}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <span className="text-sm text-neutral-darker">Bạn có muốn lưu địa chỉ này không?</span>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer text-primary">
            <input type="radio" name={`save-addr-${instanceId}`} checked={wantSaveAddress === false} onChange={() => onWantSaveAddressChange(false)} className="accent-accent cursor-pointer" />
            Không
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer text-primary">
            <input type="radio" name={`save-addr-${instanceId}`} checked={wantSaveAddress === true} onChange={() => onWantSaveAddressChange(true)} className="accent-accent cursor-pointer" />
            Có
          </label>
        </div>
      </div>
    </div>
  );

  // Empty state
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-4 gap-3">
      <p className="text-sm text-neutral-dark">Chưa có địa chỉ nào được lưu</p>
      <button type="button" onClick={onShowManualForm} className="text-sm text-accent hover:underline flex items-center gap-1 cursor-pointer">
        <Plus size={14} />
        Thêm địa chỉ mới
      </button>
    </div>
  );

  // Quyết định hiển thị view nào
  const renderContent = () => {
    // Show manual form when explicitly requested
    if (showManualForm) return renderManualForm();
    // No saved addresses → show empty + option to add
    if (savedAddresses.length === 0) return renderEmpty();
    // Has saved addresses → show list
    return renderSavedList();
  };

  return (
    <div className="bg-neutral-light rounded-lg p-4 sm:p-5 border border-neutral">
      <h2 className="text-base font-semibold text-primary mb-4">Thông tin giao hàng</h2>
      {renderContent()}
    </div>
  );
}
