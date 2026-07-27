"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import type { Supplier } from "../supplier.types";

export interface SupplierFormData {
  code: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  note: string;
  isActive: boolean;
}

export const DEFAULT_FORM: SupplierFormData = {
  code: "",
  name: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  taxCode: "",
  note: "",
  isActive: true,
};

export function supplierToForm(s: Supplier): SupplierFormData {
  return {
    code: s.code,
    name: s.name,
    contactName: s.contactName ?? "",
    phone: s.phone ?? "",
    email: s.email ?? "",
    address: s.address ?? "",
    taxCode: s.taxCode ?? "",
    note: s.note ?? "",
    isActive: s.isActive,
  };
}

export function formToCreatePayload(form: SupplierFormData) {
  return {
    ...(form.code.trim() ? { code: form.code.trim() } : {}),
    name: form.name.trim(),
    contactName: form.contactName.trim() || undefined,
    phone: form.phone.trim() || undefined,
    email: form.email.trim() || undefined,
    address: form.address.trim() || undefined,
    taxCode: form.taxCode.trim() || undefined,
    note: form.note.trim() || undefined,
    isActive: form.isActive,
  };
}

export function formToUpdatePayload(form: SupplierFormData) {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    contactName: form.contactName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    taxCode: form.taxCode.trim(),
    note: form.note.trim(),
    isActive: form.isActive,
  };
}

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

interface SupplierFormProps {
  initialData: SupplierFormData;
  isEdit?: boolean;
  onSubmit: (form: SupplierFormData) => Promise<void>;
  saving: boolean;
  error: string | null;
  submitLabel?: string;
  onCancel?: () => void;
}

export function SupplierForm({ initialData, isEdit = false, onSubmit, saving, error, submitLabel = "Lưu", onCancel }: SupplierFormProps) {
  const [form, setForm] = useState<SupplierFormData>(initialData);

  const set = <K extends keyof SupplierFormData>(key: K, value: SupplierFormData[K]) => setForm((prev) => ({ ...prev, [key]: value }));

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
        <FormRow label="Mã nhà cung cấp" hint={isEdit ? undefined : "Bỏ trống để tự sinh mã"}>
          <input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="SUP-001" className={inputCls} />
        </FormRow>

        <FormRow label="Tên nhà cung cấp" required>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Công ty TNHH ABC" className={inputCls} required />
        </FormRow>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Người liên hệ">
          <input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Tên người liên hệ" className={inputCls} />
        </FormRow>
        <FormRow label="Số điện thoại">
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="09xxxxxxxx" className={inputCls} />
        </FormRow>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Email">
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@abc.com" className={inputCls} />
        </FormRow>
        <FormRow label="Mã số thuế">
          <input value={form.taxCode} onChange={(e) => set("taxCode", e.target.value)} placeholder="0123456789" className={inputCls} />
        </FormRow>
      </div>

      <FormRow label="Địa chỉ">
        <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Số nhà, đường, quận/huyện..." className={inputCls} />
      </FormRow>

      <FormRow label="Ghi chú">
        <textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={2} placeholder="Ghi chú thêm" className={`${inputCls} resize-none`} />
      </FormRow>

      <label className="flex items-center justify-between px-3 py-2.5 border border-neutral rounded-xl cursor-pointer w-fit min-w-[240px]">
        <div>
          <p className="text-[13px] text-primary">Hoạt động</p>
          <p className="text-[11px] text-neutral-dark">Cho phép chọn NCC này khi nhập kho</p>
        </div>
        <button type="button" onClick={() => set("isActive", !form.isActive)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 ml-3 ${form.isActive ? "bg-accent" : "bg-neutral"}`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? "left-5" : "left-0.5"}`} />
        </button>
      </label>

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
