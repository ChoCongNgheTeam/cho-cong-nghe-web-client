"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Plus, X } from "lucide-react";
import type { VoucherDetail, CreateVoucherPayload, UpdateVoucherPayload, TargetType } from "../voucher.types";
import { TARGET_TYPE_LABELS } from "../const";
import { formatVND } from "@/helpers";

export interface VoucherFormData {
  code: string;
  description: string;
  discountType: "DISCOUNT_PERCENT" | "DISCOUNT_FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscountValue: string;
  maxUses: string;
  maxUsesPerUser: string;
  startDate: string;
  endDate: string;
  priority: number;
  isActive: boolean;
  targets: Array<{ targetType: TargetType; targetId?: string }>;
}

export const DEFAULT_FORM: VoucherFormData = {
  code: "",
  description: "",
  discountType: "DISCOUNT_PERCENT",
  discountValue: 10,
  minOrderValue: 0,
  maxDiscountValue: "",
  maxUses: "",
  maxUsesPerUser: "",
  startDate: "",
  endDate: "",
  priority: 0,
  isActive: true,
  targets: [{ targetType: "ALL" }],
};

export function voucherToForm(v: VoucherDetail): VoucherFormData {
  return {
    code: v.code,
    description: v.description ?? "",
    discountType: v.discountType,
    discountValue: v.discountValue,
    minOrderValue: v.minOrderValue,
    maxDiscountValue: v.maxDiscountValue !== undefined ? String(v.maxDiscountValue) : "",
    maxUses: v.maxUses !== undefined ? String(v.maxUses) : "",
    maxUsesPerUser: v.maxUsesPerUser !== undefined ? String(v.maxUsesPerUser) : "",
    startDate: v.startDate ? new Date(v.startDate).toISOString().slice(0, 16) : "",
    endDate: v.endDate ? new Date(v.endDate).toISOString().slice(0, 16) : "",
    priority: v.priority,
    isActive: v.isActive,
    targets: v.targets.length > 0 ? v.targets.map((t) => ({ targetType: t.targetType, targetId: t.targetId })) : [{ targetType: "ALL" }],
  };
}

export function formToCreatePayload(form: VoucherFormData): CreateVoucherPayload {
  return {
    code: form.code.trim().toUpperCase(),
    description: form.description.trim() || undefined,
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    minOrderValue: Number(form.minOrderValue) || 0,
    maxDiscountValue: form.maxDiscountValue ? Number(form.maxDiscountValue) : undefined,
    maxUses: form.maxUses ? Number(form.maxUses) : undefined,
    maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : undefined,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    priority: Number(form.priority) || 0,
    isActive: form.isActive,
    targets: form.targets,
  };
}

export function formToUpdatePayload(form: VoucherFormData): UpdateVoucherPayload {
  const { code, ...rest } = formToCreatePayload(form);
  return rest;
}

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-neutral-dark/50";

function FormRow({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
        {label}
        {required && <span className="text-promotion normal-case font-normal ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-neutral-dark/70">{hint}</p>}
    </div>
  );
}

interface VoucherFormProps {
  initialData: VoucherFormData;
  isEdit?: boolean;
  onSubmit: (form: VoucherFormData) => Promise<void>;
  saving: boolean;
  error: string | null;
  submitLabel?: string;
  onCancel?: () => void;
}

export function VoucherForm({ initialData, isEdit = false, onSubmit, saving, error, submitLabel = "Lưu", onCancel }: VoucherFormProps) {
  const [form, setForm] = useState<VoucherFormData>(initialData);

  const set = (key: keyof VoucherFormData, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const addTarget = () => setForm((prev) => ({ ...prev, targets: [...prev.targets, { targetType: "ALL" as TargetType }] }));

  const removeTarget = (idx: number) => setForm((prev) => ({ ...prev, targets: prev.targets.filter((_, i) => i !== idx) }));

  const updateTarget = (idx: number, key: keyof (typeof form.targets)[0], value: string) =>
    setForm((prev) => ({
      ...prev,
      targets: prev.targets.map((t, i) => (i === idx ? { ...t, [key]: value, ...(key === "targetType" && { targetId: undefined }) } : t)),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const isPercent = form.discountType === "DISCOUNT_PERCENT";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Thông tin cơ bản */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thông tin cơ bản</p>

        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Mã voucher" required hint="Tự động chuyển chữ hoa">
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              disabled={isEdit}
              placeholder="SUMMER20"
              className={`${inputCls} font-mono ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
              required
            />
          </FormRow>
          <FormRow label="Ưu tiên" hint="Số lớn hơn = ưu tiên cao hơn">
            <input type="number" value={form.priority} onChange={(e) => set("priority", e.target.value)} className={inputCls} />
          </FormRow>
        </div>

        <FormRow label="Mô tả">
          <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Nhập mô tả ngắn..." className={inputCls} />
        </FormRow>
      </div>

      {/* Giảm giá */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Giảm giá</p>

        <FormRow label="Loại giảm giá" required>
          <select value={form.discountType} onChange={(e) => set("discountType", e.target.value)} className={`${inputCls} cursor-pointer`}>
            <option value="DISCOUNT_PERCENT">Giảm theo % (phần trăm)</option>
            <option value="DISCOUNT_FIXED">Giảm tiền trực tiếp</option>
          </select>
        </FormRow>

        <div className="grid grid-cols-2 gap-4">
          <FormRow label={isPercent ? "Phần trăm giảm (%)" : "Số tiền giảm (VNĐ)"} required>
            <div className="relative">
              <input type="number" value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} min={0} max={isPercent ? 100 : undefined} className={inputCls} required />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-dark font-medium">{isPercent ? "%" : "₫"}</span>
            </div>
          </FormRow>

          {isPercent && (
            <FormRow label="Giảm tối đa (VNĐ)" hint="Để trống = không giới hạn">
              <input type="number" value={form.maxDiscountValue} onChange={(e) => set("maxDiscountValue", e.target.value)} placeholder="200000" className={inputCls} />
            </FormRow>
          )}

          <FormRow label="Đơn tối thiểu (VNĐ)">
            <input type="number" value={form.minOrderValue} onChange={(e) => set("minOrderValue", e.target.value)} min={0} className={inputCls} />
          </FormRow>
        </div>
      </div>

      {/* Giới hạn sử dụng */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Giới hạn sử dụng</p>
        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Tổng lượt dùng" hint="Để trống = không giới hạn">
            <input type="number" value={form.maxUses} onChange={(e) => set("maxUses", e.target.value)} placeholder="100" min={1} className={inputCls} />
          </FormRow>
          <FormRow label="Lượt/người dùng" hint="Để trống = không giới hạn">
            <input type="number" value={form.maxUsesPerUser} onChange={(e) => set("maxUsesPerUser", e.target.value)} placeholder="1" min={1} className={inputCls} />
          </FormRow>
        </div>
      </div>

      {/* Thời gian */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thời gian áp dụng</p>
        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Ngày bắt đầu" hint="Để trống = hiệu lực ngay">
            <input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} />
          </FormRow>
          <FormRow label="Ngày kết thúc" hint="Để trống = không hết hạn">
            <input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} />
          </FormRow>
        </div>
      </div>

      {/* Phạm vi áp dụng */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Phạm vi áp dụng</p>
          <button type="button" onClick={addTarget} className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-accent border border-accent/30 rounded-lg hover:bg-accent/5 cursor-pointer">
            <Plus size={11} /> Thêm
          </button>
        </div>

        <div className="space-y-2">
          {form.targets.map((target, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select value={target.targetType} onChange={(e) => updateTarget(idx, "targetType", e.target.value)} className={`${inputCls} flex-1 cursor-pointer`}>
                {Object.entries(TARGET_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {target.targetType !== "ALL" && (
                <input value={target.targetId ?? ""} onChange={(e) => updateTarget(idx, "targetId", e.target.value)} placeholder="ID (UUID)" className={`${inputCls} flex-1 font-mono text-[11px]`} />
              )}
              {form.targets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTarget(idx)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion cursor-pointer shrink-0"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cài đặt */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5">
        <label className="flex items-start gap-3 cursor-pointer w-fit">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-accent cursor-pointer" />
          <div>
            <p className="text-[13px] font-medium text-primary">Đang hoạt động</p>
            <p className="text-[11px] text-neutral-dark">Voucher được hiển thị và áp dụng</p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
          >
            Huỷ
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl cursor-pointer"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
