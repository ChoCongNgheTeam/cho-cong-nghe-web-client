"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import type { Specification, CreateSpecificationPayload, UpdateSpecificationPayload } from "../specification.types";
import { FILTER_TYPE_LABELS } from "../const";

export interface SpecificationFormData {
  key: string;
  name: string;
  group: string;
  unit: string;
  icon: string;
  isActive: boolean;
  isFilterable: boolean;
  filterType: string;
  isRequired: boolean;
  sortOrder: number;
}

export const DEFAULT_FORM: SpecificationFormData = {
  key: "",
  name: "",
  group: "Thông số khác",
  unit: "",
  icon: "",
  isActive: true,
  isFilterable: false,
  filterType: "",
  isRequired: false,
  sortOrder: 0,
};

export function specToForm(spec: Specification): SpecificationFormData {
  return {
    key: spec.key,
    name: spec.name,
    group: spec.group,
    unit: spec.unit ?? "",
    icon: spec.icon ?? "",
    isActive: spec.isActive,
    isFilterable: spec.isFilterable,
    filterType: spec.filterType ?? "",
    isRequired: spec.isRequired,
    sortOrder: spec.sortOrder,
  };
}

export function formToCreatePayload(form: SpecificationFormData): CreateSpecificationPayload {
  return {
    key: form.key.trim(),
    name: form.name.trim(),
    group: form.group.trim() || "Thông số khác",
    unit: form.unit.trim() || undefined,
    icon: form.icon.trim() || undefined,
    isActive: form.isActive,
    isFilterable: form.isFilterable,
    filterType: form.isFilterable && form.filterType ? (form.filterType as any) : undefined,
    isRequired: form.isRequired,
    sortOrder: Number(form.sortOrder),
  };
}

export function formToUpdatePayload(form: SpecificationFormData): UpdateSpecificationPayload {
  const { key, ...rest } = formToCreatePayload(form);
  return rest;
}

interface SpecificationFormProps {
  initialData: SpecificationFormData;
  isEdit?: boolean;
  onSubmit: (form: SpecificationFormData) => Promise<void>;
  saving: boolean;
  error: string | null;
  submitLabel?: string;
  onCancel?: () => void;
}

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

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-neutral-dark/50";

export function SpecificationForm({ initialData, isEdit = false, onSubmit, saving, error, submitLabel = "Lưu", onCancel }: SpecificationFormProps) {
  const [form, setForm] = useState<SpecificationFormData>(initialData);

  const set = (key: keyof SpecificationFormData, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

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

      {/* Section: Cơ bản */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thông tin cơ bản</p>

        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Key định danh" required hint="Chỉ gồm chữ thường, số, gạch dưới (vd: screen_size)">
            <input
              value={form.key}
              onChange={(e) => set("key", e.target.value)}
              disabled={isEdit}
              placeholder="screen_size"
              className={`${inputCls} ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
              required
            />
          </FormRow>

          <FormRow label="Tên hiển thị" required>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Kích thước màn hình" className={inputCls} required />
          </FormRow>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Nhóm" hint="Dùng để nhóm các thông số liên quan">
            <input value={form.group} onChange={(e) => set("group", e.target.value)} placeholder="Màn hình" className={inputCls} />
          </FormRow>

          <FormRow label="Đơn vị" hint="Vd: inch, GB, MHz">
            <input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="inch" className={inputCls} />
          </FormRow>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Icon (emoji hoặc tên icon)" hint="Vd: 📱 hoặc monitor">
            <input value={form.icon} onChange={(e) => set("icon", e.target.value)} placeholder="📱" className={inputCls} />
          </FormRow>

          <FormRow label="Thứ tự hiển thị" hint="Số nhỏ hơn hiển thị trước">
            <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className={inputCls} min={0} />
          </FormRow>
        </div>
      </div>

      {/* Section: Cài đặt */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Cài đặt</p>

        <div className="grid grid-cols-3 gap-4">
          {/* isActive */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral hover:bg-neutral-light-active transition-colors cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-accent cursor-pointer" />
            <div>
              <p className="text-[13px] font-medium text-primary">Đang hoạt động</p>
              <p className="text-[11px] text-neutral-dark">Hiển thị thông số này</p>
            </div>
          </label>

          {/* isRequired */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral hover:bg-neutral-light-active transition-colors cursor-pointer">
            <input type="checkbox" checked={form.isRequired} onChange={(e) => set("isRequired", e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-accent cursor-pointer" />
            <div>
              <p className="text-[13px] font-medium text-primary">Bắt buộc</p>
              <p className="text-[11px] text-neutral-dark">Yêu cầu nhập khi tạo SP</p>
            </div>
          </label>

          {/* isFilterable */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral hover:bg-neutral-light-active transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFilterable}
              onChange={(e) => {
                set("isFilterable", e.target.checked);
                if (!e.target.checked) set("filterType", "");
              }}
              className="mt-0.5 w-4 h-4 rounded accent-accent cursor-pointer"
            />
            <div>
              <p className="text-[13px] font-medium text-primary">Có thể lọc</p>
              <p className="text-[11px] text-neutral-dark">Dùng trong bộ lọc SP</p>
            </div>
          </label>
        </div>

        {/* filterType — chỉ hiện khi isFilterable */}
        {form.isFilterable && (
          <FormRow label="Loại bộ lọc" required={form.isFilterable}>
            <select value={form.filterType} onChange={(e) => set("filterType", e.target.value)} className={`${inputCls} cursor-pointer`} required={form.isFilterable}>
              <option value="">-- Chọn loại bộ lọc --</option>
              {Object.entries(FILTER_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormRow>
        )}
      </div>

      {/* Actions */}
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
