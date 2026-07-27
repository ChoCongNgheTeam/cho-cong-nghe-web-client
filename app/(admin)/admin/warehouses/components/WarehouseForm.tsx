"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import type { Warehouse } from "../warehouse.types";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface WarehouseFormData {
  code: string;
  name: string;
  address: string;
  phone: string;
  managerName: string;
  note: string;
  isDefault: boolean;
  isActive: boolean;
}

export const DEFAULT_FORM: WarehouseFormData = {
  code: "",
  name: "",
  address: "",
  phone: "",
  managerName: "",
  note: "",
  isDefault: false,
  isActive: true,
};

export function warehouseToForm(w: Warehouse): WarehouseFormData {
  return {
    code: w.code,
    name: w.name,
    address: w.address ?? "",
    phone: w.phone ?? "",
    managerName: w.managerName ?? "",
    note: w.note ?? "",
    isDefault: w.isDefault,
    isActive: w.isActive,
  };
}

export function formToCreatePayload(form: WarehouseFormData) {
  return {
    ...(form.code.trim() ? { code: form.code.trim() } : {}),
    name: form.name.trim(),
    address: form.address.trim() || undefined,
    phone: form.phone.trim() || undefined,
    managerName: form.managerName.trim() || undefined,
    note: form.note.trim() || undefined,
    isDefault: form.isDefault,
    isActive: form.isActive,
  };
}

export function formToUpdatePayload(form: WarehouseFormData) {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    address: form.address.trim(),
    phone: form.phone.trim(),
    managerName: form.managerName.trim(),
    note: form.note.trim(),
    isDefault: form.isDefault,
    isActive: form.isActive,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-neutral-dark/50";

function FormRow({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
        {label} {required && <span className="text-promotion normal-case font-normal">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-neutral-dark/70">{hint}</p>}
    </div>
  );
}

// ── Main WarehouseForm ──────────────────────────────────────────────────────────
interface WarehouseFormProps {
  initialData: WarehouseFormData;
  isEdit?: boolean;
  onSubmit: (form: WarehouseFormData) => Promise<void>;
  saving: boolean;
  error: string | null;
  submitLabel?: string;
  onCancel?: () => void;
}

export function WarehouseForm({ initialData, isEdit = false, onSubmit, saving, error, submitLabel = "Lưu", onCancel }: WarehouseFormProps) {
  const [form, setForm] = useState<WarehouseFormData>(initialData);

  const set = <K extends keyof WarehouseFormData>(key: K, value: WarehouseFormData[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Mã kho" hint={isEdit ? undefined : "Bỏ trống để tự sinh mã"}>
          <input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="WH-001" className={inputCls} />
        </FormRow>

        <FormRow label="Tên kho" required>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Kho trung tâm" className={inputCls} required />
        </FormRow>
      </div>

      <FormRow label="Địa chỉ">
        <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Số nhà, đường, quận/huyện..." className={inputCls} />
      </FormRow>

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Số điện thoại">
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="09xxxxxxxx" className={inputCls} />
        </FormRow>

        <FormRow label="Người quản lý">
          <input value={form.managerName} onChange={(e) => set("managerName", e.target.value)} placeholder="Tên quản lý kho" className={inputCls} />
        </FormRow>
      </div>

      <FormRow label="Ghi chú">
        <textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={2} placeholder="Ghi chú thêm về kho" className={`${inputCls} resize-none`} />
      </FormRow>

      <div className="flex gap-4">
        <label className="flex items-center justify-between flex-1 px-3 py-2.5 border border-neutral rounded-xl cursor-pointer">
          <div>
            <p className="text-[13px] text-primary">Hoạt động</p>
            <p className="text-[11px] text-neutral-dark">Cho phép dùng kho này</p>
          </div>
          <button type="button" onClick={() => set("isActive", !form.isActive)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${form.isActive ? "bg-accent" : "bg-neutral"}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? "left-5" : "left-0.5"}`} />
          </button>
        </label>

        <label className="flex items-center justify-between flex-1 px-3 py-2.5 border border-neutral rounded-xl cursor-pointer">
          <div>
            <p className="text-[13px] text-primary">Kho mặc định</p>
            <p className="text-[11px] text-neutral-dark">Dùng để trừ/hoàn tồn kho khi có đơn hàng</p>
          </div>
          <button type="button" onClick={() => set("isDefault", !form.isDefault)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${form.isDefault ? "bg-amber-400" : "bg-neutral"}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isDefault ? "left-5" : "left-0.5"}`} />
          </button>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
          >
            Huỷ
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
