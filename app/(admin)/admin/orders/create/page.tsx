"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Plus, Trash2, Loader2, User, MapPin, Package, CreditCard, Tag, X, AlertCircle, CheckCircle2, ShoppingCart, UserPlus, Users } from "lucide-react";
import Select from "react-select";
import { formatVND } from "@/helpers";
import {
  searchUsers,
  getUserAddresses,
  getProvinces,
  getWards,
  getActivePaymentMethods,
  searchProducts,
  getVariantOptions,
  createOrderAdmin,
  type UserResult,
  type UserAddress,
  type Province,
  type Ward,
  type PaymentMethod,
  type ProductSearchResult,
  type VariantOption,
} from "../_libs/orders";
import { useAdminHref } from "@/hooks/useAdminHref";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface CartItem {
  _key: string;
  productId: string;
  productName: string;
  productThumbnail: string | null;
  variantId: string;
  variantLabel: string;
  variantCode: string;
  unitPrice: number;
  quantity: number;
}

interface SelectOption {
  value: string | number;
  label: string;
}

interface AddrState {
  contactName: string;
  phone: string;
  provinceCode: number | "";
  provinceName: string;
  wardCode: number | "";
  wardName: string;
  houseNumber: string;
  streetName: string;
}

const EMPTY_ADDR: AddrState = {
  contactName: "",
  phone: "",
  provinceCode: "",
  provinceName: "",
  wardCode: "",
  wardName: "",
  houseNumber: "",
  streetName: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

const phoneRe = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const isValidPhone = (v: string) => phoneRe.test(v.trim());
const nameHasDigit = (v: string) => /\d/.test(v);
const addressInvalidChar = (v: string) => /[^a-zA-ZÀ-ỹ0-9\s\/,.]/.test(v);

// ─────────────────────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block mb-1.5">
      {children}
      {required && <span className="text-promotion ml-0.5">*</span>}
    </label>
  );
}

function inputCls(hasError?: boolean) {
  return `w-full px-3 py-2 text-[13px] bg-neutral-light border rounded-xl text-primary placeholder:text-neutral-dark/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all ${hasError ? "border-promotion" : "border-neutral"}`;
}

const rsStyles = (hasError?: boolean) => ({
  control: (b: any) => ({
    ...b,
    borderRadius: "0.75rem",
    borderColor: hasError ? "#ef4444" : "#d1d5db",
    boxShadow: "none",
    background: "var(--color-neutral-light,#fafafa)",
    "&:hover": { borderColor: "#9ca3af" },
    minHeight: "38px",
  }),
  valueContainer: (b: any) => ({ ...b, padding: "0.25rem 0.75rem" }),
  input: (b: any) => ({ ...b, margin: 0, padding: 0, fontSize: "13px" }),
  menu: (b: any) => ({ ...b, borderRadius: "0.75rem", marginTop: 4, boxShadow: "0 10px 15px -3px rgba(0,0,0,.1)", zIndex: 9999 }),
  option: (b: any, s: any) => ({ ...b, background: s.isSelected ? "#6366f1" : s.isFocused ? "#f3f4f6" : "white", color: s.isSelected ? "white" : "#111827", fontSize: "13px", padding: "8px 12px" }),
  singleValue: (b: any) => ({ ...b, fontSize: "13px" }),
  placeholder: (b: any) => ({ ...b, fontSize: "13px", color: "#9ca3af" }),
});

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-light border border-neutral rounded-2xl shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-neutral bg-neutral-light-active/50">
        <span className="text-accent">{icon}</span>
        <p className="text-[13px] font-semibold text-primary">{title}</p>
      </div>
      <div className="px-5 pb-5 pt-4 space-y-4">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADDRESS FORM
// ─────────────────────────────────────────────────────────────────────────────

interface AddressFormProps {
  provinces: Province[];
  wards: Ward[];
  addr: AddrState;
  setAddr: (fn: (p: AddrState) => AddrState) => void;
  errors: Record<string, string>;
  showNamePhone?: boolean;
  touched: Set<string>;
  onTouch: (field: string) => void;
  loadingWards?: boolean;
}

function AddressForm({ provinces, wards, addr, setAddr, errors, showNamePhone, touched, onTouch, loadingWards }: AddressFormProps) {
  const provinceOptions = provinces.map((p) => ({ value: p.code, label: p.name }));
  const wardOptions = wards.map((w) => ({ value: w.code, label: w.name }));
  const selectedProvince = addr.provinceCode ? (provinceOptions.find((o) => o.value === addr.provinceCode) ?? null) : null;
  const selectedWard = addr.wardCode ? (wardOptions.find((o) => o.value === addr.wardCode) ?? null) : null;

  return (
    <div className="space-y-3 p-4 rounded-xl border border-accent/20 bg-accent/5">
      {showNamePhone !== false && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Họ tên người nhận</Label>
            <input
              value={addr.contactName}
              onChange={(e) => setAddr((p) => ({ ...p, contactName: e.target.value }))}
              onBlur={() => onTouch("contactName")}
              placeholder="Nguyễn Văn A"
              className={inputCls(touched.has("contactName") && (!addr.contactName.trim() || nameHasDigit(addr.contactName)))}
            />
            {touched.has("contactName") && !addr.contactName.trim() && <p className="text-[11px] text-promotion mt-1">Họ tên không được trống</p>}
            {touched.has("contactName") && addr.contactName.trim() && nameHasDigit(addr.contactName) && <p className="text-[11px] text-promotion mt-1">Họ tên không được chứa số</p>}
          </div>
          <div>
            <Label required>SĐT người nhận</Label>
            <input
              value={addr.phone}
              onChange={(e) => setAddr((p) => ({ ...p, phone: e.target.value }))}
              onBlur={() => onTouch("addrPhone")}
              placeholder="0912345678"
              className={inputCls(touched.has("addrPhone") && !isValidPhone(addr.phone))}
            />
            {touched.has("addrPhone") && !isValidPhone(addr.phone) && <p className="text-[11px] text-promotion mt-1">SĐT không hợp lệ (VD: 0912345678)</p>}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Tỉnh / Thành phố</Label>
          <Select
            options={provinceOptions}
            value={selectedProvince}
            onChange={(o: any) => {
              setAddr((p) => ({ ...p, provinceCode: o?.value ?? "", provinceName: o?.label ?? "", wardCode: "", wardName: "" }));
              onTouch("province");
            }}
            placeholder="— Chọn tỉnh —"
            isSearchable
            styles={rsStyles(touched.has("province") && !addr.provinceCode)}
            noOptionsMessage={() => "Không tìm thấy"}
          />
          {touched.has("province") && !addr.provinceCode && <p className="text-[11px] text-promotion mt-1">Chọn tỉnh/thành</p>}
        </div>
        <div>
          <Label required>Phường / Xã</Label>
          <Select
            options={wardOptions}
            value={selectedWard}
            onChange={(o: any) => {
              setAddr((p) => ({ ...p, wardCode: o?.value ?? "", wardName: o?.label ?? "" }));
              onTouch("ward");
            }}
            placeholder={loadingWards ? "Đang tải..." : addr.provinceCode ? "— Chọn phường/xã —" : "Chọn tỉnh trước"}
            isDisabled={!addr.provinceCode || loadingWards}
            isSearchable
            styles={rsStyles(touched.has("ward") && !addr.wardCode)}
            noOptionsMessage={() => "Không tìm thấy"}
          />
          {touched.has("ward") && !addr.wardCode && <p className="text-[11px] text-promotion mt-1">Chọn phường/xã</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Số nhà / Tòa nhà</Label>
          <input
            value={addr.houseNumber}
            onChange={(e) => setAddr((p) => ({ ...p, houseNumber: e.target.value }))}
            onBlur={() => onTouch("houseNumber")}
            placeholder="VD: 42, 42B, Lô 5"
            className={inputCls(touched.has("houseNumber") && (!addr.houseNumber.trim() || addressInvalidChar(addr.houseNumber)))}
          />
          {touched.has("houseNumber") && !addr.houseNumber.trim() && <p className="text-[11px] text-promotion mt-1">Số nhà không được trống</p>}
          {touched.has("houseNumber") && addr.houseNumber.trim() && addressInvalidChar(addr.houseNumber) && <p className="text-[11px] text-promotion mt-1">Chỉ nhập chữ, số và / , .</p>}
        </div>
        <div>
          <Label required>Tên đường / Khu vực</Label>
          <input
            value={addr.streetName}
            onChange={(e) => setAddr((p) => ({ ...p, streetName: e.target.value }))}
            onBlur={() => onTouch("streetName")}
            placeholder="VD: Nguyễn Trãi, KDC Vạn Phúc"
            className={inputCls(touched.has("streetName") && (!addr.streetName.trim() || addressInvalidChar(addr.streetName)))}
          />
          {touched.has("streetName") && !addr.streetName.trim() && <p className="text-[11px] text-promotion mt-1">Tên đường không được trống</p>}
          {touched.has("streetName") && addr.streetName.trim() && addressInvalidChar(addr.streetName) && <p className="text-[11px] text-promotion mt-1">Chỉ nhập chữ, số và / , .</p>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART VARIANT SELECTOR — nhúng thẳng vào file này luôn cho tiện
// ─────────────────────────────────────────────────────────────────────────────

const ATTR_LABELS: Record<string, string> = {
  color: "Màu sắc",
  storage: "Dung lượng",
  ram: "RAM",
  bundle: "Phiên bản",
  gpu: "GPU",
  cpu: "CPU",
  size: "Kích thước",
};

/** Lấy attributes map từ variant */
function getAttrs(v: VariantOption): Record<string, { value: string; label: string }> {
  return (v as any).attributes ?? {};
}

/** Lấy thứ tự attr codes từ tất cả variants */
function getAttrCodes(variants: VariantOption[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const v of variants) {
    for (const code of Object.keys(getAttrs(v))) {
      if (!seen.has(code)) {
        seen.add(code);
        order.push(code);
      }
    }
  }
  return order;
}

/**
 * Bundle mode = attrs phụ thuộc lẫn nhau, không thể chọn độc lập.
 * Phát hiện: nếu số combo thực tế < tích Cartesian → bundle.
 * Ví dụ MacBook: 2 GPU × 2 Storage = 4 lý thuyết, thực tế chỉ 2 → bundle.
 */
function isBundleMode(variants: VariantOption[], attrCodes: string[]): boolean {
  const nonColorCodes = attrCodes.filter((c) => c !== "color");
  if (nonColorCodes.length <= 1) return false;

  let cartesian = 1;
  for (const code of nonColorCodes) {
    const uniq = new Set(variants.map((v) => getAttrs(v)[code]?.value).filter(Boolean));
    cartesian *= uniq.size;
  }

  const availableVariants = variants.filter((v) => v.available);
  const combos = new Set(availableVariants.map((v) => nonColorCodes.map((c) => getAttrs(v)[c]?.value ?? "").join("|")));

  return combos.size < cartesian;
}

function VariantPriceRow({ variant, addQty, setAddQty, onAdd }: { variant: VariantOption; addQty: number; setAddQty: (q: number) => void; onAdd: () => void }) {
  const finalPrice = (variant as any).finalPrice ?? variant.price;
  const hasDiscount = ((variant as any).discountPercentage ?? 0) > 0;
  return (
    <div className="flex items-end gap-3 pt-1">
      <div className="flex-1 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50">
        <p className="text-[11px] text-emerald-600 font-mono truncate">{variant.code}</p>
        <p className="text-[15px] font-bold text-accent">{formatVND(finalPrice)}</p>
        {hasDiscount && <p className="text-[11px] text-neutral-dark line-through">{formatVND(variant.price)}</p>}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-1.5">Số lượng</p>
        <div className="flex items-center border border-neutral rounded-xl overflow-hidden w-28">
          <button onClick={() => setAddQty(Math.max(1, addQty - 1))} className="px-3 py-2 hover:bg-neutral-light-active text-[14px] cursor-pointer">
            −
          </button>
          <input
            type="number"
            value={addQty}
            onChange={(e) => setAddQty(Math.max(1, Number(e.target.value)))}
            className="flex-1 text-center text-[13px] bg-transparent border-none outline-none py-2 min-w-0"
          />
          <button onClick={() => setAddQty(addQty + 1)} className="px-3 py-2 hover:bg-neutral-light-active text-[14px] cursor-pointer">
            +
          </button>
        </div>
      </div>
      <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-medium rounded-xl cursor-pointer mb-0.5">
        <ShoppingCart size={14} /> Thêm vào đơn
      </button>
    </div>
  );
}

/** Mode 1: color + storage độc lập → chọn từng attr */
function IndependentAttrSelector({
  variants,
  attrCodes,
  selectedAttrs,
  setSelectedAttrs,
  addQty,
  setAddQty,
  onAddToCart,
}: {
  variants: VariantOption[];
  attrCodes: string[];
  selectedAttrs: Record<string, string>;
  setSelectedAttrs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  addQty: number;
  setAddQty: (q: number) => void;
  onAddToCart: (v: VariantOption) => void;
}) {
  const matchedVariant = useMemo(
    () =>
      variants.find((v) => {
        if (!v.available) return false;
        const vAttrs = getAttrs(v);
        return Object.entries(selectedAttrs).every(([code, sel]) => {
          const val = vAttrs[code]?.value;
          return !val || val === sel;
        });
      }) ?? null,
    [variants, selectedAttrs],
  );

  /**
   * Khi chọn 1 attr mới, tìm variant available tốt nhất khớp với lựa chọn đó.
   * Nếu các attr đang chọn xung đột → tự động điều chỉnh sang giá trị hợp lệ.
   * Ví dụ: đang chọn storage=512GB, click GPU=20core
   * → không có 20core+512GB available → tìm variant 20core+1TB → auto-select storage=1TB
   */
  const handleSelectAttr = (code: string, value: string) => {
    // Thử giữ nguyên tất cả attrs khác trước
    const newAttrs = { ...selectedAttrs, [code]: value };

    // Kiểm tra có variant available không với tổ hợp mới
    const exactMatch = variants.find((v) => {
      if (!v.available) return false;
      const va = getAttrs(v);
      return Object.entries(newAttrs).every(([c, sv]) => {
        const vv = va[c]?.value;
        return !vv || vv === sv;
      });
    });

    if (exactMatch) {
      // Tổ hợp hợp lệ → giữ nguyên
      setSelectedAttrs(newAttrs);
      return;
    }

    // Không có exact match → tìm variant available có attr vừa chọn,
    // rồi lấy toàn bộ attrs của variant đó (auto-adjust các attr xung đột)
    const fallback = variants.find((v) => {
      if (!v.available) return false;
      return getAttrs(v)[code]?.value === value;
    });

    if (fallback) {
      // Lấy toàn bộ attrs của fallback variant
      const fallbackAttrs: Record<string, string> = {};
      for (const [c, { value: val }] of Object.entries(getAttrs(fallback))) {
        fallbackAttrs[c] = val;
      }
      setSelectedAttrs(fallbackAttrs);
    } else {
      // Không tìm được → chỉ set attr đó, để matchedVariant = null
      setSelectedAttrs(newAttrs);
    }
  };

  return (
    <div className="space-y-3">
      {attrCodes.map((code) => {
        const valMap = new Map<string, { value: string; label: string; imageUrl: string | null }>();
        for (const v of variants) {
          const attr = getAttrs(v)[code];
          if (attr && !valMap.has(attr.value)) {
            valMap.set(attr.value, { value: attr.value, label: attr.label, imageUrl: code === "color" ? ((v as any).imageUrl ?? null) : null });
          }
        }
        return (
          <div key={code}>
            <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-2">{ATTR_LABELS[code] ?? code}</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(valMap.values()).map((opt) => {
                const isSelected = selectedAttrs[code] === opt.value;
                // enabled = có ít nhất 1 variant available chứa opt.value này
                // KHÔNG check các attr khác đã chọn — vì khi click sẽ auto-adjust
                const enabled = variants.some((v) => v.available && getAttrs(v)[code]?.value === opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => enabled && setSelectedAttrs((p) => ({ ...p, [code]: opt.value }))}
                    disabled={!enabled}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] transition-all
                      ${
                        !enabled
                          ? "border-neutral/40 text-neutral-dark/40 bg-neutral-light-active/50 cursor-not-allowed line-through"
                          : isSelected
                            ? "border-accent bg-accent/10 text-accent font-semibold cursor-pointer"
                            : "border-neutral hover:border-accent/50 text-primary cursor-pointer"
                      }`}
                  >
                    {code === "color" && opt.imageUrl && <Image src={opt.imageUrl} alt="" width={16} height={16} className={`rounded object-contain ${!enabled ? "opacity-40" : ""}`} unoptimized />}
                    {code === "color" && !opt.imageUrl && opt.value && (
                      <span className={`w-3.5 h-3.5 rounded-full border border-neutral/50 shrink-0 ${!enabled ? "opacity-40" : ""}`} style={{ background: opt.value }} />
                    )}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {matchedVariant ? (
        <VariantPriceRow variant={matchedVariant} addQty={addQty} setAddQty={setAddQty} onAdd={() => onAddToCart(matchedVariant)} />
      ) : (
        <p className="text-[12px] text-neutral-dark/60 italic">Chọn đủ thuộc tính để xem biến thể.</p>
      )}
    </div>
  );
}

/** Mode 2: attrs phụ thuộc nhau (MacBook-style) → gộp thành "Phiên bản" */
function BundleAttrSelector({
  variants,
  attrCodes,
  addQty,
  setAddQty,
  onAddToCart,
}: {
  variants: VariantOption[];
  attrCodes: string[];
  addQty: number;
  setAddQty: (q: number) => void;
  onAddToCart: (v: VariantOption) => void;
}) {
  const nonColorCodes = attrCodes.filter((c) => c !== "color");
  const hasColor = attrCodes.includes("color");

  // Gộp non-color attrs thành bundle combos
  // bundleKey = "16core|24gb|512gb", variantsByColor = Map<colorValue, Variant>
  const bundleMap = useMemo(() => {
    const map = new Map<string, { key: string; label: string; variantsByColor: Map<string, VariantOption> }>();
    for (const v of variants) {
      const attrs = getAttrs(v);
      const key = nonColorCodes.map((c) => attrs[c]?.value ?? "").join("|");
      const label = nonColorCodes
        .map((c) => attrs[c]?.label ?? "")
        .filter(Boolean)
        .join(" / ");
      if (!map.has(key)) map.set(key, { key, label, variantsByColor: new Map() });
      const colorVal = attrs["color"]?.value ?? "_no_color_";
      map.get(key)!.variantsByColor.set(colorVal, v);
    }
    return map;
  }, [variants, nonColorCodes]);

  // Colors
  const colorMap = useMemo(() => {
    const map = new Map<string, { value: string; label: string; imageUrl: string | null }>();
    for (const v of variants) {
      const c = getAttrs(v)["color"];
      if (c && !map.has(c.value)) map.set(c.value, { value: c.value, label: c.label, imageUrl: (v as any).imageUrl ?? null });
    }
    return map;
  }, [variants]);

  // State: selectedBundleKey + selectedColor
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const defaultAttrs = getAttrs(defaultVariant ?? ({} as any));
  const defaultBundleKey = nonColorCodes.map((c) => defaultAttrs[c]?.value ?? "").join("|");
  const defaultColor = defaultAttrs["color"]?.value ?? "_no_color_";

  const [selectedBundleKey, setSelectedBundleKey] = useState(defaultBundleKey);
  const [selectedColor, setSelectedColor] = useState(defaultColor);

  // Reset khi variants thay đổi (chọn product mới)
  useEffect(() => {
    setSelectedBundleKey(defaultBundleKey);
    setSelectedColor(defaultColor);
  }, [variants]); // eslint-disable-line

  const currentBundle = bundleMap.get(selectedBundleKey);
  const matchedVariant = currentBundle?.variantsByColor.get(selectedColor) ?? currentBundle?.variantsByColor.get("_no_color_") ?? null;

  const handleSelectBundle = (bundleKey: string) => {
    setSelectedBundleKey(bundleKey);
    // Giữ màu nếu có, nếu màu hiện tại không có trong bundle mới thì lấy màu đầu tiên
    const bundle = bundleMap.get(bundleKey);
    if (bundle && !bundle.variantsByColor.has(selectedColor)) {
      const firstColor = Array.from(bundle.variantsByColor.keys())[0];
      setSelectedColor(firstColor);
    }
  };

  const handleSelectColor = (colorVal: string) => {
    setSelectedColor(colorVal);
    // Nếu bundle hiện tại không có màu này, tìm bundle khác có màu này + available
    if (!currentBundle?.variantsByColor.has(colorVal)) {
      for (const [key, bundle] of bundleMap) {
        if (bundle.variantsByColor.has(colorVal) && bundle.variantsByColor.get(colorVal)?.available) {
          setSelectedBundleKey(key);
          break;
        }
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Phiên bản */}
      <div>
        <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-2">Phiên bản</p>
        <div className="grid grid-cols-2 gap-2">
          {Array.from(bundleMap.values()).map((bundle) => {
            const variantForColor = bundle.variantsByColor.get(selectedColor) ?? Array.from(bundle.variantsByColor.values())[0];
            const isAvailable = variantForColor?.available ?? false;
            const isSelected = bundle.key === selectedBundleKey;
            return (
              <button
                key={bundle.key}
                onClick={() => isAvailable && handleSelectBundle(bundle.key)}
                disabled={!isAvailable}
                className={`relative px-3 py-2.5 rounded-xl border text-left text-[12px] font-medium transition-all
                  ${
                    !isAvailable
                      ? "border-neutral/40 text-neutral-dark/40 bg-neutral-light-active/50 cursor-not-allowed"
                      : isSelected
                        ? "border-accent bg-accent/10 text-accent cursor-pointer"
                        : "border-neutral hover:border-accent/50 text-primary cursor-pointer"
                  }`}
              >
                <span className={!isAvailable ? "line-through" : ""}>{bundle.label}</span>
                {isSelected && <span className="absolute top-1 right-1.5 text-accent text-[10px]">✓</span>}
                {!isAvailable && <span className="block text-[10px] text-neutral-dark/50 mt-0.5">Hết hàng</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Màu sắc */}
      {hasColor && colorMap.size > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-2">Màu sắc</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(colorMap.values()).map((opt) => {
              const isSelected = selectedColor === opt.value;
              const availableWithBundle = currentBundle
                ? (currentBundle.variantsByColor.get(opt.value)?.available ?? false)
                : variants.some((v) => getAttrs(v)["color"]?.value === opt.value && v.available);
              return (
                <button
                  key={opt.value}
                  onClick={() => availableWithBundle && handleSelectColor(opt.value)}
                  disabled={!availableWithBundle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] transition-all
                    ${
                      !availableWithBundle
                        ? "border-neutral/40 text-neutral-dark/40 opacity-50 cursor-not-allowed"
                        : isSelected
                          ? "border-accent bg-accent/10 text-accent font-semibold cursor-pointer"
                          : "border-neutral hover:border-accent/50 text-primary cursor-pointer"
                    }`}
                >
                  {opt.imageUrl ? (
                    <Image src={opt.imageUrl} alt="" width={16} height={16} className="rounded object-contain" unoptimized />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-neutral/50 shrink-0" style={{ background: opt.value }} />
                  )}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {matchedVariant ? (
        <VariantPriceRow variant={matchedVariant} addQty={addQty} setAddQty={setAddQty} onAdd={() => onAddToCart(matchedVariant)} />
      ) : (
        <p className="text-[12px] text-neutral-dark/60 italic">Chọn phiên bản để tiếp tục.</p>
      )}
    </div>
  );
}

/** Wrapper: tự phát hiện mode rồi render đúng selector */
function SmartVariantSelector({
  variants,
  loadingVariants,
  addQty,
  setAddQty,
  onAddToCart,
}: {
  variants: VariantOption[];
  loadingVariants: boolean;
  addQty: number;
  setAddQty: (q: number) => void;
  onAddToCart: (v: VariantOption) => void;
}) {
  const attrCodes = useMemo(() => getAttrCodes(variants), [variants]);
  const bundleMode = useMemo(() => isBundleMode(variants, attrCodes), [variants, attrCodes]);

  // Independent mode needs its own selectedAttrs state
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const initAttrs = useMemo(() => {
    if (!defaultVariant) return {};
    const auto: Record<string, string> = {};
    for (const [code, { value }] of Object.entries(getAttrs(defaultVariant))) auto[code] = value;
    return auto;
  }, [defaultVariant]);

  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(initAttrs);

  // Reset khi variants thay đổi
  useEffect(() => {
    setSelectedAttrs(initAttrs);
  }, [variants]); // eslint-disable-line

  if (loadingVariants)
    return (
      <div className="flex items-center gap-2 text-[12px] text-neutral-dark">
        <Loader2 size={13} className="animate-spin" /> Đang tải biến thể...
      </div>
    );
  if (!variants.length) return null;

  return bundleMode ? (
    <BundleAttrSelector variants={variants} attrCodes={attrCodes} addQty={addQty} setAddQty={setAddQty} onAddToCart={onAddToCart} />
  ) : (
    <IndependentAttrSelector
      variants={variants}
      attrCodes={attrCodes}
      selectedAttrs={selectedAttrs}
      setSelectedAttrs={setSelectedAttrs}
      addQty={addQty}
      setAddQty={setAddQty}
      onAddToCart={onAddToCart}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function CreateOrderPage() {
  const router = useRouter();

  // ── Customer ──────────────────────────────────────────────────────────────
  const [customerTab, setCustomerTab] = useState<"existing" | "new">("existing");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [searchingUser, setSearchingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);
  const [newCustomer, setNewCustomer] = useState({ fullName: "", phone: "", email: "" });

  // ── Address ───────────────────────────────────────────────────────────────
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [newAddr, setNewAddr] = useState<AddrState>(EMPTY_ADDR);
  const [addrTouched, setAddrTouched] = useState<Set<string>>(new Set());
  const touchAddr = (field: string) => setAddrTouched((prev) => new Set([...prev, field]));

  // ── Products ──────────────────────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductSearchResult[]>([]);
  const [searchingProduct, setSearchingProduct] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [addQty, setAddQty] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const productSearchRef = useRef<HTMLDivElement>(null);

  // ── Payment ───────────────────────────────────────────────────────────────
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"UNPAID" | "PAID">("UNPAID");
  const [orderStatus, setOrderStatus] = useState<"PENDING" | "PROCESSING">("PENDING");
  const [shippingFee, setShippingFee] = useState("0");
  const [voucherCode, setVoucherCode] = useState("");

  // ── Submit ────────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const href = useAdminHref();

  // ─────────────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([getProvinces(), getActivePaymentMethods()])
      .then(([provs, methods]) => {
        setProvinces(provs);
        setPaymentMethods(methods);
        if (methods.length) setSelectedPaymentId(methods[0].id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!newAddr.provinceCode) {
      setWards([]);
      return;
    }
    setLoadingWards(true);
    getWards(newAddr.provinceCode as number)
      .then(setWards)
      .catch(console.error)
      .finally(() => setLoadingWards(false));
  }, [newAddr.provinceCode]);

  useEffect(() => {
    if (!selectedUser) {
      setUserAddresses([]);
      setSelectedAddressId(null);
      return;
    }
    getUserAddresses(selectedUser.id)
      .then((addrs) => {
        setUserAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) ?? addrs[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch(console.error);
  }, [selectedUser]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(e.target as Node)) setUserResults([]);
      if (productSearchRef.current && !productSearchRef.current.contains(e.target as Node)) setShowProductDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────────────────────────────────

  const doSearchUsers = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setUserResults([]);
      return;
    }
    setSearchingUser(true);
    try {
      setUserResults(await searchUsers(q));
    } catch {
      setUserResults([]);
    } finally {
      setSearchingUser(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearchUsers(userSearch), 300);
    return () => clearTimeout(t);
  }, [userSearch, doSearchUsers]);

  const doSearchProducts = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setProductResults([]);
      setShowProductDropdown(false);
      return;
    }
    setSearchingProduct(true);
    try {
      const results = await searchProducts(q);
      setProductResults(results);
      if (results.length > 0) setShowProductDropdown(true);
    } catch {
      setProductResults([]);
      setShowProductDropdown(false);
    } finally {
      setSearchingProduct(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) return;
    const t = setTimeout(() => doSearchProducts(productSearch), 300);
    return () => clearTimeout(t);
  }, [productSearch, doSearchProducts, selectedProduct]);

  const handleSelectProduct = async (product: ProductSearchResult) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setShowProductDropdown(false);
    setVariants([]);
    setLoadingVariants(true);
    try {
      const opts = await getVariantOptions(product.slug);
      setVariants(opts);
    } catch {
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CART — handleAddToCart nhận variant từ SmartVariantSelector
  // ─────────────────────────────────────────────────────────────────────────

  const handleAddToCart = useCallback(
    (variant: VariantOption) => {
      if (!selectedProduct) return;

      // Build label từ tất cả attrs
      const attrs = getAttrs(variant);
      const label =
        Object.values(attrs)
          .map((a) => a.label)
          .filter(Boolean)
          .join(" / ") ||
        variant.code ||
        "Default";

      const existing = cart.find((c) => c.variantId === variant.id);
      if (existing) {
        setCart((p) => p.map((c) => (c.variantId === variant.id ? { ...c, quantity: c.quantity + addQty } : c)));
      } else {
        setCart((p) => [
          ...p,
          {
            _key: uid(),
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            productThumbnail: (variant as any).imageUrl ?? selectedProduct.thumbnail,
            variantId: variant.id,
            variantLabel: label,
            variantCode: variant.code,
            unitPrice: (variant as any).finalPrice ?? variant.price,
            quantity: addQty,
          },
        ]);
      }

      // Reset product search
      setProductSearch("");
      setSelectedProduct(null);
      setVariants([]);
      setAddQty(1);
    },
    [selectedProduct, cart, addQty],
  );

  const removeFromCart = (key: string) => setCart((p) => p.filter((c) => c._key !== key));
  const updateQty = (key: string, qty: number) => {
    if (qty < 1) return;
    setCart((p) => p.map((c) => (c._key === key ? { ...c, quantity: qty } : c)));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────────────────────────────────────

  const subtotal = cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0);
  const shippingFeeNum = Number(shippingFee) || 0;
  const total = subtotal + shippingFeeNum;
  const selectedAddress = userAddresses.find((a) => a.id === selectedAddressId);
  const buildDetailAddress = (addr: AddrState) => [addr.houseNumber.trim(), addr.streetName.trim()].filter(Boolean).join(", ");

  // ─────────────────────────────────────────────────────────────────────────
  // VALIDATE + SUBMIT
  // ─────────────────────────────────────────────────────────────────────────

  const touchAllAddrFields = () => setAddrTouched(new Set(["contactName", "addrPhone", "province", "ward", "houseNumber", "streetName"]));

  const validateAddrFields = (addr: AddrState): string[] => {
    touchAllAddrFields();
    const errs: string[] = [];
    if (!addr.contactName.trim() || nameHasDigit(addr.contactName)) errs.push("contactName");
    if (!isValidPhone(addr.phone)) errs.push("addrPhone");
    if (!addr.provinceCode) errs.push("province");
    if (!addr.wardCode) errs.push("ward");
    if (!addr.houseNumber.trim() || addressInvalidChar(addr.houseNumber)) errs.push("houseNumber");
    if (!addr.streetName.trim() || addressInvalidChar(addr.streetName)) errs.push("streetName");
    return errs;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (customerTab === "existing") {
      if (!selectedUser) errs.user = "Vui lòng chọn khách hàng";
      if (!selectedAddressId && !showNewAddress) errs.address = "Vui lòng chọn địa chỉ giao hàng";
      // if (showNewAddress && validateAddrFields(newAddr).length) errs.addrForm = "Thông tin địa chỉ chưa hợp lệ";
    } else {
      if (!newCustomer.fullName.trim()) errs.newFullName = "Họ tên không được trống";
      if (nameHasDigit(newCustomer.fullName)) errs.newFullName = "Họ tên không được chứa số";
      if (!isValidPhone(newCustomer.phone)) errs.newPhone = "SĐT không hợp lệ";
      // if (validateAddrFields(newAddr).length) errs.addrForm = "Thông tin địa chỉ chưa hợp lệ";
    }
    if (cart.length === 0) errs.cart = "Giỏ hàng chưa có sản phẩm";
    if (!selectedPaymentId) errs.payment = "Chọn phương thức thanh toán";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: any = {
        items: cart.map((c) => ({ productVariantId: c.variantId, quantity: c.quantity, unitPrice: c.unitPrice })),
        shippingFee: shippingFeeNum,
        paymentMethodId: selectedPaymentId!,
        paymentStatus,
        orderStatus,
        ...(voucherCode.trim() ? { voucherCode: voucherCode.trim() } : {}),
      };
      if (customerTab === "existing" && selectedUser) {
        payload.userId = selectedUser.id;
        if (showNewAddress) {
          payload.newAddress = {
            provinceCode: newAddr.provinceCode,
            provinceName: newAddr.provinceName,
            wardCode: newAddr.wardCode,
            wardName: newAddr.wardName,
            detailAddress: buildDetailAddress(newAddr),
          };
          payload.customerInfo = { fullName: newAddr.contactName.trim(), phone: newAddr.phone.trim() };
        } else {
          payload.shippingAddressId = selectedAddressId;
        }
      } else {
        payload.customerInfo = { fullName: newCustomer.fullName.trim(), phone: newCustomer.phone.trim(), email: newCustomer.email.trim() || undefined };
        payload.newAddress = {
          provinceCode: newAddr.provinceCode,
          provinceName: newAddr.provinceName,
          wardCode: newAddr.wardCode,
          wardName: newAddr.wardName,
          detailAddress: buildDetailAddress(newAddr),
        };
      }
      const res = await createOrderAdmin(payload);
      router.push(href(`/orders/${res.data.id}`));
    } catch (e: any) {
      setSubmitError(e?.message ?? "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark">/</span>
        <Link href="/admin/orders" className="text-[13px] text-neutral-dark hover:text-accent">
          Đơn hàng
        </Link>
        <span className="text-neutral-dark">/</span>
        <span className="text-[13px] text-primary font-medium">Tạo đơn mới</span>
      </div>

      <div className="px-6">
        <div className="mb-5">
          <h1 className="text-[20px] font-bold text-primary">Tạo đơn hàng mới</h1>
          <p className="text-[13px] text-neutral-dark mt-1">Tạo đơn hàng thủ công từ admin panel.</p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-5">
            {/* ── 1. Khách hàng ── */}
            <SectionCard title="Khách hàng" icon={<User size={15} />}>
              <div className="flex gap-1 p-1 rounded-xl bg-neutral-light-active border border-neutral">
                <button
                  onClick={() => setCustomerTab("existing")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${customerTab === "existing" ? "bg-accent text-white shadow-sm" : "text-neutral-dark hover:text-primary"}`}
                >
                  <Users size={13} /> Khách hàng cũ
                </button>
                <button
                  onClick={() => setCustomerTab("new")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${customerTab === "new" ? "bg-accent text-white shadow-sm" : "text-neutral-dark hover:text-primary"}`}
                >
                  <UserPlus size={13} /> Khách hàng mới
                </button>
              </div>

              {customerTab === "existing" ? (
                <>
                  <div ref={userSearchRef} className="relative">
                    <Label required>Tìm khách hàng</Label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                      <input
                        value={selectedUser ? `${selectedUser.fullName} — ${selectedUser.email}` : userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setSelectedUser(null);
                        }}
                        placeholder="Tìm theo tên, email, SĐT..."
                        className={inputCls(!!errors.user) + " pl-8 pr-8"}
                        readOnly={!!selectedUser}
                      />
                      {selectedUser && (
                        <button
                          onClick={() => {
                            setSelectedUser(null);
                            setUserSearch("");
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-promotion cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                      {searchingUser && !selectedUser && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-dark" />}
                    </div>
                    {errors.user && <p className="text-[11px] text-promotion mt-1">{errors.user}</p>}
                    {userResults.length > 0 && !selectedUser && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-neutral-light border border-neutral rounded-xl shadow-lg py-1 max-h-52 overflow-y-auto">
                        {userResults.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setSelectedUser(u);
                              setUserSearch("");
                              setUserResults([]);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-light-active cursor-pointer text-left"
                          >
                            <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 text-[11px] font-bold">{u.fullName?.[0]?.toUpperCase() ?? "U"}</div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-primary truncate">{u.fullName}</p>
                              <p className="text-[11px] text-neutral-dark">
                                {u.email} · {u.phone}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedUser && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Địa chỉ giao hàng</Label>
                        <button
                          onClick={() => {
                            setShowNewAddress((v) => !v);
                            setNewAddr(EMPTY_ADDR);
                            setAddrTouched(new Set());
                          }}
                          className="text-[11px] text-accent hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Plus size={11} /> {showNewAddress ? "Dùng địa chỉ có sẵn" : "Nhập địa chỉ mới"}
                        </button>
                      </div>
                      {!showNewAddress ? (
                        userAddresses.length > 0 ? (
                          <div className="space-y-2">
                            {userAddresses.map((addr) => (
                              <label
                                key={addr.id}
                                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === addr.id ? "border-accent bg-accent/5" : "border-neutral hover:border-accent/50"}`}
                              >
                                <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-0.5 accent-accent" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13px] font-medium text-primary">
                                    {addr.contactName} · {addr.phone}
                                    {addr.isDefault && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">Mặc định</span>}
                                  </p>
                                  <p className="text-[12px] text-neutral-dark mt-0.5">
                                    {addr.detailAddress}, {addr.wardName}, {addr.provinceName}
                                  </p>
                                </div>
                              </label>
                            ))}
                            {errors.address && <p className="text-[11px] text-promotion">{errors.address}</p>}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-light-active border border-neutral text-[12px] text-neutral-dark">
                            <MapPin size={13} /> Khách hàng chưa có địa chỉ. Nhập địa chỉ mới.
                          </div>
                        )
                      ) : (
                        <AddressForm provinces={provinces} wards={wards} addr={newAddr} setAddr={setNewAddr} errors={errors} touched={addrTouched} onTouch={touchAddr} loadingWards={loadingWards} />
                      )}
                      {errors.addrForm && <p className="text-[11px] text-promotion mt-1">{errors.addrForm}</p>}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label required>Họ và tên</Label>
                      <input
                        value={newCustomer.fullName}
                        onChange={(e) => setNewCustomer((p) => ({ ...p, fullName: e.target.value }))}
                        placeholder="Nguyễn Văn A"
                        className={inputCls(!!errors.newFullName)}
                      />
                      {errors.newFullName && <p className="text-[11px] text-promotion mt-1">{errors.newFullName}</p>}
                    </div>
                    <div>
                      <Label required>Số điện thoại</Label>
                      <input value={newCustomer.phone} onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))} placeholder="0912345678" className={inputCls(!!errors.newPhone)} />
                      {errors.newPhone && <p className="text-[11px] text-promotion mt-1">{errors.newPhone}</p>}
                    </div>
                  </div>
                  <div>
                    <Label>Email (tùy chọn)</Label>
                    <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className={inputCls()} />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-primary mb-2">Địa chỉ giao hàng</p>
                    <AddressForm
                      provinces={provinces}
                      wards={wards}
                      addr={newAddr}
                      setAddr={setNewAddr}
                      errors={errors}
                      showNamePhone={false}
                      touched={addrTouched}
                      onTouch={touchAddr}
                      loadingWards={loadingWards}
                    />
                    {errors.addrForm && <p className="text-[11px] text-promotion mt-1">{errors.addrForm}</p>}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* ── 2. Sản phẩm ── */}
            <SectionCard title="Sản phẩm" icon={<Package size={15} />}>
              {/* Search box */}
              <div ref={productSearchRef} className="relative">
                <Label>Tìm sản phẩm</Label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                  <input
                    value={selectedProduct ? selectedProduct.name : productSearch}
                    onChange={(e) => {
                      if (selectedProduct) return;
                      setProductSearch(e.target.value);
                      if (!e.target.value) setShowProductDropdown(false);
                    }}
                    readOnly={!!selectedProduct}
                    placeholder="Tìm theo tên sản phẩm... (VD: iPhone, MacBook)"
                    className={inputCls() + " pl-8 pr-8" + (selectedProduct ? " bg-neutral-light-active/60 cursor-default" : "")}
                  />
                  {selectedProduct && (
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setProductSearch("");
                        setVariants([]);
                        setShowProductDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-promotion cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {searchingProduct && !selectedProduct && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-dark" />}
                </div>

                {showProductDropdown && productResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-neutral-light border border-neutral rounded-xl shadow-lg py-1 max-h-64 overflow-y-auto">
                    {productResults.map((p) => (
                      <button key={p.id} onClick={() => handleSelectProduct(p)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-light-active cursor-pointer text-left">
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-neutral bg-neutral-light-active shrink-0">
                          {p.thumbnail ? (
                            <Image src={p.thumbnail} alt={p.name} width={36} height={36} className="object-contain w-full h-full" unoptimized />
                          ) : (
                            <Package size={14} className="text-neutral-dark m-auto mt-2.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-primary truncate">{p.name}</p>
                          <p className="text-[11px] text-neutral-dark">
                            {p.brand?.name} · {p.category?.name}
                          </p>
                          {/* Hiển thị giá preview từ search results */}
                          {(p as any).price && (
                            <p className="text-[11px] font-semibold text-accent">
                              {formatVND((p as any).price.final)}
                              {(p as any).price.hasPromotion && <span className="ml-1 text-neutral-dark/50 line-through text-[10px]">{formatVND((p as any).price.base)}</span>}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Variant selector — tự động chọn Independent hoặc Bundle mode */}
              {selectedProduct && (
                <div className="p-4 rounded-xl border border-neutral bg-neutral-light-active/40 space-y-3">
                  {/* Product header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral bg-neutral-light shrink-0">
                      {selectedProduct.thumbnail ? (
                        <Image src={selectedProduct.thumbnail} alt={selectedProduct.name} width={40} height={40} className="object-contain w-full h-full" unoptimized />
                      ) : (
                        <Package size={14} className="text-neutral-dark m-3" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-primary">{selectedProduct.name}</p>
                      <p className="text-[11px] text-neutral-dark">{selectedProduct.brand?.name}</p>
                    </div>
                  </div>

                  {/* SmartVariantSelector tự phát hiện mode */}
                  <SmartVariantSelector variants={variants} loadingVariants={loadingVariants} addQty={addQty} setAddQty={setAddQty} onAddToCart={handleAddToCart} />
                </div>
              )}

              {errors.cart && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px]">
                  <AlertCircle size={13} /> {errors.cart}
                </div>
              )}

              {/* Cart table */}
              {cart.length > 0 && (
                <div className="border border-neutral rounded-xl overflow-hidden">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-neutral-light-active border-b border-neutral">
                        <th className="text-left px-3 py-2 font-semibold text-neutral-dark">Sản phẩm</th>
                        <th className="text-right px-3 py-2 font-semibold text-neutral-dark">Đơn giá</th>
                        <th className="text-center px-3 py-2 font-semibold text-neutral-dark">SL</th>
                        <th className="text-right px-3 py-2 font-semibold text-neutral-dark">Tổng</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item._key} className="border-b border-neutral/50 last:border-0">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-neutral bg-neutral-light-active shrink-0">
                                {item.productThumbnail ? (
                                  <Image src={item.productThumbnail} alt="" width={32} height={32} className="object-contain w-full h-full" unoptimized />
                                ) : (
                                  <Package size={11} className="text-neutral-dark m-2.5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-primary font-medium truncate max-w-[160px]">{item.productName}</p>
                                <p className="text-neutral-dark text-[11px]">{item.variantLabel}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right">{formatVND(item.unitPrice)}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center border border-neutral rounded-lg overflow-hidden w-20 mx-auto">
                              <button onClick={() => updateQty(item._key, item.quantity - 1)} className="px-2 py-1 hover:bg-neutral-light-active text-[13px] cursor-pointer">
                                −
                              </button>
                              <span className="flex-1 text-center py-1">{item.quantity}</span>
                              <button onClick={() => updateQty(item._key, item.quantity + 1)} className="px-2 py-1 hover:bg-neutral-light-active text-[13px] cursor-pointer">
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-accent">{formatVND(item.unitPrice * item.quantity)}</td>
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => removeFromCart(item._key)}
                              className="w-6 h-6 rounded-lg hover:bg-promotion-light hover:text-promotion flex items-center justify-center cursor-pointer text-neutral-dark"
                            >
                              <Trash2 size={11} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>

          {/* RIGHT 1/3 */}
          <div className="space-y-5">
            <SectionCard title="Thanh toán" icon={<CreditCard size={15} />}>
              <div>
                <Label required>Phương thức</Label>
                <Select
                  options={paymentMethods.map((p) => ({ value: p.id, label: p.name }))}
                  value={selectedPaymentId ? { value: selectedPaymentId, label: paymentMethods.find((p) => p.id === selectedPaymentId)?.name ?? "" } : null}
                  onChange={(o: SelectOption | null) => setSelectedPaymentId((o?.value as string) ?? null)}
                  placeholder={paymentMethods.length === 0 ? "Đang tải..." : "— Chọn —"}
                  styles={rsStyles(!!errors.payment)}
                  noOptionsMessage={() => "Không có"}
                />
                {errors.payment && <p className="text-[11px] text-promotion mt-1">{errors.payment}</p>}
              </div>
              <div>
                <Label>Trạng thái thanh toán</Label>
                <div className="flex gap-2">
                  {(["UNPAID", "PAID"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setPaymentStatus(s)}
                      className={`flex-1 py-2 rounded-xl border text-[12px] font-medium transition-colors cursor-pointer ${paymentStatus === s ? "border-accent bg-accent/10 text-accent" : "border-neutral text-primary hover:border-accent/50"}`}
                    >
                      {s === "UNPAID" ? "Chưa TT" : "Đã TT"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Trạng thái đơn</Label>
                <div className="flex gap-2">
                  {(["PENDING", "PROCESSING"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setOrderStatus(s)}
                      className={`flex-1 py-2 rounded-xl border text-[12px] font-medium transition-colors cursor-pointer ${orderStatus === s ? "border-accent bg-accent/10 text-accent" : "border-neutral text-primary hover:border-accent/50"}`}
                    >
                      {s === "PENDING" ? "Chờ duyệt" : "Xử lý"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Phí vận chuyển</Label>
                <input type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} placeholder="0" className={inputCls()} />
              </div>
              <div>
                <Label>Voucher</Label>
                <div className="relative">
                  <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                  <input value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} placeholder="VOUCHER2026" className={inputCls() + " pl-8 font-mono"} />
                </div>
              </div>
            </SectionCard>

            {/* Summary */}
            <div className="bg-neutral-light border border-neutral rounded-2xl p-4 space-y-2.5 shadow-sm">
              <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-3">Tóm tắt</p>
              <div className="flex justify-between text-[13px]">
                <span className="text-neutral-dark">Tạm tính ({cart.reduce((s, c) => s + c.quantity, 0)} sp)</span>
                <span className="font-medium">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-neutral-dark">Phí ship</span>
                <span>{shippingFeeNum > 0 ? formatVND(shippingFeeNum) : <span className="text-emerald-600 font-medium">Miễn phí</span>}</span>
              </div>
              <div className="border-t border-neutral pt-2.5 flex justify-between">
                <span className="text-[14px] font-bold text-primary">Tổng cộng</span>
                <span className="text-[16px] font-bold text-accent">{formatVND(total)}</span>
              </div>
              {(selectedUser || (customerTab === "new" && newCustomer.fullName)) && (
                <div className="pt-2.5 border-t border-neutral">
                  <div className="flex items-center gap-1.5 text-[12px]">
                    <User size={11} className="text-neutral-dark shrink-0" />
                    <span className="font-medium text-primary">{selectedUser?.fullName ?? newCustomer.fullName}</span>
                    {customerTab === "new" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">Mới</span>}
                  </div>
                  {selectedAddress && (
                    <div className="flex items-start gap-1.5 text-[12px] text-neutral-dark mt-1">
                      <MapPin size={11} className="shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {selectedAddress.detailAddress}, {selectedAddress.wardName}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {submitError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[12px]">
                <AlertCircle size={13} /> {submitError}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-hover text-white text-[14px] font-semibold rounded-xl cursor-pointer disabled:opacity-60 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Đang tạo...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Tạo đơn hàng
                </>
              )}
            </button>
            <button
              onClick={() => router.back()}
              disabled={submitting}
              className="w-full py-2.5 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
            >
              Huỷ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
